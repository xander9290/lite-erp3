"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useController, useFormContext } from "react-hook-form";
import { Form, Dropdown, Spinner } from "react-bootstrap";

export interface Many2OneOption {
  id: number | string;
  name?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface Many2oneFieldProps {
  name: string;
  model: string; // 👈 NUEVO
  label?: string;
  readonly?: boolean;
  invisible?: boolean;
  inline?: boolean;
  className?: string;
  autoFocus?: boolean;
  ponChange?: (value: Many2OneOption) => void;
}

export function FieldRelation({
  name,
  model,
  label,
  readonly,
  invisible,
  inline,
  className,
  autoFocus,
  ponChange,
}: Many2oneFieldProps) {
  const { control } = useFormContext();

  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ name, control });

  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<Many2OneOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  /* ---------------- Fetch API ---------------- */

  const fetchOptions = useCallback(
    async (search: string) => {
      if (abortRef.current) {
        abortRef.current.abort(); // 👈 cancelamos la anterior
      }

      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);

      try {
        const res = await fetch(
          `/api/m2o/${model}?search=${encodeURIComponent(search)}&limit=8`,
          { signal: controller.signal },
        );

        const data = await res.json();
        setOptions(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    },
    [model],
  );

  /* ---------------- Debounce ---------------- */

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

  /* ---------------- Resolver valor inicial por ID ---------------- */

  useEffect(() => {
    if (value === null || value === undefined || value === "") {
      setQuery("");
      return;
    }

    const resolveInitial = async () => {
      try {
        const res = await fetch(`/api/m2o/${model}?id=${value}`);
        const data = await res.json();
        setQuery(data.name ?? "");
      } catch (err) {
        console.error(err);
      }
    };

    resolveInitial();
  }, [value, model]);

  /* ---------------- Selección ---------------- */

  const handleSelect = (option: Many2OneOption) => {
    onChange(option.id);
    if (ponChange) ponChange(option);
    setQuery(option.name ?? "");
    setIsOpen(false);
  };

  /* ---------------- Click fuera ---------------- */

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

  /* ---------------- Input ---------------- */

  //   atajos de teclado
  useEffect(() => {
    setHighlightedIndex(0);
  }, [options]);

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
      const selected = options[highlightedIndex];
      if (selected) handleSelect(selected);
    }

    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const input = (
    <>
      <Form.Control
        type="text"
        value={query}
        onChange={(e) => {
          const newValue = String(e.target.value);
          setQuery(newValue);
          setIsOpen(true);

          // 👇 Si el usuario borra todo, limpiamos el ID real
          if (newValue.trim() === "") {
            onChange("");
          }
        }}
        onFocus={() => setIsOpen(true)}
        autoComplete="off"
        isInvalid={!!error}
        readOnly={readonly}
        size="sm"
        autoFocus={autoFocus}
        className={`border-0 ${
          !inline && "border-bottom"
        } shadow-none rounded-0 ${className}`}
        onKeyDown={handleKeyDown}
      />

      {loading && <Spinner animation="border" size="sm" />}

      <Form.Control.Feedback type="invalid">
        {error?.message}
      </Form.Control.Feedback>

      {isOpen && options.length > 0 && !readonly && (
        <Dropdown show className="w-100">
          <Dropdown.Menu
            className="p-0 w-100"
            style={{
              maxHeight: 200,
              overflowY: "auto",
              zIndex: 1050,
            }}
          >
            {options.map((opt, index) => (
              <Dropdown.Item
                key={opt.id}
                active={index === highlightedIndex}
                onMouseDown={() => handleSelect(opt)}
                className="text-wrap border-bottom"
              >
                {opt.displayName ?? opt.name}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      )}
    </>
  );

  if (inline) {
    return <div ref={containerRef}>{input}</div>;
  }

  return (
    <Form.Group ref={containerRef} className="mb-3">
      <Form.Label className="fw-semibold m-0">{label}</Form.Label>
      {input}
    </Form.Group>
  );
}
