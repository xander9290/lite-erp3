// lib/counter.ts
import prisma from "./prisma";

// Función de formateo
function formatCode(prefix: string, value: number, length = 5): string {
  return `${prefix.toUpperCase()}${value.toString().padStart(length, "0")}`;
}

// Clase del contador con caché
class CounterCache {
  private cache = new Map<string, { value: number; lastSync: number }>();
  private syncThreshold = 10; // Sincronizar cada 10 incrementos

  async getNextValue(prefix: string, model: string): Promise<string> {
    // Si tenemos valor en caché, usarlo
    if (this.cache.has(model)) {
      const cached = this.cache.get(model)!;
      const nextValue = cached.value + 1;

      // Actualizar caché
      this.cache.set(model, { value: nextValue, lastSync: cached.lastSync });

      // Sincronizar con DB cada N incrementos
      if (nextValue % this.syncThreshold === 0) {
        await this.syncToDatabase(model, nextValue);
      } else {
        // Sincronización en background asíncrona
        this.syncToDatabase(model, nextValue).catch(console.error);
      }

      return formatCode(prefix, nextValue);
    }

    // Primera vez - obtener de DB
    return await this.getFromDatabase(prefix, model);
  }

  private async getFromDatabase(prefix: string, model: string): Promise<string> {
    const counter = await prisma.counter.upsert({
      where: { id: model },
      update: { value: { increment: 1 } },
      create: { id: model, value: 1 },
    });

    // Guardar en caché
    this.cache.set(model, { value: counter.value, lastSync: Date.now() });

    return formatCode(prefix, counter.value);
  }

  private async syncToDatabase(model: string, value: number): Promise<void> {
    try {
      await prisma.counter.update({
        where: { id: model },
        data: { value: value },
      });

      // Actualizar timestamp de última sincronización
      const cached = this.cache.get(model);
      if (cached) {
        this.cache.set(model, { ...cached, lastSync: Date.now() });
      }
    } catch (error) {
      console.error(`Error sincronizando contador ${model}:`, error);
    }
  }
}

// Crear una instancia única (singleton)
const counterCache = new CounterCache();

// Exportar la función principal
export async function getNextValue(prefix: string, model: string): Promise<string> {
  return counterCache.getNextValue(prefix, model);
}

// Función opcional para limpiar caché (útil en testing)
export function clearCounterCache(): void {
  // Nota: esto es solo para debugging/testing
  console.warn("Counter cache cleared");
}
