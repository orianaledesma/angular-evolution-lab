import { Component, input } from '@angular/core';

/** Builds the aria-describedby value a control inside <app-form-field> should use. */
export function describedBy(fieldId: string, hint: boolean, error: boolean): string | null {
  const ids = [hint ? `${fieldId}-hint` : null, error ? `${fieldId}-error` : null].filter(Boolean);
  return ids.length ? ids.join(' ') : null;
}

@Component({
  selector: 'app-form-field',
  templateUrl: './form-field.html',
  styleUrl: './form-field.scss',
})
export class FormField {
  readonly label = input.required<string>();
  readonly fieldId = input.required<string>();
  readonly hint = input<string>();
  readonly error = input<string | null>();
  readonly required = input(false);
}
