import { QUESTIONS, type DemoLink, type Question } from '../interview/questions';
import { HOOK_MAPPINGS } from '../lifecycle/snippets';
import type { TreeAction } from '../lifecycle/tree-probe';
import { FLATTENING_OPERATORS, type FlatteningOperator } from '../rxjs/marble-lab';

export const DECKS = ['theory', 'cases', 'interview'] as const;
export type Deck = (typeof DECKS)[number];

/**
 * A piece of quiz text: an i18n key (whose `paramKeys` are themselves i18n keys, translated
 * first) or literal code that is never translated.
 */
export type QuizText =
  | {
      readonly key: string;
      readonly params?: Readonly<Record<string, string>>;
      readonly paramKeys?: Readonly<Record<string, string>>;
    }
  | { readonly code: string };

/**
 * One multiple-choice question. Almost all text is reused from the sections of the app: the
 * prompts quote demo labels and takeaways, the options are existing names and explanations, and
 * the feedback links to the demo that proves the answer. Only the prompts and the wrong answers
 * to the interview questions are quiz-specific (`quiz.prompts.*`, `quiz.distractors.*`).
 */
export interface QuizItem {
  readonly id: string;
  readonly deck: Deck;
  readonly prompt: QuizText;
  /** The first option is the correct one; the session samples and shuffles them per round. */
  readonly options: readonly QuizText[];
  /** Existing explanation texts shown after answering. Interview items use AnswerDetail. */
  readonly explain?: readonly QuizText[];
  readonly demo?: DemoLink;
  readonly question?: Question;
}

const key = (k: string, paramKeys?: Record<string, string>): QuizText =>
  paramKeys ? { key: k, paramKeys } : { key: k };
const code = (c: string): QuizText => ({ code: c });

/** Correct value first, then every other value of the same list. */
function correctFirst<T>(all: readonly T[], correct: T): T[] {
  return [correct, ...all.filter((x) => x !== correct)];
}

const LIFECYCLE = (anchor: string): DemoLink => ({ path: '/lifecycle', anchor });
const RXJS = (anchor: string): DemoLink => ({ path: '/rxjs', anchor });

// ── Theory: what the lifecycle and RxJS demos measure ───────────────────────────────────────

const TREE_ACTIONS: readonly TreeAction[] = ['signal', 'input', 'plain', 'event'];

const treeItems: QuizItem[] = TREE_ACTIONS.map((action) => ({
  id: `tree-${action}`,
  deck: 'theory',
  prompt: key('quiz.prompts.tree', { action: `lifecycle.tree.actions.${action}` }),
  options: correctFirst(TREE_ACTIONS, action).map((a) => key(`lifecycle.tree.why.${a}`)),
  explain: [key('lifecycle.tree.t1')],
  demo: LIFECYCLE('cd-tree-demo'),
}));

/** Pairs from the measured hook order: the first one runs first. */
const ORDER_PAIRS = [
  ['ngOnChanges', 'ngOnInit'],
  ['ngDoCheck', 'effect()'],
  ['effect()', 'ngAfterContentInit'],
  ['ngAfterViewInit', 'afterNextRender()'],
] as const;

const orderItems: QuizItem[] = [
  ...ORDER_PAIRS.map(([first, second], i) => ({
    id: `order-${String(i)}`,
    deck: 'theory' as const,
    prompt: key('quiz.prompts.order'),
    options: [code(first), code(second)],
    explain: [key('lifecycle.hooks.t1')],
    demo: LIFECYCLE('hooks-demo'),
  })),
  {
    id: 'order-destroy',
    deck: 'theory',
    prompt: key('quiz.prompts.orderDestroy'),
    options: [code('ngOnDestroy'), code('DestroyRef.onDestroy()')],
    explain: [key('lifecycle.hooks.t4')],
    demo: LIFECYCLE('hooks-demo'),
  },
];

