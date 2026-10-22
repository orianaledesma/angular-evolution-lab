import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { type Subscription, interval } from 'rxjs';
import { Button } from '@shared/ui/button/button';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import {
  EMPTY_LANE,
  FLATTENING_OPERATORS,
  type FlatteningOperator,
  type InnerRun,
  type LaneState,
  type MarbleLab,
  createMarbleLab,
} from './marble-lab';
import { FLATTENING } from './snippets';

export const WINDOW_MS = 6500;
export const REQUEST_MS = 1200;
/** Three quick clicks, a pause, two more: shows every operator's difference in one run. */
export const SCENARIO_MS = [0, 400, 800, 2600, 3000] as const;

type Lanes = Readonly<Record<FlatteningOperator, LaneState>>;

const emptyLanes = (): Lanes => ({
  switchMap: EMPTY_LANE,
  mergeMap: EMPTY_LANE,
  concatMap: EMPTY_LANE,
  exhaustMap: EMPTY_LANE,
});

@Component({
  selector: 'app-flattening-demo',
  imports: [TranslatePipe, Card, CodeCompare, Button],
  templateUrl: './flattening-demo.html',
  styleUrl: './flattening-demo.scss',
})
export class FlatteningDemo {
  protected readonly snippets = FLATTENING;
  protected readonly operators = FLATTENING_OPERATORS;
  protected readonly windowMs = WINDOW_MS;

  readonly lanes = signal<Lanes>(emptyLanes());
  readonly clicks = signal<readonly { request: number; at: number }[]>([]);
  readonly now = signal(0);
  readonly running = signal(false);
  readonly finished = computed(() => this.now() >= WINDOW_MS);

  private lab: MarbleLab | null = null;
  private ticker: Subscription | null = null;
  private scenario: ReturnType<typeof setTimeout>[] = [];
  private startedAt = 0;

  private readonly cleanup = inject(DestroyRef).onDestroy(() => {
    this.stop();
  });

  /** Sends one request through all four operators. Starts the clock on the first click. */
  sendRequest(): void {
    if (this.finished()) {
      return;
    }
    const lab = this.lab ?? this.start();
    const request = this.clicks().length + 1;
    this.clicks.update((c) => [...c, { request, at: this.elapsed() }]);
    lab.click(request);
  }

  playScenario(): void {
    this.reset();
    this.scenario = SCENARIO_MS.map((delay) =>
      setTimeout(() => {
        this.sendRequest();
      }, delay),
    );
  }

  reset(): void {
    this.stop();
    this.lanes.set(emptyLanes());
    this.clicks.set([]);
    this.now.set(0);
  }

  /** Parallel runs get their own row so overlapping bars stay readable (mergeMap). */
  protected readonly rows = computed(() => {
    const result = {} as Record<FlatteningOperator, { slot: Map<number, number>; count: number }>;
    for (const op of FLATTENING_OPERATORS) {
      const slot = new Map<number, number>();
      const busyUntil: number[] = [];
      for (const run of this.lanes()[op].runs) {
        let row = busyUntil.findIndex((until) => until <= run.start);
        if (row === -1) {
          row = busyUntil.length;
        }
        busyUntil[row] = run.end ?? Number.POSITIVE_INFINITY;
        slot.set(run.request, row);
      }
      result[op] = { slot, count: Math.max(1, busyUntil.length) };
    }
    return result;
  });

  protected row(op: FlatteningOperator, request: number): number {
    return this.rows()[op].slot.get(request) ?? 0;
  }

  protected left(ms: number): number {
    return (Math.min(ms, WINDOW_MS) / WINDOW_MS) * 100;
  }

  protected width(run: InnerRun): number {
    return this.left(run.end ?? this.now()) - this.left(run.start);
  }

  protected requestsWith(op: FlatteningOperator, status: InnerRun['status']): string {
    const list = this.lanes()[op].runs.filter((run) => run.status === status);
    return list.map((run) => `#${String(run.request)}`).join(' ') || '—';
  }

  /** Clicks that never started an inner observable (exhaustMap ignores them). */
  protected ignored(op: FlatteningOperator): string {
    const started = new Set(this.lanes()[op].runs.map((run) => run.request));
    const list = this.clicks().filter((click) => !started.has(click.request));
    return list.map((click) => `#${String(click.request)}`).join(' ') || '—';
  }

  protected emitted(op: FlatteningOperator): string {
    const outputs = this.lanes()[op].outputs;
    return outputs.map((o) => `#${String(o.request)}`).join(' ') || '—';
  }

  private start(): MarbleLab {
    this.startedAt = performance.now();
    this.running.set(true);
    const lab = createMarbleLab({
      durationMs: REQUEST_MS,
      elapsed: () => this.elapsed(),
      onLane: (op, update) => {
        this.lanes.update((lanes) => ({ ...lanes, [op]: update(lanes[op]) }));
      },
    });
    this.lab = lab;
    // ~30 fps playhead; stops at the end of the window.
    this.ticker = interval(33).subscribe(() => {
      this.now.set(this.elapsed());
      if (this.finished()) {
        this.stopClock();
      }
    });
    return lab;
  }

  private elapsed(): number {
    return performance.now() - this.startedAt;
  }

  private stopClock(): void {
    this.ticker?.unsubscribe();
    this.ticker = null;
    this.running.set(false);
  }

  private stop(): void {
    this.scenario.forEach(clearTimeout);
    this.scenario = [];
    this.stopClock();
    this.lab?.dispose();
    this.lab = null;
  }
}
