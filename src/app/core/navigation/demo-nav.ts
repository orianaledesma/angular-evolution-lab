export type NavGroup = 'start' | 'versions' | 'fundamentals' | 'prep' | 'project';

export interface DemoNavItem {
  readonly path: string;
  readonly labelKey: string;
  readonly group: NavGroup;
  readonly version?: number;
}

export const DEMO_NAV: readonly DemoNavItem[] = [
  { path: '/', labelKey: 'nav.home', group: 'start' },
  { path: '/v16', labelKey: 'nav.v16', group: 'versions', version: 16 },
  { path: '/v17', labelKey: 'nav.v17', group: 'versions', version: 17 },
  { path: '/v18', labelKey: 'nav.v18', group: 'versions', version: 18 },
  { path: '/v19', labelKey: 'nav.v19', group: 'versions', version: 19 },
  { path: '/v20', labelKey: 'nav.v20', group: 'versions', version: 20 },
  { path: '/v21', labelKey: 'nav.v21', group: 'versions', version: 21 },
  { path: '/v22', labelKey: 'nav.v22', group: 'versions', version: 22 },
  { path: '/lifecycle', labelKey: 'nav.lifecycle', group: 'fundamentals' },
  { path: '/rxjs', labelKey: 'nav.rxjs', group: 'fundamentals' },
  { path: '/interview', labelKey: 'nav.interview', group: 'prep' },
  { path: '/quiz', labelKey: 'nav.quiz', group: 'prep' },
  { path: '/requirements', labelKey: 'nav.requirements', group: 'project' },
];

/** Groups in display order; `start` has no heading. */
export const NAV_GROUPS: readonly NavGroup[] = [
  'start',
  'versions',
  'fundamentals',
  'prep',
  'project',
];
