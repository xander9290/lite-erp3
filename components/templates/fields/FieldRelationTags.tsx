"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useController, useFormContext } from "react-hook-form";
import { Form, Dropdown, Badge } from "react-bootstrap";

export interface Many2ManyOption {
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

interface Props {
  name: string;
  model: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  invisible?: boolean;
  domain?: Domain;
}

export function FieldRelationTags({
  name,
  model,
  label,
  disabled,
  className,
  required,
  invisible,
  domain,
}: Props) {
  const { control } = useFormContext();

  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const value = (field.value as string[] | undefined) ?? [];
  const setValue = field.onChange;

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

  const serializedDomain = useMemo(
    () => JSON.stringify(domain ?? []),
    [domain],
  );

  useEffect(() => {
    if (value.length === 0) {
      setSelectedObjects([]);
      return;
    }

    const resolve = async () => {
      try {
        const params = new URLSearchParams({
          ids: value.join(","),
          domain: serializedDomain,
        });

        const res = await fetch(`/api/m2m/${model}?${params.toString()}`);
        const data = await res.json();
        const safeData = Array.isArray(data) ? data : [];

        const sorted = value
          .map((id) => safeData.find((item: Many2ManyOption) => item.id === id))
          .filter(Boolean) as Many2ManyOption[];

        setSelectedObjects(sorted);
      } catch (err) {
        console.error(err);
      }
    };

    resolve();
  }, [value, model, serializedDomain]);

  const fetchOptions = useCallback(
    async (search: string) => {
      if (abortRef.current) abortRef.current.abort();

      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);

      try {
        const params = new URLSearchParams({
          search,
          limit: "10",
          domain: serializedDomain,
          excludeIds: value.join(","),
        });

        const res = await fetch(`/api/m2o/${model}?${params.toString()}`, {
          signal: controller.signal,
        });

        const data = await res.json();
        const safeData = Array.isArray(data) ? data : [];

        const filtered = safeData.filter(
          (opt: Many2ManyOption) => !value.includes(opt.id),
        );

        setOptions(filtered);
      } catch (err: any) {
        if (err.name !== "AbortError") console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [model, value, serializedDomain],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!isOpen || disabled) return;

    debounceRef.current = setTimeout(() => {
      fetchOptions(query);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchOptions, isOpen, disabled]);

  const handleSelect = (option: Many2ManyOption) => {
    if (value.includes(option.id)) {
      setIsOpen(false);
      setQuery("");
      return;
    }

    setValue([...value, option.id]);
    setQuery("");
    setIsOpen(false);
    setHighlightedIndex(0);

    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleRemove = (id: string) => {
    setValue(value.filter((v) => v !== id));
  };

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

    if (e.key === "Backspace" && query === "" && value.length > 0) {
      e.preventDefault();
      handleRemove(value[value.length - 1]);
    }
  };

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

  useEffect(() => {
    setHighlightedIndex(0);
  }, [options]);

  if (invisible) return null;

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
            bg="primary"
            className="d-flex align-items-center gap-1 px-2 py-1"
          >
            <span>{opt.displayName ?? opt.name}</span>

            {!disabled && (
              <button
                type="button"
                className="btn btn-sm p-0 ms-1 border-0 bg-transparent text-white lh-1"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemove(opt.id);
                }}
                aria-label={`Quitar ${opt.displayName ?? opt.name ?? opt.id}`}
              >
                ×
              </button>
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
            onFocus={() => {
              setIsOpen(true);
              fetchOptions(query.trim());
            }}
            onKeyDown={handleKeyDown}
            size="sm"
            className="border-0 border-bottom shadow-none flex-grow-1 rounded-0"
            style={{ minWidth: "120px" }}
            autoComplete="off"
          />
        )}
      </div>

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
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(option);
                }}
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
