import type { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', title: 'Angular Evolution Lab', loadComponent: () => import('./features/home/home') },
  {
    path: 'v16',
    title: 'v16 · Signals',
    loadComponent: () => import('./features/v16-signals/v16-signals'),
  },
  { path: '**', title: 'Not found', loadComponent: () => import('./features/not-found/not-found') },
];
