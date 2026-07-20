"use client";

import Link from "next/link";
import { Card, Col, Row } from "react-bootstrap";

export interface ApplicationMenuItem {
  label: string;
  href: string;
  icon?: string;
  description?: string;
  disabled?: boolean;
  badge?: string | number;
}

interface ApplicationGridTemplateProps {
  children?: React.ReactNode;
  title?: string;
  description?: string;
  applications: ApplicationMenuItem[];

  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  xxl?: number;
}

export function ApplicationGridTemplate({
  children,
  title,
  description,
  applications,

  xs = 2,
  sm = 3,
  md = 4,
  lg = 5,
  xl = 6,
  xxl = 8,
}: ApplicationGridTemplateProps) {
  return (
    <div className="h-100">
      {(title || description) && (
        <div className="mb-4">
          {title && <h4 className="mb-1">{title}</h4>}

          {description && (
            <p className="text-body-secondary mb-0">{description}</p>
          )}
        </div>
      )}

      <Row xs={xs} sm={sm} md={md} lg={lg} xl={xl} xxl={xxl} className="g-3">
        {applications.map((application) => (
          <Col key={application.href}>
            <ApplicationGridItem application={application} />
          </Col>
        ))}
      </Row>

      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

interface ApplicationGridItemProps {
  application: ApplicationMenuItem;
}

function ApplicationGridItem({ application }: ApplicationGridItemProps) {
  const content = (
    <Card
      className={[
        "h-100",
        "border-0",
        "shadow-sm",
        "application-grid-item",
        application.disabled ? "opacity-50" : "",
      ].join(" ")}
    >
      <Card.Body className="position-relative d-flex flex-column align-items-center justify-content-center text-center p-3">
        {application.badge !== undefined && (
          <span className="position-absolute top-0 end-0 badge rounded-pill text-bg-danger m-2">
            {application.badge}
          </span>
        )}

        <div className="application-grid-icon d-flex align-items-center justify-content-center rounded-circle bg-body-tertiary mb-3">
          <i
            className={`${application.icon ?? "bi bi-grid-fill"} fs-2`}
            aria-hidden="true"
          />
        </div>

        <span className="fw-semibold">{application.label}</span>

        {application.description && (
          <small className="text-body-secondary mt-1">
            {application.description}
          </small>
        )}
      </Card.Body>
    </Card>
  );

  if (application.disabled) {
    return (
      <div className="text-decoration-none text-body" aria-disabled="true">
        {content}
      </div>
    );
  }

  return (
    <Link href={application.href} className="text-decoration-none text-body">
      {content}
    </Link>
  );
}

export default ApplicationGridTemplate;
