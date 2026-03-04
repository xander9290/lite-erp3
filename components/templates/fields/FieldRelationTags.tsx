"use client";

import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  CSSProperties,
  useCallback,
} from "react";
import { useController, useFormContext } from "react-hook-form";
import { Form, Dropdown, Badge, Spinner } from "react-bootstrap";

export interface Many2ManyOption {
  id: string; // cuid
  name?: string | null;
  displayName?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface Props {
  name: string;
  model: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  invisible?: boolean;
}

export function FieldRelationTags({
  name,
  model,
  label,
  disabled,
  className,
  required,
  invisible,
}: Props) {
  const { control } = useFormContext();

  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  //   const access = useAccess();
  //   const fieldAccess = access?.find((f) => f.fieldName === name);

  //   const styleProps: CSSProperties = {
  //     pointerEvents: fieldAccess?.readonly ? "none" : "auto",
  //   };

  /* ============================================================
     1️⃣ RHF VALUE (ids[])
     ============================================================ */

  const value = field.value as string[] | undefined;
  const setValue = field.onChange;

  /* ============================================================
     2️⃣ UI STATE
     ============================================================ */

  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<Many2ManyOption[]>([]);
  const [selectedObjects, setSelectedObjects] = useState<Many2ManyOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  /* ============================================================
     3️⃣ Resolver IDs → Objetos
     ============================================================ */

  useEffect(() => {
    if (!value || value.length === 0) {
      setSelectedObjects([]);
      return;
    }

    const resolve = async () => {
      try {
        const res = await fetch(`/api/m2o/${model}?ids=${value?.join(",")}`);
        const data = await res.json();
        setSelectedObjects(data);
      } catch (err) {
        console.error(err);
      }
    };

    resolve();
  }, [value, model]);

  /* ============================================================
     4️⃣ Fetch options dinámico
     ============================================================ */

  const fetchOptions = useCallback(
    async (search: string) => {
      if (abortRef.current) abortRef.current.abort();

      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);

      try {
        const res = await fetch(
          `/api/m2o/${model}?search=${encodeURIComponent(search)}&limit=10`,
          { signal: controller.signal },
        );

        const data = await res.json();

        // excluir ya seleccionados
        const filtered = data.filter(
          (opt: Many2ManyOption) => !value?.includes(opt.id),
        );

        setOptions(filtered);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (err.name !== "AbortError") console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [model, value],
  );

  /* ============================================================
     5️⃣ Debounce
     ============================================================ */

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 2) {
      setOptions([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchOptions(query);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchOptions]);

  /* ============================================================
     6️⃣ Seleccionar
     ============================================================ */

  const handleSelect = (option: Many2ManyOption) => {
    setValue([...(value || []), option.id]);
    setQuery("");
    setIsOpen(false);
    setHighlightedIndex(0);

    requestAnimationFrame(() => inputRef.current?.focus());
  };

  /* ============================================================
     7️⃣ Eliminar
     ============================================================ */

  const handleRemove = (id: string) => {
    setValue(value?.filter((v) => v !== id));
  };

  /* ============================================================
     8️⃣ Teclado
     ============================================================ */

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || options.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev + 1 < options.length ? prev + 1 : prev,
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const option = options[highlightedIndex];
      if (option) handleSelect(option);
    }

    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  /* ============================================================
     9️⃣ Click fuera
     ============================================================ */

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  //   if (invisible || fieldAccess?.invisible) return null;

  /* ============================================================
     🔟 Render
     ============================================================ */

  return (
    <div ref={containerRef} className={className}>
      {label && (
        <Form.Label className="fw-semibold">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </Form.Label>
      )}

      <div
        className="d-flex flex-wrap align-items-center gap-1 p-1 mb-3"
        style={{ minHeight: "38px" }}
        onClick={() => inputRef.current?.focus()}
      >
        {selectedObjects.map((opt) => (
          <Badge
            key={opt.id}
            bg="secondary"
            className="d-flex align-items-center gap-1 px-2 py-1"
          >
            <span>{opt.displayName ?? opt.name}</span>
            {!disabled && (
              <span
                role="button"
                onClick={() => handleRemove(opt.id)}
                className="ms-1"
              >
                ×
              </span>
            )}
          </Badge>
        ))}

        {!disabled && (
          <Form.Control
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            size="sm"
            className="border-0 border-bottom shadow-none flex-grow-1 rounded-0"
            style={{ minWidth: "120px" }}
          />
        )}
      </div>

      {loading && <Spinner size="sm" />}

      {error && (
        <div className="text-danger mt-1" style={{ fontSize: "0.85rem" }}>
          {error.message}
        </div>
      )}

      {isOpen && options.length > 0 && (
        <Dropdown show className="w-100">
          <Dropdown.Menu
            className="p-0"
            style={{
              width: "100%",
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            {options.map((option, index) => (
              <Dropdown.Item
                key={option.id}
                active={index === highlightedIndex}
                onMouseDown={() => handleSelect(option)}
                className="text-wrap border-bottom"
              >
                {option.displayName ?? option.name}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      )}
    </div>
  );
}
