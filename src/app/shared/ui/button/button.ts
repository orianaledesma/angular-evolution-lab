import { Component, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

/** Styles a native <button>/<a>: keeps native semantics and keyboard behaviour. */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector -- attribute selector keeps native <button>/<a> semantics
  selector: 'button[app-button], a[app-button]',
  template: '<ng-content />',
  styleUrl: './button.scss',
  host: {
    class: 'btn',
    '[class.btn--primary]': "variant() === 'primary'",
    '[class.btn--secondary]': "variant() === 'secondary'",
    '[class.btn--ghost]': "variant() === 'ghost'",
    '[class.btn--danger]': "variant() === 'danger'",
    '[class.btn--sm]': "size() === 'sm'",
  },
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<'md' | 'sm'>('md');
}
