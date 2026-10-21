export interface Milestone {
  readonly version: number;
  readonly year: number;
  readonly path: string;
  readonly apis: readonly string[];
}

export const TIMELINE: readonly Milestone[] = [
  {
    version: 16,
    year: 2023,
    path: '/v16',
    apis: ['signal()', 'computed()', 'effect()', 'takeUntilDestroyed'],
  },
  {
    version: 17,
    year: 2023,
    path: '/v17',
    apis: ['@if / @for', '@defer', 'input() / model()', 'viewChild()'],
  },
  {
    version: 18,
    year: 2024,
    path: '/v18',
    apis: ['zoneless (exp.)', '@let', 'control.events', 'redirectTo fn'],
  },
  { version: 19, year: 2024, path: '/v19', apis: ['linkedSignal()', 'resource()', 'rxResource()'] },
  {
    version: 20,
    year: 2025,
    path: '/v20',
    apis: ['effect stable', 'httpResource()', '** · in · void'],
  },
  {
    version: 21,
    year: 2025,
    path: '/v21',
    apis: ['Signal Forms', 'Angular Aria', 'zoneless default'],
  },
  {
    version: 22,
    year: 2026,
    path: '/v22',
    apis: ['OnPush default', '@Service', 'injectAsync()', 'debounced()'],
  },
];
