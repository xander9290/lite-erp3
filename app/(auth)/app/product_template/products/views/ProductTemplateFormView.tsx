"use client";

import {
  createProduct,
  ProductTemplateWithProps,
  updateProduct,
} from "../actions/productTemplate.action";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
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
  FieldTags,
} from "@/components/templates/fields";
import { Notebook, Page, PageSheet } from "@/components/templates/Notebook";
import toast from "react-hot-toast";
import {
  BtnDeleteLine,
  SimpleTable,
  SimpleTD,
} from "@/components/templates/simpletemplates";
import { Col } from "react-bootstrap";
import { getUomById } from "../../uom_category/actions/uom.action";
import type { WarehouseType } from "@/generated/prisma/enums";
import { useAuth } from "@/hooks/sessionStore";
import { formatNumberForDisplay } from "@/app/libs/helpers";

export const computeStocks = ({
  product,
  whType = ["SALES", "PRODUCTION"],
}: {
  product: ProductTemplateWithProps | null;
  whType?: WarehouseType[];
}) => {
  let qtyAvailable = 0.0;
  const saleWarehouses =
    product?.Stocks.filter((s) => whType.includes(s.Warehouse.type)) || [];
  for (const sale of saleWarehouses) {
    qtyAvailable += sale.qty - sale.reservedQty;
  }
  return formatNumberForDisplay(qtyAvailable, 3);
};

