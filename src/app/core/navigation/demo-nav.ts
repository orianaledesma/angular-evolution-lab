export interface DemoNavItem {
  readonly path: string;
  readonly labelKey: string;
  readonly version?: number;
}

export const DEMO_NAV: readonly DemoNavItem[] = [
  { path: '/', labelKey: 'nav.home' },
  { path: '/v16', labelKey: 'nav.v16', version: 16 },
  { path: '/v17', labelKey: 'nav.v17', version: 17 },
  { path: '/v18', labelKey: 'nav.v18', version: 18 },
  { path: '/v19', labelKey: 'nav.v19', version: 19 },
  { path: '/v20', labelKey: 'nav.v20', version: 20 },
  { path: '/v21', labelKey: 'nav.v21', version: 21 },
  { path: '/v22', labelKey: 'nav.v22', version: 22 },
  { path: '/requirements', labelKey: 'nav.requirements' },
];
