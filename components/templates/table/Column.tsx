// components/Column.tsx
import { ColumnConfig } from "@/app/libs/definitions";

// Este componente no renderiza nada visualmente
// Solo sirve como "configuration object" para TableTemplate
export function Column(props: ColumnConfig) {
  // Siempre retorna null - es un componente "fantasma"
  // que solo existe para proporcionar configuración al padre
  props;
  return null;
}

// Alternativa: Si quieres que tenga utilidades de validación
export function ColumnWithValidation(props: ColumnConfig) {
  // Validaciones en desarrollo
  if (process.env.NODE_ENV === "development") {
    if (!props.field) {
      console.warn('Column: "field" prop is required');
    }
    if (!props.label) {
      console.warn('Column: "label" prop is required');
    }
  }

  return null;
}
