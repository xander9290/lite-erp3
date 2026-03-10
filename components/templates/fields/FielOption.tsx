"use client";

import React, { useEffect, useRef, useState } from "react";
import { useController, useFormContext } from "react-hook-form";
import { Dropdown, Form } from "react-bootstrap";

export interface Many2OneOption {
  id: number | string;
  name?: string | null;
  displayName?: string | null;
  [key: string]: any;
}

interface Many2oneFieldProps<T extends Many2OneOption> {
  name: string;
  label?: string;
  options: T[] | null;
  readonly?: boolean;
  invisible?: boolean;
  inline?: boolean;
  className?: string;
  autoFocus?: boolean;
  ponChange?: (value: T) => void;
  disabled?: boolean;
}

export function FieldOption<T extends Many2OneOption>({
  name,
  label,
  options,
  readonly = false,
  invisible = false,
  inline = false,
  className = "",
  autoFocus = false,
  ponChange,
  disabled,
}: Many2oneFieldProps<T>) {
  const { control } = useFormContext();

  const {
    field: { value, onChange, onBlur, ref },
    fieldState: { error },
  } = useController({ name, control });

  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const normalizedOptions = options ?? [];

  const getOptionLabel = (option?: Many2OneOption | null) =>
    option?.displayName ?? option?.name ?? "";

  useEffect(() => {
    if (value === null || value === undefined || value === "") {
      setQuery("");
      return;
    }

    if (typeof value === "object") {
      setQuery(getOptionLabel(value));
      return;
    }

    const selected = normalizedOptions.find((opt) => opt.id === value);
    setQuery(getOptionLabel(selected));
  }, [value, normalizedOptions]);

  const filteredOptions = normalizedOptions
    .filter((opt) =>
      getOptionLabel(opt).toLowerCase().includes(query.trim().toLowerCase()),
    )
    .slice(0, 8);

  const handleSelect = (option: T) => {
    onChange(option.id);
    ponChange?.(option);
    setQuery(getOptionLabel(option));
    setIsOpen(false);
    setHighlightedIndex(0);
  };

  const handleBlur = () => {
    if (!query.trim()) {
      setQuery("");
      onChange(null);
      return;
    }

    const exactMatch = normalizedOptions.find(
      (opt) => getOptionLabel(opt).toLowerCase() === query.trim().toLowerCase(),
    );

    if (exactMatch) {
      handleSelect(exactMatch);
    } else {
      onChange(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (filteredOptions.length === 0) return;
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : prev,
      );
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (filteredOptions.length === 0) return;
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const selected = filteredOptions[highlightedIndex];
      if (selected) handleSelect(selected);
      return;
    }

    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  if (invisible) return null;

  const input = (
    <>
      <Form.Control
        ref={ref}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          if (readonly || disabled) return;
          setIsOpen(true);
          setHighlightedIndex(0);
        }}
        onBlur={() => {
          handleBlur();
          onBlur();
        }}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        isInvalid={!!error}
        disabled={disabled}
        readOnly={readonly}
        autoFocus={autoFocus}
        className={`border-0 ${!inline ? "border-bottom" : ""} shadow-none rounded-0 p-0 ${className}`}
      />

      <Form.Control.Feedback type="invalid">
        {error?.message}
      </Form.Control.Feedback>

      {isOpen && !readonly && !disabled && filteredOptions.length > 0 && (
        <Dropdown show className="w-100">
          <Dropdown.Menu
            className="p-0 w-auto"
            style={{
              maxHeight: 200,
              overflowY: "auto",
              zIndex: 1050,
              fontSize: "0.9rem",
            }}
          >
            {filteredOptions.map((opt, index) => (
              <Dropdown.Item
                key={opt.id}
                active={index === highlightedIndex}
                onMouseDown={() => handleSelect(opt)}
                className="text-wrap border-bottom"
              >
                {getOptionLabel(opt)}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      )}
    </>
  );

  if (inline) {
    return (
      <div ref={containerRef} title={name} className="p-0 m-0">
        {input}
      </div>
    );
  }

  return (
    <Form.Group ref={containerRef} className="mb-3">
      <Form.Label className="fw-semibold m-0">{label}</Form.Label>
      {input}
    </Form.Group>
  );
}
