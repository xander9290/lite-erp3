"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  FormBook,
  FormPage,
  FormView,
  FormViewGroup,
  PageSheet,
} from "@/components/templates/FormView";
import {
  userSchema,
  userSchemaDefault,
  UserSchemaType,
} from "../schemas/user.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useModals } from "@/contexts/ModalContext";
import {
  FieldBoolean,
  FieldEntry,
  FieldImage,
  FieldRelation,
} from "@/components/templates/fields";
import { createUser, updateUser, UserWithProps } from "../actions/user-actions";
import toast from "react-hot-toast";
import UserChangePasswordModal from "./UserChangePasswordModal";

function UsersFormView({
  id,
  user,
}: {
  id: string | null;
  user: UserWithProps | null;
}) {
  const methods = useForm<UserSchemaType>({
    resolver: zodResolver(userSchema),
    defaultValues: userSchemaDefault,
  });

  const { reset } = methods;

  const originalValuesRef = useRef<UserSchemaType | null>(null);
  const router = useRouter();

  const { modalError } = useModals();

  const [changePasswordModal, setChangePasswordModal] = useState(false);

  const onSubmit: SubmitHandler<UserSchemaType> = async (data) => {
    if (id && id === "null") {
      const res = await createUser(data);
      if (!res.success) {
        modalError(res.message);
        return;
      }

      router.replace(`/app/users?view_type=form&id=${res.data?.id}`);
      toast.success(res.message);
    } else {
      const res = await updateUser({ id: id, ...data });
      if (!res.success) {
        modalError(res.message);
        return;
      }

      router.refresh();
      toast.success(res.message);
    }
  };

  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };

  useEffect(() => {
    if (!user) {
      const values: UserSchemaType = {
        name: "",
        login: "",
        email: "",
        imageUrl: null,
        active: false,
        createdAt: null,
        lastLogin: null,
        groupId: null,
        updatedAt: null,
        createdUid: null,
      };

      reset(values);
      originalValuesRef.current = values;
      return;
    }

    const values: UserSchemaType = {
      name: user.Partner?.name || "",
      login: user.login,
      email: user.Partner?.email || "",
      imageUrl: user.Partner?.imageUrl || null,
      active: user.active,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      groupId: user.groupId,
      updatedAt: user.updatedAt,
      createdUid: user.createdUid,
    };

    reset(values);
    originalValuesRef.current = values;
  }, [user, reset]);

  return (
    <>
      <FormView
        cleanUrl="/app/users?view_type=form&id=null"
        reverse={handleReverse}
        onSubmit={onSubmit}
        methods={methods}
        id={id}
        auditLog="users"
        actions={[
          {
            action: () => setChangePasswordModal(!changePasswordModal),
            fieldName: "changePasswordAction",
            string: "Cambiar contraseña",
            variant: "info",
            invisible: !id || id === "null",
          },
        ]}
      >
        <FormViewGroup>
          <FieldEntry name="name" label="Nombre" />
          <FieldEntry name="login" label="Usuario" />
          <FieldEntry name="email" type="email" label="Correo" />
          <FieldBoolean name="active" label="Activo" />
        </FormViewGroup>
        <FormViewGroup>
          <FieldImage name="imageUrl" folder="users" editable remove />
          <FieldRelation
            model="group"
            name="groupId"
            label="Grupo"
            searchPageSize={25}
            searchColumns={[
              {
                key: "name",
                label: "Nombre",
                accessor: (r) => r.name,
                filterable: true,
                type: "string",
              },
            ]}
          />
        </FormViewGroup>
        <FormBook dKey="otherInfo">
          <FormPage eventKey="otherInfo" title="Otra información">
            <PageSheet name="pageOtherInfo">
              <FormViewGroup>
                <FieldEntry
                  name="lastLogin"
                  type="datetime-local"
                  label="Última conexión"
                  readonly
                />
                <FieldEntry
                  name="updatedAt"
                  type="datetime-local"
                  label="Última actualización"
                  readonly
                />
                <FieldEntry
                  name="createdAt"
                  type="datetime-local"
                  label="Fecha de creación"
                  readonly
                />
                <FieldRelation
                  name="createdUid"
                  model="user"
                  label="Creado por"
                  readonly
                />
              </FormViewGroup>
            </PageSheet>
          </FormPage>
        </FormBook>
      </FormView>
      <UserChangePasswordModal
        show={changePasswordModal}
        onHide={() => setChangePasswordModal(!changePasswordModal)}
        id={id}
      />
    </>
  );
}

export default UsersFormView;
