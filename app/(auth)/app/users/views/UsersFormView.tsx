"use client";

import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
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
  userSchemaType,
} from "../schemas/user.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { useModals } from "@/contexts/ModalContext";
import {
  FieldBoolean,
  FieldEntry,
  FieldRelation,
  FieldRelationTags,
} from "@/components/templates/fields";
import {
  createUser,
  getUserById,
  updateUser,
  UserWithProps,
} from "../actions/actions";
import toast from "react-hot-toast";

function UsersFormView({
  id,
  user,
}: {
  id: string | null;
  user: UserWithProps | null;
}) {
  const methods = useForm<userSchemaType>({
    resolver: zodResolver(userSchema),
    defaultValues: userSchemaDefault,
  });

  const { reset } = methods;

  const originalValuesRef = useRef<userSchemaType | null>(null);
  const router = useRouter();

  const { modalError } = useModals();

  const onSubmit: SubmitHandler<userSchemaType> = async (data) => {
    console.log(data);
    if (id && id === "null") {
      const res = await createUser(data);
      if (!res.success) return modalError(res.message);

      router.replace(`/app/users?view_type=form&id=${res.data?.id}`);
      toast.success(res.message);
    } else {
      const res = await updateUser({ id, ...data });
      if (!res.success) return modalError(res.message);

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
      const record: userSchemaType = {
        name: "",
        login: "",
        email: "",
        active: false,
        managerId: null,
        lastLogin: null,
        createdAt: null,
        updatedAt: null,
      };
      reset(record);
      originalValuesRef.current = record;
    } else {
      const record: userSchemaType = {
        name: user.Partner?.name || "",
        login: user.login,
        email: user.Partner?.email || "",
        active: user.active,
        managerId: user.managerId,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
      reset(record);
      originalValuesRef.current = record;
    }
  }, [user]);

  return (
    <FormView
      cleanUrl="/app/users?view_type=form&id=null"
      reverse={handleReverse}
      onSubmit={onSubmit}
      methods={methods}
      id={id}
    >
      <FormViewGroup>
        <FieldEntry name="name" label="Nombre" />
        <FieldEntry name="login" label="Usuario" />
        <FieldEntry name="email" type="email" label="Correo" />
        <FieldBoolean name="active" label="Activo" />
      </FormViewGroup>
      <FormBook dKey="team">
        <FormPage eventKey="team" title="Equipo">
          <PageSheet>
            <FormViewGroup>
              <FieldRelation
                name="managerId"
                model="user"
                label="Gerente"
                domain={[
                  ["active", "=", true],
                  ["id", "!=", id],
                ]}
              />
            </FormViewGroup>
          </PageSheet>
        </FormPage>
        <FormPage eventKey="otherInfo" title="Otra información">
          <PageSheet>
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
            </FormViewGroup>
          </PageSheet>
        </FormPage>
      </FormBook>
    </FormView>
  );
}

export default UsersFormView;
