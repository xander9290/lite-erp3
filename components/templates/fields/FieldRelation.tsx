// // "use client";

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

  // 📍 Mostrar toast cuando hay error (solo una vez por error)
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
    if (!value) {
      setQuery("");
      return;
    }
    setQuery(value.name ?? "");
  }, [value]);

  // 📍 Optimizado: Calcular posición con useCallback memoizado
  const updateMenuPosition = useCallback(() => {
    if (!inputRef.current) return;

    const rect = inputRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const DROPDOWN_HEIGHT = 220;
    const SPACING = 4;

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    const openUpwards = spaceBelow < DROPDOWN_HEIGHT && spaceAbove > spaceBelow;

    const top = openUpwards
      ? rect.top - DROPDOWN_HEIGHT - SPACING
      : rect.bottom + SPACING;

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
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
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
    onBlur(); // Llamar al onBlur original de react-hook-form

    // Pequeño delay para permitir que el click en el dropdown se registre
    setTimeout(() => {
      if (!isOpen) {
        // Si no hay valor seleccionado, limpiar query
        if (!value?.id) {
          setQuery("");
        } else {
          // Restaurar el nombre del valor seleccionado
          setQuery(value.name ?? "");
        }
      }
    }, 150);
  }, [onBlur, isOpen, value]);

  const handleOff = useCallback(() => {
    setQuery("");
    setIsOpen(true);
    onChange(null);
    ponChange?.(null, null);
    inputRef.current?.focus();
    requestAnimationFrame(updateMenuPosition);
  }, [onChange, ponChange, updateMenuPosition]);

  // 📍 Optimizado: Memoizar el dropdown menu
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
            className="p-0 mt-0"
            style={{ maxHeight: 200, overflowY: "auto" }}
          >
            {options.length === 0 ? (
              <Dropdown.Item disabled className="text-muted">
                <small>No hay resultados</small>
              </Dropdown.Item>
            ) : (
              options.map((opt, index) => (
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
        className={`w-100 shadow-none px-1 rounded-end-0 ${className ?? ""} ${inline ? "border-0" : ""}`}
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
      <div ref={containerRef} title={name} className="m-0 p-0 w-100">
        {input}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="mb-1 w-100">
      <div className="d-flex align-items-stretch">
        <FloatingLabel
          label={label ?? name}
          className="flex-grow-1 fs-6 fw-bold"
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
            className="rounded-start-0"
            title="Limpiar selección"
          >
            <i className="bi bi-power"></i>
          </Button>
        )}
      </div>

      {/* Mantenemos el feedback visual aunque el toast ya muestra el error */}
      <Form.Control.Feedback type="invalid" className={error ? "d-block" : ""}>
        {error?.message}
      </Form.Control.Feedback>
    </div>
  );
}
