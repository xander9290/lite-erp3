"use client";

import Link from "next/link";
import React, { ReactElement } from "react";
import {
  Alert,
  Button,
  ButtonGroup,
  Card,
  Col,
  Container,
  Dropdown,
  DropdownButton,
  Row,
} from "react-bootstrap";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/sessionStore";

type HeaderActionProps = {
  name: string;
  string: React.ReactNode;
  action: () => void;
};

type HeaderProps = {
  children?: React.ReactNode;
  formView?: string;
  title: string;
  actions?: HeaderActionProps[];
};

type BodyProps = { children: React.ReactNode };
type FooterProps = { children: React.ReactNode };

// Subcomponentes
function Header({ children, formView, title, actions }: HeaderProps) {
  const { access } = useAuth();
  const router = useRouter();

  const modelName = formView?.split("?")[0].split("/")[2] + "Model";
  const modelAccess = access.find((acc) => acc.fieldName === modelName);
  return (
    <Card.Header>
      <Container fluid>
        <Row className="gy-1">
          <Col xs="12" sm="11" md="6" lg="6" xl="6">
            <div className="d-flex gap-2 align-items-center">
              {formView && !modelAccess?.notCreate && (
                <Link
                  className="btn btn-primary btn-sm fw-semibold"
                  href={formView}
                >
                  Nuevo
                </Link>
              )}
              <Card.Title className="m-0 p-0">{title}</Card.Title>
              {actions && (
                <DropdownButton
                  variant="none"
                  title={<i className="bi bi-gear-fill"></i>}
                  as={ButtonGroup}
                  size="sm"
                >
                  {actions.map((action, index) => {
                    return (
                      <Dropdown.Item
                        key={`action-list-${index}`}
                        onClick={() => action.action()}
                        eventKey={index}
                        title={action.name}
                      >
                        {action.string}
                      </Dropdown.Item>
                    );
                  })}
                </DropdownButton>
              )}
            </div>
          </Col>
          <Col xs="12" sm="11" md="6" lg="6" xl="6">
            <div className="d-flex justify-content-end align-items-end gap-2">
              {children}
              <Button size="sm" onClick={() => router.back()}>
                <i className="bi bi-arrow-left"></i>
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </Card.Header>
  );
}

function Body({ children }: BodyProps) {
  return (
    <Card.Body className="p-0 flex-fill overflow-auto">{children}</Card.Body>
  );
}

function Footer({ children }: FooterProps) {
  return <Card.Footer>{children}</Card.Footer>;
}

export type ListViewSubComponents = {
  Header: typeof Header;
  Body: typeof Body;
  Footer: typeof Footer;
};

type ListViewProps = {
  children:
    | ReactElement<HeaderProps, typeof Header>
    | ReactElement<BodyProps, typeof Body>
    | ReactElement<FooterProps, typeof Footer>
    | ReactElement<any>[];
  model: string;
};

function ListView({ children, model }: ListViewProps) {
  const { access } = useAuth();
  const modelAccess = access.find((acc) => acc.fieldName === model + "Model");

  if (modelAccess?.invisible)
    return (
      <Row className="h-100 justify-content-center">
        <Col xs="12" md="6" className="h-100 px-0 mt-5">
          <Alert variant="warning">
            <h2 className="text-center">ACCESO DENEGADO</h2>
          </Alert>
        </Col>
      </Row>
    );

  return <Card className="h-100 d-flex flex-column border-0">{children}</Card>;
}

ListView.Header = Header;
ListView.Body = Body;
ListView.Footer = Footer;

export default ListView;
