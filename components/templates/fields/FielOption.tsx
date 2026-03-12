"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useController, useFormContext } from "react-hook-form";
import { Dropdown, Form } from "react-bootstrap";

export interface SelectOption {
  value: number | string;
  option: string;
  [key: string]: any;
}

interface FieldOptionProps<T extends SelectOption> {
  name: string;
  label?: string;
  options: T[] | null;
  readonly?: boolean;
  invisible?: boolean;
  inline?: boolean;
  className?: string;
  autoFocus?: boolean;
  onOptionChange?: (value: T) => void;
  disabled?: boolean;
}

interface MenuPosition {
  top: number;
  left: number;
  width: number;
}

export function FieldOption<T extends SelectOption>({
  name,
  label,
  options,
  readonly = false,
  invisible = false,
  inline = false,
  className = "",
  autoFocus = false,
  onOptionChange,
  disabled,
}: FieldOptionProps<T>) {
  const { control } = useFormContext();

  const {
    field: { value, onChange, onBlur, ref },
    fieldState: { error },
  } = useController({ name, control });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({
    top: 0,
    left: 0,
    width: 0,
  });
  const [mounted, setMounted] = useState(false);

  const normalizedOptions = useMemo(() => options ?? [], [options]);

  const getOptionLabel = (option?: SelectOption | null) => option?.option ?? "";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (value === null || value === undefined || value === "") {
      setQuery("");
      return;
    }

    if (typeof value === "object") {
      setQuery(getOptionLabel(value));
      return;
    }

    const selected = normalizedOptions.find((opt) => opt.value === value);
    setQuery(getOptionLabel(selected));
  }, [value, normalizedOptions]);

  const filteredOptions = useMemo(() => {
    const search = query.trim().toLowerCase();

    return normalizedOptions
      .filter((opt) => getOptionLabel(opt).toLowerCase().includes(search))
      .slice(0, 8);
  }, [normalizedOptions, query]);

  const updateMenuPosition = () => {
    if (!inputRef.current) return;

    const rect = inputRef.current.getBoundingClientRect();

    setMenuPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  };

  const handleSelect = (option: T) => {
    onChange(option.value);
    onOptionChange?.(option);
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
      const target = event.target as Node;

      if (containerRef.current && !containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

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
  }, [isOpen]);

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

  const dropdownMenu =
    mounted && isOpen && !readonly && !disabled && filteredOptions.length > 0
      ? createPortal(
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
                className="p-0 w-auto"
                style={{
                  maxHeight: 200,
                  overflowY: "auto",
                  fontSize: "0.9rem",
                  zIndex: 9999,
                }}
              >
                {filteredOptions.map((opt, index) => (
                  <Dropdown.Item
                    key={opt.value}
                    active={index === highlightedIndex}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(opt);
                    }}
                    className="text-wrap border-bottom"
                  >
                    {getOptionLabel(opt)}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>,
          document.body,
        )
      : null;

  const input = (
    <>
      <Form.Control
        ref={(element) => {
          ref(element);
          inputRef.current = element;
        }}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          requestAnimationFrame(updateMenuPosition);
        }}
        onFocus={() => {
          if (readonly || disabled) return;
          setIsOpen(true);
          setHighlightedIndex(0);
          requestAnimationFrame(updateMenuPosition);
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
        className={`border-0 w-auto ${!inline ? "border-bottom p-0" : ""} shadow-none rounded-0 ${className}`}
      />

      <Form.Control.Feedback type="invalid">
        {error?.message}
      </Form.Control.Feedback>

      {dropdownMenu}
    </>
  );

  if (inline) {
    return (
      <div ref={containerRef} title={name} className="p-0 m-0 w-auto">
        {input}
      </div>
    );
  }

  return (
    <Form.Group
      className="mb-3"
      ref={(element) => {
        containerRef.current = element as HTMLDivElement | null;
      }}
    >
      <Form.Label className="fw-semibold m-0">{label}</Form.Label>
      {input}
    </Form.Group>
  );
}
