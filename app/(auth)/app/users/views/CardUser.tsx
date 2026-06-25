"use client";

import { Card, Col, Row } from "react-bootstrap";
import { UserWithProps } from "../actions/user-actions";
import Image from "next/image";
import { WidgetBadgeStatus } from "@/components/widgets";

function CardUser({ user }: { user: UserWithProps }) {
  return (
    <Card>
      <Row className="g-0 h-100">
        <Col md="4" className="d-flex align-items-center">
          <div
            className="position-relative w-100"
            style={{ aspectRatio: "1/1" }}
          >
            <Image
              src={user.Partner?.imageUrl || "/images/avatar_default.svg"}
              alt={user.Partner?.name || "Partner"}
              fill
              className="object-fit-cover rounded-start"
              sizes="(max-width: 768px) 100vw, 33vw"
              priority={false}
            />
          </div>
        </Col>
        <Col md="8" className="d-flex flex-column">
          <Card.Body className="p-2 d-flex flex-column h-100">
            <div className="d-flex justify-content-between align-items-start mb-1">
              <Card.Title
                className="fs-5 fw-semibold text-truncate mb-0"
                title={user.Partner?.name}
                style={{ maxWidth: "70%" }}
              >
                {user.Partner?.name || "Sin nombre"}
              </Card.Title>
            </div>
            <div className="d-flex justify-content-between align-items-start mb-1">
              <Card.Text>{user.login}</Card.Text>
              <Card.Text>{user.Group?.name}</Card.Text>
            </div>
            {user.Partner?.email && (
              <div className="small text-muted">
                <i className="bi bi-envelope me-1"></i>
                {user.Partner?.email}
              </div>
            )}
            <small>
              <WidgetBadgeStatus
                value={user.active ? "active" : "inactive"}
                options={{
                  active: { label: "Activo", color: "success" },
                  inactive: { label: "Inactivo", color: "danger" },
                }}
              />
            </small>
          </Card.Body>
        </Col>
      </Row>
    </Card>
  );
}

export default CardUser;
