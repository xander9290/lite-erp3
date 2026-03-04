"use client";

import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import { useRouter } from "next/navigation";
import { FormView, FormViewGroup } from "@/components/templates/FormView";
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
    console.log(data);
  };

  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };

  useEffect(() => {
    if (id && id !== "null") {
      modalError("No hay ID");
    }
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
        <h2>Fields</h2>
      </FormViewGroup>
    </FormView>
  );
}

export default UsersFormView;
