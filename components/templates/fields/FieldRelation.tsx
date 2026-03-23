"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { useController, useFormContext } from "react-hook-form";
import { Form, Dropdown, Button, FloatingLabel } from "react-bootstrap";
import { useAccess } from "@/contexts/AccessContext";
import { TableTemplateColumn } from "../TableTemplate";
import RelationSearchModal from "../RelationSearchModal";

export interface Many2OneOption {
  id: string;
  name?: string | null;
  [key: string]: any;
}

export type DomainOperator =
  | "="
  | "!="
  | "contains"
  | "startsWith"
  | "endsWith"
  | "in"
  | "notIn"
  | ">"
  | ">="
  | "<"
  | "<=";

export type DomainItem = [field: string, operator: DomainOperator, value: any];
export type Domain = DomainItem[];

interface Many2oneFieldProps<T extends Many2OneOption> {
  name: string;
  model: string;

  label?: string;
  readonly?: boolean;
  invisible?: boolean;
  inline?: boolean;
  className?: string;
  autoFocus?: boolean;

  ponChange?: (value: Many2OneOption["id"] | null, record: T | null) => void;

  domain?: Domain;
  placeholder?: string;

  searchColumns?: TableTemplateColumn<T>[];
  searchPageSize?: number;
}

interface MenuPosition {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
}

