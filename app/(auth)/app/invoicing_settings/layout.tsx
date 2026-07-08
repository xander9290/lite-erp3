"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card, Col, Nav, Row } from "react-bootstrap";

const menu = [
  {
    label: "Términos de pago",
    href: "/app/invoicing_settings/payment_term?view_type=list&id=null",
    icon: "bi-credit-card",
  },
  {
    label: "Impuestos",
    href: "/app/invoicing_settings/invoicing_tax?view_type=list&id=null",
    icon: "bi-percent",
  },
  {
    label: "Monedas",
    href: "/app/invoicing_settings/invoicing_currency?view_type=list&id=null",
    icon: "bi-currency-exchange",
  },
];

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <Row className="g-3 h-100">
      <Col xs={12} md={4} lg={3} xl={2}>
        <Card className="shadow-sm h-100">
          <Card.Header className="fw-semibold">
            <i className="bi bi-gear me-2" />
            Facturación
          </Card.Header>

          <Card.Body className="p-2">
            <Nav className="flex-column gap-1">
              {menu.map((item) => (
                <Nav.Link key={item.href} as={Link} href={item.href} active={pathname.startsWith(item.href.split("?")[0])} className="rounded d-flex align-items-center">
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
