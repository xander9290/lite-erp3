import {
  FormProvider,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";
import {
  Alert,
  Button,
  Col,
  Container,
  Dropdown,
  DropdownButton,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";
import { useRouter } from "next/navigation";
import { ButtonVariant } from "react-bootstrap/esm/types";
import NotFound from "@/app/not-found";
import { Suspense, useEffect, useRef } from "react";
import AuditLogViewer from "./AuditLogViewer";
import { useAuth } from "@/hooks/sessionStore";

type TFormActions = {
  string: React.ReactElement | string;
  action: () => void;
  invisible?: boolean;
  readonly?: boolean;
  variant?: ButtonVariant | "light";
  fieldName: string;
};

export type TFormState = {
  name: string;
  label: string;
  decoration: ButtonVariant | "light";
}[];

type FormViewProps<T extends FieldValues> = {
  methods: UseFormReturn<T>;
  onSubmit: (data: T) => void;
  children: React.ReactNode;
  id: string | null;
  cleanUrl: string;
  reverse: () => void;
  actions?: TFormActions[];
  formStates?: TFormState;
  state?: string;
  auditLog?: string;
  isReallyDirty?: boolean;
};

export function FormView<T extends FieldValues>({
  methods,
  onSubmit,
  children,
  id,
  cleanUrl,
  reverse,
  actions,
  formStates,
  state,
  auditLog = "null",
}: FormViewProps<T>) {
  const {
    handleSubmit,
    formState: { isSubmitting, isDirty },
    getValues,
  } = methods;

  const dirty = isDirty;

  const { access } = useAuth();
  const router = useRouter();

  const reversingRef = useRef(false);

  const modelName = cleanUrl.split("?")[0].split("/")[2] + "Model";
  const modelAccess = access.find((acc) => acc.fieldName === modelName);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  const handleReverseExtended = () => {
    if (reversingRef.current) return;

    reversingRef.current = true;

    reverse();

    if (id && id === "null") {
      router.back();
    }

    requestAnimationFrame(() => {
      reversingRef.current = false;
    });
  };

  if (!id || id === "") {
    return <NotFound />;
  }

  if (modelAccess?.invisible) {
    return (
      <Row className="h-100 justify-content-center">
        <Col xs="12" md="6" className="h-100 px-0 mt-5">
          <Alert variant="warning">
            <h2 className="text-center">ACCESO DENEGADO</h2>
          </Alert>
        </Col>
      </Row>
    );
  }

  return (
    <Row className="h-100">
      <Col xs="12" md="12" lg="8" xl="7" xxl="8" className="h-100 px-0">
        <FormProvider {...methods}>
          <Form
            noValidate
            className="card d-flex flex-column h-100 border-0 bg-body-tertiary"
            style={{
              fontSize: "0.9rem",
              minHeight: "calc(100vh - 100px)",
              maxHeight: "calc(100vh - 100px)",
            }}
          >
            <div className="card-header d-flex justify-content-between align-items-center gap-2 border-0">
              <div className="d-flex align-items-center gap-1">
                {id !== "null" && (
                  <Button
                    type="button"
                    onClick={() => {
                      if (dirty) {
                        const confirmLeave = confirm(
                          "Tienes cambios sin guardar. ¿Continuar?",
                        );
                        if (!confirmLeave) return;
                      }
                      router.replace(cleanUrl);
                    }}
                    className="fw-semibold"
                    disabled={modelAccess?.notCreate}
                  >
                    Nuevo
                  </Button>
                )}

                <Button
                  type="button"
                  disabled={!dirty || modelAccess?.notEdit}
                  onClick={handleSubmit(onSubmit)}
                  variant={isDirty ? "warning" : "outline-secondary"}
                >
                  {isSubmitting ? (
                    <Spinner size="sm" animation="border" />
                  ) : (
                    <i className="bi bi-cloud-arrow-up-fill" />
                  )}
                </Button>

                <Button
                  type="button"
                  onClick={handleReverseExtended}
                  disabled={!dirty}
                  title="Deshacer cambios"
                  variant={isDirty ? "warning" : "outline-secondary"}
                >
                  <i className="bi bi-arrow-counterclockwise" />
                </Button>
              </div>

              <div className="d-flex align-items-center gap-2">
                <div className="d-none d-md-flex gap-1 align-items-center">
                  {actions?.map((action, index) => {
                    const actionAccess = access.filter(
                      (acc) => acc.fieldName === action.fieldName,
                    );

                    if (actionAccess[0]?.invisible) return null;
                    if (action.invisible) return null;

                    return (
                      <Button
                        key={`${action.string}-${index}`}
                        variant={action.variant ?? "info"}
                        type="button"
                        onClick={action.action}
                        disabled={action.readonly}
                        title={action.fieldName}
                        className="fw-bold"
                      >
                        {action.string}
                      </Button>
                    );
                  })}
                </div>

                <div className="d-flex d-md-none">
                  <DropdownButton variant="light" title="Acciones" align="end">
                    {actions?.map((action, index) => {
                      const actionAccess = access.filter(
                        (acc) => acc.fieldName === action.fieldName,
                      );

                      if (actionAccess[0]?.invisible) return null;
                      if (action.invisible) return null;

                      return (
                        <Dropdown.Item
                          key={`${action.string}-${index}`}
                          as={Button}
                          variant={action.variant ?? "light"}
                          onClick={action.action}
                          disabled={action.readonly}
                        >
                          {action.string}
                        </Dropdown.Item>
                      );
                    })}
                  </DropdownButton>
                </div>

                <Button
                  variant={dirty ? "outline-danger" : "secondary"}
                  onClick={() => {
                    if (dirty) {
                      const confirmLeave = confirm(
                        "Tienes cambios sin guardar. ¿Salir?",
                      );
                      if (!confirmLeave) return;
                    }
                    router.back();
                  }}
                  title={dirty ? "Hay cambios sin guardar" : "Volver"}
                >
                  {dirty ? (
                    <i className="bi bi-exclamation-triangle-fill" />
                  ) : (
                    <i className="bi bi-arrow-left" />
                  )}
                </Button>
              </div>
            </div>
            <div
              className="card-body p-0 flex-grow-1 overflow-auto"
              style={{ minHeight: 0 }}
            >
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 px-2 py-2">
                <div className="card-title h3 fw-semibold m-0 text-truncate">
                  {id !== "null" ? getValues().name : "Nuevo"}
                </div>

                {/* STATEBAR DESKTOP */}
                {formStates && (
                  <div className="d-none d-md-flex justify-content-end flex-grow-1">
                    <div className="statebar">
                      {formStates.map((st, index) => {
                        const isActive = st.name === state;
                        const isLast = index === formStates.length - 1;

                        return (
                          <div
                            key={`${st.label}-${st.name}-${index}`}
                            className={[
                              "statebar-item",
                              isActive ? `active bg-${st.decoration}` : "",
                              isLast ? "last" : "",
                            ].join(" ")}
                            title={st.name}
                          >
                            <span>{st.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STATEBAR MOBILE */}
                {formStates && (
                  <div className="d-flex d-md-none">
                    <Button
                      size="sm"
                      variant={
                        formStates.find((st) => st.name === state)?.decoration
                      }
                      className="fw-semibold text-uppercase"
                    >
                      {formStates.find((st) => st.name === state)?.label}
                    </Button>
                  </div>
                )}
              </div>

              <Container>
                <Row>{children}</Row>
              </Container>
            </div>
          </Form>
        </FormProvider>
      </Col>
      {/* ================= THREAD PANEL ================= */}
      <Col
        xs="12"
        md="12"
        lg="4"
        xl="5"
        xxl="4"
        className="h-100 mt-3 mt-lg-0 px-0"
      >
        {auditLog && (
          <Suspense fallback={<Spinner animation="border" size="sm" />}>
            <AuditLogViewer entityId={id} entityType={auditLog} />
          </Suspense>
        )}
      </Col>
    </Row>
  );
}

export function FormViewGroup({
  invisible,
  children,
  readonly,
}: {
  className?: string;
  invisible?: boolean;
  children: React.ReactNode;
  readonly?: boolean;
}) {
  if (invisible) return null;

  return (
    <Col md="6">
      <fieldset className="py-1" disabled={readonly}>
        {children}
      </fieldset>
    </Col>
  );
}

export function FormViewFluid({
  invisible,
  children,
  readonly,
}: {
  className?: string;
  invisible?: boolean;
  children: React.ReactNode;
  readonly?: boolean;
}) {
  if (invisible) return null;

  return (
    <Col md="12">
      <fieldset className="mt-1" disabled={readonly}>
        {children}
      </fieldset>
    </Col>
  );
}

export function FormViewStack({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`d-flex justify-content-between align-items-center gap-1 m-0 p-0 ${className}`}
    >
      {children}
    </div>
  );
}
