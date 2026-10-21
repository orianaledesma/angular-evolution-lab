import type { HttpErrorResponse } from '@angular/common/http';
import { isProblemDetails } from '@core/models/problem-details';

export const TEST_DRIVE_VEHICLES = [
  { id: 'vw-id3', label: 'Volkswagen ID.3' },
  { id: 'bmw-i4', label: 'BMW i4 eDrive40' },
  { id: 'audi-q4', label: 'Audi Q4 e-tron' },
  { id: 'porsche-taycan', label: 'Porsche Taycan' },
] as const;

/** Earliest bookable day: tomorrow, as yyyy-mm-dd (local time). */
export function earliestDate(now = new Date()): string {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return `${String(d.getFullYear())}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Field errors from an RFC 9457 body, e.g. `{ errors: { email: ['…'] } }`. */
export function serverFieldError(error: unknown, field: string): string | null {
  const body: unknown = (error as Partial<HttpErrorResponse> | null)?.error;
  return isProblemDetails(body) ? (body.errors?.[field]?.[0] ?? body.title) : null;
}
