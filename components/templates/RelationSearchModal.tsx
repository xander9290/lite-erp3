import { Modal } from "react-bootstrap";
import TableTemplate, { TableTemplateColumn } from "./TableTemplate";
import { Domain } from "./fields/FieldRelation";

type Props<T> = {
  show: boolean;
  onHide: () => void;
  model: string;
  columns: TableTemplateColumn<T>[];
  domain?: Domain;
  onSelect: (record: T) => void;
};

export default function RelationSearchModal<T>({
  show,
  onHide,
  model,
  columns,
  domain,
  onSelect,
}: Props<T>) {
  return (
    <Modal show={show} onHide={onHide} size="xl" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Buscar registro</Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0">
        <TableTemplate
          model={model}
          columns={columns}
          domain={domain}
          pageSize={20}
          getRowId={(row: any) => row.id}
          // onSelectionChange={(ids) => {}}
          onRowClick={onSelect}
        />
      </Modal.Body>
    </Modal>
  );
}
