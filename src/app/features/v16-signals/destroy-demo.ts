import { Component, DestroyRef, Injectable, type OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { interval } from 'rxjs';
import { Button } from '@shared/ui/button/button';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { DESTROY } from './snippets';

export const TELEMETRY_INTERVAL_MS = 500;

/** Counts live subscriptions so the cleanup is visible on screen. */
@Injectable()
export class SubscriptionTracker {
  readonly active = signal(0);
  readonly ticks = signal(0);
}

@Component({
  selector: 'app-telemetry-feed',
  imports: [TranslatePipe],
  template: `
    <p class="telemetry">
      <span aria-hidden="true">●</span> {{ 'v16.destroy.speed' | translate }}:
      <strong>{{ speed() }} km/h</strong>
    </p>
  `,
  styles: `
    .telemetry {
      margin: 0;
      font-family: var(--font-mono);

      span {
        color: var(--color-success);
      }
    }
  `,
})
export class TelemetryFeed implements OnInit {
  private readonly tracker = inject(SubscriptionTracker);
  readonly speed = signal(0);

  private readonly feed = interval(TELEMETRY_INTERVAL_MS)
    .pipe(takeUntilDestroyed())
    .subscribe((tick) => {
      this.speed.set(Math.round(80 + 40 * Math.sin(tick / 3)));
      this.tracker.ticks.update((n) => n + 1);
    });

  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.tracker.active.update((n) => n + 1);
    this.destroyRef.onDestroy(() => {
      this.tracker.active.update((n) => n - 1);
    });
  }
}

@Component({
  selector: 'app-destroy-demo',
  imports: [TranslatePipe, Card, CodeCompare, Button, TelemetryFeed],
  providers: [SubscriptionTracker],
  templateUrl: './destroy-demo.html',
})
export class DestroyDemo {
  protected readonly tracker = inject(SubscriptionTracker);
  protected readonly snippets = DESTROY;
  readonly mounted = signal(true);

  toggle(): void {
    this.mounted.update((m) => !m);
  }
}
