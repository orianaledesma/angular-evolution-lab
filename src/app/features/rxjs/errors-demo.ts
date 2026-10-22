import { Component, DestroyRef, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import {
  type Observable,
  Subject,
  type Subscription,
  catchError,
  defer,
  map,
  of,
  retry,
  switchMap,
  throwError,
  timer,
} from 'rxjs';
import { Button } from '@shared/ui/button/button';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { ERRORS } from './snippets';

export const STRATEGIES = ['none', 'catch', 'retry'] as const;
export type Strategy = (typeof STRATEGIES)[number];

/** The fake server fails this many calls in a row, then recovers. */
export const FAILURES = 2;
export const LATENCY_MS = 300;
export const BACKOFF_MS = 400;

export interface AttemptLog {
  readonly id: number;
  readonly text: string;
  readonly params: Readonly<Record<string, string | number>>;
}

interface Column {
  readonly calls: number;
  readonly alive: boolean;
  readonly result: string | null;
  readonly log: readonly AttemptLog[];
}

const freshColumn = (): Column => ({ calls: 0, alive: true, result: null, log: [] });

@Component({
  selector: 'app-errors-demo',
  imports: [TranslatePipe, Card, CodeCompare, Button],
  templateUrl: './errors-demo.html',
})
export class ErrorsDemo {
  protected readonly snippets = ERRORS;
  protected readonly strategies = STRATEGIES;

  readonly columns = signal<Readonly<Record<Strategy, Column>>>({
    none: freshColumn(),
    catch: freshColumn(),
    retry: freshColumn(),
  });

  private readonly clicks = new Subject<void>();
  private nextLogId = 0;
  private subscriptions: Subscription[] = this.wire();

  private readonly cleanup = inject(DestroyRef).onDestroy(() => {
    this.unsubscribe();
  });

  load(): void {
    for (const strategy of STRATEGIES) {
      this.log(strategy, 'rxjs.errors.log.click');
    }
    this.clicks.next();
  }

  reset(): void {
    this.unsubscribe();
    this.columns.set({ none: freshColumn(), catch: freshColumn(), retry: freshColumn() });
    this.subscriptions = this.wire();
  }

  /** A server that fails FAILURES calls in a row (per column), then answers. */
  private call(strategy: Strategy): Observable<string> {
    return defer(() => {
      const n = this.columns()[strategy].calls + 1;
      this.patch(strategy, { calls: n });
      const fails = n <= FAILURES;
      this.log(strategy, fails ? 'rxjs.errors.log.fail' : 'rxjs.errors.log.ok', { n });
      return timer(LATENCY_MS).pipe(
        switchMap(() =>
          fails ? throwError(() => new Error(`503 #${String(n)}`)) : of(`200 #${String(n)}`),
        ),
      );
    });
  }

  private pipeline(strategy: Strategy): Observable<string> {
    switch (strategy) {
      // The error reaches the outer stream: it errors and is closed for good.
      case 'none':
        return this.clicks.pipe(switchMap(() => this.call(strategy)));
      // Caught inside switchMap: only this inner request fails, the click stream survives.
      case 'catch':
        return this.clicks.pipe(
          switchMap(() => this.call(strategy).pipe(catchError(() => of('fallback')))),
        );
      // Retried with exponential backoff, then caught as a last resort.
      case 'retry':
        return this.clicks.pipe(
          switchMap(() =>
            this.call(strategy).pipe(
              retry({
                count: 3,
                delay: (_error, retryCount) => {
                  const wait = BACKOFF_MS * 2 ** (retryCount - 1);
                  this.log(strategy, 'rxjs.errors.log.wait', { ms: wait });
                  return timer(wait).pipe(map(() => retryCount));
                },
              }),
              catchError(() => of('fallback')),
            ),
          ),
        );
    }
  }

  private wire(): Subscription[] {
    return STRATEGIES.map((strategy) =>
      this.pipeline(strategy).subscribe({
        next: (result) => {
          this.patch(strategy, { result });
          this.log(strategy, 'rxjs.errors.log.result', { result });
        },
        error: () => {
          this.patch(strategy, { alive: false, result: 'error' });
          this.log(strategy, 'rxjs.errors.log.dead');
        },
      }),
    );
  }

  private patch(strategy: Strategy, change: Partial<Column>): void {
    this.columns.update((c) => ({ ...c, [strategy]: { ...c[strategy], ...change } }));
  }

  private log(strategy: Strategy, text: string, params: AttemptLog['params'] = {}): void {
    const entry = { id: this.nextLogId++, text, params };
    this.columns.update((c) => ({
      ...c,
      [strategy]: { ...c[strategy], log: [...c[strategy].log, entry].slice(-10) },
    }));
  }

  private unsubscribe(): void {
    this.subscriptions.forEach((s) => {
      s.unsubscribe();
    });
    this.subscriptions = [];
  }
}
