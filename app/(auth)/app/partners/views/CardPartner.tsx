"use client";

import { Card, Col, Row } from "react-bootstrap";
import Image from "next/image";
import { PartnerWithProps } from "../actions/partner-actions";

function CardPartner({ p }: { p: PartnerWithProps }) {
  return (
    <Card className="h-100 shadow-sm hover-shadow transition" style={{ fontSize: "0.9em", cursor: "pointer" }}>
      <Row className="g-0 h-100">
        <Col md="4" className="d-flex align-items-center">
          <div className="position-relative w-100" style={{ aspectRatio: "1/1" }}>
            <Image src={p.imageUrl || "/images/avatar_default.svg"} alt={p.name || "Partner"} fill className="object-fit-cover rounded-start" sizes="(max-width: 768px) 100vw, 33vw" priority={false} />
          </div>
        </Col>
        <Col md="8" className="d-flex flex-column">
          <Card.Body className="p-1 d-flex flex-column h-100">
            <div className="d-flex justify-content-between align-items-start mb-1">
              <Card.Title className="fs-6 fw-semibold text-truncate mb-0" title={p.name} style={{ maxWidth: "70%" }}>
                {p.name || "Sin nombre"}
              </Card.Title>
            </div>
            <Card.Text className="p-0 m-0 text-muted small flex-grow-1">
              {p.completeAddress ? (
                <>
                  <i className="bi bi-geo-alt me-1"></i>
                  {p.completeAddress}
                </>
              ) : (
                <span className="text-muted fst-italic">Dirección no disponible</span>
              )}
            </Card.Text>

            {p.phone && (
              <div className="small text-muted">
                <i className="bi bi-telephone me-1"></i>
                {p.phone}
              </div>
            )}
            {p.email && (
              <div className="small text-muted">
                <i className="bi bi-envelope me-1"></i>
                {p.email}
              </div>
            )}
          </Card.Body>
        </Col>
      </Row>
    </Card>
  );
}

export default CardPartner;