export function FieldRelation<T extends Many2OneOption>({
  name,
  model,
  label,
  readonly,
  invisible,
  inline,
  className,
  autoFocus,
  ponChange,
  domain,
  placeholder,
  searchColumns,
}: Many2oneFieldProps<T>) {
  const access = useAccess({ fieldName: name });

  const { control } = useFormContext();

  const {
    field: { value, onChange, onBlur },
    fieldState: { error },
  } = useController({ name, control });

  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<T[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 0,
  });
  const [showSearchModal, setShowSearchModal] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const serializedDomain = JSON.stringify(domain ?? []);

  const updateMenuPosition = useCallback(() => {
    if (!inputRef.current) return;

    const rect = inputRef.current.getBoundingClientRect();

    const viewportHeight = window.innerHeight;
    const dropdownHeight = 220; // altura aproximada del dropdown

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    const openUpwards = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    const top = openUpwards ? rect.top - dropdownHeight - 4 : rect.bottom + 4;

    const maxHeight = openUpwards
      ? rect.top - 10
      : viewportHeight - rect.bottom - 10;

    setMenuPosition({
      top,
      left: rect.left,
      width: rect.width,
      maxHeight,
    });
  }, []);

  const fetchOptions = useCallback(
    async (search: string) => {
      if (abortRef.current) {
        abortRef.current.abort();
      }

      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);

      try {
        const params = new URLSearchParams({
          search,
          limit: "5",
          domain: serializedDomain,
        });

        const res = await fetch(`/api/m2o/${model}?${params.toString()}`, {
          signal: controller.signal,
        });

        const data = await res.json();
        setOptions(Array.isArray(data) ? (data as T[]) : []);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    },
    [model, serializedDomain],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!isOpen) return;

    debounceRef.current = setTimeout(() => {
      fetchOptions(query);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchOptions, isOpen]);

  useEffect(() => {
    if (value === null || value === undefined || value === "") {
      setQuery("");
      return;
    }

    const resolveInitial = async () => {
      try {
        const params = new URLSearchParams({
          id: String(value),
          domain: serializedDomain,
        });

        const res = await fetch(`/api/m2o/${model}?${params.toString()}`);
        const data = await res.json();
        setQuery(data?.name ?? "");
      } catch (err) {
        console.error(err);
      }
    };

    resolveInitial();
  }, [value, model, serializedDomain]);

  const handleSelect = useCallback(
    (record: T) => {
      onChange(record.id);
      ponChange?.(record.id, record);
      setQuery(record.displayName ?? record.name ?? "");
      setIsOpen(false);
    },
    [onChange, ponChange],
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;

      if (containerRef.current && !containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [options]);

  useEffect(() => {
    if (!isOpen) return;

    updateMenuPosition();

    const handleScroll = () => {
      updateMenuPosition();
    };

    const handleResize = () => {
      updateMenuPosition();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen, updateMenuPosition]);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || options.length === 0) {
      if (e.key === "Escape") setIsOpen(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev + 1 < options.length ? prev + 1 : prev,
      );
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const selected = options[highlightedIndex];
      if (selected) handleSelect(selected);
      return;
    }

    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleOff = () => {
    setQuery("");
    setOptions([]);
    setIsOpen(true);
    onChange(null);
    ponChange?.(null, null);
    inputRef.current?.focus();
    requestAnimationFrame(updateMenuPosition);
  };

  const openDropdown = useCallback(() => {
    if (readonly || access?.readonly) return;
    setIsOpen(true);
    fetchOptions(query.trim());
    requestAnimationFrame(updateMenuPosition);
  }, [readonly, access?.readonly, fetchOptions, query, updateMenuPosition]);

  const dropdownMenu = useMemo(() => {
    if (!mounted || !isOpen || readonly || access?.readonly) return null;

    return createPortal(
      <div
        style={{
          position: "fixed",
          top: menuPosition.top,
          left: menuPosition.left,
          width: menuPosition.width,
          zIndex: 9999,
        }}
      >
        <Dropdown show className="w-100">
          <Dropdown.Menu
            show
            className="p-0 w-auto mt-0"
            style={{
              maxHeight: 200,
              overflowY: "auto",
              zIndex: 9999,
            }}
          >
            {options.map((opt, index) => (
              <Dropdown.Item
                key={opt.id}
                active={index === highlightedIndex}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(opt);
                }}
                className="text-wrap p-1"
                style={{ fontSize: "0.9rem" }}
              >
                {opt.displayName ?? opt.name}
              </Dropdown.Item>
            ))}
            {searchColumns && (
              <Dropdown.Item
                className="text-primary"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                  console.log("Modal activado");
                  setShowSearchModal(true);
                }}
              >
                <small>Buscar más..</small>
              </Dropdown.Item>
            )}
          </Dropdown.Menu>
        </Dropdown>
      </div>,
      document.body,
    );
  }, [
    mounted,
    isOpen,
    readonly,
    access?.readonly,
    menuPosition.top,
    menuPosition.left,
    menuPosition.width,
    loading,
    options,
    highlightedIndex,
    handleSelect,
  ]);

  if (invisible) return null;
  if (access?.invisible) return null;

  const floatingText = label ?? name;

  const input = (
    <>
      <Form.Control
        type="text"
        name={name}
        value={query}
        ref={inputRef}
        placeholder={placeholder}
        onChange={(e) => {
          const newValue = String(e.target.value);
          setQuery(newValue);
          setIsOpen(true);
          requestAnimationFrame(updateMenuPosition);

          if (newValue.trim() === "") {
            onChange(null);
            ponChange?.(null, null);
          }
        }}
        onFocus={openDropdown}
        onClick={openDropdown}
        onBlur={onBlur}
        autoComplete="off"
        isInvalid={!!error}
        readOnly={readonly || access?.readonly}
        autoFocus={autoFocus}
        className={`w-100 shadow-none px-1 rounded-end-0 ${className ?? ""} ${inline ? "border-0" : ""}`}
        onKeyDown={handleKeyDown}
        style={{ fontSize: "0.9rem" }}
      />
      {dropdownMenu}
      {searchColumns && (
        <RelationSearchModal
          show={showSearchModal}
          onHide={() => setShowSearchModal(false)}
          model={model}
          columns={searchColumns}
          domain={domain}
          onSelect={(record) => {
            handleSelect(record);
            setShowSearchModal(false);
          }}
        />
      )}
    </>
  );

  if (inline) {
    return (
      <div ref={containerRef} title={name} className="m-0 p-0">
        {input}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="mb-1" title={name}>
      <div className="d-flex align-items-stretch">
        <FloatingLabel
          controlId={name}
          label={floatingText}
          className="flex-grow-1 fs-6 fw-semibold"
        >
          {input}
        </FloatingLabel>
        {!inline && (
          <Button
            size="sm"
            variant="light"
            onClick={handleOff}
            title="Desplegar"
            disabled={readonly || access?.readonly}
            className="flex-shrink-0 rounded-start-0 border-start-0"
            style={{ minWidth: 42 }}
          >
            <i className="bi bi-power"></i>
          </Button>
        )}
      </div>
      <Form.Control.Feedback type="invalid" className={error ? "d-block" : ""}>
        {error?.message}
      </Form.Control.Feedback>
    </div>
  );
}
