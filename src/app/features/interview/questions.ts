export const CATEGORIES = ['core', 'rxjs', 'architecture', 'domain', 'tricky'] as const;
export type Category = (typeof CATEGORIES)[number];

/** A live demo in this app: route path plus the id of the demo host (see AnchorFocus). */
export interface DemoLink {
  readonly path: string;
  readonly anchor?: string;
}

/**
 * Question metadata. All questions target a senior role: they ask for decisions, trade-offs,
 * internals and failure modes, not definitions. The text lives in i18n under
 * `interview.q.<id>.{q,short,long}`; optional code lives in ./snippets.ts (excluded from
 * check:legacy because it may show legacy code on purpose).
 */
export interface Question {
  readonly id: string;
  readonly category: Category;
  readonly demo?: DemoLink;
}

export const QUESTIONS: readonly Question[] = [
  // Angular core
  { id: 'signals', category: 'core', demo: { path: '/rxjs', anchor: 'interop-demo' } },
  { id: 'computedEffect', category: 'core', demo: { path: '/v19', anchor: 'linked-demo' } },
  { id: 'linkedSignal', category: 'core', demo: { path: '/v19', anchor: 'linked-demo' } },
  { id: 'zoneless', category: 'core', demo: { path: '/lifecycle', anchor: 'cd-tree-demo' } },
  { id: 'onPush', category: 'core', demo: { path: '/v22', anchor: 'cd-strategy-demo' } },
  { id: 'lifecycleOrder', category: 'core', demo: { path: '/lifecycle', anchor: 'hooks-demo' } },
  {
    id: 'afterRender',
    category: 'core',
    demo: { path: '/lifecycle', anchor: 'modern-hooks-demo' },
  },
  { id: 'diHierarchy', category: 'core', demo: { path: '/lifecycle', anchor: 'injectors-demo' } },
  {
    id: 'injectionContext',
    category: 'core',
    demo: { path: '/lifecycle', anchor: 'injectors-demo' },
  },
  { id: 'migration', category: 'core', demo: { path: '/v18', anchor: 'zoneless-demo' } },
  { id: 'signalInputs', category: 'core', demo: { path: '/v17', anchor: 'signal-io-demo' } },
  { id: 'controlFlow', category: 'core', demo: { path: '/v17', anchor: 'for-demo' } },
  { id: 'deferBlocks', category: 'core', demo: { path: '/v17', anchor: 'defer-demo' } },
  { id: 'resourceApi', category: 'core', demo: { path: '/v20', anchor: 'http-resource-demo' } },
  { id: 'signalForms', category: 'core', demo: { path: '/v22', anchor: 'test-drive-demo' } },
  { id: 'routeData', category: 'core', demo: { path: '/v16', anchor: 'input-binding-demo' } },
  // RxJS
  { id: 'flattening', category: 'rxjs', demo: { path: '/rxjs', anchor: 'flattening-demo' } },
  { id: 'hotCold', category: 'rxjs', demo: { path: '/rxjs', anchor: 'subjects-demo' } },
  { id: 'subjects', category: 'rxjs', demo: { path: '/rxjs', anchor: 'subjects-demo' } },
  { id: 'rxjsErrors', category: 'rxjs', demo: { path: '/rxjs', anchor: 'errors-demo' } },
  { id: 'unsubscribe', category: 'rxjs', demo: { path: '/rxjs', anchor: 'leaks-demo' } },
  { id: 'stillRxjs', category: 'rxjs', demo: { path: '/rxjs', anchor: 'interop-demo' } },
  // Architecture & quality
  { id: 'structure', category: 'architecture', demo: { path: '/requirements' } },
  {
    id: 'stateManagement',
    category: 'architecture',
    demo: { path: '/lifecycle', anchor: 'injectors-demo' },
  },
  {
    id: 'httpErrors',
    category: 'architecture',
    demo: { path: '/v20', anchor: 'http-resource-demo' },
  },
  { id: 'testing', category: 'architecture', demo: { path: '/requirements' } },
  { id: 'accessibility', category: 'architecture', demo: { path: '/v21', anchor: 'aria-demo' } },
  { id: 'performance', category: 'architecture', demo: { path: '/v17', anchor: 'defer-demo' } },
  { id: 'bundle', category: 'architecture', demo: { path: '/v22', anchor: 'lazy-service-demo' } },
  { id: 'i18n', category: 'architecture', demo: { path: '/' } },
  // Automotive scenarios
  {
    id: 'realtimeTelemetry',
    category: 'domain',
    demo: { path: '/lifecycle', anchor: 'cd-tree-demo' },
  },
  { id: 'connectionLoss', category: 'domain', demo: { path: '/rxjs', anchor: 'errors-demo' } },
  { id: 'configurator', category: 'domain', demo: { path: '/v19', anchor: 'linked-demo' } },
  { id: 'microFrontends', category: 'domain' },
  { id: 'multiBrand', category: 'domain', demo: { path: '/' } },
  { id: 'headUnit', category: 'domain', demo: { path: '/v17', anchor: 'for-demo' } },
  // Senior trick questions
  { id: 'effectSync', category: 'tricky', demo: { path: '/v19', anchor: 'linked-demo' } },
  { id: 'mutation', category: 'tricky', demo: { path: '/lifecycle', anchor: 'cd-tree-demo' } },
  { id: 'switchMapSave', category: 'tricky', demo: { path: '/rxjs', anchor: 'flattening-demo' } },
  {
    id: 'requiredInput',
    category: 'tricky',
    demo: { path: '/v16', anchor: 'required-input-demo' },
  },
  { id: 'thirdParty', category: 'tricky', demo: { path: '/v18', anchor: 'zoneless-demo' } },
  { id: 'trackIndex', category: 'tricky', demo: { path: '/v17', anchor: 'for-demo' } },
  { id: 'ng0100', category: 'tricky' },
];
