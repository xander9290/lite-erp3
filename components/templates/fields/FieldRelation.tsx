"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { FieldError, useController, useFormContext } from "react-hook-form";
import { Form, Dropdown, FloatingLabel, Button } from "react-bootstrap";
import { useAccess } from "@/contexts/AccessContext";
import { ColumnConfig } from "@/app/libs/definitions";
import RelationSearchModal from "../RelationSearchModal";
import { useRelation } from "@/hooks/useRelation";
import toast from "react-hot-toast";
import styles from "./FieldRelation.module.css";

export interface Many2OneOption {
  id: string;
  displayName?: string | null;
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
  | "<="
  | "some" // Para relaciones "some"
  | "every" // Para relaciones "every"
  | "none"; // Para relaciones "none"

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
  searchColumns?: ColumnConfig[];
}

interface MenuPosition {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
}

type FieldErrorWithId = FieldError & {
  id?: {
    message?: string;
  };
};

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
    fieldState: { error: err },
  } = useController({ name, control });

  const error: FieldErrorWithId | undefined = err;

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
  const errorShownRef = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(false);
  const valueRef = useRef<Many2OneValue | null>(value ?? null);
  const itemRefs = useRef(new Map<string, HTMLElement>()); // 📍 Mostrar toast cuando hay error (solo una vez por error)
  useEffect(() => {
    if (error && error.id && !errorShownRef.current) {
      toast.error(error.id?.message || "Error");
      errorShownRef.current = true;
    }

    if (!error?.id?.message) {
      errorShownRef.current = false;
    }
  }, [error?.id]);

  // Sincronizar query con value
  useEffect(() => {
    valueRef.current = value ?? null;

    if (!value) {
      setQuery("");
      return;
    }

    setQuery(value.name ?? value.displayName ?? "");
  }, [value]);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // 📍 Optimizado: Calcular posición con useCallback memoizado
  const updateMenuPosition = useCallback(() => {
    if (!inputRef.current) return;

    const rect = inputRef.current.getBoundingClientRect();

    const viewportHeight = window.innerHeight;

    const MENU_MAX_HEIGHT = 125;
    const MIN_SPACE_BELOW = 100;
    const SPACING = 4;

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    const openUpwards = spaceBelow < MIN_SPACE_BELOW && spaceAbove > spaceBelow;

    const maxHeight = Math.min(
      openUpwards ? spaceAbove - 8 : spaceBelow - 8,
      MENU_MAX_HEIGHT,
    );

    setMenuPosition({
      top: openUpwards ? rect.top - maxHeight - SPACING : rect.bottom + SPACING,
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

      // Opción 1: Cerrar el dropdown (comportamiento actual)
      setIsOpen(false);

      // Opción 2: Mantener el dropdown abierto (descomentar la siguiente línea)
      // setIsOpen(true);
      // search(""); // Resetear búsqueda para mostrar todas las opciones
    },
    [onChange, ponChange],
  );

  // 📍 Optimizado: Event listener con cleanup
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      const insideInput = containerRef.current?.contains(target);

      const insideMenu = menuRef.current?.contains(target);

      if (!insideInput && !insideMenu) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset highlighted index cuando cambian las opciones
  useEffect(() => setHighlightedIndex(0), [options]);

  // 📍 Optimizado: Manejo de scroll/resize con cleanup y throttle implícito
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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || options.length === 0) {
        if (e.key === "Escape") setIsOpen(false);
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) => Math.min(prev + 1, options.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          const selected = options[highlightedIndex];
          if (selected) handleSelect(selected);
          break;
        case "Escape":
          setIsOpen(false);
          break;
      }
    },
    [isOpen, options, highlightedIndex, handleSelect],
  );

  const openDropdown = useCallback(() => {
    if (readonly || access?.readonly) return;

    setIsOpen(true);

    // Si ya hay un valor seleccionado, limpiamos la query temporalmente
    // para mostrar todas las opciones o hacer una búsqueda vacía
    if (value && value.id) {
      // Guardamos la query actual para restaurarla después si es necesario
      // pero por ahora buscamos con string vacío
      search("");
    } else {
      search(query.trim());
    }

    requestAnimationFrame(updateMenuPosition);
  }, [readonly, access?.readonly, search, query, updateMenuPosition, value]);

  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = String(e.target.value);
      setQuery(newValue);
      setIsOpen(true);
      search(newValue.trim());
      requestAnimationFrame(updateMenuPosition);

      if (newValue.trim() === "") {
        onChange(null);
        ponChange?.(null, null);
      }
    },
    [search, onChange, ponChange, updateMenuPosition],
  );

  const handleInputFocus = useCallback(() => {
    if (readonly || access?.readonly) return;

    setIsOpen(true);

    // Si hay un valor seleccionado, temporalmente hacemos una búsqueda vacía
    // para mostrar más opciones, pero preservamos el query visual
    if (value?.id) {
      // Guardamos el query actual temporalmente
      search("");
      // Opcional: restaurar query después de un tiempo o mantenerlo
      // setQuery(currentQuery);
    } else {
      search(query.trim());
    }

    requestAnimationFrame(updateMenuPosition);
  }, [readonly, access?.readonly, value, query, search, updateMenuPosition]);

  const handleBlur = useCallback(() => {
    onBlur();

    requestAnimationFrame(() => {
      const active = document.activeElement;

      if (
        menuRef.current?.contains(active) ||
        containerRef.current?.contains(active)
      ) {
        return;
      }

      setIsOpen(false);

      if (valueRef.current?.id) {
        setQuery(valueRef.current.name ?? "");
      } else {
        setQuery("");
      }
    });
  }, [onBlur]);

  const handleOff = useCallback(() => {
    setQuery("");
    setIsOpen(false);

    onChange(null);
    ponChange?.(null, null);

    search("");

    inputRef.current?.focus();
  }, [onChange, ponChange, search]);

  // useEffect(() => {
  //   itemRefs.current[highlightedIndex]?.scrollIntoView({
  //     block: "nearest",
  //     behavior: "instant",
  //   });
  // }, [highlightedIndex]);

  // 📍 Optimizado: Memoizar el dropdown menu
  const dropdownMenu = useMemo(() => {
    if (!mounted || !isOpen || readonly || access?.readonly) return null;

    return createPortal(
      <div
        ref={menuRef}
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
            className={styles.dropdownMenu}
            onMouseDown={(e) => e.preventDefault()}
            style={{
              maxHeight: menuPosition.maxHeight,
              overflowY: "auto",
            }}
          >
            {options.length === 0 ? (
              <Dropdown.Item disabled className="text-muted">
                <small>No hay resultados</small>
              </Dropdown.Item>
            ) : (
              options.map((opt, index) => (
                <Dropdown.Item
                  ref={(el) => {
                    if (el) {
                      itemRefs.current.set(opt.id, el);
                    } else {
                      itemRefs.current.delete(opt.id);
                    }
                  }}
                  key={opt.id}
                  active={index === highlightedIndex}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(opt);
                  }}
                  className={styles.dropdownItem}
                >
                  {opt.displayName ?? opt.name}
                </Dropdown.Item>
              ))
            )}

            {searchColumns && searchColumns.length > 0 && (
              <Dropdown.Item
                className="text-primary"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                  setShowSearchModal(true);
                }}
              >
                <small>🔍 Buscar más...</small>
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
    menuPosition,
    options,
    highlightedIndex,
    handleSelect,
    searchColumns,
  ]);

  if (invisible || access?.invisible) return null;

  const input = (
    <>
      <Form.Control
        type="text"
        name={name}
        value={query}
        ref={inputRef}
        placeholder={placeholder}
        onChange={handleQueryChange}
        onFocus={handleInputFocus}
        onClick={openDropdown}
        onBlur={handleBlur} // 👈 Cambia onBlur por handleBlur
        autoComplete="off"
        isInvalid={!!error}
        readOnly={readonly || access?.readonly}
        autoFocus={autoFocus}
        className={[
          styles.relationInput,
          inline ? styles.inlineInput : "",
          className ?? "",
        ].join(" ")}
        onKeyDown={handleKeyDown}
        style={{ fontSize: "0.9rem" }}
      />
      {dropdownMenu}
      {searchColumns && searchColumns.length > 0 && (
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
      <div ref={containerRef} title={name} className={styles.inlineWrapper}>
        {input}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={styles.fieldWrapper}>
      <div className={styles.inputGroup}>
        <FloatingLabel
          label={label ?? name}
          className={styles.floatingLabel}
          title={name}
        >
          {input}
        </FloatingLabel>

        {!readonly && (
          <Button
            size="sm"
            variant="secondary"
            onClick={handleOff}
            disabled={readonly || access?.readonly}
            className={styles.clearButton}
            title="Limpiar selección"
          >
            <i className="bi bi-power" />
          </Button>
        )}
      </div>

      <Form.Control.Feedback
        type="invalid"
        className={error ? styles.feedbackVisible : styles.feedback}
      >
        {error?.message}
      </Form.Control.Feedback>
    </div>
  );
}
