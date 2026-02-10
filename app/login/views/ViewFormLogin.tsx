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
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  userLoginSchema,
  userLoginSchemaDefault,
  UserLoginSchemaType,
} from "@/schemas/userlogin.schema";
import { userLogin } from "@/app/actions/login-actions";
import toast from "react-hot-toast";
import { redirect } from "next/navigation";

function ViewFormLogin() {
  const {
    formState: { isSubmitting, errors },
    handleSubmit,
    register,
  } = useForm<UserLoginSchemaType>({
    resolver: zodResolver(userLoginSchema),
    defaultValues: userLoginSchemaDefault,
  });

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
    <Container>
      <Row className="justify-content-center">
        <Col xs="11" sm="11" md="4" lg="3" xl="4" xxl="3">
          <Form
            className="card shadow-sm mt-5"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >
            <fieldset className="card-body" disabled={isSubmitting}>
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
            </fieldset>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default ViewFormLogin;
