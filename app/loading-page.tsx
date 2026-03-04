"use client";

import { Spinner } from "react-bootstrap";

export default function LoadingPage() {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <Spinner animation="border" variant="primary" role="status" />
    </div>
  );
}
