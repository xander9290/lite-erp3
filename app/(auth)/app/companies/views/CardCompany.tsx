"use client";

import { Card, Col, Row } from "react-bootstrap";
import { CompanieWithProps } from "../actions/companies-actions";
import { WidgetAvatar } from "@/components/widgets";

function CardCompany({ comapny }: { comapny: CompanieWithProps }) {
  return (
    <Card className="p-1" style={{ minHeight: "100px" }}>
      <Row className="g-0">
        <Col md="2" className="text-center">
          <WidgetAvatar
            width={80}
            height={80}
            imageUrl={comapny.Partner?.imageUrl}
          />
        </Col>
        <Col md="10" className="text-truncate">
          <Card.Body className="p-1 text-center text-md-start">
            <div
              className="fs-6 fw-semibold"
              title={`[${comapny.code}] ${comapny.Partner?.name}`}
            >{`[${comapny.code}] ${comapny.Partner?.name}`}</div>
            <div>
              <small>
                <strong>Gerente: </strong>
                <span>{comapny.Manager?.name}</span>
              </small>
            </div>
            <div>
              <small>
                <strong>Ubicación: </strong>
                <span
                  title={`${comapny.Partner?.county}, ${comapny.Partner?.province}`}
                >
                  {comapny.Partner?.county}, {comapny.Partner?.province}
                </span>
              </small>
            </div>
          </Card.Body>
        </Col>
      </Row>
    </Card>
  );
}

export default CardCompany;
