import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { PowerChart } from './power-chart';
import { DEFER } from './snippets';

@Component({
  selector: 'app-defer-demo',
  imports: [TranslatePipe, Card, CodeCompare, PowerChart],
  templateUrl: './defer-demo.html',
  styles: `
    .scroller {
      max-height: 16rem;
      overflow-y: auto;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
    }

    .spacer {
      display: grid;
      min-height: 22rem;
      place-items: center;
      color: var(--color-text-muted);
    }

    .slot {
      min-height: 10rem;
      padding: var(--space-4);
    }
  `,
})
export class DeferDemo {
  protected readonly snippets = DEFER;
}
