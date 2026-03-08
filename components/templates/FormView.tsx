import {
  FormProvider,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";
import {
  Alert,
  Button,
  ButtonGroup,
  Col,
  Container,
  Dropdown,
  DropdownButton,
  Form,
  Row,
  Spinner,
  Tab,
  Tabs,
} from "react-bootstrap";
import { useRouter } from "next/navigation";
import { ButtonVariant } from "react-bootstrap/esm/types";
import NotFound from "@/app/not-found";
import { Suspense } from "react";

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
};

type FormViewProps<T extends FieldValues> = {
  methods: UseFormReturn<T>;
  onSubmit: (data: T) => void;
  children: React.ReactNode;
  id: string | null;
  cleanUrl: string;
  reverse: () => void;
  actions?: TFormActions[];
  formStates?: TFormState[];
  state?: string;
  modelThread?: string;
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
}: FormViewProps<T>) {
  const {
    handleSubmit,
    formState: { isSubmitting, isDirty },
    getValues,
  } = methods;

  const router = useRouter();

  if (!id || id === "") {
    return <NotFound />;
  }

  return (
    <Row className="h-100 overflow-auto">
      <Col xs="12" md="8" className="h-100">
        <FormProvider {...methods}>
          <Form noValidate className="card d-flex flex-column h-100 border-0">
            <div className="card-header d-flex justify-content-between align-items-center border-0">
              {/* BOTONES DE FORMULARIO */}
              <div className="d-flex align-items-center gap-1">
                {id !== "null" && (
                  <Button
                    type="button"
                    onClick={() => router.replace(cleanUrl)}
                    className="fw-semibold"
                    size="sm"
                  >
                    Nuevo
                  </Button>
                )}

                <Button
                  type="button"
                  disabled={!isDirty}
                  onClick={handleSubmit(onSubmit)}
                  size="sm"
                  variant="none"
                >
                  {isSubmitting ? (
                    <Spinner size="sm" animation="border" />
                  ) : (
                    <i className="bi bi-cloud-arrow-up-fill"></i>
                  )}
                </Button>

                <Button
                  type="button"
                  onClick={reverse}
                  disabled={!isDirty}
                  title="Deshacer cambios"
                  size="sm"
                  variant="none"
                >
                  <i className="bi bi-arrow-counterclockwise"></i>
                </Button>
              </div>

              {/* BOTONES VISTA ESCRITORIO */}
              <div className="d-none d-md-flex gap-1 align-items-center">
                {actions?.map((action, index) => {
                  return (
                    <Button
                      key={`${action.string}-${index}`}
                      variant={action.variant ?? "light"}
                      type="button"
                      onClick={action.action}
                      disabled={action.readonly}
                      title={action.fieldName}
                      className="fw-semibold"
                      size="sm"
                    >
                      {action.string}
                    </Button>
                  );
                })}
              </div>

              {/* BOTONES VISTA MÓVIL */}
              <div className="d-flex d-md-none">
                <DropdownButton variant="light" title="Acciones" align="end">
                  {actions?.map((action, index) => {
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
                size="sm"
                variant="none"
                onClick={() => router.back()}
                disabled={isDirty}
              >
                <i className="bi bi-arrow-left"></i>
              </Button>
            </div>
            <div
              className="card-body p-0 flex-fill"
              style={{ overflowX: "hidden", overflowY: "auto" }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div className="card-title h3 fw-semibold my-1 mx-2">
                  {id !== "null" ? getValues().name : "Nuevo"}
                </div>

                {/* STATEBAR DESKTOP */}
                <div className="d-none d-md-flex justify-content-end gap-1 my-2 w-50">
                  <ButtonGroup>
                    {formStates?.map((st, index) => (
                      <Button
                        key={`${st.label}-${st.name}-${index}`}
                        variant={st.name === state ? st.decoration : "none"}
                        className={`${
                          st.name === state ? "fw-semibold" : "text-black"
                        } text-uppercase border`}
                      >
                        {st.label}
                      </Button>
                    ))}
                  </ButtonGroup>
                </div>
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
      <Col xs="12" md="4" className="h-100 mt-3 mt-md-0">
        {/* {modelThread && (
          <Suspense fallback={<Spinner animation="border" size="sm" />}>
            <ThreadTemplate entityId={id} entityName={modelThread} />
          </Suspense>
        )} */}
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
      <fieldset className="p-2 mt-1 rounded" disabled={readonly}>
        {/* {label ? (
          <legend
            className="fw-bolder text-uppercase mx-1 mb-3"
            style={{ fontSize: "1rem" }}
          >
            {label}
          </legend>
        ) : (
          <div style={{ marginBottom: "36px" }}></div>
        )} */}
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
      className={`d-flex justify-content-between align-items-center m-0 p-0 ${className}`}
    >
      {children}
    </div>
  );
}

export const FormBook = ({
  children,
  dKey,
}: {
  children: React.ReactNode;
  dKey: string;
}) => {
  return (
    <Tabs defaultActiveKey={dKey} transition={false} className="mt-3">
      {children}
    </Tabs>
  );
};

export const FormPage = ({
  children,
  eventKey,
  title,
}: {
  children: React.ReactNode;
  eventKey: string;
  title: string;
}) => {
  return (
    <Tab eventKey={eventKey} title={title}>
      {children}
    </Tab>
  );
};

export const PageSheet = ({
  children,
  fieldName,
  invisible,
  readonly,
}: {
  children: React.ReactNode;
  fieldName?: string;
  invisible?: boolean;
  readonly?: boolean;
}) => {
  return (
    <Row
      style={{
        minHeight: "300px",
      }}
      title={fieldName}
    >
      <div
        className="m-0 p-0 overflow-auto"
        style={{
          pointerEvents: readonly ? "none" : "auto",
          minHeight: "300px",
        }}
      >
        {children}
      </div>
    </Row>
  );
};
