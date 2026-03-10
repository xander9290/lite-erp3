"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  groupSchema,
  groupSchemaDefault,
  GroupSchemaType,
} from "../schemas/group.schema";
import { useCallback, useEffect, useRef } from "react";
import { useModals } from "@/contexts/ModalContext";
import {
  FormBook,
  FormPage,
  FormView,
  FormViewGroup,
} from "@/components/templates/FormView";
import {
  createGroup,
  GroupWithProps,
  updateGroup,
} from "../actions/groups-actions";
import {
  FieldBoolean,
  FieldEntry,
  FieldRelationTags,
} from "@/components/templates/fields";
import toast from "react-hot-toast";
import { FieldOption } from "@/components/templates/fields/FielOption";

function GroupFormView({
  id,
  group,
}: {
  id: string | null;
  group: GroupWithProps | null;
}) {
  const methods = useForm<GroupSchemaType>({
    resolver: zodResolver(groupSchema),
    defaultValues: groupSchemaDefault,
  });

  const { reset } = methods;
  const { modalError } = useModals();

  const originalValuesRef = useRef<GroupSchemaType | null>(null);
  const router = useRouter();

  const onSubmit: SubmitHandler<GroupSchemaType> = async (data) => {
    if (id && id === "null") {
      const res = await createGroup({
        ...data,
        users: data.users.map((u) => u),
      });

      if (!res.success) return modalError(res.message);

      router.replace(`/app/groups?view_type=form&id=${res.data?.id}`);
      toast.success(res.message);
    } else {
      const res = await updateGroup({ id, ...data });

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

  const setGroup = useCallback(() => {
    if (!group) {
      const values: GroupSchemaType = {
        name: "",
        active: true,
        users: [],
        createdAt: null,
        updatedAt: null,
      };
      reset(values);
      originalValuesRef.current = values;
    } else {
      const values: GroupSchemaType = {
        name: group.name,
        active: group.active,
        users: group.Users.map((u) => u.id) ?? [],
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      };
      reset(values);
      originalValuesRef.current = values;
    }
  }, [group, reset]);

  useEffect(() => {
    setGroup();
  }, [setGroup]);

  return (
    <FormView
      cleanUrl="/app/groups?view_type=form&id=null"
      reverse={handleReverse}
      onSubmit={onSubmit}
      methods={methods}
      auditLog="groups"
      id={id}
    >
      <FormViewGroup>
        <FieldEntry name="name" label="Nombre" />
        <FieldBoolean name="active" label="Activo" />
      </FormViewGroup>
      <FormViewGroup>
        <FieldRelationTags
          model="user"
          label="Usuarios"
          name="users"
          domain={[["name", "!=", "bot"]]}
        />
      </FormViewGroup>
      <FormBook dKey="groupLine">
        <FormPage eventKey="groupLine" title="Accesos">
          <h3>Accesos</h3>
        </FormPage>
      </FormBook>
    </FormView>
  );
}

export default GroupFormView;
