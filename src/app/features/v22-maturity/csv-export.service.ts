import { DOCUMENT } from '@angular/common';
import { Service, inject } from '@angular/core';
import type { Vehicle } from '@core/models/vehicle';

const COLUMNS = ['id', 'brand', 'model', 'year', 'fuel', 'powerKw', 'priceEur'] as const;

function escapeCell(value: string | number): string {
  const text = String(value);
  return /[",;\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/**
 * v22 @Service(): auto-provided in root and tree-shakable. It lives in its own lazy chunk and
 * is only downloaded through injectAsync() — never imported eagerly.
 */
@Service()
export class CsvExport {
  private readonly document = inject(DOCUMENT);

  toCsv(rows: readonly Vehicle[]): string {
    const lines = rows.map((row) => COLUMNS.map((c) => escapeCell(row[c])).join(';'));
    return [COLUMNS.join(';'), ...lines].join('\n');
  }

  /** Triggers a browser download of the generated file. Returns false where unsupported. */
  download(filename: string, csv: string): boolean {
    const url = this.document.defaultView?.URL;
    if (typeof url?.createObjectURL !== 'function') {
      return false;
    }
    const href = url.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = this.document.createElement('a');
    link.href = href;
    link.download = filename;
    link.click();
    url.revokeObjectURL(href);
    return true;
  }
}

export default CsvExport;
