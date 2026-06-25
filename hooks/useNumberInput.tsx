import { useCallback, useEffect, useRef, useState } from "react";

type UseNumberInputProps = {
  initialValue: number | null;
  decimals?: number;
  min?: number;
  max?: number;
  onChange: (value: number | null) => void;
};

function addThousandsSeparator(value: string) {
  if (!value) return "";

  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function cleanNumberInput(value: string, decimals: number) {
  let cleaned = value.replace(/,/g, "").replace(/[^\d.]/g, "");

  const firstDotIndex = cleaned.indexOf(".");

  if (firstDotIndex !== -1) {
    const beforeDot = cleaned.slice(0, firstDotIndex);
    const afterDot = cleaned
      .slice(firstDotIndex + 1)
      .replace(/\./g, "")
      .slice(0, decimals);

    cleaned = `${beforeDot}.${afterDot}`;
  }

  if (decimals === 0) {
    cleaned = cleaned.replace(/\./g, "");
  }

  return cleaned;
}

function parseNumber(value: string): number | null {
  const cleanValue = value.replace(/,/g, "");

  if (cleanValue === "" || cleanValue === ".") return null;

  const parsed = Number(cleanValue);

  return Number.isNaN(parsed) ? null : parsed;
}

function formatNumber(value: number, decimals: number) {
  return value.toLocaleString("es-MX", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: true,
  });
}

function normalizeIntegerPart(value: string) {
  const normalized = value.replace(/^0+(?=\d)/, "");

  return normalized === "" ? "0" : normalized;
}

function formatEditableValue(value: string, decimals: number) {
  if (!value) return "";

  const hasDot = value.includes(".");
  const [integerRaw, decimalRaw = ""] = value.split(".");

  const integerPart = normalizeIntegerPart(integerRaw || "0");
  const groupedInteger = addThousandsSeparator(integerPart);

  if (decimals === 0) {
    return groupedInteger;
  }

  const decimalPart = hasDot
    ? decimalRaw.padEnd(decimals, "0").slice(0, decimals)
    : "".padEnd(decimals, "0");

  return `${groupedInteger}.${decimalPart}`;
}

function getLogicalCaretIndex(
  value: string,
  caretPosition: number,
  decimals: number,
) {
  const textBeforeCaret = value.slice(0, caretPosition);
  const cleanedBeforeCaret = cleanNumberInput(textBeforeCaret, decimals);

  return cleanedBeforeCaret.length;
}

function getCaretPositionFromLogicalIndex(
  formattedValue: string,
  logicalIndex: number,
) {
  if (logicalIndex <= 0) return 0;

  let count = 0;

  for (let i = 0; i < formattedValue.length; i++) {
    const char = formattedValue[i];

    if (/\d|\./.test(char)) {
      count++;
    }

    if (count >= logicalIndex) {
      return i + 1;
    }
  }

  return formattedValue.length;
}

function useNumberInput({
  initialValue,
  decimals = 2,
  min,
  max,
  onChange,
}: UseNumberInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isFocusedRef = useRef(false);

  const [displayValue, setDisplayValue] = useState(() => {
    if (initialValue === null || Number.isNaN(initialValue)) return "";
    return formatNumber(initialValue, decimals);
  });

  useEffect(() => {
    if (isFocusedRef.current) return;

    if (initialValue === null || Number.isNaN(initialValue)) {
      setDisplayValue("");
      return;
    }

    setDisplayValue(formatNumber(initialValue, decimals));
  }, [initialValue, decimals]);

  const updateCaret = useCallback((logicalIndex: number, nextValue: string) => {
    requestAnimationFrame(() => {
      const input = inputRef.current;
      if (!input) return;

      const nextCaretPosition = getCaretPositionFromLogicalIndex(
        nextValue,
        logicalIndex,
      );

      input.setSelectionRange(nextCaretPosition, nextCaretPosition);
    });
  }, []);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawInput = e.target.value;
      const caretPosition = e.target.selectionStart ?? rawInput.length;

      const logicalCaretIndex = getLogicalCaretIndex(
        rawInput,
        caretPosition,
        decimals,
      );

      let cleaned = cleanNumberInput(rawInput, decimals);

      if (cleaned === "") {
        setDisplayValue("");
        onChange(null);
        return;
      }

      if (cleaned.includes(".")) {
        const [integerPart, decimalPart = ""] = cleaned.split(".");
        cleaned = `${normalizeIntegerPart(integerPart)}.${decimalPart}`;
      } else {
        cleaned = normalizeIntegerPart(cleaned);
      }

      const formatted = formatEditableValue(cleaned, decimals);
      const parsed = parseNumber(cleaned);

      setDisplayValue(formatted);
      updateCaret(logicalCaretIndex, formatted);

      onChange(parsed);
    },
    [decimals, onChange, updateCaret],
  );

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    isFocusedRef.current = true;

    const parsed = parseNumber(e.target.value);

    requestAnimationFrame(() => {
      if (parsed === 0) {
        e.target.select();
      }
    });
  }, []);

  const handleBlur = useCallback(() => {
    isFocusedRef.current = false;

    const parsed = parseNumber(displayValue);

    if (parsed === null) {
      setDisplayValue("");
      onChange(null);
      return;
    }

    let finalValue = parsed;

    if (min !== undefined && finalValue < min) finalValue = min;
    if (max !== undefined && finalValue > max) finalValue = max;

    const rounded = Number(finalValue.toFixed(decimals));

    setDisplayValue(formatNumber(rounded, decimals));
    onChange(rounded);
  }, [displayValue, decimals, min, max, onChange]);

  function getDecimalStartPosition(value: string) {
    const dotIndex = value.indexOf(".");

    if (dotIndex === -1) return value.length;

    return dotIndex + 1;
  }

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.ctrlKey || e.metaKey) return;

      const allowedKeys = [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
        "Delete",
        "Backspace",
        "Tab",
        "Enter",
      ];

      if (allowedKeys.includes(e.key)) return;

      if (e.key === ".") {
        if (decimals <= 0) {
          e.preventDefault();
          return;
        }

        e.preventDefault();

        const input = inputRef.current;
        if (!input) return;

        const decimalStart = getDecimalStartPosition(displayValue);

        requestAnimationFrame(() => {
          input.setSelectionRange(decimalStart, decimalStart);
        });

        return;
      }

      if (!/^\d$/.test(e.key)) {
        e.preventDefault();
      }
    },
    [decimals, displayValue],
  );

  return {
    inputRef,
    displayValue,
    handleInput,
    handleFocus,
    handleBlur,
    handleKeyDown,
  };
}

export default useNumberInput;
