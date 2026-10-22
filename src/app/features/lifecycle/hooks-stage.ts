import { Component, input, output } from '@angular/core';
import { HooksChild } from './hooks-child';

/**
 * The child's parent. A separate OnPush component on purpose: it is only refreshed when its own
 * inputs change, so re-rendering the log next to it does not run the child's hooks again.
 */
@Component({
  selector: 'app-hooks-stage',
  imports: [HooksChild],
  template: `
    <div class="stage">
      <p class="status">parent tick: {{ tick() }}</p>
      @if (mounted()) {
        <app-hooks-child [plate]="plate()" (clicked)="childClicked.emit()">
          <p class="status">projected content</p>
        </app-hooks-child>
      } @else {
        <p class="empty-state">—</p>
      }
    </div>
  `,
  styles: `
    .stage {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      padding: var(--space-3);
      border: 2px dashed var(--color-border);
      border-radius: var(--radius-md);
    }

    p {
      margin: 0;
    }
  `,
})
export class HooksStage {
  readonly mounted = input.required<boolean>();
  readonly plate = input.required<string>();
  readonly tick = input.required<number>();
  readonly childClicked = output();
}
