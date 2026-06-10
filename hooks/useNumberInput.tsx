import { useCallback, useEffect, useState } from "react";

function useNumberInput({ initialValue, decimals = 2, min, max, onChange }: { initialValue: number | null; decimals: number; min?: number; max?: number; onChange: (value: number | null) => void }) {
  // Estado interno: representación string del número (ej: "1234" para 12.34)
  const [rawValue, setRawValue] = useState<string>(() => {
    if (initialValue === null || isNaN(initialValue)) return "";
    // Convertir el número a string sin formato, pero escalado
    // Ej: 12.34 -> "1234" (sin punto, para facilitar edición)
    const scaled = Math.round(initialValue * Math.pow(10, decimals));
    return scaled.toString();
  });

  // Sincronizar cuando el valor externo cambia
  useEffect(() => {
    if (initialValue === null || isNaN(initialValue)) {
      setRawValue("");
      return;
    }
    const scaled = Math.round(initialValue * Math.pow(10, decimals));
    const newRaw = scaled.toString();
    if (newRaw !== rawValue) {
      setRawValue(newRaw);
    }
  }, [initialValue, decimals]);

  // Función para formatear el valor actual para display
  const getDisplayValue = useCallback(() => {
    if (!rawValue || rawValue === "") return "";

    // Convertir el string escalado a número con decimales
    const numValue = parseInt(rawValue, 10) / Math.pow(10, decimals);

    // Formatear con separador de miles y decimales
    return numValue.toLocaleString("es-MX", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: true,
    });
  }, [rawValue, decimals]);

  // Procesar entrada del usuario
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const cursorPos = e.target.selectionStart || 0;

    // Obtener solo dígitos y punto del input (el usuario podría pegar algo)
    let cleaned = input.replace(/[^\d.]/g, "");

    // Manejar múltiples puntos
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      cleaned = parts[0] + "." + parts.slice(1).join("");
    }

    // Separar parte entera y decimal
    const integerPart = parts[0] || "";
    let decimalPart = parts[1] || "";

    // Limitar decimales
    if (decimalPart.length > decimals) {
      decimalPart = decimalPart.slice(0, decimals);
      cleaned = integerPart + (decimalPart ? "." + decimalPart : "");
    }

    // Limitar parte entera según el rango max
    let numValue = parseFloat(cleaned);
    if (!isNaN(numValue)) {
      if (min !== undefined && numValue < min) numValue = min;
      if (max !== undefined && numValue > max) numValue = max;

      // Escalar y guardar
      const scaled = Math.round(numValue * Math.pow(10, decimals));
      setRawValue(scaled.toString());
      onChange(numValue);
    } else if (cleaned === "" || cleaned === ".") {
      setRawValue("");
      onChange(null);
    }

    // Restaurar posición del cursor después del render
    setTimeout(() => {
      if (e.target && cursorPos !== undefined) {
        e.target.setSelectionRange(cursorPos, cursorPos);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permitir navegación con flechas, home, end, delete, backspace
    const allowedKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "Delete", "Backspace", "Tab"];

    if (allowedKeys.includes(e.key)) {
      return; // Dejar que el navegador maneje estos
    }

    // Evitar caracteres no numéricos excepto punto
    if (!/[\d.]/.test(e.key) && e.key !== ".") {
      e.preventDefault();
    }

    // Evitar punto si ya existe
    if (e.key === "." && rawValue && rawValue.includes(".")) {
      e.preventDefault();
    }
  };

  return {
    displayValue: getDisplayValue(),
    rawValue,
    handleInput,
    handleKeyDown,
  };
}

export default useNumberInput;
