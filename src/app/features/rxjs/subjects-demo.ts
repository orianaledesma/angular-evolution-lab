import { Component, DestroyRef, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import {
  BehaviorSubject,
  type Observable,
  ReplaySubject,
  Subject,
  type Subscription,
  defer,
  of,
  shareReplay,
} from 'rxjs';
import { Button } from '@shared/ui/button/button';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { SUBJECTS } from './snippets';

export const SOURCE_KINDS = ['cold', 'shareReplay', 'subject', 'behavior', 'replay'] as const;
export type SourceKind = (typeof SOURCE_KINDS)[number];

/** Push-based kinds get values from "Emit"; cold kinds produce a value per execution. */
const PUSH_KINDS: readonly SourceKind[] = ['subject', 'behavior', 'replay'];

export const SUBSCRIBER_NAMES = ['A', 'B', 'C'] as const;
export type SubscriberName = (typeof SUBSCRIBER_NAMES)[number];

interface Source {
  readonly stream: Observable<string>;
  readonly emit?: (value: string) => void;
}

@Component({
  selector: 'app-subjects-demo',
  imports: [TranslatePipe, Card, CodeCompare, Button],
  templateUrl: './subjects-demo.html',
})
export class SubjectsDemo {
  protected readonly snippets = SUBJECTS;
  protected readonly kinds = SOURCE_KINDS;
  protected readonly names = SUBSCRIBER_NAMES;

  readonly kind = signal<SourceKind>('cold');
  /** How many times the (fake) backend actually ran. */
  readonly executions = signal(0);
  readonly received = signal<Readonly<Partial<Record<SubscriberName, readonly string[]>>>>({});

  private source: Source = this.createSource('cold');
  private subscriptions: Subscription[] = [];
  private nextValue = 1;

  private readonly cleanup = inject(DestroyRef).onDestroy(() => {
    this.unsubscribeAll();
  });

  protected isPush(): boolean {
    return PUSH_KINDS.includes(this.kind());
  }

  protected isSubscribed(name: SubscriberName): boolean {
    return name in this.received();
  }

  select(kind: SourceKind): void {
    this.unsubscribeAll();
    this.kind.set(kind);
    this.executions.set(0);
    this.received.set({});
    this.nextValue = 1;
    this.source = this.createSource(kind);
  }

  subscribe(name: SubscriberName): void {
    this.received.update((r) => ({ ...r, [name]: [] }));
    this.subscriptions.push(
      this.source.stream.subscribe((value) => {
        this.received.update((r) => ({ ...r, [name]: [...(r[name] ?? []), value] }));
      }),
    );
  }

  emit(): void {
    this.source.emit?.(`v${String(this.nextValue++)}`);
  }

  private createSource(kind: SourceKind): Source {
    // A cold observable: the producer (a "request") runs once per subscriber.
    const request = defer(() => {
      this.executions.update((n) => n + 1);
      return of(`response #${String(this.executions())}`);
    });
    switch (kind) {
      case 'cold':
        return { stream: request };
      case 'shareReplay':
        return { stream: request.pipe(shareReplay({ bufferSize: 1, refCount: false })) };
      case 'subject': {
        const subject = new Subject<string>();
        return {
          stream: subject.asObservable(),
          emit: (v) => {
            subject.next(v);
          },
        };
      }
      case 'behavior': {
        const subject = new BehaviorSubject<string>('v0 (initial)');
        return {
          stream: subject.asObservable(),
          emit: (v) => {
            subject.next(v);
          },
        };
      }
      case 'replay': {
        const subject = new ReplaySubject<string>(2);
        return {
          stream: subject.asObservable(),
          emit: (v) => {
            subject.next(v);
          },
        };
      }
    }
  }

  private unsubscribeAll(): void {
    this.subscriptions.forEach((s) => {
      s.unsubscribe();
    });
    this.subscriptions = [];
  }
}
