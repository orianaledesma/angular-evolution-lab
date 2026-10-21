import type { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', title: 'Angular Evolution Lab', loadComponent: () => import('./features/home/home') },
  { path: '**', title: 'Not found', loadComponent: () => import('./features/not-found/not-found') },
];
