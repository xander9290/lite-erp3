"use client";

import { Card, Col, Row } from "react-bootstrap";
import { UserWithProps } from "../actions/user-actions";
import {
  WidgetAvatar,
  WidgetBadgeStatus,
  WidgetDropList,
} from "@/components/widgets";

function CardUser({ user }: { user: UserWithProps }) {
  return (
    <Card className="p-1">
      <Row className="g-0">
        <Col md="2" className="text-center">
          <WidgetAvatar
            width={80}
            height={80}
            imageUrl={user.Partner?.imageUrl}
          />
        </Col>
        <Col md="10">
          <Card.Body className="p-1 text-center text-md-start">
            <div className="fs-6 fw-bold">{user.Partner?.name}</div>
            <div>
              <small>
                <strong>Usuario: </strong>
                <span>{user.login} </span>
                <WidgetBadgeStatus
                  value={user.active ? "active" : "inactive"}
                  options={{
                    active: { label: "Activo", color: "success" },
                    inactive: { label: "Inactivo", color: "danger" },
                  }}
                />
              </small>
            </div>
            <div>
              <small>
                <strong>Grupo: </strong>
                <span>{user.Group?.name}</span>
              </small>
            </div>
            <div>
              <strong>Empresas:</strong>
              <WidgetDropList items={user.Companies} />
            </div>
          </Card.Body>
        </Col>
      </Row>
    </Card>
  );
}

export default CardUser;
