import type { Routes } from '@angular/router';
import { BAY_NAME, BayTelemetry } from './garage/bay-telemetry';

const bay = (name: string) => ({
  path: `bay-${name}`,
  // Route-level providers get their own EnvironmentInjector — destroyed on leave
  // thanks to withAutoCleanupInjectors() in app.config.ts.
  providers: [{ provide: BAY_NAME, useValue: name.toUpperCase() }, BayTelemetry],
  loadComponent: () => import('./garage/bay'),
});

export const V21_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./v21-signal-forms'),
    children: [bay('a'), bay('b'), bay('c')],
  },
];

export default V21_ROUTES;
