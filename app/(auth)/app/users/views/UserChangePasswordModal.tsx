"use client";

import { ModalBasicProps } from "@/app/libs/definitions";
import { useForm, SubmitHandler, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Form, Modal } from "react-bootstrap";
import {
  userPasswordSchema,
  userPasswordSchemaDefault,
  UserPasswordType,
} from "../schemas/userPassword.schema";
import { FieldEntry, FieldSubmit } from "@/components/templates/fields";
import { updatePassword } from "../actions/user-actions";
import { useModals } from "@/contexts/ModalContext";
import toast from "react-hot-toast";

function UserChangePasswordModal({
  onHide,
  show,
  id,
}: ModalBasicProps & { id: string | null }) {
  const methods = useForm<UserPasswordType>({
    resolver: zodResolver(userPasswordSchema),
    defaultValues: userPasswordSchemaDefault,
  });

  const { handleSubmit, reset } = methods;

  const { modalError } = useModals();

  const onSubmit: SubmitHandler<UserPasswordType> = async (data) => {
    if (id && id !== "null") {
      const res = await updatePassword({ id, password: data.password2 });
      if (!res.success) return modalError(res.message);

      toast.success(res.message);
      onHide();
    }
  };

  const handleExited = () => {
    reset({ password1: "", password2: "" });
  };

  return (
    <Modal
      onHide={onHide}
      show={show}
      backdrop="static"
      centered
      onExited={handleExited}
    >
      <Modal.Header closeButton>Cambiar contraseña</Modal.Header>
      <Modal.Body className="p-2">
        <FormProvider {...methods}>
          <Form onSubmit={handleSubmit(onSubmit)} noValidate className="card">
            <div className="card-body">
              <FieldEntry
                name="password1"
                type="password"
                label="Contraseña"
                autoFocus
                className="bg-body-tertiary"
              />
              <FieldEntry
                name="password2"
                type="password"
                label="Confirmar"
                className="bg-body-tertiary"
              />
              <div className="d-flex justify-content-end gap-1">
                <Button
                  onClick={onHide}
                  variant="secondary"
                  className="fw-semibold"
                >
                  Cancelar
                </Button>
                <FieldSubmit name="accept" label="Aceptar" />
              </div>
            </div>
          </Form>
        </FormProvider>
      </Modal.Body>
    </Modal>
  );
}

export default UserChangePasswordModal;
