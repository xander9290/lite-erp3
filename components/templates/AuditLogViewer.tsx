"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Card,
  ListGroup,
  Placeholder,
  Alert,
  Button,
  Form,
  Spinner,
} from "react-bootstrap";
import { format } from "date-fns";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createAuditlog,
  getAuditlogsByEntity,
  type AuditLogWithProps,
} from "@/app/actions/auditlog-actions";
import { useAuth } from "@/hooks/sessionStore";
import { FieldEntry, FieldSubmit, WidgetAvatar } from "./fields";
import {
  auditNotesSchema,
  auditNotesSchemaDefault,
  AuditNotesSchemaType,
} from "@/schemas/auditnotes.schema";
import { useModals } from "@/contexts/ModalContext";

type AuditLogViewerProps = {
  entityType: string;
  entityId: string;
};

type FetchState = "idle" | "loading" | "success" | "error";

function AuditLogItem({ audit }: { audit: AuditLogWithProps }) {
  return (
    <ListGroup.Item className="bg-body-tertiary p-2 border-0 border-bottom rounded-0">
      <div className="d-flex flex-row align-items-end gap-2">
        <WidgetAvatar id={audit.User.id} />
        <small className="fw-semibold">
          {audit.User.Partner?.name ?? audit.User.name ?? "Usuario"}
        </small>
        <small className="text-muted">
          {format(new Date(audit.createdAt), "dd/MM/yyyy HH:mm")}
        </small>
      </div>

      <div className="ms-2 mt-2">
        <div
          className="rounded bg-body px-2 py-1 small"
          style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
        >
          {audit.log}
        </div>
      </div>
    </ListGroup.Item>
  );
}

function AuditLogSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, index) => (
        <ListGroup.Item
          key={index}
          className="bg-body-tertiary p-2 border-0 border-bottom rounded-0"
        >
          <div className="d-flex flex-row align-items-end gap-2">
            <Placeholder
              as="div"
              animation="glow"
              style={{ width: 32, height: 32, borderRadius: "50%" }}
            >
              <Placeholder xs={12} />
            </Placeholder>

            <Placeholder as="div" animation="glow" className="flex-grow-1">
              <Placeholder xs={3} /> <Placeholder xs={2} />
            </Placeholder>
          </div>

          <div className="ms-2 mt-2">
            <Placeholder as="div" animation="glow">
              <Placeholder xs={8} />
            </Placeholder>
          </div>
        </ListGroup.Item>
      ))}
    </>
  );
}

function AuditLogCreatingState({
  userName,
  userId,
}: {
  userName?: string | null;
  userId?: string | null;
}) {
  return (
    <ListGroup.Item className="bg-body-tertiary p-2 border-0 border-bottom rounded-0">
      <div className="d-flex flex-row align-items-end gap-2">
        <WidgetAvatar id={userId ?? null} />
        <small className="fw-semibold">{userName ?? "Usuario"}</small>
        <small className="text-muted">
          {format(new Date(), "dd/MM/yyyy HH:mm")}
        </small>
      </div>

      <div className="ms-2 mt-2">
        <p className="my-0 text-muted">Está creando un registro...</p>
      </div>
    </ListGroup.Item>
  );
}

