"use client";
import { Col, Container, Form, Row } from "react-bootstrap";
import { useForm, SubmitHandler, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  userLoginSchema,
  userLoginSchemaDefault,
  UserLoginSchemaType,
} from "@/schemas/userlogin.schema";
import { userLogin } from "@/app/(auth)/app/actions/login-actions";
import toast from "react-hot-toast";
import { redirect } from "next/navigation";
import { FieldEntry, FieldSubmit } from "@/components/templates/fields";
import { AccessProvider } from "@/contexts/AccessContext";
import { SessionProvider } from "next-auth/react";

function ViewFormLogin() {
  const methods = useForm<UserLoginSchemaType>({
    resolver: zodResolver(userLoginSchema),
    defaultValues: userLoginSchemaDefault,
  });

  const { handleSubmit } = methods;

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
                      <FieldSubmit
                        name="validate"
                        label="Entrar"
                        feedback="Validando"
                      />
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
