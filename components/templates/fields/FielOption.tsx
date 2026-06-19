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

type WidgetType = "select" | "radio";

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
  widget?: WidgetType;
  columns?: number;
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
  widget = "select",
  columns = 2,
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
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSelectingRef = useRef<boolean>(false); // 🔑 Nuevo ref para controlar selección

  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
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

  // Sincronizar query con el valor seleccionado (solo para modo select)
  useEffect(() => {
    if (widget === "radio") return;

    // Si estamos seleccionando, no sobrescribir el query
    if (isSelectingRef.current) return;

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
  }, [value, normalizedOptions, widget]);

  useEffect(() => {
    if (widget === "select") {
      autoResize();
    }
  }, [query, widget]);

  const displayOptions = useMemo(() => {
    if (widget === "radio") return normalizedOptions;

    if (isOpen) {
      const search = searchTerm.trim().toLowerCase();
      if (!search) return normalizedOptions;

      return normalizedOptions
        .filter((opt) => getOptionLabel(opt).toLowerCase().includes(search))
        .slice(0, 8);
    }

    if (value !== null && value !== undefined && value !== "") {
      let selected: T | undefined;

      if (typeof value === "object") {
        selected = value as T;
      } else {
        selected = normalizedOptions.find((opt) => opt.value === value);
      }

      return selected ? [selected] : [];
    }

    return [];
  }, [isOpen, normalizedOptions, searchTerm, value, widget]);

  const updateMenuPosition = () => {
    if (!inputRef.current || widget === "radio") return;

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
    isSelectingRef.current = true; // 🔑 Marcar que estamos seleccionando

    onChange(option.value);
    onOptionChange?.(option);
    setQuery(getOptionLabel(option));
    setSearchTerm("");
    setIsOpen(false);
    setHighlightedIndex(0);

    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }

    requestAnimationFrame(() => {
      autoResize();
      updateMenuPosition();
      // 🔑 Resetear el flag después de un breve delay
      setTimeout(() => {
        isSelectingRef.current = false;
      }, 50);
    });
  };

  const handleRadioChange = (option: T) => {
    onChange(option.value);
    onOptionChange?.(option);
  };

  const handleBlur = () => {
    if (widget === "radio") return;

    onBlur();

    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }

    blurTimeoutRef.current = setTimeout(() => {
      // 🔑 Si estamos seleccionando, no cerrar
      if (isSelectingRef.current) {
        blurTimeoutRef.current = null;
        return;
      }

      const activeElement = document.activeElement;
      const dropdownPortal = document.querySelector(
        '[data-dropdown-portal="true"]',
      );

      if (dropdownPortal && dropdownPortal.contains(activeElement)) {
        return;
      }

      setIsOpen(false);
      setSearchTerm("");

      if (!query.trim()) {
        setQuery("");
        onChange(null);
        return;
      }

      const exactMatch = normalizedOptions.find(
        (opt) =>
          getOptionLabel(opt).toLowerCase() === query.trim().toLowerCase(),
      );

      if (exactMatch) {
        onChange(exactMatch.value);
        onOptionChange?.(exactMatch);
        setQuery(getOptionLabel(exactMatch));
      } else {
        if (value !== null && value !== undefined && value !== "") {
          let selected: T | undefined;
          if (typeof value === "object") {
            selected = value as T;
          } else {
            selected = normalizedOptions.find((opt) => opt.value === value);
          }
          setQuery(getOptionLabel(selected));
        } else {
          setQuery("");
          onChange(null);
        }
      }

      blurTimeoutRef.current = null;
    }, 150);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (containerRef.current && !containerRef.current.contains(target)) {
        const dropdownPortal = document.querySelector(
          '[data-dropdown-portal="true"]',
        );
        if (dropdownPortal && dropdownPortal.contains(target)) {
          return;
        }
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm]);

  useEffect(() => {
    if (!isOpen || widget === "radio") return;

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
  }, [isOpen, searchTerm, widget]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (widget === "radio") return;

    if (!isOpen) {
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (displayOptions.length === 0) return;
      setHighlightedIndex((prev) =>
        prev < displayOptions.length - 1 ? prev + 1 : prev,
      );
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (displayOptions.length === 0) return;
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const selected = displayOptions[highlightedIndex];
      if (selected) handleSelect(selected);
      return;
    }

    if (e.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
      inputRef.current?.blur();
    }
  };

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  if (invisible) return null;
  if (access?.invisible) return null;

  const floatingText = label ?? name;
  const isDisabled = disabled || readOnly || access?.readonly || isSubmitting;

  // Renderizado para widget="radio"
  if (widget === "radio") {
    return (
      <div
        className={`mb-2 ${className}  border rounded p-1`}
        ref={(element) => {
          containerRef.current = element;
        }}
        title={name}
      >
        {label && (
          <Form.Label className="fw-bold mb-2" style={{ fontSize: "0.9rem" }}>
            {label}
          </Form.Label>
        )}

        <div
          className="d-flex flex-wrap gap-1"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: "0.5rem",
          }}
        >
          {normalizedOptions.map((opt) => {
            const isChecked =
              value === opt.value ||
              (typeof value === "object" && value?.value === opt.value);

            return (
              <Form.Check
                key={String(opt.value)}
                type="radio"
                id={`${name}-${String(opt.value)}`}
                name={name}
                label={getOptionLabel(opt)}
                value={String(opt.value)}
                checked={isChecked}
                onChange={() => handleRadioChange(opt)}
                disabled={isDisabled}
                className="mb-0 bg-body-tertiary"
                style={{ fontSize: "0.9rem" }}
              />
            );
          })}
        </div>

        {error && (
          <Form.Control.Feedback type="invalid" className="d-block">
            {error?.message}
          </Form.Control.Feedback>
        )}
      </div>
    );
  }

  // Renderizado para widget="select"
  const dropdownMenu =
    mounted && isOpen && !isDisabled && displayOptions.length > 0
      ? createPortal(
          <div
            data-dropdown-portal="true"
            style={{
              position: "fixed",
              top: menuPosition.top,
              left: menuPosition.left,
              width: menuPosition.width,
              zIndex: 9999,
            }}
            onMouseDown={(e) => {
              e.preventDefault();
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
                {displayOptions.map((opt, index) => (
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
        placeholder={label ?? name}
        ref={(element) => {
          ref(element);
          inputRef.current = element;
          if (element) {
            requestAnimationFrame(() => autoResize(element));
          }
        }}
        value={query}
        onChange={(e) => {
          const newValue = e.target.value;
          setQuery(newValue);
          setSearchTerm(newValue);

          if (document.activeElement === inputRef.current) {
            setIsOpen(true);
            setHighlightedIndex(0);
          }

          autoResize(e.target as HTMLTextAreaElement);
          requestAnimationFrame(updateMenuPosition);
        }}
        onFocus={() => {
          if (isDisabled) return;

          // 🔑 Limpiar flags y timeouts
          if (blurTimeoutRef.current) {
            clearTimeout(blurTimeoutRef.current);
            blurTimeoutRef.current = null;
          }
          isSelectingRef.current = false;

          setIsOpen(true);
          setHighlightedIndex(0);
          setSearchTerm("");

          requestAnimationFrame(() => {
            autoResize();
            updateMenuPosition();
          });
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        isInvalid={!!error}
        disabled={isDisabled}
        readOnly={isDisabled}
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
      className="mb-1"
      ref={(element) => {
        containerRef.current = element;
      }}
      title={name}
    >
      <FloatingLabel
        controlId={name}
        label={floatingText}
        className="w-100 fs-6 fw-bold"
      >
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
