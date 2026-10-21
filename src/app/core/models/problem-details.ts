/** RFC 9457 Problem Details — the single error shape the UI ever sees. */
export interface ProblemDetails {
  readonly type: string;
  readonly title: string;
  readonly status: number;
  readonly detail?: string;
  readonly instance?: string;
  readonly errors?: Readonly<Record<string, readonly string[]>>;
}

export function isProblemDetails(value: unknown): value is ProblemDetails {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Partial<ProblemDetails>).title === 'string' &&
    typeof (value as Partial<ProblemDetails>).status === 'number'
  );
}