const migrateItems: QuizItem[] = HOOK_MAPPINGS.map((m) => ({
  id: `migrate-${m.id}`,
  deck: 'theory',
  prompt: { key: 'quiz.prompts.migrate', params: { hook: m.classic } },
  options: correctFirst(HOOK_MAPPINGS, m).map((x) => code(x.modern)),
  explain: [key(`lifecycle.modern.rows.${m.id}`)],
  demo: LIFECYCLE('modern-hooks-demo'),
}));

/** i18n key of the phase description → the afterRenderEffect phase name. */
const PHASES = [
  ['earlyRead', 'earlyRead'],
  ['write', 'write'],
  ['mixed', 'mixedReadWrite'],
  ['read', 'read'],
] as const;

const phaseItems: QuizItem[] = PHASES.map(([descKey, name]) => ({
  id: `phase-${name}`,
  deck: 'theory',
  prompt: key('quiz.prompts.phase', { desc: `lifecycle.modern.phases.${descKey}` }),
  options: correctFirst(
    PHASES.map(([, n]) => n),
    name,
  ).map(code),
  explain: [key('lifecycle.modern.phasesExplain')],
  demo: LIFECYCLE('modern-hooks-demo'),
}));

// "cold" is left out: its explanation starts with the word "Cold".
const SOURCES = ['cold', 'shareReplay', 'subject', 'behavior', 'replay'] as const;

const sourceItems: QuizItem[] = SOURCES.slice(1).map((source) => ({
  id: `source-${source}`,
  deck: 'theory',
  prompt: key('quiz.prompts.source', { behaviour: `rxjs.subjects.kinds.${source}.explain` }),
  options: correctFirst(SOURCES, source).map((s) => key(`rxjs.subjects.kinds.${s}.name`)),
  explain: [key('rxjs.subjects.t1')],
  demo: RXJS('subjects-demo'),
}));

/** Emitted responses in the flattening demo's scenario, as its spec asserts. */
const SCENARIO_ANSWERS = ['#3 #5', '#1 #4', '#1 #2 #3 #4 #5', '#1 #3 #5'] as const;

const scenarioItems: QuizItem[] = (
  [
    ['switchMap', '#3 #5', 'rxjs.flattening.t2'],
    ['exhaustMap', '#1 #4', 'rxjs.flattening.t3'],
  ] as const
).map(([op, emitted, takeaway]) => ({
  id: `scenario-${op}`,
  deck: 'theory',
  prompt: { key: 'quiz.prompts.scenario', params: { op } },
  options: correctFirst(SCENARIO_ANSWERS, emitted).map(code),
  explain: [key('rxjs.flattening.t1'), key(takeaway)],
  demo: RXJS('flattening-demo'),
}));

const rxjsTheoryItems: QuizItem[] = [
  {
    id: 'burst-effect',
    deck: 'theory',
    prompt: key('quiz.prompts.burstEffect'),
    options: ['1', '3', '0'].map(code),
    explain: [key('rxjs.interop.explain'), key('rxjs.interop.t2')],
    demo: RXJS('interop-demo'),
  },
  {
    id: 'burst-subject',
    deck: 'theory',
    prompt: key('quiz.prompts.burstSubject'),
    options: ['3', '1', '0'].map(code),
    explain: [key('rxjs.interop.explain')],
    demo: RXJS('interop-demo'),
  },
  {
    id: 'catch-error',
    deck: 'theory',
    prompt: key('quiz.prompts.catchError'),
    options: [
      'clicks$.pipe(switchMap(() => load().pipe(catchError(() => of(fallback)))))',
      'clicks$.pipe(switchMap(() => load()), catchError(() => of(fallback)))',
      'clicks$.pipe(switchMap(() => load())).subscribe({ error: showError })',
    ].map(code),
    explain: [key('rxjs.errors.t1'), key('rxjs.errors.t2')],
    demo: RXJS('errors-demo'),
  },
  {
    id: 'leak',
    deck: 'theory',
    prompt: key('quiz.prompts.leak'),
    options: [
      'interval(1000).subscribe((n) => (this.ticks = n))',
      'http.get(url).subscribe((data) => (this.data = data))',
      'feed$.pipe(takeUntilDestroyed()).subscribe(render)',
      'ticks = toSignal(interval(1000))',
    ].map(code),
    explain: [key('rxjs.leaks.t1'), key('rxjs.leaks.t3')],
    demo: RXJS('leaks-demo'),
  },
];

