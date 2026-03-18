"use client";
import {
  Button,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
  Spinner,
} from "react-bootstrap";
import { useForm, SubmitHandler, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  userLoginSchema,
  userLoginSchemaDefault,
  UserLoginSchemaType,
} from "@/schemas/userlogin.schema";
import { userLogin } from "@/app/actions/login-actions";
import toast from "react-hot-toast";
import { redirect } from "next/navigation";
import { FieldEntry } from "@/components/templates/fields";
import { AccessProvider } from "@/contexts/AccessContext";
import { SessionProvider } from "next-auth/react";

function ViewFormLogin() {
  // const {
  //   formState: { isSubmitting, errors },
  //   handleSubmit,
  //   register,
  // } = useForm<UserLoginSchemaType>({
  //   resolver: zodResolver(userLoginSchema),
  //   defaultValues: userLoginSchemaDefault,
  // });

  const methods = useForm<UserLoginSchemaType>({
    resolver: zodResolver(userLoginSchema),
    defaultValues: userLoginSchemaDefault,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit: SubmitHandler<UserLoginSchemaType> = async (data) => {
    const res = await userLogin(data);

    if (!res.success) {
      toast.error(res.message, { position: "top-center" });
      return;
    }

    toast.success(res.message, { position: "top-center" });
    redirect("/app");
  };

  return (
    <SessionProvider>
      <AccessProvider>
        <Container>
          <Row className="justify-content-center">
            <Col xs="11" sm="11" md="4" lg="3" xl="4" xxl="3">
              <FormProvider {...methods}>
                <Form
                  className="card shadow-sm mt-5"
                  noValidate
                  onSubmit={handleSubmit(onSubmit)}
                >
                  {/* <fieldset
                className="card-body bg-body-tertiary"
                disabled={isSubmitting}
              >
                <legend className="card-title">Inicio de sesión</legend>
                <InputGroup className="mb-3">
                  <InputGroup.Text>
                    <i className="bi bi-person-fill"></i>
                  </InputGroup.Text>
                  <Form.Control
                    {...register("login")}
                    className="text-center"
                    placeholder="Usuario"
                    type="text"
                    autoComplete="off"
                    autoFocus
                    isInvalid={!!errors.login}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.login?.message}
                  </Form.Control.Feedback>
                </InputGroup>
                <InputGroup className="mb-2">
                  <InputGroup.Text>
                    <i className="bi bi-lock-fill"></i>
                  </InputGroup.Text>
                  <Form.Control
                    {...register("password")}
                    className="text-center"
                    placeholder="Contraseña"
                    type="password"
                    autoComplete="off"
                    isInvalid={!!errors.password}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password?.message}
                  </Form.Control.Feedback>
                </InputGroup>
                <Form.Group className="d-grid">
                  <Button type="submit">
                    {isSubmitting ? (
                      <>
                        <Spinner size="sm" animation="border" />
                        <span className="ms-2">Validando</span>
                      </>
                    ) : (
                      <>Entrar</>
                    )}
                  </Button>
                </Form.Group>
              </fieldset> */}
                  <fieldset className="card-body">
                    <FieldEntry
                      name="login"
                      label="Usuario"
                      className="text-center"
                      autoFocus
                    />
                    <FieldEntry
                      name="password"
                      label="Contraseña"
                      type="password"
                    />
                    <Form.Group className="d-grid">
                      <Button
                        type="submit"
                        variant="primary"
                        className="fw-semibold"
                      >
                        {isSubmitting ? (
                          <>
                            <Spinner size="sm" animation="border" />
                            <span className="ms-2">Validando</span>
                          </>
                        ) : (
                          <>Entrar</>
                        )}
                      </Button>
                    </Form.Group>
                  </fieldset>
                </Form>
              </FormProvider>
            </Col>
          </Row>
        </Container>
      </AccessProvider>
    </SessionProvider>
  );
}

export default ViewFormLogin;
