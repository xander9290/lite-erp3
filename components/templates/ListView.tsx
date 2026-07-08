"use client";

import Link from "next/link";
import React, { ReactElement } from "react";
import { Alert, Button, ButtonGroup, Card, Col, Container, Dropdown, DropdownButton, Row } from "react-bootstrap";
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

  const modelName = formView?.split("?")[0].split("/").at(2);
  const modelAccess = access.find((acc) => acc.fieldName === modelName);
  return (
    <Card.Header className="bg-body border-bottom py-3">
      <Row className="align-items-center g-3">
        <Col md={6}>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {formView && !modelAccess?.notCreate && (
              <Link href={formView} className="btn btn-primary">
                <i className="bi bi-plus-lg me-1"></i>
                Nuevo
              </Link>
            )}

            <h5 className="mb-0 fw-semibold flex-grow-1">{title}</h5>

            {actions && actions.length > 0 && (
              <DropdownButton as={ButtonGroup} variant="outline-secondary" size="sm" title={<i className="bi bi-three-dots"></i>}>
                {actions.map((action, index) => (
                  <Dropdown.Item key={index} onClick={action.action}>
                    {action.string}
                  </Dropdown.Item>
                ))}
              </DropdownButton>
            )}
          </div>
        </Col>

        <Col md={6}>
          <div className="d-flex justify-content-md-end gap-2 flex-wrap">
            {children}

            <Button variant="warning" onClick={() => router.back()}>
              <i className="bi bi-arrow-left"></i>
            </Button>
          </div>
        </Col>
      </Row>
    </Card.Header>
  );
}

function Body({ children }: BodyProps) {
  return <Card.Body className="p-0 flex-fill">{children}</Card.Body>;
}

function Footer({ children }: FooterProps) {
  return <Card.Footer className="bg-body border-top">{children}</Card.Footer>;
}

export type ListViewSubComponents = {
  Header: typeof Header;
  Body: typeof Body;
  Footer: typeof Footer;
};

type ListViewProps = {
  children: ReactElement<HeaderProps, typeof Header> | ReactElement<BodyProps, typeof Body> | ReactElement<FooterProps, typeof Footer> | ReactElement<any>[];
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

  return <Card className="shadow-sm border-0 h-100">{children}</Card>;
}

ListView.Header = Header;
ListView.Body = Body;
ListView.Footer = Footer;

export default ListView;
