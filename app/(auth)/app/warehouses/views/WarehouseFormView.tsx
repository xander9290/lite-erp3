"use client";

import {
  warehouseSchemaDefault,
  WarehouseSchemaType,
  warehouseSchema,
} from "../schemas/warehouse.schema";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useModals } from "@/contexts/ModalContext";

function WarehouseFormView({ id }: { id: string | null }) {
  const methods = useForm<WarehouseSchemaType>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: warehouseSchemaDefault,
  });

  const { reset } = methods;

  const originalValuesRef = useRef<WarehouseSchemaType | null>(null);
  const router = useRouter();

  const { modalError } = useModals();

  const onSubmit: SubmitHandler<WarehouseSchemaType> = async (data) => {};

  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };

  useEffect(() => {});

  return <div>WarehouseFormView</div>;
}

export default WarehouseFormView;
