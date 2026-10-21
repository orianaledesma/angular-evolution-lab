import { Injectable, InjectionToken, type OnDestroy, inject } from '@angular/core';
import { InjectorRegistry } from './injector-registry';

export const BAY_NAME = new InjectionToken<string>('BAY_NAME');

/** Provided on a route: lives in that route's EnvironmentInjector. */
@Injectable()
export class BayTelemetry implements OnDestroy {
  private readonly registry = inject(InjectorRegistry);
  readonly bay = inject(BAY_NAME);
  readonly id = this.registry.created(this.bay);

  ngOnDestroy(): void {
    this.registry.destroyed(this.id);
  }
}
