"use client";

import { Badge, Card, Col, Row } from "react-bootstrap";
import { ProductTemplateWithProps } from "../actions/productTemplate.action";
import { WidgetAvatar } from "@/components/widgets";
import { FieldText } from "@/components/templates/fields";
import { computeStocks } from "./ProductTemplateFormView";

function CardProduct({ product }: { product: ProductTemplateWithProps }) {
  return (
    <Card className="p-1 shadow-sm" style={{ minHeight: "110px" }}>
      <Row className="g-0">
        <Col md="2" className="text-center">
          <WidgetAvatar width={80} height={80} imageUrl={product?.imageUrl} />
        </Col>
        <Col md="10">
          <Card.Body className="p-1 text-center text-md-start">
            <div className="d-flex flex-row justify-content-between">
              <div className="fs-6 fw-semibold text-truncate" title={product.description}>
                <FieldText name="description" output={product.description} />
              </div>
              <div>{product.state === "AVAILABLE" ? <Badge bg="success">DISPONIBLE</Badge> : <Badge bg="danger">AGOTADO</Badge>}</div>
            </div>
            <Card.Text className="d-flex justify-content-between m-0 my-1">
              <FieldText name="defaultCode" output={`[${product.defaultCode}]`} />
              <span className="text-truncate" title={product.ProductCategory?.name}>
                <em>
                  <FieldText name="productCategory" output={`${product.ProductCategory?.name || ""}`} />
                </em>
              </span>
            </Card.Text>
            <Card.Text className="d-flex justify-content-between m-0 my-1">
              <FieldText name="price1" output={`$${product.price1.toFixed(2) || "0.00"}`} />
              <em>
                <FieldText name="productBrand" output={product.ProductBrand?.description || ""} />
              </em>
            </Card.Text>
            <Card.Text className="m-0">
              <strong>Disponible: </strong>
              {computeStocks({ product })}
              <span> {product.Uom?.code}</span>
            </Card.Text>
            <Card.Text className="d-flex gap-1 m-0">
              {product.Tags.map((t) => (
                <Badge key={t.name}>{t.name}</Badge>
              ))}
            </Card.Text>
          </Card.Body>
        </Col>
      </Row>
    </Card>
  );
}

export default CardProduct;
