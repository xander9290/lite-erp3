// import { Modal } from "react-bootstrap";
// import TableTemplate, { TableTemplateColumn } from "./TableTemplate";
// import { Domain } from "./fields/FieldRelation";

// type Props<T> = {
//   show: boolean;
//   onHide: () => void;
//   model: string;
//   columns: TableTemplateColumn<T>[];
//   domain?: Domain;
//   onSelect: (record: T) => void;
// };

// export default function RelationSearchModal<T>({
//   show,
//   onHide,
//   model,
//   columns,
//   domain,
//   onSelect,
// }: Props<T>) {
//   return (
//     <Modal show={show} onHide={onHide} size="xl" backdrop="static">
//       <Modal.Header closeButton>
//         <Modal.Title>Buscar registro</Modal.Title>
//       </Modal.Header>

//       <Modal.Body className="p-0">
//         <TableTemplate
//           model={model}
//           columns={columns}
//           domain={domain}
//           pageSize={20}
//           getRowId={(row: any) => row.id}
//           // onSelectionChange={(ids) => {}}
//           onRowClick={onSelect}
//         />
//       </Modal.Body>
//     </Modal>
//   );
// }

// components/RelationSearchModal.tsx
import { Modal } from "react-bootstrap";
import { TableTemplateLite } from "./table/TableTemplateLite";
import { Column } from "./table/Column";
import { Domain } from "./fields/FieldRelation";
import { ColumnConfig } from "@/app/libs/definitions";

type Props = {
  show: boolean;
  onHide: () => void;
  model: string;
  columns: ColumnConfig[]; // 👈 Ahora usa ColumnConfig
  domain?: Domain;
  onSelect: (record: any) => void;
};

export default function RelationSearchModal({
  show,
  onHide,
  model,
  columns,
  domain,
  onSelect,
}: Props) {
  return (
    <Modal show={show} onHide={onHide} size="xl" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Buscar registro</Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0">
        <TableTemplateLite
          model={model}
          baseDomain={domain}
          pageSize={20}
          onRowClick={(row) => {
            onSelect(row);
            onHide();
          }}
        >
          {/* Convertir ColumnConfig[] a <Column> components */}
          {columns.map((col) => (
            <Column
              key={col.field}
              field={col.field}
              label={col.label}
              type={col.type}
              include={col.include}
            />
          ))}
        </TableTemplateLite>
      </Modal.Body>
    </Modal>
  );
}
