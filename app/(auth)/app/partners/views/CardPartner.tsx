"use client";

import { Card, Col, Row } from "react-bootstrap";
import { PartnerWithProps } from "../actions/partner-actions";
import Image from "next/image";

function CardPartner({ p }: { p: PartnerWithProps }) {
  return (
    <Card>
      <Row className="g-0">
        <Col md="4">
          <img
            src={p.imageUrl ?? "/images/avatar_default.svg"}
            className="img-fluid rounded-start"
            alt=""
          />
        </Col>
        <Col md="8">
          <Card.Body>
            <Card.Title>{p.name}</Card.Title>
            <small style={{ fontSize: "0.8rem" }}>
              <Card.Text className="p-0 m-0">
                {p.street} {p.houseNumber}
              </Card.Text>
              <Card.Text className="p-0 m-0">
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
