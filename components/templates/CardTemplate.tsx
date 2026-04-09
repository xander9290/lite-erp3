// components/CardTemplate.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Form,
  Button,
  Spinner,
  Badge,
  Row,
  Col,
  Container,
} from "react-bootstrap";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/sessionStore";
import useSWR from "swr";

export type CardTemplateColumn<T> = {
  key: string;
  fieldName?: string;
  label: string;
  type?: "string" | "number" | "date" | "datetime" | "boolean";
  accessor: (row: T) => unknown;
  render?: (row: T, index: number) => React.ReactNode;
};

type CardApiResponse<T> = {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
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

type FilterCondition = {
  id: string;
  field: string;
  operator: DomainOperator;
  value: string;
};

type CardTemplateProps<T> = {
  model: string;
  columns: CardTemplateColumn<T>[];
  getRowId: (row: T) => string;
  renderCard: (row: T) => React.ReactNode; // Personalización total de cada tarjeta
  onCardClick?: (row: T) => void;
  viewForm?: string;
  pageSize?: number;
  defaultOrder?: string;
  domain?: Domain;
  includes?: any;
  emptyMessage?: string;
  columnsGrid?: number; // Número de columnas en la cuadrícula (1, 2, 3, 4, etc.)
};

const fetcher = async <T,>(url: string): Promise<CardApiResponse<T>> => {
  const res = await fetch(url);
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return res.json();
};

function parseDefaultOrder(defaultOrder?: string): {
  key: string | null;
  direction: "asc" | "desc";
} {
  if (!defaultOrder?.trim()) {
    return { key: null, direction: "asc" };
  }
  const parts = defaultOrder.trim().split(/\s+/);
  return {
    key: parts[0] ?? null,
    direction: (parts[1] ?? "asc").toLowerCase() === "desc" ? "desc" : "asc",
  };
}

const getOperatorsByType = (type?: string): DomainOperator[] => {
  switch (type) {
    case "number":
    case "date":
    case "datetime":
      return ["=", "!=", ">", ">=", "<", "<="];
    case "boolean":
      return ["=", "!="];
    default:
      return ["contains", "=", "!=", "startsWith", "endsWith"];
  }
};

const operatorLabels: Record<DomainOperator, string> = {
  "=": "Igual a",
  "!=": "Diferente de",
  contains: "Contiene",
  startsWith: "Empieza con",
  endsWith: "Termina con",
  in: "Está en",
  notIn: "No está en",
  ">": "Mayor que",
  ">=": "Mayor o igual que",
  "<": "Menor que",
  "<=": "Menor o igual que",
};

const formatFilterValue = (value: string, type?: string): string => {
  if (type === "date" && value.match(/^\d{4}-\d{2}-\d{2}/)) {
    const [year, month, day] = value.split("-");
    if (day) return `${day}/${month}/${year}`;
  }
  return value;
};

export default function CardTemplate<T>({
  model,
  columns,
  getRowId,
  renderCard,
  onCardClick,
  viewForm,
  pageSize: pageSizeProp = 20,
  defaultOrder,
  domain: externalDomain,
  includes,
  emptyMessage = "No hay elementos para mostrar",
  columnsGrid = 3, // Por defecto 3 columnas
}: CardTemplateProps<T>) {
  const router = useRouter();
  const { access } = useAuth();
  const modelName = viewForm?.split("?")[0].split("/")[2];
  const accesProps = access.filter((acc) => acc.entityType === modelName);

  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>(
    [],
  );
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [newFilterField, setNewFilterField] = useState<string>("");
  const [newFilterOperator, setNewFilterOperator] =
    useState<DomainOperator>("contains");
  const [newFilterValue, setNewFilterValue] = useState<string>("");

  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: "asc" | "desc";
  }>(() => parseDefaultOrder(defaultOrder));

  const [page, setPage] = useState(1);
  const pageSize = pageSizeProp;

  useEffect(() => {
    setSortConfig(parseDefaultOrder(defaultOrder));
    setPage(1);
  }, [defaultOrder]);

  useEffect(() => {
    setPage(1);
  }, [JSON.stringify(externalDomain)]);

  const fieldsParam = useMemo(() => {
    const keys = new Set<string>();
    for (const c of columns) keys.add(c.key);
    keys.add("id");
    return Array.from(keys).join(",");
  }, [columns]);

  const serializedDomain = useMemo(() => {
    const domainFromConditions: Domain = filterConditions
      .filter((fc) => fc.field && fc.value)
      .map((fc) => [fc.field, fc.operator, fc.value]);
    const allDomain = [...(externalDomain || []), ...domainFromConditions];
    return JSON.stringify(allDomain);
  }, [externalDomain, filterConditions]);

  const buildUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    params.set("fields", fieldsParam);
    if (sortConfig.key) {
      params.set("sortKey", sortConfig.key);
      params.set("sortDir", sortConfig.direction);
    }
    params.set("domain", serializedDomain);
    params.set("includes", JSON.stringify(includes ?? {}));
    return `/api/tables/${model}?${params.toString()}`;
  }, [
    model,
    page,
    pageSize,
    fieldsParam,
    sortConfig.key,
    sortConfig.direction,
    serializedDomain,
    includes,
  ]);

  const { data, error, isLoading } = useSWR<CardApiResponse<T>>(
    buildUrl,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    },
  );

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleAddFilter = () => {
    if (!newFilterField || !newFilterValue) return;

    let finalValue = newFilterValue;
    const columnType = getColumnByKey(newFilterField)?.type;

    if (columnType === "date" || columnType === "datetime") {
      if (/^\d{4}-\d{2}-\d{2}$/.test(newFilterValue)) {
        finalValue = `${newFilterValue}T00:00:00.000Z`;
      } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(newFilterValue)) {
        finalValue = `${newFilterValue}:00.000Z`;
      }
    }

    const newCondition: FilterCondition = {
      id: crypto.randomUUID(),
      field: newFilterField,
      operator: newFilterOperator,
      value: finalValue,
    };

    setFilterConditions([...filterConditions, newCondition]);
    setNewFilterField("");
    setNewFilterOperator("contains");
    setNewFilterValue("");
    setPage(1);
  };

  const handleRemoveFilter = (id: string) => {
    setFilterConditions(filterConditions.filter((fc) => fc.id !== id));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilterConditions([]);
    setPage(1);
  };

  const getColumnByKey = (key: string) => {
    return columns.find((c) => c.key === key);
  };

  const selectedColumnType = getColumnByKey(newFilterField)?.type;

  const handleCardClick = (row: T) => {
    if (onCardClick) {
      onCardClick(row);
      return;
    }
    if (viewForm) {
      const id = getRowId(row);
      router.push(`${viewForm}&id=${id}`);
    }
  };

  // Determinar el ancho de las columnas basado en columnsGrid
  const getColProps = () => {
    switch (columnsGrid) {
      case 1:
        return { xs: 12 };
      case 2:
        return { xs: 12, md: 6 };
      case 3:
        return { xs: 12, sm: 6, md: 6, lg: 6, xl: 2 };
      case 4:
        return { xs: 12, md: 6, lg: 3 };
      default:
        return { xs: 12, md: 6, lg: 4 };
    }
  };

  return (
    <div className="position-relative">
      {isLoading && (
        <div
          className="position-absolute end-0 top-0 me-2 mt-2 d-flex align-items-center gap-2 text-muted"
          style={{ zIndex: 5 }}
        >
          <Spinner size="sm" />
          <span className="small">Cargando…</span>
        </div>
      )}

      {error && <div className="text-danger small mb-2">{error.message}</div>}

      {/* Panel de filtros (igual que en TableTemplate) */}
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={() => setShowFilterPanel(!showFilterPanel)}
          >
            <i
              className={`bi ${showFilterPanel ? "bi-eye-slash" : "bi-funnel"}`}
            ></i>
            {showFilterPanel ? "Ocultar filtros" : "Mostrar filtros"}
            {filterConditions.length > 0 && (
              <Badge bg="primary" className="ms-2">
                {filterConditions.length}
              </Badge>
            )}
          </Button>
          {filterConditions.length > 0 && (
            <Button
              size="sm"
              variant="outline-danger"
              onClick={handleClearFilters}
            >
              <i className="bi bi-trash"></i> Limpiar filtros
            </Button>
          )}
        </div>

        {showFilterPanel && (
          <div className="border rounded p-2">
            {/* Filtros activos */}
            {filterConditions.length > 0 && (
              <div className="mb-3">
                <strong>Filtros activos:</strong>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {filterConditions.map((filter) => {
                    const col = getColumnByKey(filter.field);
                    const displayValue = formatFilterValue(
                      filter.value,
                      col?.type,
                    );
                    return (
                      <Badge
                        key={filter.id}
                        bg="primary"
                        className="d-flex align-items-center gap-2 py-2 px-3"
                        style={{ fontSize: "0.85rem" }}
                      >
                        <span>
                          {col?.label || filter.field}:
                          {operatorLabels[filter.operator]} {displayValue}
                        </span>
                        <i
                          className="bi bi-x-circle-fill"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleRemoveFilter(filter.id)}
                        ></i>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Agregar nuevo filtro */}
            <div className="row g-2 align-items-end">
              <div className="col-auto">
                <Form.Label className="small mb-0">Campo</Form.Label>
                <Form.Select
                  size="sm"
                  value={newFilterField}
                  onChange={(e) => {
                    setNewFilterField(e.target.value);
                    const col = getColumnByKey(e.target.value);
                    if (col) {
                      setNewFilterOperator(getOperatorsByType(col.type)[0]);
                      setNewFilterValue("");
                    }
                  }}
                  style={{ width: "220px" }}
                >
                  <option value="">Seleccionar campo</option>
                  {columns.map((col) => {
                    const fieldAccess = accesProps.find(
                      (acc) => acc.fieldName === col.fieldName,
                    );
                    if (fieldAccess?.invisible) return null;
                    return (
                      <option key={col.key} value={col.key}>
                        {col.label}
                      </option>
                    );
                  })}
                </Form.Select>
              </div>

              <div className="col-auto">
                <Form.Label className="small mb-0">Operador</Form.Label>
                <Form.Select
                  size="sm"
                  value={newFilterOperator}
                  onChange={(e) =>
                    setNewFilterOperator(e.target.value as DomainOperator)
                  }
                  style={{ width: "140px" }}
                  disabled={!newFilterField}
                >
                  {getOperatorsByType(selectedColumnType).map((op) => (
                    <option key={op} value={op}>
                      {operatorLabels[op]}
                    </option>
                  ))}
                </Form.Select>
              </div>

              <div className="col-auto">
                <Form.Label className="small mb-0">Valor</Form.Label>
                {selectedColumnType === "date" ? (
                  <Form.Control
                    size="sm"
                    type="date"
                    value={newFilterValue}
                    onChange={(e) => setNewFilterValue(e.target.value)}
                    style={{ width: "180px" }}
                    disabled={!newFilterField}
                  />
                ) : selectedColumnType === "datetime" ? (
                  <Form.Control
                    size="sm"
                    type="datetime-local"
                    value={newFilterValue}
                    onChange={(e) => setNewFilterValue(e.target.value)}
                    style={{ width: "220px" }}
                    disabled={!newFilterField}
                  />
                ) : selectedColumnType === "boolean" ? (
                  <Form.Select
                    size="sm"
                    value={newFilterValue}
                    onChange={(e) => setNewFilterValue(e.target.value)}
                    style={{ width: "180px" }}
                    disabled={!newFilterField}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="true">Sí / Verdadero</option>
                    <option value="false">No / Falso</option>
                  </Form.Select>
                ) : (
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="Valor a buscar..."
                    value={newFilterValue}
                    onChange={(e) => setNewFilterValue(e.target.value)}
                    style={{ width: "250px" }}
                    disabled={!newFilterField}
                  />
                )}
              </div>

              <div className="col-auto">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleAddFilter}
                  disabled={!newFilterField || !newFilterValue}
                >
                  <i className="bi bi-plus-lg"></i> Agregar filtro
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vista de tarjetas en cuadrícula */}
      {rows.length === 0 && !isLoading ? (
        <div className="text-center p-5 text-muted">{emptyMessage}</div>
      ) : (
        <>
          <Container fluid>
            <Row className="g-2">
              {rows.map((row) => (
                <Col
                  key={getRowId(row)}
                  onClick={() => handleCardClick(row)}
                  style={{ cursor: "pointer", minWidth: "325px" }}
                  {...getColProps()}
                >
                  {renderCard(row)}
                </Col>
              ))}
            </Row>
          </Container>

          {/* Paginación */}
          {total >= pageSize && (
            <div className="mt-4 d-flex justify-content-end align-items-center gap-2">
              <span className="text-muted small">
                Página {page} de {totalPages} — {total} registros
              </span>
              <div className="d-flex gap-2">
                <Button
                  size="sm"
                  disabled={page === 1 || isLoading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <i className="bi bi-rewind-fill"></i>
                </Button>
                <Button
                  size="sm"
                  disabled={page === totalPages || isLoading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <i className="bi bi-fast-forward-fill"></i>
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