export default function AuditLogViewer({
  entityType,
  entityId,
}: AuditLogViewerProps) {
  const { user } = useAuth();
  const { modalError } = useModals();
  const [isPending, startTransition] = useTransition();

  const methods = useForm<AuditNotesSchemaType>({
    resolver: zodResolver(auditNotesSchema),
    defaultValues: auditNotesSchemaDefault,
  });

  const { reset, handleSubmit, setFocus } = methods;

  const [auditLogs, setAuditLogs] = useState<AuditLogWithProps[]>([]);
  const [status, setStatus] = useState<FetchState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [showNoteForm, setShowNoteForm] = useState(false);

  const isCreating = useMemo(() => entityId === "null", [entityId]);

  const canFetch = useMemo(() => {
    return Boolean(
      entityType &&
      entityType !== "null" &&
      entityId &&
      entityId !== "null" &&
      !isCreating,
    );
  }, [entityType, entityId, isCreating]);

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (!canFetch) {
        setAuditLogs([]);
        setStatus("idle");
        setError(null);
        return;
      }

      setStatus("loading");
      setError(null);

      try {
        const logs = await getAuditlogsByEntity({ entityType, entityId });

        if (!active) return;

        setAuditLogs(logs ?? []);
        setStatus("success");
      } catch (err) {
        if (!active) return;

        console.error("Error loading audit logs:", err);
        setAuditLogs([]);
        setStatus("error");
        setError("No se pudo cargar el historial.");
      }
    };

    run();

    return () => {
      active = false;
    };
  }, [canFetch, entityId, entityType]);

  useEffect(() => {
    setShowNoteForm(false);
    reset({ string: "" });
  }, [entityType, entityId, reset]);

  const onSubmitNote: SubmitHandler<AuditNotesSchemaType> = async (data) => {
    if (!showNoteForm || !canFetch || isPending) return;

    startTransition(async () => {
      try {
        const note = data.string.trim();

        if (!note) return;

        const res = await createAuditlog({
          action: "create",
          entityType,
          entityId,
          log: `- ${note}`,
        });

        if (!res.success || !res.data) {
          modalError(res.message);
          return;
        }

        setAuditLogs((prev) => [res.data as AuditLogWithProps, ...prev]);
        setStatus("success");
        setError(null);
        reset({ string: "" });
        setFocus("string");
      } catch (err) {
        console.error("Error creating audit note:", err);
        modalError("No se pudo crear la nota.");
      }
    });
  };

  const handleCancelNote = () => {
    reset({ string: "" });
    setShowNoteForm(false);
  };

  return (
    <Card style={{ height: "100%" }} className="d-flex flex-column border-0">
      <Card.Header className="py-2 px-3 d-flex justify-content-between align-items-center">
        <Button
          size="sm"
          variant="info"
          className="fw-semibold"
          onClick={() => setShowNoteForm(true)}
          disabled={showNoteForm || !canFetch || isPending}
        >
          <i className="bi bi-pencil-square me-1" />
          Crear nota
        </Button>
      </Card.Header>

      <Card.Body className="flex-fill overflow-auto p-0">
        {showNoteForm && canFetch && (
          <FormProvider {...methods}>
            <Form
              noValidate
              className="card m-2"
              onSubmit={handleSubmit(onSubmitNote)}
            >
              <div className="card-body">
                <FieldEntry
                  name="string"
                  inline
                  placeholder="Escribir nota..."
                  as="textarea"
                  rows={2}
                  autoFocus
                />
              </div>

              <div className="card-footer">
                <div className="d-flex gap-2">
                  <FieldSubmit
                    label={isPending ? "Guardando..." : "Crear"}
                    name="createNote"
                    disabled={isPending}
                  />

                  <Button
                    type="button"
                    variant="warning"
                    size="sm"
                    className="fw-semibold"
                    onClick={handleCancelNote}
                    disabled={isPending}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </Form>
          </FormProvider>
        )}

        {status === "error" ? (
          <div className="p-2">
            <Alert variant="danger" className="mb-0">
              {error}
            </Alert>
          </div>
        ) : null}

        <ListGroup variant="flush">
          {isCreating ? (
            <AuditLogCreatingState userName={user?.name} userId={user?.id} />
          ) : status === "loading" ? (
            <AuditLogSkeleton />
          ) : auditLogs.length > 0 ? (
            auditLogs.map((audit) => (
              <AuditLogItem key={audit.id} audit={audit} />
            ))
          ) : status === "success" ? (
            <ListGroup.Item className="text-muted py-3 px-3">
              No hay movimientos registrados.
            </ListGroup.Item>
          ) : (
            <ListGroup.Item className="text-muted py-3 px-3">
              Selecciona un registro para ver su historial.
            </ListGroup.Item>
          )}
        </ListGroup>

        {isPending && (
          <div className="px-3 py-2 border-top small text-muted d-flex align-items-center gap-2">
            <Spinner animation="border" size="sm" />
            Guardando nota...
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
