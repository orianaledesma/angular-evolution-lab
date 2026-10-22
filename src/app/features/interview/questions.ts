export const CATEGORIES = ['core', 'rxjs', 'architecture', 'tricky'] as const;
export type Category = (typeof CATEGORIES)[number];

export const LEVELS = ['mid', 'senior'] as const;
export type Level = (typeof LEVELS)[number];

/** A live demo in this app: route path plus the id of the demo host (see AnchorFocus). */
export interface DemoLink {
  readonly path: string;
  readonly anchor?: string;
}

/**
 * Question metadata. The text lives in i18n under `interview.q.<id>.{q,short,long}`; optional code
 * lives in ./snippets.ts (excluded from check:legacy because it may show legacy code on purpose).
 */
export interface Question {
  readonly id: string;
  readonly category: Category;
  readonly level: Level;
  readonly demo?: DemoLink;
}

export const QUESTIONS: readonly Question[] = [
  // Angular core
  {
    id: 'signals',
    category: 'core',
    level: 'mid',
    demo: { path: '/rxjs', anchor: 'interop-demo' },
  },
  {
    id: 'computedEffect',
    category: 'core',
    level: 'mid',
    demo: { path: '/v16', anchor: 'cart-demo' },
  },
  {
    id: 'linkedSignal',
    category: 'core',
    level: 'senior',
    demo: { path: '/v19', anchor: 'linked-demo' },
  },
  {
    id: 'zoneless',
    category: 'core',
    level: 'senior',
    demo: { path: '/lifecycle', anchor: 'cd-tree-demo' },
  },
  {
    id: 'onPush',
    category: 'core',
    level: 'mid',
    demo: { path: '/v22', anchor: 'cd-strategy-demo' },
  },
  {
    id: 'lifecycleOrder',
    category: 'core',
    level: 'mid',
    demo: { path: '/lifecycle', anchor: 'hooks-demo' },
  },
  {
    id: 'afterRender',
    category: 'core',
    level: 'senior',
    demo: { path: '/lifecycle', anchor: 'modern-hooks-demo' },
  },
  {
    id: 'diHierarchy',
    category: 'core',
    level: 'senior',
    demo: { path: '/lifecycle', anchor: 'injectors-demo' },
  },
  {
    id: 'injectionContext',
    category: 'core',
    level: 'mid',
    demo: { path: '/lifecycle', anchor: 'injectors-demo' },
  },
  { id: 'standalone', category: 'core', level: 'mid' },
  {
    id: 'signalInputs',
    category: 'core',
    level: 'mid',
    demo: { path: '/v17', anchor: 'signal-io-demo' },
  },
  { id: 'controlFlow', category: 'core', level: 'mid', demo: { path: '/v17', anchor: 'for-demo' } },
  {
    id: 'deferBlocks',
    category: 'core',
    level: 'senior',
    demo: { path: '/v17', anchor: 'defer-demo' },
  },
  {
    id: 'resourceApi',
    category: 'core',
    level: 'senior',
    demo: { path: '/v20', anchor: 'http-resource-demo' },
  },
  {
    id: 'signalForms',
    category: 'core',
    level: 'senior',
    demo: { path: '/v22', anchor: 'test-drive-demo' },
  },
  {
    id: 'routeParams',
    category: 'core',
    level: 'mid',
    demo: { path: '/v16', anchor: 'input-binding-demo' },
  },
  // RxJS
  {
    id: 'flattening',
    category: 'rxjs',
    level: 'mid',
    demo: { path: '/rxjs', anchor: 'flattening-demo' },
  },
  {
    id: 'hotCold',
    category: 'rxjs',
    level: 'senior',
    demo: { path: '/rxjs', anchor: 'subjects-demo' },
  },
  {
    id: 'subjects',
    category: 'rxjs',
    level: 'mid',
    demo: { path: '/rxjs', anchor: 'subjects-demo' },
  },
  {
    id: 'rxjsErrors',
    category: 'rxjs',
    level: 'senior',
    demo: { path: '/rxjs', anchor: 'errors-demo' },
  },
  {
    id: 'unsubscribe',
    category: 'rxjs',
    level: 'mid',
    demo: { path: '/rxjs', anchor: 'leaks-demo' },
  },
  {
    id: 'stillRxjs',
    category: 'rxjs',
    level: 'senior',
    demo: { path: '/rxjs', anchor: 'interop-demo' },
  },
  // Architecture & quality
  { id: 'structure', category: 'architecture', level: 'senior', demo: { path: '/requirements' } },
  {
    id: 'stateManagement',
    category: 'architecture',
    level: 'senior',
    demo: { path: '/lifecycle', anchor: 'injectors-demo' },
  },
  {
    id: 'httpErrors',
    category: 'architecture',
    level: 'mid',
    demo: { path: '/v20', anchor: 'http-resource-demo' },
  },
  { id: 'testing', category: 'architecture', level: 'senior', demo: { path: '/requirements' } },
  {
    id: 'accessibility',
    category: 'architecture',
    level: 'senior',
    demo: { path: '/v21', anchor: 'aria-demo' },
  },
  {
    id: 'performance',
    category: 'architecture',
    level: 'senior',
    demo: { path: '/v17', anchor: 'defer-demo' },
  },
  {
    id: 'bundle',
    category: 'architecture',
    level: 'senior',
    demo: { path: '/v22', anchor: 'lazy-service-demo' },
  },
  { id: 'i18n', category: 'architecture', level: 'mid', demo: { path: '/' } },
  // Senior trick questions
  {
    id: 'effectSync',
    category: 'tricky',
    level: 'senior',
    demo: { path: '/v19', anchor: 'linked-demo' },
  },
  {
    id: 'mutation',
    category: 'tricky',
    level: 'senior',
    demo: { path: '/lifecycle', anchor: 'cd-tree-demo' },
  },
  {
    id: 'switchMapSave',
    category: 'tricky',
    level: 'senior',
    demo: { path: '/rxjs', anchor: 'flattening-demo' },
  },
  {
    id: 'requiredInput',
    category: 'tricky',
    level: 'senior',
    demo: { path: '/v16', anchor: 'required-input-demo' },
  },
  {
    id: 'thirdParty',
    category: 'tricky',
    level: 'senior',
    demo: { path: '/v18', anchor: 'zoneless-demo' },
  },
  {
    id: 'trackIndex',
    category: 'tricky',
    level: 'senior',
    demo: { path: '/v17', anchor: 'for-demo' },
  },
  { id: 'ng0100', category: 'tricky', level: 'senior' },
];
