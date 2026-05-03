// components/templates/card/CardTemplateLite.tsx
"use client";

import React, { useState } from "react";
import { Row, Col, Container } from "react-bootstrap";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { ColumnConfig, FilterValue, TableData } from "@/app/libs/definitions";
import { FilterBuilder } from "./table/FilterBuilder";
import { Pagination } from "./table/Pagination";

interface CardTemplateProps {
  model: string;
  children: React.ReactNode;
  renderCard: (row: any) => React.ReactNode;
  onCardClick?: (row: any) => void;
  viewForm?: string;
  pageSize?: number;
  defaultOrder?: string;
  baseDomain?: any[];
  emptyMessage?: string;
  columnsGrid?: 1 | 2 | 3 | 4;
}

function buildSortForApi(field: string, dir: "asc" | "desc"): any {
  if (!field.includes(".")) {
    return { [field]: dir };
  }
  const [relation, ...path] = field.split(".");
  return { [relation]: { [path.join(".")]: dir } };
}

export function CardTemplateLite({
  model,
  children,
  renderCard,
  onCardClick,
  viewForm,
  pageSize = 20,
  defaultOrder,
  baseDomain = [],
  emptyMessage = "No hay elementos para mostrar",
  columnsGrid = 3,
}: CardTemplateProps) {
  const router = useRouter();

  // Extraer columnas de los children
  const columns: ColumnConfig[] = React.Children.toArray(children)
    .filter((child) => React.isValidElement(child))
    .map((child) => child.props as ColumnConfig);

  // Estado
  const [sort] = useState<{ field: string; dir: "asc" | "desc" }>(() => {
    if (defaultOrder) {
      const [field, dir] = defaultOrder.split(" ");
      return {
        field,
        dir: dir?.toLowerCase() === "desc" ? "desc" : "asc",
      };
    }
    return { field: "id", dir: "asc" };
  });

  const [filters, setFilters] = useState<FilterValue[]>([]);
  const [page, setPage] = useState(1);

  // Construir includes desde las columnas
  const includes = columns.reduce((acc, col) => {
    if (col.include) Object.assign(acc, col.include);
    return acc;
  }, {});

  // Construir URL
  const sortForApi = buildSortForApi(sort.field, sort.dir);

  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    sort: JSON.stringify(sortForApi),
    filters: JSON.stringify(filters),
    domain: JSON.stringify(baseDomain),
    columnTypes: JSON.stringify(
      Object.fromEntries(
        columns.map((col) => [col.field, col.type || "string"]),
      ),
    ),
    includes: JSON.stringify(includes),
  });

  const apiUrl = `/api/tables/${model}?${params}`;

  // SWR
  const { data, error, isLoading } = useSWR<TableData>(apiUrl, fetcher);

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;

  // Handlers
  const handleFilter = (newFilters: FilterValue[]) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleCardClick = (row: any) => {
    if (onCardClick) {
      onCardClick(row);
      return;
    }
    if (viewForm) {
      router.push(`${viewForm}&id=${row.id}`);
    }
  };

  // Grid responsive
  const getColProps = () => {
    switch (columnsGrid) {
      case 1:
        return { xs: 12 };
      case 2:
        return { xs: 12, md: 6 };
      case 3:
        return { xs: 12, sm: 6, lg: 4 };
      case 4:
        return { xs: 12, sm: 6, md: 4, lg: 3 };
      default:
        return { xs: 12, sm: 6, lg: 4 };
    }
  };

  return (
    <div className="position-relative">
      {/* Toolbar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <FilterBuilder
          columns={columns}
          filters={filters}
          onChange={handleFilter}
        />
      </div>

      {/* Cards Grid */}
      {rows.length === 0 && !isLoading ? (
        <div className="text-center p-5 text-muted">{emptyMessage}</div>
      ) : (
        <>
          <Container fluid>
            <Row className="g-3">
              {rows.map((row: any) => (
                <Col
                  key={row.id}
                  onClick={() => handleCardClick(row)}
                  style={{
                    cursor: onCardClick || viewForm ? "pointer" : "default",
                  }}
                  {...getColProps()}
                >
                  {renderCard(row)}
                </Col>
              ))}
            </Row>
          </Container>

          {/* Pagination */}
          {total > pageSize && (
            <div className="mt-4 d-flex justify-content-between align-items-center">
              <small className="text-muted">
                {total.toLocaleString()} registros
              </small>
              <Pagination
                currentPage={page}
                totalPages={Math.ceil(total / pageSize)}
                onPageChange={setPage}
                isLoading={isLoading}
              />
            </div>
          )}
        </>
      )}

      {/* Error */}
      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2" />
          {error.message || "Error al cargar datos"}
        </div>
      )}
    </div>
  );
}

async function fetcher(url: string): Promise<TableData> {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  return res.json();
}
