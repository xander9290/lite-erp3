"use client";

import { Card, Col, Row } from "react-bootstrap";
import { CompanieWithProps } from "../actions/companies-actions";
import { WidgetAvatar } from "@/components/widgets";

function CardCompany({ comapny }: { comapny: CompanieWithProps }) {
  return (
    <Card className="p-1">
      <Row className="g-0">
        <Col md="2" className="text-center">
          <WidgetAvatar
            width={80}
            height={80}
            imageUrl={comapny.Partner?.imageUrl}
          />
        </Col>
        <Col md="10">
          <Card.Body className="p-1 text-center text-md-start">
            <div className="fs-6 fw-semibold">{`[${comapny.code}] ${comapny.Partner?.name}`}</div>
            <div>
              <small>
                <strong>Gerente: </strong>
                <span>{comapny.Manager?.name}</span>
              </small>
            </div>
          </Card.Body>
        </Col>
      </Row>
    </Card>
  );
}

export default CardCompany;