function ProductTemplateFormView({
  id,
  product,
}: {
  id: string | null;
  product: ProductTemplateWithProps | null;
}) {
  const { companyId } = useAuth();

  const methods = useForm<ProductTemplateSchemaType>({
    resolver: zodResolver(productTemplateSchema),
    defaultValues: productTemplateSchemaDefault,
  });

  const { reset, getValues, handleSubmit, control, setValue } = methods;

  //LÍNEAS DE EMBALAJE
  const {
    remove,
    append,
    fields: packaging,
  } = useFieldArray({
    control,
    name: "ProductPackagingLines",
  });

  //LÍNEAS DE RECETARIO
  const {
    remove: removeReceipt,
    append: appReceipt,
    fields: receipts,
  } = useFieldArray({
    control,
    name: "ReceiptLines",
  });

  const originalValuesRef = useRef<ProductTemplateSchemaType | null>(null);
  const router = useRouter();

  const { modalError } = useModals();

  const onSubmit: SubmitHandler<ProductTemplateSchemaType> = async (data) => {
    if (id && id === "null") {
      const res = await createProduct({ data });
      if (!res.success) return modalError(res.message);

      router.replace(
        `/app/product_template/products?view_type=form&id=${res.data?.id}`,
      );
      toast.success(res.message);
    } else {
      const res = await updateProduct({ data, id });
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

  const actionToggleState = handleSubmit(async () => {
    const newData: ProductTemplateSchemaType = {
      ...getValues(),
      state: product?.state === "AVAILABLE" ? "NOT_AVAILABLE" : "AVAILABLE",
    };
    await onSubmit(newData);
  });

  const actionViewStocks = () => {
    return router.push(
      `/app/stock_warehouse?view_type=list&id=null&product_id=${id}`,
    );
  };

  const actionViewStockMoves = () => {
    return router.push(
      `/app/stock_move?view_type=list&id=null&product_id=${id}`,
    );
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
      manufacturing: product.manufacturing,
      yield: product.yield,
      displayType: product.displayType,
      state: product.state,
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
      Tags: product.Tags.map((t) => t.id) || [],
      productCategoryId: {
        id: product.ProductCategory?.id || "",
        name: product.ProductCategory?.name || "",
      },
      productBrandId: {
        id: product.ProductBrand?.id || "",
        name: product.ProductBrand?.name || "",
      },
      uomId: { id: product.Uom?.id || "", name: product.Uom?.name || "" },
      ProductPackagingLines:
        product.ProductPackagingLines.map((p) => ({
          id: p.id,
          packagingId: {
            id: p.ProductPackaging.id,
            name: p.ProductPackaging.name,
          },
          productId: { id: p.Product.id, name: p.Product.name },
          uomId: { id: p.Uom.id, name: p.Uom.name },
          qty: p.qty,
        })) || [],
      ReceiptLines: product.ReceiptLines.map((line) => ({
        id: line.id,
        qty: line.qty,
        active: line.active,
        productId: { id: line.Product.id, name: line.Product.name },
        uomId: { id: line.Uom.id, name: line.Uom.name },
      })),
      taxSaleId: {
        id: product.TaxSale?.id || "",
        name: product.TaxSale?.name || "",
      },
      taxPurchaseId: {
        id: product.TaxPurchase?.id || "",
        name: product.TaxPurchase?.name || "",
      },
      createdAt: product.createdAt,
      createdUid: product.createUid,
      updatedAt: product.updatedAt,
    };

    reset(values);
    originalValuesRef.current = values;
  }, [product, reset]);

  const stockMovesCount = () => {
    const getMoves = product?.StockMoves.filter(
      (s) => s.Company.id === companyId,
    );
    return getMoves?.length ?? 0;
  };

  return (
    <FormView
      methods={methods}
      cleanUrl="/app/product_template?view_type=form&id=null"
      auditLog="productTemplate"
      reverse={handleReverse}
      onSubmit={onSubmit}
      id={id}
      formStates={[
        { name: "AVAILABLE", label: "DISPONIBLE", decoration: "success" },
        { name: "NOT_AVAILABLE", label: "AGOTADO", decoration: "danger" },
      ]}
      state={product?.state}
      actions={[
        {
          action: actionToggleState,
          fieldName: "actionToggleState",
          string: product?.state === "AVAILABLE" ? "AGOTADO" : "DISPONIBLE",
          variant: "info",
          invisible: id === "null",
        },
        {
          action: actionViewStocks,
          fieldName: "actionViewStocks",
          string: `Existencias: ${computeStocks({ product })}`,
          variant: "outline-primary",
          invisible: id === "null",
        },
        {
          action: actionViewStockMoves,
          fieldName: "actionViewStockMoves",
          string: `Movimientos: ${stockMovesCount()}`,
          variant: "outline-primary",
          invisible: id === "null" || stockMovesCount() === 0,
        },
      ]}
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
      <FormViewGroup>
        <FieldRelation
          model="productCategory"
          name="productCategoryId"
          label="Categoría"
          searchColumns={[
            { field: "name", label: "Nombre" },
            { field: "active", label: "Activo", type: "boolean" },
          ]}
          domain={[["active", "=", true]]}
        />
        <FieldRelation
          model="productBrand"
          name="productBrandId"
          label="Marca"
          searchColumns={[
            { field: "name", label: "Nombre" },
            { field: "active", label: "Activo", type: "boolean" },
          ]}
          domain={[["active", "=", true]]}
        />
        <FieldRelation
          model="uomCategory"
          name="uomId"
          label="Unidad de medida"
          searchColumns={[
            { field: "name", label: "Nombre" },
            { field: "active", label: "Activo", type: "boolean" },
          ]}
          domain={[["active", "=", true]]}
        />
        <FieldTags name="Tags" label="Etiquetas" />
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
                  label="Ú. Costo"
                  readonly
                />
                <FieldEntry
                  name="uomIncomingAllowed"
                  type="number"
                  label="MdC"
                />
              </FormViewStack>
              <FieldRelation
                model="invoicingTax"
                name="taxPurchaseId"
                label="Impuestos compra"
              />
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
                <FieldEntry type="number" name="price1" label="Precio 1" />
                <FieldEntry type="number" name="price2" label="Precio 2" />
                <FieldEntry type="number" name="price3" label="Precio 3" />
              </FormViewStack>
              <FormViewStack>
                <FieldEntry type="number" name="price4" label="Precio 4" />
                <FieldEntry type="number" name="price5" label="Precio 5" />
                <FieldEntry
                  name="uomOutgoingAllowed"
                  type="number"
                  label="Múltiplo de venta"
                />
              </FormViewStack>
              <FieldRelation
                model="invoicingTax"
                name="taxSaleId"
                label="Impuestos venta"
              />
            </FormViewGroup>
          </PageSheet>
        </Page>
        <Page eventKey="inventory" title="Inventario">
          <PageSheet name="inventory">
            <FormViewGroup>
              <h6>Dimensiones</h6>
              <FormViewStack>
                <FieldEntry name="alto" label="Alto" type="number" />
                <FieldEntry name="ancho" label="Ancho" type="number" />
                <FieldEntry name="largo" label="Largo" type="number" />
              </FormViewStack>
              <FormViewStack>
                <FieldEntry name="weight" label="Peso" type="number" />
                <FieldEntry name="volume" label="Volumen" type="number" />
              </FormViewStack>
            </FormViewGroup>
            <FormViewGroup>
              <h6>Embalajes</h6>
              <SimpleTable
                data={packaging}
                headers={[
                  { string: "Nombre", width: 100, minWidth: 60 },
                  { string: "Cantidad", width: 35, minWidth: 25 },
                  { string: "UdM", width: 100, minWidth: 60 },
                  {
                    string: <i className="bi bi-trash"></i>,
                    className: "text-center",
                    width: 35,
                    minWidth: 30,
                    name: "lineDelete",
                  },
                ]}
                resizable
                renderRow={(row, index) => (
                  <tr key={row.id} className="border-bottom">
                    <SimpleTD name="linePackagingName" colIdx={index}>
                      <FieldRelation
                        inline
                        model="productPackaging"
                        name={`ProductPackagingLines.${index}.packagingId`}
                      />
                    </SimpleTD>
                    <SimpleTD name="linePackagingQty" colIdx={index}>
                      <FieldEntry
                        className="text-end"
                        inline
                        name={`ProductPackagingLines.${index}.qty`}
                        type="number"
                      />
                    </SimpleTD>
                    <SimpleTD name="lineUomId" colIdx={index}>
                      <FieldRelation
                        model="uomCategory"
                        name={`ProductPackagingLines.${index}.uomId`}
                        inline
                      />
                    </SimpleTD>
                    <SimpleTD
                      name="lineDelete"
                      colIdx={index}
                      contentPosition="text-center"
                    >
                      <BtnDeleteLine action={() => remove(index)} />
                    </SimpleTD>
                  </tr>
                )}
                action={() =>
                  append({
                    id: "",
                    packagingId: { id: "", name: "" },
                    productId: { id: "", name: "" },
                    uomId: { id: "", name: "" },
                    qty: 0.0,
                  })
                }
              />
            </FormViewGroup>
          </PageSheet>
        </Page>
        <Page title="Recetario" eventKey="receipt">
          <PageSheet name="productReceiptLines">
            <Col md="12" className="p-0 m-0 overflow-auto">
              <SimpleTable
                data={receipts}
                headers={[
                  { string: "Producto", width: 200, minWidth: 90 },
                  { string: "Cantidad", width: 70, minWidth: 50 },
                  { string: "UdM", width: 80, minWidth: 70 },
                  { string: "Activo", width: 50, minWidth: 45 },
                  {
                    string: <i className="bi bi-trash"></i>,
                    className: "text-center",
                    width: 35,
                    minWidth: 30,
                    name: "lineDelete",
                  },
                ]}
                resizable
                renderRow={(row, index) => (
                  <tr key={row.id} className="border-bottom">
                    <SimpleTD colIdx={index} name="lineReceiptProductId">
                      <FieldRelation
                        inline
                        model="productTemplate"
                        name={`ReceiptLines.${index}.productId`}
                        searchColumns={[
                          { field: "name", label: "Nombre" },
                          { field: "sales", label: "Venta", type: "boolean" },
                        ]}
                        domain={[
                          ["id", "!=", id],
                          ["sales", "=", false],
                        ]}
                        ponChange={async (val, record) => {
                          const rec = record as ProductTemplateWithProps;
                          const uomId = rec && rec.uomId;
                          const getUom = (await getUomById({ id: uomId })) || {
                            id: "",
                            name: "",
                          };
                          setValue(`ReceiptLines.${index}.uomId`, {
                            id: getUom.id,
                            name: getUom.name,
                          });
                        }}
                      />
                    </SimpleTD>
                    <SimpleTD colIdx={index} name="lineReceiptQty">
                      <FieldEntry
                        inline
                        type="number"
                        decimals={3}
                        name={`ReceiptLines.${index}.qty`}
                      />
                    </SimpleTD>
                    <SimpleTD colIdx={index} name="lineReceiptUomId">
                      <FieldRelation
                        inline
                        model="uomCategory"
                        readonly
                        name={`ReceiptLines.${index}.uomId`}
                      />
                    </SimpleTD>
                    <SimpleTD colIdx={index} name="lineReceiptActive">
                      <FieldBoolean
                        inline
                        name={`ReceiptLines.${index}.active`}
                      />
                    </SimpleTD>
                    <SimpleTD
                      name="lineDelete"
                      colIdx={index}
                      contentPosition="text-center"
                    >
                      <BtnDeleteLine action={() => removeReceipt(index)} />
                    </SimpleTD>
                  </tr>
                )}
                action={() =>
                  appReceipt({
                    id: "",
                    productId: { id: "", name: "" },
                    uomId: { id: "", name: "" },
                    qty: 1.0,
                    active: true,
                  })
                }
              />
            </Col>
          </PageSheet>
        </Page>
        <Page eventKey="manufacturing" title="Fabricación">
          <PageSheet name="manufacturingPage">
            <FormViewGroup>
              <FieldBoolean name="manufacturing" label="Se puede fabricar" />
              <FieldEntry
                name="yield"
                label="Rendimiento"
                type="number"
                decimals={3}
              />
            </FormViewGroup>
          </PageSheet>
        </Page>
      </Notebook>
    </FormView>
  );
}

export default ProductTemplateFormView;
