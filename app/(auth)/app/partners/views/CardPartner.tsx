"use client";

import { Card, Col, Row } from "react-bootstrap";
import { PartnerWithProps } from "../actions/partner-actions";
import Image from "next/image";

function CardPartner({ p }: { p: PartnerWithProps }) {
  return (
    <Card style={{ height: "138px" }}>
      <Row className="g-0">
        <Col md="4">
          <img
            src={p.imageUrl || "/images/avatar_default.svg"}
            className="img-fluid rounded-start"
            alt=""
          />
        </Col>
        <Col md="8">
          <Card.Body>
            <Card.Title className="text-truncate" title={p.name}>
              {p.name}
            </Card.Title>
            <small style={{ fontSize: "0.8rem" }}>
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
