import { Component, input, model } from '@angular/core';

@Component({
  selector: 'app-checklist-item',
  template: `
    <label class="item">
      <input type="checkbox" [checked]="checked()" (change)="checked.set(!checked())" />
      <span [class.done]="checked()">{{ label() }}</span>
    </label>
  `,
  styles: `
    .item {
      display: flex;
      gap: var(--space-2);
      align-items: center;
      min-height: 2.5rem;
    }

    .done {
      color: var(--color-text-muted);
      text-decoration: line-through;
    }
  `,
})
export class ChecklistItem {
  readonly label = input.required<string>();
  readonly checked = model(false);
}
