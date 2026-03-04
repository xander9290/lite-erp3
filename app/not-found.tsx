"use client";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

function NotFound() {
  const router = useRouter();

  return (
    <Container className="vh-100 d-flex align-items-center justify-content-center">
      <Row className="w-100">
        <Col md={{ span: 8, offset: 2 }} lg={{ span: 6, offset: 3 }}>
          <Card className="text-center shadow-lg">
            <Card.Body>
              <h1 className="display-4 text-danger fw-bold">404</h1>
              <p className="fs-4 mb-4">Página no encontrada</p>
              <p className="text-muted">
                Lo sentimos, la página que buscas no existe o ha sido movida.
              </p>
              <Button
                variant="primary"
                size="lg"
                className="mt-3"
                onClick={() => router.back()}
              >
                Volver atrás
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default NotFound;
