import type { CodeSample } from '@shared/ui/code-compare/code-compare';

type Pair = Readonly<{ before: CodeSample; after: CodeSample }>;

export const FLATTENING: Pair = {
  before: {
    label: 'Nested subscribe · no cancellation, no ordering',
    code: `this.search$.subscribe((q) => {
  this.api.search(q).subscribe((r) => {
    this.results = r;   // a slow old response can overwrite
  });                   // a newer one; nothing is cancelled
});`,
  },
  after: {
    label: 'One flattening operator states the policy',
    code: `search$.pipe(switchMap(q => api.search(q)))   // latest wins
uploads$.pipe(mergeMap(f => api.upload(f), 3)) // parallel, max 3
saves$.pipe(concatMap(d => api.save(d)))      // in order
submit$.pipe(exhaustMap(() => api.pay()))      // ignore re-clicks`,
  },
};

export const SUBJECTS: Pair = {
  before: {
    label: 'Cold HTTP observable · one request per subscriber',
    code: `vehicles$ = this.http.get<Vehicle[]>('/api/vehicles');

// header, list and filter each subscribe (or use | async)
// → three identical requests`,
  },
  after: {
    label: 'Shared: one request, cached for late subscribers',
    code: `vehicles$ = this.http.get<Vehicle[]>('/api/vehicles').pipe(
  shareReplay({ bufferSize: 1, refCount: true }),
);

// State that changes over time: a signal (or BehaviorSubject)
selected = signal<Vehicle | null>(null);`,
  },
};

export const INTEROP: Pair = {
  before: {
    label: 'RxJS for state · BehaviorSubject + async pipe',
    code: `private speed$ = new BehaviorSubject(0);
kmh$ = this.speed$.pipe(map(s => s * 3.6));

{{ kmh$ | async }}             // template
this.speed$.next(this.speed$.value + 1);`,
  },
  after: {
    label: 'Signals for state, RxJS at the edges',
    code: `speed = signal(0);
kmh = computed(() => this.speed() * 3.6);

// time-based or event streams stay RxJS, bridged once:
position = toSignal(this.gps$, { initialValue: null });
speed$ = toObservable(this.speed).pipe(debounceTime(300));`,
  },
};

export const ERRORS: Pair = {
  before: {
    label: 'catchError on the outer stream · it still dies',
    code: `this.clicks$.pipe(
  switchMap(() => this.api.load()),
  catchError(() => of([])),   // replaces the *whole* stream:
).subscribe(…);               // after one error, clicks are ignored`,
  },
  after: {
    label: 'Handle errors per inner request',
    code: `this.clicks$.pipe(
  switchMap(() => this.api.load().pipe(
    retry({ count: 3, delay: (_, i) => timer(400 * 2 ** (i - 1)) }),
    catchError(() => of(FALLBACK)),   // only this request
  )),
).subscribe(…);                       // the click stream survives`,
  },
};

export const LEAKS: Pair = {
  before: {
    label: 'Manual bookkeeping · easy to forget',
    code: `private sub?: Subscription;
ngOnInit()    { this.sub = this.feed.ticks$.subscribe(…); }
ngOnDestroy() { this.sub?.unsubscribe(); }   // forget this → leak

// or: private destroy$ = new Subject<void>() + takeUntil(...)`,
  },
  after: {
    label: 'Tie the subscription to DestroyRef',
    code: `ticks = this.feed.ticks$
  .pipe(takeUntilDestroyed())          // in an injection context
  .subscribe(v => this.value.set(v));

// or skip subscribing at all:
value = toSignal(this.feed.ticks$, { initialValue: 0 });`,
  },
};
