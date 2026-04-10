"use client";

import { Card } from "react-bootstrap";
import { ModelFieldWithProps } from "../actions/fields-actions";

function CardField({ field }: { field: ModelFieldWithProps }) {
  return (
    <Card className="p-1" style={{ minHeight: "100px" }}>
      <Card.Body className="p-1 text-center text-md-start">
        <small>
          <div>
            <p>
              <strong>{field.name}</strong>
            </p>
          </div>
          <div>
            <p>{field.description}</p>
          </div>
          <div>
            <p>{field.Model.name}</p>
          </div>
        </small>
      </Card.Body>
    </Card>
  );
}

export default CardField;
