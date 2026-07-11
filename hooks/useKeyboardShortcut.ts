// hooks/useKeyboardShortcut.ts
import { useEffect } from "react";

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: { altKey?: boolean; ctrlKey?: boolean } = { altKey: true },
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Validación segura
      if (!e || !e.key) return;

      // Verificar que la tecla sea la correcta
      if (e.key.toLowerCase() !== key.toLowerCase()) return;

      // Verificar modificadores
      if (options.altKey && !e.altKey) return;
      if (options.ctrlKey && !e.ctrlKey) return;

      // Prevenir comportamiento por defecto
      e.preventDefault();

      // Ejecutar callback
      callback();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, callback, options]);
}
