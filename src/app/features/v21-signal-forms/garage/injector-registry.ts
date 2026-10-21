import { Injectable, signal } from '@angular/core';

export interface InjectorRecord {
  readonly id: number;
  readonly bay: string;
  readonly alive: boolean;
}

/** Root-level log of route-scoped services, so their lifecycle is visible after they die. */
@Injectable({ providedIn: 'root' })
export class InjectorRegistry {
  private nextId = 1;
  readonly records = signal<readonly InjectorRecord[]>([]);

  created(bay: string): number {
    const id = this.nextId++;
    this.records.update((r) => [...r, { id, bay, alive: true }]);
    return id;
  }

  destroyed(id: number): void {
    this.records.update((r) => r.map((rec) => (rec.id === id ? { ...rec, alive: false } : rec)));
  }

  clear(): void {
    this.records.update((r) => r.filter((rec) => rec.alive));
  }
}
