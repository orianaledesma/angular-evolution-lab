import { Component, Injector, afterNextRender, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Badge } from '@shared/ui/badge/badge';
import { Button } from '@shared/ui/button/button';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { HooksLog } from './hooks-log';
import { HooksStage } from './hooks-stage';
import { HOOKS } from './snippets';

const PLATES = ['M-EV 2026', 'W-12345E', 'S-AB 123E'] as const;

@Component({
  selector: 'app-hooks-demo',
  imports: [TranslatePipe, Card, CodeCompare, Button, Badge, HooksStage],
  providers: [HooksLog],
  templateUrl: './hooks-demo.html',
  styleUrl: './hooks-demo.scss',
})
export class HooksDemo {
  private readonly injector = inject(Injector);
  protected readonly log = inject(HooksLog);
  protected readonly snippets = HOOKS;

  readonly mounted = signal(false);
  readonly plate = signal<string>(PLATES[0]);
  readonly tick = signal(0);
  private plateIndex = 0;

  mount(): void {
    this.run('lifecycle.hooks.actions.mount', () => {
      this.mounted.set(true);
    });
  }

  changeInput(): void {
    this.run('lifecycle.hooks.actions.input', () => {
      this.plateIndex = (this.plateIndex + 1) % PLATES.length;
      this.plate.set(PLATES[this.plateIndex] ?? PLATES[0]);
    });
  }

  parentOnly(): void {
    this.run('lifecycle.hooks.actions.parent', () => {
      this.tick.update((n) => n + 1);
    });
  }

  unmount(): void {
    this.run('lifecycle.hooks.actions.unmount', () => {
      this.mounted.set(false);
    });
  }

  /** Clicks inside the child are not routed through run(): log them on the next render. */
  childClicked(): void {
    this.log.begin();
    this.commitAfterRender('lifecycle.hooks.actions.inside');
  }

  private run(actionKey: string, change: () => void): void {
    this.log.begin();
    change();
    this.commitAfterRender(actionKey);
  }

  private commitAfterRender(actionKey: string): void {
    // `read` is the last after-render phase: the child's afterNextRender/afterRenderEffect have run.
    afterNextRender(
      {
        read: () => {
          this.log.commit(actionKey);
        },
      },
      { injector: this.injector },
    );
  }
}
