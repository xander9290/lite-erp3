"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useController, useFormContext } from "react-hook-form";
import { Form, Dropdown, Badge } from "react-bootstrap";
import {
  fetchTags,
  createTag as createTagAction,
} from "@/app/actions/tag-actions";
import { useAccess } from "@/contexts/AccessContext";

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

  /* ---------------- Values ---------------- */
  const selectedIds = useMemo(
    () => (Array.isArray(value) ? value : []),
    [value],
  );

  // const selectedTags = useMemo(
  //   () => options.filter((o) => selectedIds.includes(o.id)),
  //   [options, selectedIds],
  // );

  const selectedTags = useMemo(() => {
    const set = new Set(selectedIds);
    return options.filter((o) => set.has(o.id));
  }, [options, selectedIds]);

  const filteredOptions = useMemo(() => {
    const selectedSet = new Set(selectedIds);
    return options.filter(
      (o) =>
        !selectedSet.has(o.id) &&
        (!query || o.name.toLowerCase().includes(query.toLowerCase())),
    );
  }, [options, selectedIds, query]);

  /* ---------------- Fetch tags ---------------- */
  useEffect(() => {
    const load = async () => {
      const tags = await fetchTags();
      setOptions(tags);
    };
    load();
  }, []);

  /* ---------------- Click outside ---------------- */
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

  /* ---------------- Handlers ---------------- */
  const handleSelect = (tag: TagOption) => {
    onChange([...selectedIds, tag.id]);
    setQuery("");
    setIsOpen(false);
    setHighlightedIndex(0);
  };

  const handleRemove = (id: string) => {
    onChange(selectedIds.filter((v) => v !== id));
  };

  const handleCreateTag = async (name: string) => {
    if (!name.trim()) return;

    const res = await createTagAction({ name: name.trim() });
    if (!res.data) return;

    const newTag: TagOption = {
      id: res.data.id,
      name: res.data.name,
    };

    setOptions((prev) => [...prev, newTag]);
    handleSelect(newTag);
  };

  /* ---------------- Keyboard ---------------- */
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
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
      } else {
        await handleCreateTag(query.trim());
      }
    }

    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  /* ---------------- UI ---------------- */
  const content = (
    <>
      {/* Selected tags */}
      <div className="d-flex flex-wrap gap-1 mt-2">
        {selectedTags.map((tag) => (
          <Badge
            key={tag.id}
            pill
            bg="secondary"
            className="d-flex align-items-center gap-1 px-2 py-1"
            style={{ fontSize: "0.9rem" }}
          >
            <span>{tag.name}</span>
            <span
              role="button"
              onClick={() => handleRemove(tag.id)}
              style={{ cursor: "pointer" }}
            >
              ×
            </span>
          </Badge>
        ))}
      </div>

      {/* Input */}
      <Form.Control
        type="text"
        value={query}
        onChange={(e) => {
          if (isSubmitting || readOnly || access?.readonly) return null;
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        size="sm"
        className="shadow-none border-0 border-bottom flex-grow-1 rounded-0"
        style={{ fontSize: "0.9rem" }}
        readOnly={isSubmitting || readOnly || access?.readonly}
      />

      {error && <div className="text-danger small mt-1">{error.message}</div>}

      {/* Dropdown */}
      {isOpen && filteredOptions.length > 0 && (
        <Dropdown show className="w-100">
          <Dropdown.Menu
            className="p-0 w-100"
            style={{ maxHeight: 200, overflowY: "auto", zIndex: 1050 }}
          >
            {filteredOptions.slice(0, 10).map((tag, index) => (
              <Dropdown.Item
                key={tag.id}
                active={index === highlightedIndex}
                onMouseDown={() => handleSelect(tag)}
                className="text-wrap border-bottom"
                style={{ fontSize: "0.9rem" }}
              >
                {tag.name}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      )}
    </>
  );

  if (invisible) return null;
  if (access?.invisible) return null;

  if (inline) {
    /* ---------------- Layout ---------------- */
    return (
      <div ref={containerRef} className={className} title={name}>
        {content}
      </div>
    );
  }

  return (
    <Form.Group ref={containerRef} className="mb-3">
      {label && <Form.Label className="fw-semibold m-0">{label}</Form.Label>}
      {content}
    </Form.Group>
  );
}
