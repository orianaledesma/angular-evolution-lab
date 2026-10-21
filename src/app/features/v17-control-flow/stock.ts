import type { FuelType } from '@core/models/vehicle';

export interface StockUnit {
  readonly id: string;
  readonly vin: string;
  readonly model: string;
  readonly fuel: FuelType;
  readonly dealer: string;
  readonly priceEur: number;
}

const MODELS = ['ID.3', 'Golf 8', 'i4', 'EQE', 'Q4 e-tron', 'Taycan', 'Enyaq', 'Corsa-e'] as const;
const FUELS: readonly FuelType[] = ['electric', 'petrol', 'diesel', 'hybrid'];
const DEALERS = ['München', 'Berlin', 'Wien', 'Zürich', 'Graz', 'Basel'] as const;

/** Deterministic pseudo-random stock list (same data on every run → stable tests). */
export function generateStock(count: number, seed = 1): StockUnit[] {
  let state = seed;
  const next = () => {
    state = (state * 16807) % 2147483647;
    return state;
  };
  return Array.from({ length: count }, (_, i) => {
    const n = next();
    return {
      id: `unit-${String(i)}`,
      vin: `WVW${String(n).padStart(10, '0').slice(0, 10)}${String(i).padStart(4, '0')}`,
      model: MODELS[n % MODELS.length] ?? 'ID.3',
      fuel: FUELS[n % FUELS.length] ?? 'electric',
      dealer: DEALERS[n % DEALERS.length] ?? 'München',
      priceEur: 25000 + (n % 90) * 1000,
    };
  });
}

export function shuffle<T>(items: readonly T[], seed: number): T[] {
  const copy = [...items];
  let state = seed;
  for (let i = copy.length - 1; i > 0; i--) {
    state = (state * 16807) % 2147483647;
    const j = state % (i + 1);
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
  }
  return copy;
}