// ── Use cases: pick the right tool for a concrete situation ──────────────────────────────────

const operatorItems: QuizItem[] = FLATTENING_OPERATORS.map((op: FlatteningOperator) => ({
  id: `operator-${op}`,
  deck: 'cases',
  prompt: key('quiz.prompts.operatorFor', { use: `rxjs.flattening.use.${op}` }),
  options: correctFirst(FLATTENING_OPERATORS, op).map(code),
  explain: [
    key('rxjs.flattening.t1'),
    key(op === 'switchMap' ? 'rxjs.flattening.t2' : 'rxjs.flattening.t3'),
  ],
  demo: RXJS('flattening-demo'),
}));

const NEEDS = ['state', 'derived', 'http', 'time', 'events', 'bridge'] as const;

const needItems: QuizItem[] = NEEDS.map((need) => ({
  id: `need-${need}`,
  deck: 'cases',
  prompt: key('quiz.prompts.need', { need: `rxjs.interop.rows.${need}.need` }),
  options: correctFirst(NEEDS, need).map((n) => key(`rxjs.interop.rows.${n}.use`)),
  explain: [key('rxjs.interop.explain')],
  demo: RXJS('interop-demo'),
}));

const SCOPES = {
  panel: '@Component({ providers: [TripMeter] })',
  app: "@Service() · @Injectable({ providedIn: 'root' })",
  route: "{ path: 'trip', providers: [TripState] }",
  bootstrap: 'bootstrapApplication(App, { providers: [TripMeter] })',
} as const;
type Scope = keyof typeof SCOPES;
const SCOPE_IDS = Object.keys(SCOPES) as Scope[];

const scopeItems: QuizItem[] = (['panel', 'app', 'route'] as const).map((scope) => ({
  id: `scope-${scope}`,
  deck: 'cases',
  prompt: key(`quiz.prompts.scope.${scope}`),
  options: correctFirst(SCOPE_IDS, scope).map((s) => code(SCOPES[s])),
  explain: [key(scope === 'route' ? 'lifecycle.injectors.routeScoped' : 'lifecycle.injectors.t2')],
  demo: LIFECYCLE('injectors-demo'),
}));

const caseItems: QuizItem[] = [
  ...operatorItems,
  ...needItems,
  ...scopeItems,
  {
    id: 'linked',
    deck: 'cases',
    prompt: key('quiz.prompts.linked'),
    options: [
      'linkedSignal(() => cities(this.country())[0])',
      'computed(() => cities(this.country())[0])',
      'effect(() => this.city.set(cities(this.country())[0]))',
      'ngOnChanges() { this.city = cities(this.country)[0]; }',
    ].map(code),
    explain: [key('lifecycle.modern.rows.onChanges'), key('v19.linked.description')],
    demo: { path: '/v19', anchor: 'linked-demo' },
  },
];

// ── Interview: the senior questions, with their answer among plausible misconceptions ────────

const interviewItems: QuizItem[] = QUESTIONS.map((q) => ({
  id: `interview-${q.id}`,
  deck: 'interview',
  prompt: key(`interview.q.${q.id}.q`),
  options: [
    key(`interview.q.${q.id}.short`),
    key(`quiz.distractors.${q.id}.a`),
    key(`quiz.distractors.${q.id}.b`),
  ],
  question: q,
}));

export const QUIZ_ITEMS: readonly QuizItem[] = [
  ...treeItems,
  ...orderItems,
  ...migrateItems,
  ...phaseItems,
  ...sourceItems,
  ...scenarioItems,
  ...rxjsTheoryItems,
  ...caseItems,
  ...interviewItems,
];
