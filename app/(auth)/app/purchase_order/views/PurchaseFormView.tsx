"use client";

import {
  createPurchaseOrder,
  PurchaseOrderWithProps,
  updatePurchaseOrder,
} from "../actions/purchase.action";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  purchaseOrderSchema,
  purchaseOrderSchemaDefault,
  PurchaseOrderSchemaType,
} from "../schemas/purchase.schema";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useModals } from "@/contexts/ModalContext";
import { FormView, FormViewGroup } from "@/components/templates/FormView";
import { FieldEntry, FieldRelation } from "@/components/templates/fields";
import { useAuth } from "@/hooks/sessionStore";
import toast from "react-hot-toast";
import { Notebook, Page, PageSheet } from "@/components/templates/Notebook";
import { Col } from "react-bootstrap";
import {
  BtnDeleteLine,
  SimpleTable,
  SimpleTD,
} from "@/components/templates/simpletemplates";
import type { ProductTemplate } from "@/generated/prisma/client";
import { getProductById } from "../../product_template/products/actions/productTemplate.action";

function PurchaseFormView({
  id,
  purchase,
}: {
  id: string | null;
  purchase: PurchaseOrderWithProps | null;
}) {
  const { companyId } = useAuth();

  const methods = useForm({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: purchaseOrderSchemaDefault,
  });

  const { reset, control, setValue, getValues } = methods;

  const {
    append,
    fields: lines,
    remove,
  } = useFieldArray({
    control,
    name: "OrderLines",
  });

  const originalValuesRef = useRef<PurchaseOrderSchemaType | null>(null);
  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };
  const router = useRouter();

  const { modalError } = useModals();

  const onSubmit: SubmitHandler<PurchaseOrderSchemaType> = async (data) => {
    if (id && id === "null") {
      const res = await createPurchaseOrder({ data });
      if (!res.success) return modalError(res.message);
      router.replace(`/app/purchase_order?view_type=form&id=${res.data?.id}`);
      toast.success(res.message);
    } else {
      const res = await updatePurchaseOrder({ id, data });
      if (!res.success) return modalError(res.message);
      router.refresh();
      toast.success(res.message);
    }
  };

  const computeProductLine = async ({
    value,
    record,
    line,
  }: {
    value: string | null;
    record: ProductTemplate | null;
    line: number;
  }) => {
    if (record) {
      const productId = await getProductById({ id: value });
      if (productId) {
        const unitPrice = productId.lastCost; // ✅ ya viene sin IVA
        const taxRate = productId.TaxPurchase?.amount ?? 0.0;
        const qty = getValues().OrderLines[line].quantity;

        const subtotal = qty * unitPrice; // ✅ base gravable (sin IVA)
        const total = subtotal * (1 + taxRate); // ✅ total con IVA incluido
        const taxAmount = subtotal * taxRate; // opcional: monto del impuesto

        setValue(`OrderLines.${line}.uomId`, {
          id: productId.Uom?.id || "",
          name: productId.Uom?.name || "",
        });
        setValue(`OrderLines.${line}.priceUnit`, unitPrice);
        setValue(`OrderLines.${line}.taxRate`, taxRate);
        setValue(`OrderLines.${line}.taxAmount`, taxAmount);
        setValue(`OrderLines.${line}.subtotal`, subtotal);
        setValue(`OrderLines.${line}.total`, total);
      }
    }
  };

  const computeQuantityLine = ({
    value,
    line,
  }: {
    value: number;
    line: number;
  }) => {
    const priceUnit = getValues().OrderLines[line].priceUnit; // ✅ ya viene sin IVA
    const taxRate = getValues().OrderLines[line].taxRate ?? 0.0;
    const qty = value;

    const subtotal = qty * priceUnit; // ✅ base gravable (sin IVA)
    const total = subtotal * (1 + taxRate); // ✅ total con IVA incluido
    const taxAmount = subtotal * taxRate;

    setValue(`OrderLines.${line}.taxAmount`, taxAmount);
    setValue(`OrderLines.${line}.subtotal`, subtotal);
    setValue(`OrderLines.${line}.total`, total);
  };

  const computePriceUnit = ({
    value,
    line,
  }: {
    value: number;
    line: number;
  }) => {
    const priceUnit = value; // ✅ precio sin IVA
    const qty = getValues().OrderLines[line].quantity;
    const taxRate = getValues().OrderLines[line].taxRate ?? 0.0;

    const subtotal = qty * priceUnit; // ✅ base gravable (sin IVA)
    const total = subtotal * (1 + taxRate); // ✅ total con IVA incluido
    const taxAmount = subtotal * taxRate;

    setValue(`OrderLines.${line}.priceUnit`, priceUnit);
    setValue(`OrderLines.${line}.taxAmount`, taxAmount);
    setValue(`OrderLines.${line}.subtotal`, subtotal);
    setValue(`OrderLines.${line}.total`, total);
  };

  useEffect(() => {
    if (!purchase) {
      reset(purchaseOrderSchemaDefault);
      originalValuesRef.current = purchaseOrderSchemaDefault;
      return;
    }

    const values: PurchaseOrderSchemaType = {
      name: purchase.name,
      state: purchase.state,
      date: purchase.date,
      dateOrder: purchase.dateOrder,
      datePlanned: purchase.datePlanned,
      subtotal: purchase.subtotal,
      total: purchase.total,
      paymentTermId: {
        id: purchase.PaymentTerm?.id || "",
        name: purchase.PaymentTerm?.name || "",
      },
      supplierId: {
        id: purchase.Supplier.id,
        name: purchase.Supplier.name,
      },
      userId: {
        id: purchase.User.id,
        name: purchase.User.name,
      },
      warehouseDestId: {
        id: purchase.WarehouseDest.id,
        name: purchase.WarehouseDest.name,
      },
      OrderLines: purchase.OrderLines.map((line) => ({
        id: line.id,
        productId: {
          id: line.Product.id,
          name: line.Product.name,
        },
        uomId: {
          id: line.Uom.id,
          name: line.Uom.name,
        },
        priceUnit: line.priceUnit,
        quantity: line.quantity,
        taxRate: line.taxRate,
        taxAmount: line.taxAmount,
        subtotal: line.subtotal,
        total: line.total,
      })),
      createdAt: purchase.createdAt,
      updatedAt: purchase.updatedAt,
    };
    reset(values);
    originalValuesRef.current = values;
  }, [purchase, reset]);

  return (
    <FormView
      auditLog="purchaseOrder"
      reverse={handleReverse}
      onSubmit={onSubmit}
      id={id}
      methods={methods}
      cleanUrl="/app/purchase_order?view_type=form&id=null"
    >
      <FormViewGroup>
        <FieldRelation
          model="partner"
          name="supplierId"
          label="Proveedor"
          domain={[["displayType", "=", "SUPPLIER"]]}
          searchColumns={[{ field: "name", label: "Nombre" }]}
        />
        <FieldRelation
          model="warehouse"
          name="warehouseDestId"
          label="Almacén destino"
          domain={[
            ["type", "=", "SUPPLY"],
            ["companyId", "=", companyId],
          ]}
        />
        <FieldRelation model="users" name="userId" label="Comprador" readonly />
      </FormViewGroup>
      <FormViewGroup>
        <FieldEntry name="date" label="Creación" type="date" readonly />
        <FieldEntry name="dateOrder" label="Confirmar el" type="date" />
        <FieldEntry name="datePlanned" label="Fecha esperada" type="date" />
      </FormViewGroup>
      <Notebook defaultActiveKey="orderLine">
        <Page eventKey="orderLine" title="Productos">
          <PageSheet name="purchaseOrderLine">
            <Col md="12" className="p-0 m-0 overflow-auto">
              <SimpleTable
                data={lines}
                resizable
                headers={[
                  {
                    string: "Producto",
                    name: "productId",
                    width: 270,
                    minWidth: 170,
                  },
                  {
                    string: "Cantidad",
                    name: "quantity",
                    width: 30,
                    minWidth: 30,
                  },
                  { string: "UdM", name: "uomId", width: 50, minWidth: 50 },
                  {
                    string: "Precio U.",
                    name: "priceUnit",
                    width: 30,
                    minWidth: 30,
                  },
                  {
                    string: "Subtotal",
                    name: "subtotal",
                    width: 50,
                    minWidth: 50,
                  },
                  { string: "IVA", name: "taxRate", width: 30, minWidth: 30 },
                  { string: "Total", name: "total", width: 50, minWidth: 50 },
                  {
                    string: <i className="bi bi-trash"></i>,
                    className: "text-center",
                    width: 25,
                    minWidth: 25,
                    name: "lineDelete",
                  },
                ]}
                renderRow={(row, index) => (
                  <tr key={row.id} className="border-bottom">
                    <SimpleTD colIdx={index} name="lineProductId">
                      <FieldRelation
                        inline
                        name={`OrderLines.${index}.productId`}
                        model="productTemplate"
                        domain={[
                          ["displayType", "=", "PRODUCT"],
                          ["purchases", "=", true],
                        ]}
                        searchColumns={[
                          { field: "name", label: "Nombre" },
                          {
                            field: "purchases",
                            label: "Compra",
                            type: "boolean",
                          },
                        ]}
                        ponChange={(value, record) =>
                          computeProductLine({
                            value,
                            record: record as ProductTemplate,
                            line: index,
                          })
                        }
                      />
                    </SimpleTD>
                    <SimpleTD colIdx={index} name="lineQuantity">
                      <FieldEntry
                        inline
                        name={`OrderLines.${index}.quantity`}
                        type="number"
                        decimals={3}
                        onChange={(value) =>
                          computeQuantityLine({
                            value: Number(value),
                            line: index,
                          })
                        }
                      />
                    </SimpleTD>
                    <SimpleTD colIdx={index} name="lineUomId">
                      <FieldRelation
                        inline
                        model="uomCategory"
                        name={`OrderLines.${index}.uomId`}
                        readonly
                      />
                    </SimpleTD>
                    <SimpleTD colIdx={index} name="linePriceUnit">
                      <FieldEntry
                        inline
                        name={`OrderLines.${index}.priceUnit`}
                        type="number"
                        decimals={2}
                        onChange={(value) =>
                          computePriceUnit({
                            value: Number(value),
                            line: index,
                          })
                        }
                      />
                    </SimpleTD>
                    <SimpleTD colIdx={index} name="lineSubtotal">
                      <FieldEntry
                        inline
                        name={`OrderLines.${index}.subtotal`}
                        type="number"
                        decimals={2}
                        readonly
                      />
                    </SimpleTD>
                    <SimpleTD colIdx={index} name="lineTaxRate">
                      <FieldEntry
                        inline
                        name={`OrderLines.${index}.taxRate`}
                        type="number"
                        decimals={2}
                        readonly
                        invisible
                      />
                      <FieldEntry
                        inline
                        name={`OrderLines.${index}.taxAmount`}
                        type="number"
                        decimals={2}
                        readonly
                      />
                    </SimpleTD>
                    <SimpleTD colIdx={index} name="lineTotal">
                      <FieldEntry
                        inline
                        name={`OrderLines.${index}.total`}
                        type="number"
                        decimals={2}
                        readonly
                      />
                    </SimpleTD>
                    <SimpleTD
                      contentPosition="text-center"
                      name="lineDelete"
                      colIdx={index}
                    >
                      <BtnDeleteLine
                        action={() => remove(index)}
                        disabled={getValues().state !== "draft"}
                      />
                    </SimpleTD>
                  </tr>
                )}
                action={() =>
                  append({
                    id: null,
                    productId: { id: "", name: "" },
                    uomId: { id: "", name: "" },
                    quantity: 1.0,
                    priceUnit: 0.0,
                    taxRate: 0.0,
                    taxAmount: 0.0,
                    subtotal: 0.0,
                    total: 0.0,
                  })
                }
              />
            </Col>
          </PageSheet>
        </Page>
        <Page eventKey="otherInfo" title="Contabilidad">
          <PageSheet name="otherInfoPage">
            <FormViewGroup>
              <FieldRelation
                model="invoicingPaymentTerm"
                name="paymentTermId"
                label="Término de pago"
              />
            </FormViewGroup>
          </PageSheet>
        </Page>
      </Notebook>
    </FormView>
  );
}

export default PurchaseFormView;
