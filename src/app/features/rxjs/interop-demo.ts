import { Component, effect, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { Button } from '@shared/ui/button/button';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { INTEROP } from './snippets';

export const CHANNELS = ['subject', 'toObservable', 'effect'] as const;
export type Channel = (typeof CHANNELS)[number];

@Component({
  selector: 'app-interop-demo',
  imports: [TranslatePipe, Card, CodeCompare, Button],
  templateUrl: './interop-demo.html',
})
export class InteropDemo {
  protected readonly snippets = INTEROP;
  protected readonly channels = CHANNELS;

  readonly speed = signal(0);
  private readonly speed$ = new Subject<number>();
  /** toSignal(): the latest value of an observable, readable in templates and computed(). */
  readonly lastFromSubject = toSignal(this.speed$, { initialValue: 0 });

  readonly seen = signal<Readonly<Record<Channel, readonly number[]>>>({
    subject: [],
    toObservable: [],
    effect: [],
  });

  private readonly fromSubject = this.speed$.pipe(takeUntilDestroyed()).subscribe((v) => {
    this.push('subject', v);
  });

  // toObservable() is built on an effect: it emits once per change-detection pass, with the last value.
  private readonly fromSignal = toObservable(this.speed)
    .pipe(takeUntilDestroyed())
    .subscribe((v) => {
      this.push('toObservable', v);
    });

  private readonly logEffect = effect(() => {
    this.push('effect', this.speed());
  });

  /** Writes 3 values in the same synchronous task, to both the signal and the Subject. */
  burst(): void {
    const base = this.speed();
    for (const step of [1, 2, 3]) {
      this.speed.set(base + step * 10);
      this.speed$.next(base + step * 10);
    }
  }

  clear(): void {
    this.seen.set({ subject: [], toObservable: [], effect: [] });
  }

  private push(channel: Channel, value: number): void {
    this.seen.update((s) => ({ ...s, [channel]: [...s[channel], value].slice(-12) }));
  }
}
