"use client";

import { Button, Table } from "react-bootstrap";
import { FieldArrayMethodProps } from "react-hook-form";

type STHeader = {
  string: React.ReactNode;
  className?: string; // clase para cada <th>
  width?: number; // width opcional inicial
};

type SimpleTableTemplateProps<T> = {
  headers: STHeader[];
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode; // aquí decides la clase de <td>
  action?: () => void;
  className?: string;
};

export default function SimpleTable<T>({
  headers,
  data,
  renderRow,
  action,
  className,
}: SimpleTableTemplateProps<T>) {
  return (
    <Table size="sm" borderless hover className={className}>
      <thead className="sticky-top">
        <tr className="border-end border-bottom table-active">
          {headers.map((header, idx) => (
            <th
              key={idx}
              className={`${header.className} border-end text-nowrap`}
              style={{ minWidth: `${header.width}px` }}
            >
              {header.string}
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
              colSpan={headers.length + 1}
              className="border-0 p-0"
            >
              <Button
                size="sm"
                variant="link"
                onClick={action}
                className="border-0 text-decoration-none"
              >
                Agregar
              </Button>
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}
