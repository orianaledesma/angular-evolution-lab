import type { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', title: 'Angular Evolution Lab', loadComponent: () => import('./features/home/home') },
  {
    path: 'v16',
    title: 'v16 · Signals',
    loadComponent: () => import('./features/v16-signals/v16-signals'),
  },
  {
    path: 'v17',
    title: 'v17 · Control flow',
    loadComponent: () => import('./features/v17-control-flow/v17-control-flow'),
  },
  {
    path: 'v18',
    title: 'v18 · Zoneless',
    loadChildren: () => import('./features/v18-zoneless/v18.routes'),
  },
  { path: '**', title: 'Not found', loadComponent: () => import('./features/not-found/not-found') },
];
