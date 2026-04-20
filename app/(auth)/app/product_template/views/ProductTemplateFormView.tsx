"use client";

import { ProductTemplateWithProps } from "../actions/productTemplate.action";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productTemplateSchema,
  productTemplateSchemaDefault,
  ProductTemplateSchemaType,
} from "../schemas/productTemplate.schema";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useModals } from "@/contexts/ModalContext";
import {
  FormView,
  FormViewGroup,
  FormViewStack,
} from "@/components/templates/FormView";
import {
  FieldBoolean,
  FieldEntry,
  FieldImage,
  FieldRelation,
  FieldSelect,
} from "@/components/templates/fields";
import { Notebook, Page, PageSheet } from "@/components/templates/Notebook";

function ProductTemplateFormView({
  id,
  product,
}: {
  id: string | null;
  product: ProductTemplateWithProps | null;
}) {
  const methods = useForm<ProductTemplateSchemaType>({
    resolver: zodResolver(productTemplateSchema),
    defaultValues: productTemplateSchemaDefault,
  });

  const { reset } = methods;

  const originalValuesRef = useRef<ProductTemplateSchemaType | null>(null);
  const router = useRouter();

  const { modalError } = useModals();

  const onSubmit: SubmitHandler<ProductTemplateSchemaType> = async (data) => {};

  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };

  useEffect(() => {
    if (!product) {
      reset(productTemplateSchemaDefault);
      originalValuesRef.current = productTemplateSchemaDefault;
      return;
    }

    const values: ProductTemplateSchemaType = {
      name: product.name,
      description: product.description,
      defaultCode: product.defaultCode,
      active: product.active,
      sales: product.sales,
      purchases: product.purchases,
      displayType: product.displayType,
      imageUrl: product.imageUrl,
      lastCost: product.lastCost,
      price1: product.price1,
      price2: product.price2,
      price3: product.price3,
      price4: product.price4,
      price5: product.price5,
      alto: product.alto,
      ancho: product.ancho,
      largo: product.largo,
      weight: product.weight,
      volume: product.volume,
      supplierId: {
        id: product.Supplier?.id || "",
        name: product.Supplier?.name || "",
      },
      userId: { id: product.User?.id || "", name: product.User?.name || "" },
      uomIncomingAllowed: product.uomIncomingAllowed,
      uomOutgoingAllowed: product.uomOutgoingAllowed,
      Tags: product.Tags.map((t) => ({ id: t.id, name: t.name })) || [],
      createdAt: product.createdAt,
      createdUid: product.createUid,
      updatedAt: product.updatedAt,
    };
  }, [product, reset]);

  return (
    <FormView
      methods={methods}
      cleanUrl="/app/product_template?view_type=form&id=null"
      auditLog="productTemplate"
      reverse={handleReverse}
      onSubmit={onSubmit}
      id={id}
    >
      <FormViewGroup>
        <FieldImage folder="products" name="imageUrl" remove editable />
        <FieldEntry name="description" label="Descripción" />
        <FieldEntry name="defaultCode" label="Referencia interna" />
        <FieldSelect
          name="displayType"
          options={[
            { label: "Producto", value: "PRODUCT" },
            { label: "Servicio", value: "SERVICE" },
            { label: "Consumible", value: "CONSU" },
          ]}
          label="Tipo"
        />
        <FieldBoolean name="active" label="Activo" />
      </FormViewGroup>
      <Notebook defaultActiveKey="purchases">
        <Page eventKey="purchases" title="Compras">
          <PageSheet name="purchase">
            <FormViewGroup>
              <FieldBoolean name="purchases" label="Se puede comprar" />
              <FormViewStack>
                <FieldEntry
                  name="lastCost"
                  type="number"
                  label="Último costo"
                  readonly
                  className="text-end"
                />
                <FieldEntry
                  name="uomIncomingAllowed"
                  type="number"
                  label="Múltiplo de compra"
                  className="text-center"
                />
              </FormViewStack>
              <FieldRelation model="user" name="userId" label="Comprador" />
              <FieldRelation
                model="partner"
                name="supplierId"
                label="Proveedor"
                domain={[["displayType", "=", "SUPPLIER"]]}
              />
            </FormViewGroup>
          </PageSheet>
        </Page>
        <Page eventKey="sales" title="Ventas">
          <PageSheet name="sales">
            <FormViewGroup>
              <FieldBoolean name="sales" label="Se puede vender" />
              <FormViewStack>
                <FieldEntry
                  type="number"
                  name="price1"
                  label="Precio 1"
                  className="text-end"
                />
                <FieldEntry
                  type="number"
                  name="price2"
                  label="Precio 2"
                  className="text-end"
                />
                <FieldEntry
                  type="number"
                  name="price3"
                  label="Precio 3"
                  className="text-end"
                />
              </FormViewStack>
              <FormViewStack>
                <FieldEntry
                  type="number"
                  name="price4"
                  label="Precio 4"
                  className="text-end"
                />
                <FieldEntry
                  type="number"
                  name="price5"
                  label="Precio 5"
                  className="text-end"
                />
              </FormViewStack>
              <FieldEntry
                name="uomOutgoingAllowed"
                type="number"
                label="Múltiplo de venta"
                className="text-center"
              />
            </FormViewGroup>
          </PageSheet>
        </Page>
      </Notebook>
    </FormView>
  );
}

export default ProductTemplateFormView;
