"use client";

import { FormView, FormViewGroup } from "@/components/templates/FormView";
import {
  createProductCategory,
  ProductCategoryWithProps,
  updateProductCategory,
} from "../actions/productCategory.action";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import {
  productCategorySchema,
  productCategorySchemaDefault,
  ProductCategorySchemaType,
} from "../schemas/productCategory.schema";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useModals } from "@/contexts/ModalContext";
import {
  FieldBoolean,
  FieldEntry,
  FieldRelation,
} from "@/components/templates/fields";
import toast from "react-hot-toast";
import { Notebook, Page, PageSheet } from "@/components/templates/Notebook";
import { SimpleTable, SimpleTD } from "@/components/templates/simpletemplates";
import { Col } from "react-bootstrap";

function ProductCategoryFormView({
  id,
  productCategory,
}: {
  id: string | null;
  productCategory: ProductCategoryWithProps | null;
}) {
  const method = useForm<ProductCategorySchemaType>({
    resolver: zodResolver(productCategorySchema),
    defaultValues: productCategorySchemaDefault,
  });

  const { reset, control } = method;

  const { remove, fields, append } = useFieldArray({
    control,
    name: "Products",
  });

  const originalValuesRef = useRef<ProductCategorySchemaType | null>(null);
  const router = useRouter();

  const { modalError } = useModals();

  const onSubmit: SubmitHandler<ProductCategorySchemaType> = async (data) => {
    if (id && id === "null") {
      const res = await createProductCategory({ data });
      if (!res.success) return modalError(res.message);

      router.replace(
        `/app/product_template/categories?view_type=form&id=${res.data?.id}`,
      );
      toast.success(res.message);
    } else {
      const res = await updateProductCategory({ id, data });
      if (!res.data) return modalError(res.message);
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
    if (!productCategory) {
      reset(productCategorySchemaDefault);
      originalValuesRef.current = productCategorySchemaDefault;
      return;
    }

    const values: ProductCategorySchemaType = {
      name: productCategory.name,
      description: productCategory.description,
      active: productCategory.active,
      parentId: {
        id: productCategory.Parent?.id || "",
        name: productCategory.Parent?.name || "",
      },
      Products: productCategory.Products.map((p) => ({
        id: p.id,
        name: p.name,
      })),
      createdAt: productCategory.createdAt,
      createdUid: productCategory.createUid,
      updatedAt: productCategory.updatedAt,
    };
    reset(values);
    originalValuesRef.current = values;
  }, [reset, productCategory]);

  return (
    <FormView
      methods={method}
      id={id}
      cleanUrl="/app/product_template/categories?view_type=form&id=null"
      reverse={handleReverse}
      onSubmit={onSubmit}
      auditLog="productCategory"
    >
      <FormViewGroup>
        <FieldRelation
          model="productCategory"
          name="parentId"
          label="Categoría principal"
          searchColumns={[
            { field: "name", label: "Nombre" },
            { field: "active", label: "Activo", type: "boolean" },
          ]}
          domain={[["active", "=", true]]}
        />
        <FieldEntry name="description" label="Descripción" />
        <FieldBoolean name="active" label="Activo" />
      </FormViewGroup>
      <Notebook defaultActiveKey="Products">
        <Page eventKey="Products" title="Productos">
          <PageSheet name="Products">
            <Col className="p-0">
              <SimpleTable
                data={fields}
                headers={[
                  {
                    string: "Código",
                    name: "defaultCode",
                    width: 80,
                    minWidth: 60,
                  },
                ]}
                renderRow={(field, i) => (
                  <tr key={field.id} className="border-0 border-bottom">
                    <SimpleTD colIdx={i} name="lineDefaultCode">
                      <div className="py-1">{field.name}</div>
                    </SimpleTD>
                  </tr>
                )}
              />
            </Col>
          </PageSheet>
        </Page>
      </Notebook>
    </FormView>
  );
}

export default ProductCategoryFormView;
