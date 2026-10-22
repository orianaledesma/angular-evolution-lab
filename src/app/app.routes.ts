import type { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', title: 'nav.home', loadComponent: () => import('./features/home/home') },
  {
    path: 'v16',
    title: 'nav.v16',
    loadComponent: () => import('./features/v16-signals/v16-signals'),
  },
  {
    path: 'v17',
    title: 'nav.v17',
    loadComponent: () => import('./features/v17-control-flow/v17-control-flow'),
  },
  {
    path: 'v18',
    title: 'nav.v18',
    loadChildren: () => import('./features/v18-zoneless/v18.routes'),
  },
  {
    path: 'v19',
    title: 'nav.v19',
    loadComponent: () => import('./features/v19-linked-resource/v19-linked-resource'),
  },
  {
    path: 'v20',
    title: 'nav.v20',
    loadComponent: () => import('./features/v20-stable-signals/v20-stable-signals'),
  },
  {
    path: 'v21',
    title: 'nav.v21',
    loadChildren: () => import('./features/v21-signal-forms/v21.routes'),
  },
  {
    path: 'v22',
    title: 'nav.v22',
    loadComponent: () => import('./features/v22-maturity/v22-maturity'),
  },
  {
    path: 'lifecycle',
    title: 'nav.lifecycle',
    loadComponent: () => import('./features/lifecycle/lifecycle'),
  },
  {
    path: 'rxjs',
    title: 'nav.rxjs',
    loadComponent: () => import('./features/rxjs/rxjs'),
  },
  {
    path: 'requirements',
    title: 'nav.requirements',
    loadComponent: () => import('./features/requirements/requirements'),
  },
  {
    path: '**',
    title: 'common.notFound',
    loadComponent: () => import('./features/not-found/not-found'),
  },
];
