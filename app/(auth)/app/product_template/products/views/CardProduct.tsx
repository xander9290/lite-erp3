"use client";

import { Badge, Card, Col, Row } from "react-bootstrap";
import { ProductTemplateWithProps } from "../actions/productTemplate.action";
import { WidgetAvatar, WidgetBadgeStatus } from "@/components/widgets";
import { FieldText } from "@/components/templates/fields";
import { computeStocks } from "./ProductTemplateFormView";
import { formatCurrency } from "@/app/libs/helpers";

function CardProduct({ product }: { product: ProductTemplateWithProps }) {
  return (
    <Card className="p-1 shadow-sm" style={{ minHeight: "110px" }}>
      <Row className="g-0">
        <Col md="2" className="text-center">
          <WidgetAvatar
            width={80}
            height={80}
            imageUrl={product?.imageUrl ?? ""}
          />
        </Col>
        <Col md="10">
          <Card.Body
            className="p-1 text-center text-md-start"
            style={{ minHeight: "185px" }}
          >
            <Card.Title
              className="m-0 fw-semibold"
              style={{ minHeight: "55px" }}
            >
              <small>{product.description}</small>
            </Card.Title>
            <Card.Text className="d-flex justify-content-between m-0 my-1">
              <FieldText
                name="defaultCode"
                output={`[${product.defaultCode}]`}
              />
              <FieldText
                name="productBrand"
                output={product.ProductBrand?.description}
              />
            </Card.Text>
            <Card.Text className="d-flex justify-content-between m-0 my-1">
              <FieldText
                name="price1"
                output={formatCurrency({ value: product.price1 })}
              />
              <WidgetBadgeStatus
                value={product.state}
                options={{
                  AVAILABLE: { label: "Disponible", color: "success" },
                  NOT_AVAILABLE: { label: "Agotado", color: "danger" },
                }}
              />
            </Card.Text>
            <Card.Text className="m-0">
              <strong>Disponible: </strong>
              {computeStocks({ product })}
              <span> {product.Uom?.code}</span>
            </Card.Text>
            <Card.Text className="d-flex gap-1 m-0">
              {product.Tags.map((t) => (
                <small key={t.name}>
                  <Badge pill>{t.name}</Badge>
                </small>
              ))}
            </Card.Text>
          </Card.Body>
        </Col>
      </Row>
    </Card>
  );
}

export default CardProduct;
