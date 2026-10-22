import { DestroyRef, Injectable, Service, inject, signal } from '@angular/core';

let nextClockId = 1;

/** v22 @Service(): provided in root. Created on first inject(), lives as long as the app. */
@Service()
export class FleetClock {
  readonly id = nextClockId++;
  readonly createdAt = new Date();
}

export interface ScopeEvent {
  readonly id: number;
  readonly key: 'created' | 'destroyed';
  readonly instance: number;
}

/** Demo-level log of TripMeter instances (provided by InjectorsDemo). */
@Injectable()
export class ScopeLog {
  private nextEvent = 0;
  private nextInstance = 1;
  readonly events = signal<readonly ScopeEvent[]>([]);

  created(): number {
    const instance = this.nextInstance++;
    this.push('created', instance);
    return instance;
  }

  destroyed(instance: number): void {
    this.push('destroyed', instance);
  }

  clear(): void {
    this.events.set([]);
  }

  private push(key: ScopeEvent['key'], instance: number): void {
    const event = { id: this.nextEvent++, key, instance };
    this.events.update((events) => [event, ...events].slice(0, 8));
  }
}

/**
 * Listed in each panel's `providers`: one instance per panel, shared by the panel's children and
 * destroyed together with the panel — its DestroyRef is the panel's node injector.
 */
@Injectable()
export class TripMeter {
  private readonly log = inject(ScopeLog);
  readonly instance = this.log.created();
  readonly km = signal(0);

  private readonly cleanup = inject(DestroyRef).onDestroy(() => {
    this.log.destroyed(this.instance);
  });
}
