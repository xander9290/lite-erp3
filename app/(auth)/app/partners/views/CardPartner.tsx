"use client";

import { Card, Col, Row } from "react-bootstrap";
import { PartnerWithProps } from "../actions/partner-actions";
import { WidgetAvatar } from "@/components/widgets";

function CardPartner({ p }: { p: PartnerWithProps }) {
  return (
    <Card style={{ height: "135px" }}>
      <Row className="g-0">
        <Col md="4" className="text-md-start text-center">
          <WidgetAvatar width={90} height={90} imageUrl={p.imageUrl} />
        </Col>
        <Col md="8">
          <Card.Body className="px-1">
            <small style={{ fontSize: "0.8rem" }}>
              <Card.Title className="text-truncate" title={p.name}>
                {p.name}
              </Card.Title>
              <Card.Text
                className="p-0 m-0 text-truncate"
                title={`${p.street} ${p.houseNumber}`}
              >
                {p.street} {p.houseNumber}
              </Card.Text>
              <Card.Text
                className="p-0 m-0 text-truncate"
                title={`${p.town} ${p.county} ${p.province} ${p.country}`}
              >
                {p.town} {p.county} {p.province} {p.country}
              </Card.Text>
              <Card.Text>
                {p.phone} {p.email}
              </Card.Text>
            </small>
          </Card.Body>
        </Col>
      </Row>
    </Card>
  );
}

export default CardPartner;
