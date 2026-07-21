// components/templates/card/CardTemplateLite.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Row, Col, Container, Spinner, Button } from "react-bootstrap";
import { useRouter } from "next/navigation";
import useSWR from "swr";

import { ColumnConfig, FilterValue, TableData } from "@/app/libs/definitions";

import { FilterBuilder } from "./table/FilterBuilder";
import { Pagination } from "./table/Pagination";

const EMPTY_DOMAIN: any[] = [];

interface CardTemplateProps<T extends { id: string }> {
  model: string;
  children: React.ReactNode;
  renderCard: (row: T) => React.ReactNode;
  onCardClick?: (row: T) => void;
  viewForm?: string;
  pageSize?: number;
  defaultOrder?: string;
  baseDomain?: any[];
  emptyMessage?: string;
  columnsGrid?: 1 | 2 | 3 | 4;
}

function buildNestedObject(
  path: string[],
  value: unknown,
): Record<string, any> {
  return path.reduceRight<Record<string, any>>(
    (acc, key) => ({ [key]: acc }),
    value as any,
  );
}

function buildSortForApi(
  field: string,
  dir: "asc" | "desc",
): Record<string, any> {
  return buildNestedObject(field.split("."), dir);
}

function parseDefaultOrder(defaultOrder?: string): {
  field: string;
  dir: "asc" | "desc";
} {
  if (!defaultOrder?.trim()) {
    return {
      field: "id",
      dir: "asc",
    };
  }

  const [field, direction] = defaultOrder.trim().split(/\s+/);

  return {
    field: field || "id",
    dir: direction?.toLowerCase() === "desc" ? "desc" : "asc",
  };
}

export function CardTemplateLite<T extends { id: string }>({
  model,
  children,
  renderCard,
  onCardClick,
  viewForm,
  pageSize = 100,
  defaultOrder,
  baseDomain = EMPTY_DOMAIN,
  emptyMessage = "No hay elementos para mostrar",
  columnsGrid = 4,
}: CardTemplateProps<T>) {
  const router = useRouter();

  const columns = useMemo<ColumnConfig[]>(() => {
    return React.Children.toArray(children)
      .filter(React.isValidElement)
      .map((child) => child.props as ColumnConfig);
  }, [children]);

  const [sort] = useState(() => parseDefaultOrder(defaultOrder));
  const [filters, setFilters] = useState<FilterValue[]>([]);
  const [page, setPage] = useState(1);

  const includes = useMemo<Record<string, any>>(() => {
    return columns.reduce<Record<string, any>>((acc, column) => {
      if (column.include) {
        Object.assign(acc, column.include);
      }

      return acc;
    }, {});
  }, [columns]);

  const columnTypes = useMemo(() => {
    return Object.fromEntries(
      columns.map((column) => [column.field, column.type ?? "string"]),
    );
  }, [columns]);

  const domainKey = useMemo(() => JSON.stringify(baseDomain), [baseDomain]);

  const apiUrl = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sort: JSON.stringify(buildSortForApi(sort.field, sort.dir)),
      filters: JSON.stringify(filters),
      domain: domainKey,
      columnTypes: JSON.stringify(columnTypes),
      includes: JSON.stringify(includes),
    });

    return `/api/tables/${model}?${params.toString()}`;
  }, [model, page, pageSize, sort, filters, domainKey, columnTypes, includes]);

  const { data, error, isLoading, isValidating, mutate } = useSWR<TableData<T>>(
    apiUrl,
    fetcher,
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    },
  );

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const clickable = Boolean(onCardClick || viewForm);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [model, pageSize, domainKey]);

  const handleFilter = useCallback((newFilters: FilterValue[]) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handleCardClick = useCallback(
    (row: T) => {
      if (onCardClick) {
        onCardClick(row);
        return;
      }

      if (viewForm) {
        const separator = viewForm.includes("?") ? "&" : "?";
        router.push(`${viewForm}${separator}id=${row.id}`);
      }
    },
    [onCardClick, router, viewForm],
  );

  const colProps = useMemo(() => {
    switch (columnsGrid) {
      case 1:
        return { xs: 12 };

      case 2:
        return {
          xs: 12,
          md: 6,
        };

      case 3:
        return {
          xs: 12,
          sm: 6,
          lg: 4,
        };

      case 4:
        return {
          xs: 12,
          sm: 6,
          lg: 4,
          xl: 3,
        };

      default:
        return {
          xs: 12,
          sm: 6,
          lg: 4,
        };
    }
  }, [columnsGrid]);

  return (
    <div
      className="position-relative d-flex flex-column"
      style={{
        height: "calc(100vh - 125px)",
        minHeight: 0,
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <FilterBuilder
          columns={columns}
          filters={filters}
          onChange={handleFilter}
        />

        {isValidating && data && (
          <Spinner
            animation="border"
            size="sm"
            aria-label="Actualizando registros"
          />
        )}
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between">
          <span>
            <i className="bi bi-exclamation-triangle me-2" />
            {error.message || "Error al cargar datos"}
          </span>

          <Button
            type="button"
            variant="outline-danger"
            size="sm"
            onClick={() => mutate()}
          >
            Reintentar
          </Button>
        </div>
      )}

      <div className="flex-grow-1 overflow-y-auto" style={{ minHeight: 0 }}>
        {isLoading && !data ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner animation="border" size="sm" className="me-2" />
            <span>Cargando registros...</span>
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center p-5 text-muted">{emptyMessage}</div>
        ) : (
          <Container fluid className="px-0">
            <Row className="g-2">
              {rows.map((row) => (
                <Col
                  key={row.id}
                  {...colProps}
                  role={clickable ? "button" : undefined}
                  tabIndex={clickable ? 0 : undefined}
                  onClick={clickable ? () => handleCardClick(row) : undefined}
                  onKeyDown={
                    clickable
                      ? (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleCardClick(row);
                          }
                        }
                      : undefined
                  }
                  style={{
                    cursor: clickable ? "pointer" : "default",
                  }}
                >
                  {renderCard(row)}
                </Col>
              ))}
            </Row>
          </Container>
        )}
      </div>

      {total > pageSize && (
        <div className="pt-3 d-flex justify-content-between align-items-center">
          <small className="text-muted">
            {total.toLocaleString()} registros
          </small>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            isLoading={isLoading || isValidating}
          />
        </div>
      )}
    </div>
  );
}

async function fetcher<T>(url: string): Promise<TableData<T>> {
  const response = await fetch(url);

  if (!response.ok) {
    const payload = await response
      .json()
      .catch(() => ({ error: "Error desconocido" }));

    throw new Error(payload.error || `Error HTTP ${response.status}`);
  }

  return response.json();
}
