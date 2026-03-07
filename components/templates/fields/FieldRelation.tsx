"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useController, useFormContext } from "react-hook-form";
import { Form, Dropdown, Button } from "react-bootstrap";

export interface Many2OneOption {
  id: number | string;
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

interface Many2oneFieldProps {
  name: string;
  model: string;
  label?: string;
  readonly?: boolean;
  invisible?: boolean;
  inline?: boolean;
  className?: string;
  autoFocus?: boolean;
  ponChange?: (value: Many2OneOption) => void;
  domain?: Domain;
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
  domain,
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
  const inputRef = useRef<HTMLInputElement>(null);

  const serializedDomain = JSON.stringify(domain ?? []);

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
          limit: "8",
          domain: serializedDomain,
        });

        const res = await fetch(`/api/m2o/${model}?${params.toString()}`, {
          signal: controller.signal,
        });

        const data = await res.json();
        setOptions(Array.isArray(data) ? data : []);
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

  const handleSelect = (option: Many2OneOption) => {
    onChange(option.id);
    ponChange?.(option);
    setQuery(option.displayName ?? option.name ?? "");
    setIsOpen(false);
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

  const handleOff = () => {
    setQuery("");
    setIsOpen(true);
    onChange(null);
    inputRef.current?.focus();
  };

  if (invisible) return null;

  const input = (
    <>
      <div className="d-flex">
        <Form.Control
          type="text"
          value={query}
          ref={inputRef}
          onChange={(e) => {
            const newValue = String(e.target.value);
            setQuery(newValue);
            setIsOpen(true);

            if (newValue.trim() === "") {
              onChange(null);
            }
          }}
          onFocus={() => {
            if (readonly) return;
            setIsOpen(true);
            fetchOptions(query.trim());
          }}
          autoComplete="off"
          isInvalid={!!error}
          readOnly={readonly}
          autoFocus={autoFocus}
          className={`border-0 p-0 w-100 ${!inline ? "border-bottom" : ""} shadow-none rounded-0 ${className ?? ""}`}
          onKeyDown={handleKeyDown}
        />
        {!inline && (
          <Button
            size="sm"
            variant="none"
            onClick={handleOff}
            title="Desplegar"
            disabled={readonly}
          >
            <i className="bi bi-power"></i>
          </Button>
        )}
      </div>

      {/* {loading && <Spinner animation="border" size="sm" />} */}

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
      <div className="d-flex flex-column align-items-sm-end gap-0 flex-sm-row">
        <Form.Label
          className="fw-semibold m-0 p-0 flex-shrink-0"
          style={{ width: 100 }}
        >
          {label}
        </Form.Label>
        <div className="flex-grow-1" style={{ minWidth: 0 }}>
          {input}
        </div>
      </div>
    </Form.Group>
  );
}
