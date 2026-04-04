"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useController, useFormContext } from "react-hook-form";
import { Form, Dropdown, Button, FloatingLabel } from "react-bootstrap";
import { useAccess } from "@/contexts/AccessContext";
import { TableTemplateColumn } from "../TableTemplate";
import RelationSearchModal from "../RelationSearchModal";
import { useRelation } from "@/hooks/useRelation";

export interface Many2OneOption {
  id: string;
  name?: string | null;
  [key: string]: any;
}

export type Many2OneValue = {
  id: string;
  name?: string | null;
};

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

  ponChange?: (value: string | null, record: T | null) => void;

  domain?: Domain;
  placeholder?: string;

  searchColumns?: TableTemplateColumn<T>[];
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

  const { options, search } = useRelation<T>({
    model,
    domain,
  });

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 0,
  });
  const [showSearchModal, setShowSearchModal] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ✅ 🔥 NUEVO: usar value directamente (sin fetch)
  useEffect(() => {
    if (!value) {
      setQuery("");
      return;
    }

    setQuery(value.name ?? "");
  }, [value]);

  const updateMenuPosition = useCallback(() => {
    if (!inputRef.current) return;

    const rect = inputRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 220;

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

  useEffect(() => setMounted(true), []);

  const handleSelect = useCallback(
    (record: T) => {
      const newValue = {
        id: record.id,
        name: record.displayName ?? record.name,
      };

      onChange(newValue);
      ponChange?.(record.id, record);

      setQuery(newValue.name ?? "");
      setIsOpen(false);
    },
    [onChange, ponChange],
  );

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

  useEffect(() => setHighlightedIndex(0), [options]);

  useEffect(() => {
    if (!isOpen) return;

    updateMenuPosition();

    const handleScroll = () => updateMenuPosition();
    const handleResize = () => updateMenuPosition();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen, updateMenuPosition]);

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

    if (e.key === "Escape") setIsOpen(false);
  };

  const handleOff = () => {
    setQuery("");
    setIsOpen(true);
    onChange(null);
    ponChange?.(null, null);
    inputRef.current?.focus();
    requestAnimationFrame(updateMenuPosition);
  };

  const openDropdown = useCallback(() => {
    if (readonly || access?.readonly) return;

    setIsOpen(true);
    search(query.trim()); // 🔥 antes fetchOptions
    requestAnimationFrame(updateMenuPosition);
  }, [readonly, access?.readonly, search, query, updateMenuPosition]);

  const dropdownMenu =
    !mounted || !isOpen || readonly || access?.readonly
      ? null
      : createPortal(
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
                className="p-0 mt-0"
                style={{ maxHeight: 200, overflowY: "auto" }}
              >
                {options.map((opt, index) => (
                  <Dropdown.Item
                    key={opt.id}
                    active={index === highlightedIndex}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(opt);
                    }}
                    className="p-1"
                    style={{ fontSize: "0.9rem" }}
                  >
                    {opt.name}
                  </Dropdown.Item>
                ))}

                {searchColumns && (
                  <Dropdown.Item
                    className="text-primary"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setIsOpen(false);
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

  if (invisible || access?.invisible) return null;

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

          // 🔥 ESTA LÍNEA FALTABA
          search(newValue.trim());

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
    <div ref={containerRef} className="mb-1">
      <div className="d-flex align-items-stretch">
        <FloatingLabel
          label={label ?? name}
          className="flex-grow-1 fs-6 fw-bold"
          title={name}
        >
          {input}
        </FloatingLabel>

        <Button
          size="sm"
          variant="light"
          onClick={handleOff}
          disabled={readonly || access?.readonly}
          className="rounded-start-0"
        >
          <i className="bi bi-power"></i>
        </Button>
      </div>

      <Form.Control.Feedback type="invalid" className={error ? "d-block" : ""}>
        {error?.message}
      </Form.Control.Feedback>
    </div>
  );
}
