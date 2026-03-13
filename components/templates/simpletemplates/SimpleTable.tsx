"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Table } from "react-bootstrap";

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

    const extraPadding = 16;

    setColumnWidths((prev) => {
      const next = [...prev];
      next[columnIndex] = Math.max(minWidth, measuredWidth + extraPadding);
      return next;
    });
  };

  const colgroup = useMemo(
    () => (
      <colgroup>
        {headers.map((_, index) => (
          <col
            key={index}
            style={{
              width: `${columnWidths[index]}px`,
            }}
          />
        ))}
      </colgroup>
    ),
    [headers, columnWidths],
  );

  return (
    <div className="w-100 overflow-auto">
      <Table
        ref={tableRef}
        size="sm"
        borderless
        className={className}
        style={{
          tableLayout: "fixed",
          width: "max-content",
          minWidth: "100%",
        }}
      >
        {colgroup}

        <thead className="">
          <tr className="border-end border-bottom table-active">
            {headers.map((header, idx) => (
              <th
                key={idx}
                data-column-index={idx}
                className={`${header.className ?? ""} border-end position-relative`}
                style={{
                  minWidth: `${header.minWidth ?? 60}px`,
                  width: `${columnWidths[idx]}px`,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={header.name}
              >
                <div className="position-relative w-100">
                  <span
                    className="d-block text-truncate pe-2"
                    style={{ width: "100%" }}
                  >
                    {header.string}
                  </span>

                  {resizable && idx < headers.length - 1 && (
                    <div
                      onMouseDown={(event) => startResize(event, idx)}
                      onDoubleClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        autoFitColumn(idx);
                      }}
                      title="Arrastra para redimensionar. Doble click para autoajustar."
                      style={{
                        position: "absolute",
                        top: 0,
                        right: -4,
                        width: 8,
                        height: "100%",
                        cursor: "col-resize",
                        zIndex: 10,
                      }}
                    />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length > 0
            ? data.map((item, index) => renderRow(item, index))
            : null}

          {action && (
            <tr>
              <td
                valign="middle"
                colSpan={headers.length}
                className="border-0 p-0"
              >
                <Button
                  size="sm"
                  variant="link"
                  onClick={action}
                  className="border-0 text-decoration-none shadow-none"
                >
                  Agregar
                </Button>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}
