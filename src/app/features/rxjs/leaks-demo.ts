import { Component, DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { Observable, type Subscriber } from 'rxjs';
import { Button } from '@shared/ui/button/button';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { LEAKS } from './snippets';

export const TICK_MS = 500;

/** A telemetry stream that counts its live subscriptions and the values sent to dead widgets. */
@Injectable()
export class TelemetryFeed {
  private readonly subscribers = new Set<Subscriber<number>>();
  readonly active = signal(0);
  readonly ghostUpdates = signal(0);

  readonly ticks$ = new Observable<number>((subscriber) => {
    let value = 0;
    this.subscribers.add(subscriber);
    this.active.update((n) => n + 1);
    const id = setInterval(() => {
      subscriber.next(++value);
    }, TICK_MS);
    return () => {
      clearInterval(id);
      this.subscribers.delete(subscriber);
      this.active.update((n) => n - 1);
    };
  });

  /** Completes every subscription — including the leaked ones nobody holds anymore. */
  completeAll(): void {
    for (const subscriber of [...this.subscribers]) {
      subscriber.complete();
    }
  }
}

/** Subscribes and never unsubscribes: the subscription outlives the component. */
@Component({
  selector: 'app-leaky-widget',
  template: `<p class="widget" data-testid="leaky-widget">⚠ leaky · {{ value() }}</p>`,
})
export class LeakyWidget {
  private readonly feed = inject(TelemetryFeed);
  private destroyed = false;
  protected readonly value = signal(0);

  private readonly markDestroyed = inject(DestroyRef).onDestroy(() => {
    this.destroyed = true;
  });

  // The bug: nothing ever calls unsubscribe() on this.
  private readonly subscription = this.feed.ticks$.subscribe((v) => {
    if (this.destroyed) {
      this.feed.ghostUpdates.update((n) => n + 1);
    }
    this.value.set(v);
  });
}

/** takeUntilDestroyed() ties the subscription to the component's DestroyRef. */
@Component({
  selector: 'app-safe-widget',
  template: `<p class="widget" data-testid="safe-widget">✓ safe · {{ value() }}</p>`,
})
export class SafeWidget {
  private readonly feed = inject(TelemetryFeed);
  protected readonly value = signal(0);

  private readonly subscription = this.feed.ticks$.pipe(takeUntilDestroyed()).subscribe((v) => {
    this.value.set(v);
  });
}

@Component({
  selector: 'app-leaks-demo',
  imports: [TranslatePipe, Card, CodeCompare, Button, LeakyWidget, SafeWidget],
  providers: [TelemetryFeed],
  templateUrl: './leaks-demo.html',
})
export class LeaksDemo {
  protected readonly feed = inject(TelemetryFeed);
  protected readonly snippets = LEAKS;
  readonly leaky = signal(false);
  readonly safe = signal(false);

  // Leaving the page must not leave real leaks behind.
  private readonly cleanup = inject(DestroyRef).onDestroy(() => {
    this.feed.completeAll();
  });

  toggle(widget: 'leaky' | 'safe'): void {
    (widget === 'leaky' ? this.leaky : this.safe).update((on) => !on);
  }

  fixLeaks(): void {
    this.leaky.set(false);
    this.safe.set(false);
    this.feed.completeAll();
    this.feed.ghostUpdates.set(0);
  }
}
