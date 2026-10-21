import { InjectionToken } from '@angular/core';
import type { Dealer } from '@core/models/vehicle';

export type DealerFetcher = (cityId: string, signal: AbortSignal) => Promise<Dealer[]>;

const LATENCY_MS = 600;

function abortableDelay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason as Error);
    });
  });
}

/** Plain fetch() + AbortSignal — resource() works with any Promise, not only HttpClient. */
export const DEALER_FETCHER = new InjectionToken<DealerFetcher>('DEALER_FETCHER', {
  providedIn: 'root',
  factory: () => async (cityId, signal) => {
    await abortableDelay(LATENCY_MS, signal);
    const response = await fetch('/mock-api/dealers.json', { signal });
    const dealers = (await response.json()) as Dealer[];
    return dealers.filter((d) => d.cityId === cityId);
  },
});
