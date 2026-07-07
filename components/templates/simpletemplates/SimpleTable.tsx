"use client";

import { extractEntityFromPath } from "@/contexts/AccessContext";
import { useAuth } from "@/hooks/sessionStore";
import { usePathname } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Table } from "react-bootstrap";
import styles from "./SimpleTable.module.css";

type STHeader = {
  string: React.ReactNode;
  className?: string;
  width?: number;
  minWidth?: number;
  name?: string;
};

type SimpleTableTemplateProps<T> = {
  headers: STHeader[];
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
  action?: () => void;
  className?: string;
  resizable?: boolean;
};

type ResizeState = {
  columnIndex: number;
  startX: number;
  startWidth: number;
} | null;

export function SimpleTable<T>({
  headers,
  data,
  renderRow,
  action,
  className,
  resizable = true,
}: SimpleTableTemplateProps<T>) {
  const tableRef = useRef<HTMLTableElement | null>(null);

  const { access } = useAuth();

  const pathName = usePathname();
  const entity = extractEntityFromPath(pathName);
  const modelAccess = access.filter((acc) => acc.entityType === entity);

  const visibleHeaders = useMemo(() => {
    return headers
      .map((header, originalIndex) => ({
        ...header,
        originalIndex,
      }))
      .filter((header) => {
        const fieldAccess = modelAccess.find(
          (acc) => acc.fieldName === header.name,
        );

        return !fieldAccess?.invisible;
      });
  }, [headers, modelAccess]);

  const [columnWidths, setColumnWidths] = useState<number[]>(
    headers.map((header) => header.width ?? 140),
  );

  const [resizeState, setResizeState] = useState<ResizeState>(null);

  useEffect(() => {
    setColumnWidths((prev) =>
      headers.map((header, index) => prev[index] ?? header.width ?? 140),
    );
  }, [headers]);

  useEffect(() => {
    if (!resizeState) return;

    const handleMouseMove = (event: MouseEvent) => {
      const delta = event.clientX - resizeState.startX;

      setColumnWidths((prev) => {
        const next = [...prev];
        const minWidth = headers[resizeState.columnIndex]?.minWidth ?? 60;

        next[resizeState.columnIndex] = Math.max(
          minWidth,
          resizeState.startWidth + delta,
        );

        return next;
      });
    };

    const handleMouseUp = () => {
      setResizeState(null);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [resizeState, headers]);

  const startResize = (
    event: React.MouseEvent<HTMLDivElement>,
    columnIndex: number,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setResizeState({
      columnIndex,
      startX: event.clientX,
      startWidth: columnWidths[columnIndex],
    });
  };

  const autoFitColumn = (columnIndex: number) => {
    const table = tableRef.current;
    if (!table) return;

    const minWidth = headers[columnIndex]?.minWidth ?? 60;

    const headerCell = table.querySelector(
      `thead th[data-column-index="${columnIndex}"]`,
    ) as HTMLTableCellElement | null;

    const bodyCells = Array.from(
      table.querySelectorAll(`tbody td[data-column-index="${columnIndex}"]`),
    ) as HTMLTableCellElement[];

    const measureElements = [headerCell, ...bodyCells].filter(
      Boolean,
    ) as HTMLElement[];

    if (measureElements.length === 0) {
      setColumnWidths((prev) => {
        const next = [...prev];
        next[columnIndex] = minWidth;
        return next;
      });

      return;
    }

    const measuredWidth = Math.max(
      ...measureElements.map((element) => {
        const clone = element.cloneNode(true) as HTMLElement;

        clone.style.position = "absolute";
        clone.style.visibility = "hidden";
        clone.style.pointerEvents = "none";
        clone.style.whiteSpace = "nowrap";
        clone.style.width = "auto";
        clone.style.minWidth = "0";
        clone.style.maxWidth = "none";
        clone.style.overflow = "visible";
        clone.style.textOverflow = "clip";
        clone.style.padding = getComputedStyle(element).padding;
        clone.style.font = getComputedStyle(element).font;
        clone.style.fontWeight = getComputedStyle(element).fontWeight;
        clone.style.letterSpacing = getComputedStyle(element).letterSpacing;
        clone.style.textTransform = getComputedStyle(element).textTransform;
        clone.style.border = getComputedStyle(element).border;
        clone.style.boxSizing = getComputedStyle(element).boxSizing;

        document.body.appendChild(clone);
        const width = Math.ceil(clone.getBoundingClientRect().width);
        document.body.removeChild(clone);

        return width;
      }),
    );

    const extraPadding = 20;

    setColumnWidths((prev) => {
      const next = [...prev];
      next[columnIndex] = Math.max(minWidth, measuredWidth + extraPadding);
      return next;
    });
  };

  const colgroup = useMemo(
    () => (
      <colgroup>
        {visibleHeaders.map((header) => (
          <col
            key={header.originalIndex}
            style={{
              width: `${columnWidths[header.originalIndex]}px`,
            }}
          />
        ))}
      </colgroup>
    ),
    [visibleHeaders, columnWidths],
  );

  return (
    <div className={[styles.tableShell, className ?? ""].join(" ")}>
      <div className={styles.tableScroller}>
        <Table
          ref={tableRef}
          size="sm"
          borderless
          className={styles.table}
          style={{
            tableLayout: "fixed",
            width: "max-content",
            minWidth: "100%",
          }}
        >
          {colgroup}

          <thead className={styles.tableHead}>
            <tr>
              {visibleHeaders.map((header, visibleIndex) => {
                const idx = header.originalIndex;

                return (
                  <th
                    key={idx}
                    data-column-index={idx}
                    className={[styles.headCell, header.className ?? ""].join(
                      " ",
                    )}
                    style={{
                      minWidth: `${header.minWidth ?? 60}px`,
                      width: `${columnWidths[idx]}px`,
                    }}
                    title={header.name}
                  >
                    <div className={styles.headContent}>
                      <span className={styles.headText}>{header.string}</span>

                      {resizable &&
                        visibleIndex < visibleHeaders.length - 1 && (
                          <div
                            className={[
                              styles.resizeHandle,
                              resizeState?.columnIndex === idx
                                ? styles.resizeHandleActive
                                : "",
                            ].join(" ")}
                            onMouseDown={(event) => startResize(event, idx)}
                            onDoubleClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              autoFitColumn(idx);
                            }}
                            title="Arrastra para redimensionar. Doble click para autoajustar."
                          />
                        )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className={styles.tableBody}>
            {data.map((item, index) => renderRow(item, index))}

            {action && (
              <tr className={styles.addRow}>
                <td
                  valign="middle"
                  colSpan={visibleHeaders.length}
                  className={styles.addCell}
                >
                  <Button
                    variant="link"
                    onClick={action}
                    className={styles.addButton}
                  >
                    <i className="bi bi-plus-circle" />
                    <span>Agregar</span>
                  </Button>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
