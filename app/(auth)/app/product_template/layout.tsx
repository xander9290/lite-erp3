"use client";

import Link from "next/link";
import React from "react";
import { Col, Nav, Row } from "react-bootstrap";

function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Row>
      <Col xs="3" sm="3" md="2" xl="1" xxl="1">
        <Nav
          className="flex-column"
          defaultActiveKey="/app/product_template/products"
        >
          <Nav.Link
            as={Link}
            href="/app/product_template/products?view_type=list&id=null"
            className="border-bottom py-2"
          >
            Productos
          </Nav.Link>
          <Nav.Link
            as={Link}
            href="/app/product_template/categories?view_type=list&id=null"
            className="border-bottom py-2"
          >
            Categorías
          </Nav.Link>
        </Nav>
      </Col>
      <Col xs="9" sm="9" md="10" xl="11" xxl="11">
        {children}
      </Col>
    </Row>
  );
}

export default layout;
