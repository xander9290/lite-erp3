"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card, Col, Nav, Row } from "react-bootstrap";

export interface SidebarMenuItem {
  label: string;
  href: string;
  icon?: string;
  disabled?: boolean;
}

interface SidebarTemplateProps {
  children: React.ReactNode;
  title: string;
  icon?: string;
  menu: SidebarMenuItem[];

  sidebarXs?: number;
  sidebarMd?: number;
  sidebarLg?: number;
  sidebarXl?: number;

  contentXs?: number;
  contentMd?: number;
  contentLg?: number;
  contentXl?: number;
}

export function SidebarTemplate({
  children,
  title,
  icon = "bi bi-grid-fill",
  menu,

  sidebarXs = 12,
  sidebarMd = 4,
  sidebarLg = 3,
  sidebarXl = 2,

  contentXs = 12,
  contentMd = 8,
  contentLg = 9,
  contentXl = 10,
}: SidebarTemplateProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    const itemPathname = href.split("?")[0];

    return pathname === itemPathname || pathname.startsWith(`${itemPathname}/`);
  };

  return (
    <Row className="g-3 h-100">
      <Col xs={sidebarXs} md={sidebarMd} lg={sidebarLg} xl={sidebarXl}>
        <Card className="shadow-sm h-100">
          <Card.Header className="fw-semibold">
            <i className={`${icon} me-2`} />
            {title}
          </Card.Header>

          <Card.Body className="p-1">
            <Nav className="flex-column">
              {menu.map((item) => {
                const active = isActive(item.href);

                return (
                  <Nav.Link
                    key={item.href}
                    as={Link}
                    href={item.href}
                    disabled={item.disabled}
                    active={active}
                    className={[
                      "d-flex",
                      "align-items-center",
                      "rounded",
                      "my-1",
                      active
                        ? "bg-secondary text-dark"
                        : "bg-body-tertiary text-body",
                      item.disabled ? "opacity-50" : "",
                    ].join(" ")}
                  >
                    {item.icon && (
                      <i className={`${item.icon} me-2`} aria-hidden="true" />
                    )}

                    <span>{item.label}</span>
                  </Nav.Link>
                );
              })}
            </Nav>
          </Card.Body>
        </Card>
      </Col>

      <Col xs={contentXs} md={contentMd} lg={contentLg} xl={contentXl}>
        {children}
      </Col>
    </Row>
  );
}

export default SidebarTemplate;
