let counter = 0;

/** Stable, document-unique ids for label/aria wiring. */
export function uniqueId(prefix: string): string {
  counter += 1;
  return `${prefix}-${String(counter)}`;
}
