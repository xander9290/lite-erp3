"use client";

import { Badge, Card, Col, Row } from "react-bootstrap";
import { ProductTemplateWithProps } from "../../actions/productTemplate.action";
import { WidgetAvatar } from "@/components/widgets";

function CardProduct({ product }: { product: ProductTemplateWithProps }) {
  return (
    <Card className="p-1" style={{ minHeight: "110px" }}>
      <Row className="g-0">
        <Col md="2" className="text-center">
          <WidgetAvatar width={80} height={80} imageUrl={product?.imageUrl} />
        </Col>
        <Col md="10">
          <Card.Body className="p-1 text-center text-md-start">
            <div className="d-flex flex-row justify-content-between">
              <div
                className="fs-6 fw-semibold text-truncate"
                title={product.description}
              >
                {product.description}
              </div>
              <div>
                {product.state === "AVAILABLE" ? (
                  <Badge bg="success">DISPONIBLE</Badge>
                ) : (
                  <Badge bg="danger">AGOTADO</Badge>
                )}
              </div>
            </div>
            <Card.Text className="m-0">{`[${product.defaultCode}]`}</Card.Text>
            <Card.Text className="m-0">${product.price1 || "0.00"}</Card.Text>
            <div className="d-flex gap-1">
              {product.Tags.map((t, i) => (
                <Badge key={t.name}>{t.name}</Badge>
              ))}
            </div>
          </Card.Body>
        </Col>
      </Row>
    </Card>
  );
}

export default CardProduct;
