import { ChangeDetectionStrategy, Component, DoCheck, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Counts how many times its host view is change-detected.
 * Eager on purpose: it is refreshed every time the parent view is, so ngDoCheck
 * fires exactly once per check of the component it lives in.
 */
@Component({
  selector: 'app-cd-counter',
  imports: [TranslatePipe],
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection -- must be checked with its host to count checks
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<span class="counter" data-testid="cd-counter"
    ><span class="label">{{ label() }}</span>
    <output class="count">{{ checks }}</output>
    <span class="unit">{{ 'common.cdChecks' | translate }}</span></span
  >`,
  styles: `
    .counter {
      display: inline-flex;
      gap: var(--space-2);
      align-items: baseline;
      padding: var(--space-1) var(--space-3);
      font-size: var(--font-size-sm);
      background: var(--color-surface-muted);
      border: 1px dashed var(--color-border);
      border-radius: var(--radius-sm);
    }

    .count {
      font-family: var(--font-mono);
      font-size: var(--font-size-lg);
      font-weight: 700;
      color: var(--color-accent-strong);
    }
  `,
})
export class CdCounter implements DoCheck {
  readonly label = input('');
  // Plain field on purpose: writing a signal during change detection is forbidden.
  protected checks = 0;

  ngDoCheck(): void {
    this.checks += 1;
  }
}
