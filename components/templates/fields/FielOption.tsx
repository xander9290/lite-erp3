"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useController, useFormContext } from "react-hook-form";
import { Dropdown, Form, FloatingLabel } from "react-bootstrap";
import { useAccess } from "@/contexts/AccessContext";

export interface SelectOption {
  value: number | string;
  option: string;
  [key: string]: any;
}

interface FieldOptionProps<T extends SelectOption> {
  name: string;
  label?: string;
  options: T[] | null;
  readOnly?: boolean;
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
  maxHeight: number;
  direction: "down" | "up";
}

export function FieldOption<T extends SelectOption>({
  name,
  label,
  options,
  readOnly = false,
  invisible = false,
  inline = false,
  className = "",
  autoFocus = false,
  onOptionChange,
  disabled,
}: FieldOptionProps<T>) {
  const access = useAccess({ fieldName: name });

  const { control } = useFormContext();

  const {
    field: { value, onChange, onBlur, ref },
    fieldState: { error },
    formState: { isSubmitting },
  } = useController({ name, control });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 200,
    direction: "down",
  });
  const [mounted, setMounted] = useState(false);

  const normalizedOptions = useMemo(() => options ?? [], [options]);

  const getOptionLabel = (option?: SelectOption | null) => option?.option ?? "";

  const autoResize = (element?: HTMLTextAreaElement | null) => {
    const el = element ?? inputRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

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

  useEffect(() => {
    autoResize();
  }, [query]);

  const filteredOptions = useMemo(() => {
    const search = query.trim().toLowerCase();

    return normalizedOptions
      .filter((opt) => getOptionLabel(opt).toLowerCase().includes(search))
      .slice(0, 8);
  }, [normalizedOptions, query]);

  const updateMenuPosition = () => {
    if (!inputRef.current) return;

    const rect = inputRef.current.getBoundingClientRect();
    const gap = 4;
    const viewportPadding = 8;
    const preferredHeight = 200;

    const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
    const spaceAbove = rect.top - viewportPadding;

    const openDown = spaceBelow >= preferredHeight || spaceBelow >= spaceAbove;

    const maxHeight = Math.max(
      80,
      Math.min(preferredHeight, openDown ? spaceBelow - gap : spaceAbove - gap),
    );

    const top = openDown
      ? rect.bottom + gap
      : Math.max(viewportPadding, rect.top - gap - maxHeight);

    setMenuPosition({
      top,
      left: rect.left,
      width: rect.width,
      maxHeight,
      direction: openDown ? "down" : "up",
    });
  };

  const handleSelect = (option: T) => {
    onChange(option.value);
    onOptionChange?.(option);
    setQuery(getOptionLabel(option));
    setIsOpen(false);
    setHighlightedIndex(0);

    requestAnimationFrame(() => {
      autoResize();
      updateMenuPosition();
    });
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
      autoResize();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen, query]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
  if (access?.invisible) return null;

  const floatingText = label ?? name;
  const placeholder = label ?? name;

  const dropdownMenu =
    mounted && isOpen && !readOnly && !disabled && filteredOptions.length > 0
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
                className="p-0 w-100"
                style={{
                  maxHeight: menuPosition.maxHeight,
                  overflowY: "auto",
                  fontSize: "0.9rem",
                  zIndex: 9999,
                  boxShadow:
                    menuPosition.direction === "up"
                      ? "0 -0.5rem 1rem rgba(0,0,0,0.15)"
                      : "0 0.5rem 1rem rgba(0,0,0,0.15)",
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
        as="textarea"
        rows={1}
        name={name}
        placeholder={placeholder}
        ref={(element) => {
          ref(element);
          inputRef.current = element;
          if (element) {
            requestAnimationFrame(() => autoResize(element));
          }
        }}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);

          autoResize(e.target as HTMLTextAreaElement);
          requestAnimationFrame(updateMenuPosition);
        }}
        onFocus={() => {
          if (disabled || readOnly || access?.readonly) return;
          setIsOpen(true);
          setHighlightedIndex(0);

          requestAnimationFrame(() => {
            autoResize();
            updateMenuPosition();
          });
        }}
        onBlur={() => {
          handleBlur();
          onBlur();
        }}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        isInvalid={!!error}
        disabled={disabled}
        readOnly={isSubmitting || readOnly || access?.readonly}
        autoFocus={autoFocus}
        className={`w-100 shadow-none overflow-hidden ${className} ${inline ? "border-0" : ""}`}
        style={{
          fontSize: "0.9rem",
          resize: "none",
          minHeight: "unset",
        }}
      />

      {dropdownMenu}
    </>
  );

  if (inline) {
    return (
      <div ref={containerRef} title={name} className="p-0 m-0 w-100">
        {input}
      </div>
    );
  }

  return (
    <div
      className="mb-3"
      ref={(element) => {
        containerRef.current = element;
      }}
      title={name}
    >
      <FloatingLabel controlId={name} label={floatingText} className="w-100">
        {input}
        <Form.Control.Feedback
          type="invalid"
          className={error ? "d-block" : ""}
        >
          {error?.message}
        </Form.Control.Feedback>
      </FloatingLabel>
    </div>
  );
}
