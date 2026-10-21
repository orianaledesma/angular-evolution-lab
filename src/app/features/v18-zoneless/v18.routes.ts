import { inject } from '@angular/core';
import { Router, type Routes } from '@angular/router';

export const V18_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./v18-zoneless') },
  {
    path: 'legacy/:model',
    // v18: redirectTo can be a function with access to params and inject().
    redirectTo: ({ params }) =>
      inject(Router).createUrlTree(['/v18'], {
        queryParams: { redirectedFrom: params['model'] as string },
      }),
  },
];

export default V18_ROUTES;
