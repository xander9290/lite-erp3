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
import { Form, Dropdown, Badge } from "react-bootstrap";
import { useAccess } from "@/contexts/AccessContext";
import styles from "./FieldRelationTags.module.css";

export interface Many2ManyOption {
  id: string;
  name: string;
  displayName?: string;
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
  inline?: boolean;
}

interface MenuPosition {
  top: number;
  left: number;
  width: number;
}

export function FieldRelationTags({
  name,
  model,
  label,
  disabled,
  className,
  invisible,
  domain,
  required,
  inline,
}: Props) {
  const access = useAccess({ fieldName: name });
  const { control } = useFormContext();

  const {
    field,
    fieldState: { error },
    formState: { isSubmitting },
  } = useController({ name, control });

  const value = (field.value as Many2ManyOption[] | undefined) ?? [];
  const setValue = field.onChange;

  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<Many2ManyOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({
    top: 0,
    left: 0,
    width: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const isReadonly = isSubmitting || access?.readonly;
  const isDisabled = disabled || isSubmitting;

  const serializedDomain = useMemo(
    () => JSON.stringify(domain ?? []),
    [domain],
  );

  const selectedObjects = value;

  const updateMenuPosition = useCallback(() => {
    if (!inputRef.current) return;

    const rect = inputRef.current.getBoundingClientRect();

    setMenuPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchOptions = useCallback(
    async (search: string) => {
      if (abortRef.current) abortRef.current.abort();

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const params = new URLSearchParams({
          search,
          limit: "8",
          domain: serializedDomain,
          excludeIds: value.map((v) => v.id).join(","),
        });

        const res = await fetch(`/api/m2o/${model}?${params.toString()}`, {
          signal: controller.signal,
        });

        const data = await res.json();
        const safeData = Array.isArray(data) ? data : [];

        const filtered = safeData.filter(
          (opt: Many2ManyOption) => !value.some((v) => v.id === opt.id),
        );

        setOptions(filtered);
      } catch (err: any) {
        if (err.name !== "AbortError") console.error(err);
      }
    },
    [model, value, serializedDomain],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!isOpen || isDisabled || isReadonly) return;

    debounceRef.current = setTimeout(() => {
      fetchOptions(query.trim());
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchOptions, isOpen, isDisabled, isReadonly]);

  const handleSelect = (option: Many2ManyOption) => {
    if (isReadonly || isDisabled) return;

    if (value.some((v) => v.id === option.id)) {
      setIsOpen(false);
      setQuery("");
      return;
    }

    setValue([
      ...value,
      {
        id: option.id,
        name: option.displayName ?? option.name,
      },
    ]);

    setQuery("");
    setIsOpen(false);
    setHighlightedIndex(0);

    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleRemove = (id: string) => {
    if (isReadonly || isDisabled) return;
    setValue(value.filter((v) => v.id !== id));
  };

  const openDropdown = () => {
    if (isReadonly || isDisabled) return;

    setIsOpen(true);
    fetchOptions(query.trim());
    requestAnimationFrame(updateMenuPosition);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isReadonly || isDisabled) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
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
      const option = options[highlightedIndex];

      if (option) handleSelect(option);
      return;
    }

    if (e.key === "Escape") {
      setIsOpen(false);
      return;
    }

    if (e.key === "Backspace" && query === "" && value.length > 0) {
      e.preventDefault();
      handleRemove(value[value.length - 1].id);
    }
  };

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

    const handleScrollOrResize = () => {
      requestAnimationFrame(updateMenuPosition);
    };

    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("scroll", handleScrollOrResize, true);

    return () => {
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("scroll", handleScrollOrResize, true);
    };
  }, [isOpen, updateMenuPosition]);

  if (invisible || access?.invisible) return null;

  const dropdownMenu =
    mounted && isOpen && !isReadonly && !isDisabled
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
              <Dropdown.Menu show className={styles.dropdownMenu}>
                {options.length > 0 ? (
                  options.map((option, index) => (
                    <Dropdown.Item
                      key={option.id}
                      active={index === highlightedIndex}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelect(option);
                      }}
                      className={styles.dropdownItem}
                    >
                      <i className="bi bi-link-45deg" />
                      <span>{option.displayName ?? option.name}</span>
                    </Dropdown.Item>
                  ))
                ) : (
                  <Dropdown.Item disabled className={styles.emptyItem}>
                    No hay resultados
                  </Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </div>,
          document.body,
        )
      : null;

  return (
    <div
      ref={containerRef}
      className={[
        inline ? styles.inlineWrapper : styles.fieldWrapper,
        className ?? "",
      ].join(" ")}
      title={name}
    >
      {label && !inline && (
        <Form.Label className={styles.label}>
          {label}
          {required && <span className={styles.requiredMark}>*</span>}
        </Form.Label>
      )}

      <div
        className={[
          styles.relationTagsBox,
          error ? styles.relationTagsBoxInvalid : "",
          isReadonly ? styles.relationTagsBoxReadonly : "",
        ].join(" ")}
        onClick={() => inputRef.current?.focus()}
      >
        {selectedObjects.map((opt) => (
          <Badge key={opt.id} pill className={styles.relationBadge}>
            <span>{opt.name}</span>

            {!isDisabled && !isReadonly && (
              <button
                type="button"
                className={styles.removeButton}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemove(opt.id);
                }}
                aria-label={`Quitar ${opt.name ?? opt.id}`}
              >
                ×
              </button>
            )}
          </Badge>
        ))}

        {!isDisabled && (
          <Form.Control
            ref={inputRef}
            type="text"
            value={query}
            readOnly={isReadonly}
            placeholder={
              selectedObjects.length > 0
                ? ""
                : label
                  ? `Buscar ${label.toLowerCase()}...`
                  : "Buscar..."
            }
            onChange={(e) => {
              if (isReadonly) return;
              setQuery(e.target.value);
              setIsOpen(true);
              requestAnimationFrame(updateMenuPosition);
            }}
            onFocus={openDropdown}
            onClick={openDropdown}
            onKeyDown={handleKeyDown}
            size="sm"
            className={styles.relationInput}
            autoComplete="off"
          />
        )}
      </div>

      {error && <div className={styles.errorText}>{error.message}</div>}

      {dropdownMenu}
    </div>
  );
}
