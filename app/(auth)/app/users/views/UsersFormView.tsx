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
import { createUser, getUserById } from "../actions/actions";
import toast from "react-hot-toast";

function UsersFormView({ id }: { id: string | null }) {
  const methods = useForm<userSchemaType>({
    resolver: zodResolver(userSchema),
    defaultValues: userSchemaDefault,
  });

  const { reset } = methods;

  const originalValuesRef = useRef<userSchemaType | null>(null);
  const router = useRouter();

  const { modalError } = useModals();

  const onSubmit: SubmitHandler<userSchemaType> = async (data) => {
    if (id && id === "null") {
      const res = await createUser(data);
      if (!res.success) return modalError(res.message);

      router.replace(`/app/users?view_type=form&id=${res.data?.id}`);
      toast.success(res.message);
    } else {
    }
  };

  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };

  const getUser = async () => {
    const res = await getUserById({ id });
    if (!res) {
      const record: userSchemaType = {
        name: "",
        login: "",
        email: "",
        active: false,
        lastLogin: null,
        createdAt: null,
        updatedAt: null,
      };
      reset(record);
      originalValuesRef.current = record;
    } else {
      const record: userSchemaType = {
        name: res.Partner?.name || "",
        login: res.login,
        email: res.Partner?.email || "",
        active: res.active,
        lastLogin: res.lastLogin,
        createdAt: res.createdAt,
        updatedAt: res.updatedAt,
      };
      reset(record);
      originalValuesRef.current = record;
    }
  };

  useEffect(() => {
    getUser();
  }, [id]);

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
      <FormBook dKey="otherInfo">
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
