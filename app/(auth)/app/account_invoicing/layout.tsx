"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Card, Col, Nav, Row } from "react-bootstrap";

const menu = [
  {
    label: "Facturas",
    href: "/app/invoicing_customer/account_move?view_type=list&id=null",
    icon: "bi bi-receipt",
  },
  {
    label: "Pagos",
    href: "/app/invoicing_customer/account_payment?view_type=list&id=null",
    icon: "bi bi-cash-stack",
  },
  {
    label: "Notas de crédito",
    href: "/app/invoicing_customer/account_refund?view_type=list&id=null",
    icon: "bi bi-receipt-cutoff",
  },
];

function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <Row className="g-3 h-100">
      <Col xs={12} md={4} lg={3} xl={2}>
        <Card className="shadow-sm h-100">
          <Card.Header className="fw-semibold">
            <i className="bi bi-person-vcard-fill me-2" />
            Facturación clientes
          </Card.Header>

          <Card.Body className="p-2">
            <Nav className="flex-column gap-1">
              {menu.map((item) => (
                <Nav.Link
                  key={item.href}
                  as={Link}
                  href={item.href}
                  active={pathname.startsWith(item.href.split("?")[0])}
                  className="rounded d-flex align-items-center"
                >
                  <i className={`${item.icon} me-2`} />
                  {item.label}
                </Nav.Link>
              ))}
            </Nav>
          </Card.Body>
        </Card>
      </Col>

      <Col xs={12} md={8} lg={9} xl={10}>
        {children}
      </Col>
    </Row>
  );
}

export default layout;
