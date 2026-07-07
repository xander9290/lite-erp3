"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useController, useFormContext } from "react-hook-form";
import { Form, Dropdown, Badge } from "react-bootstrap";
import {
  fetchTags,
  createTag as createTagAction,
} from "@/app/(auth)/app/actions/tag-actions";
import { useAccess } from "@/contexts/AccessContext";
import { usePathname } from "next/navigation";
import styles from "./FieldTags.module.css";

interface TagOption {
  id: string;
  name: string;
  displayName?: string;
}

interface Many2manyTagsFieldProps {
  name: string;
  label?: string;
  className?: string;
  invisible?: boolean;
  disabled?: boolean;
  inline?: boolean;
  readOnly?: boolean;
}

export function FieldTags({
  name,
  label,
  className,
  invisible,
  disabled,
  inline,
  readOnly,
}: Many2manyTagsFieldProps) {
  const access = useAccess({ fieldName: name });
  const pathName = usePathname();

  const { control } = useFormContext();

  const {
    field: { value, onChange },
    fieldState: { error },
    formState: { isSubmitting },
  } = useController({ name, control });

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [options, setOptions] = useState<TagOption[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);

  const isReadonly = isSubmitting || readOnly || access?.readonly;
  const isDisabled = disabled || isSubmitting;

  const selectedIds = useMemo(
    () => (Array.isArray(value) ? value : []),
    [value],
  );

  const selectedTags = useMemo(() => {
    const set = new Set(selectedIds);
    return options.filter((o) => set.has(o.id));
  }, [options, selectedIds]);

  const filteredOptions = useMemo(() => {
    const selectedSet = new Set(selectedIds);
    const normalizedQuery = query.trim().toLowerCase();

    return options.filter((option) => {
      const isSelected = selectedSet.has(option.id);
      const matchesQuery =
        !normalizedQuery || option.name.toLowerCase().includes(normalizedQuery);

      return !isSelected && matchesQuery;
    });
  }, [options, selectedIds, query]);

  const canCreate =
    query.trim().length > 0 &&
    !options.some(
      (option) => option.name.toLowerCase() === query.trim().toLowerCase(),
    );

  useEffect(() => {
    const load = async () => {
      const getEntity = pathName.split("/")[2];
      const tags = await fetchTags({ entityName: getEntity.trim() });
      setOptions(tags);
    };

    load();
  }, [pathName]);

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
  }, [query]);

  const handleSelect = (tag: TagOption) => {
    if (isReadonly || isDisabled) return;

    onChange([...selectedIds, tag.id]);
    setQuery("");
    setIsOpen(false);
    setHighlightedIndex(0);
  };

  const handleRemove = (id: string) => {
    if (isReadonly || isDisabled) return;
    onChange(selectedIds.filter((v) => v !== id));
  };

  const handleCreateTag = async (name: string) => {
    if (isReadonly || isDisabled) return;
    if (!name.trim()) return;

    const getEntity = pathName.split("/")[2];

    const res = await createTagAction({
      name: name.trim().toUpperCase(),
      entityName: getEntity.trim(),
    });

    if (!res.data) return;

    const newTag: TagOption = {
      id: res.data.id,
      name: res.data.name,
    };

    setOptions((prev) => [...prev, newTag]);
    handleSelect(newTag);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isReadonly || isDisabled) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((i) => (i + 1 < filteredOptions.length ? i + 1 : i));
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => (i > 0 ? i - 1 : 0));
    }

    if (e.key === "Enter") {
      e.preventDefault();

      const tag = filteredOptions[highlightedIndex];

      if (tag) {
        handleSelect(tag);
        return;
      }

      if (canCreate) {
        await handleCreateTag(query.trim());
      }
    }

    if (e.key === "Backspace" && !query && selectedIds.length > 0) {
      e.preventDefault();
      handleRemove(selectedIds[selectedIds.length - 1]);
    }

    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  if (invisible || access?.invisible) return null;

  const content = (
    <>
      <div
        className={[
          styles.tagsBox,
          error ? styles.tagsBoxInvalid : "",
          isReadonly ? styles.tagsBoxReadonly : "",
        ].join(" ")}
        onClick={() => {
          if (!isReadonly && !isDisabled) {
            setIsOpen(true);
          }
        }}
      >
        {selectedTags.length > 0 && (
          <div className={styles.selectedTags}>
            {selectedTags.map((tag) => (
              <Badge key={tag.id} pill className={styles.tagBadge}>
                <span>{tag.displayName ?? tag.name}</span>

                {!isReadonly && !isDisabled && (
                  <button
                    type="button"
                    className={styles.removeTagButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(tag.id);
                    }}
                    title={`Quitar ${tag.name}`}
                  >
                    ×
                  </button>
                )}
              </Badge>
            ))}
          </div>
        )}

        <Form.Control
          type="text"
          value={query}
          placeholder={selectedTags.length ? "" : "Agregar etiqueta..."}
          onChange={(e) => {
            if (isReadonly || isDisabled) return;
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (!isReadonly && !isDisabled) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          readOnly={isReadonly}
          size="sm"
          className={styles.tagsInput}
        />
      </div>

      {error && <div className={styles.errorText}>{error.message}</div>}

      {isOpen && !isReadonly && !isDisabled && (
        <Dropdown show className={styles.dropdown}>
          <Dropdown.Menu show className={styles.dropdownMenu}>
            {filteredOptions.slice(0, 10).map((tag, index) => (
              <Dropdown.Item
                key={tag.id}
                active={index === highlightedIndex}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(tag);
                }}
                className={styles.dropdownItem}
              >
                <i className="bi bi-tag" />
                <span>{tag.name}</span>
              </Dropdown.Item>
            ))}

            {filteredOptions.length === 0 && !canCreate && (
              <Dropdown.Item disabled className={styles.emptyItem}>
                No hay etiquetas disponibles
              </Dropdown.Item>
            )}

            {canCreate && (
              <Dropdown.Item
                onMouseDown={async (e) => {
                  e.preventDefault();
                  await handleCreateTag(query.trim());
                }}
                className={styles.createItem}
              >
                <i className="bi bi-plus-circle" />
                <span>
                  Crear etiqueta <strong>{query.trim().toUpperCase()}</strong>
                </span>
              </Dropdown.Item>
            )}
          </Dropdown.Menu>
        </Dropdown>
      )}
    </>
  );

  if (inline) {
    return (
      <div
        ref={containerRef}
        className={[styles.inlineWrapper, className ?? ""].join(" ")}
        title={name}
      >
        {content}
      </div>
    );
  }

  return (
    <Form.Group
      ref={containerRef}
      className={[styles.fieldWrapper, className ?? ""].join(" ")}
      title={name}
    >
      {label && <Form.Label className={styles.label}>{label}</Form.Label>}
      {content}
    </Form.Group>
  );
}
