"use client";

import Link from "next/link";
import { Col, Nav, Row } from "react-bootstrap";

function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Row className="h-100 overflow-auto">
      <Col xs="4" sm="4" md="3" xl="2" xxl="2">
        <Nav className="flex-column" defaultActiveKey="/app/product_template/products">
          <Nav.Link as={Link} href="/app/invoicing_settings/payment_term?view_type=list&id=null" className="border-bottom">
            Términos de pago
          </Nav.Link>
        </Nav>
        <Nav className="flex-column" defaultActiveKey="/app/product_template/products">
          <Nav.Link as={Link} href="/app/invoicing_settings/invoicing_tax?view_type=list&id=null" className="border-bottom">
            Impuestos
          </Nav.Link>
        </Nav>
      </Col>
      <Col xs="8" sm="8" md="9" xl="10" xxl="10">
        {children}
      </Col>
    </Row>
  );
}

export default layout;
