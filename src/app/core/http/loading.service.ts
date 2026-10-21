import { Injectable, computed, signal } from '@angular/core';

/** Global count of in-flight requests, exposed as a signal. */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly pending = signal(0);

  readonly inFlight = this.pending.asReadonly();
  readonly isLoading = computed(() => this.pending() > 0);

  start(): void {
    this.pending.update((n) => n + 1);
  }

  stop(): void {
    this.pending.update((n) => Math.max(0, n - 1));
  }
}
