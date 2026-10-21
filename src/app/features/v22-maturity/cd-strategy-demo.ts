import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from '@shared/ui/button/button';
import { Card } from '@shared/ui/card/card';
import { CdCounter } from '@shared/ui/cd-counter/cd-counter';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { CD_STRATEGY } from './snippets';

const CHILD_STYLES = `
  .child {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-3);
    background: var(--color-surface);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-md);
  }

  h3 {
    margin: 0;
    font-size: var(--font-size-md);
  }

  p {
    margin: 0;
  }
`;

/** No changeDetection key: in v22 that means OnPush. */
@Component({
  selector: 'app-onpush-child',
  imports: [CdCounter, TranslatePipe],
  template: `
    <section class="child" data-testid="onpush-child">
      <h3>OnPush · {{ 'v22.cd.default' | translate }}</h3>
      <app-cd-counter />
      <p>
        input: <strong>{{ plate() }}</strong>
      </p>
    </section>
  `,
  styles: CHILD_STYLES,
})
export class OnPushChild {
  readonly plate = input('');
}

@Component({
  selector: 'app-eager-child',
  imports: [CdCounter],
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection -- the demo contrasts Eager with the OnPush default
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <section class="child" data-testid="eager-child">
      <h3>ChangeDetectionStrategy.Eager</h3>
      <app-cd-counter />
      <p>
        input: <strong>{{ plate() }}</strong>
      </p>
    </section>
  `,
  styles: CHILD_STYLES,
})
export class EagerChild {
  readonly plate = input('');
}

@Component({
  selector: 'app-cd-strategy-demo',
  imports: [TranslatePipe, Card, CodeCompare, Button, CdCounter, OnPushChild, EagerChild],
  templateUrl: './cd-strategy-demo.html',
})
export class CdStrategyDemo {
  protected readonly snippets = CD_STRATEGY;
  readonly parentClicks = signal(0);
  readonly plate = signal('M-EV 2026');

  bumpParent(): void {
    this.parentClicks.update((n) => n + 1);
  }

  changePlate(): void {
    this.plate.update((p) => (p === 'M-EV 2026' ? 'W-12345E' : 'M-EV 2026'));
  }
}
