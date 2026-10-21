import type { CodeSample } from '@shared/ui/code-compare/code-compare';

type Pair = Readonly<{ before: CodeSample; after: CodeSample }>;

export const CART: Pair = {
  before: {
    label: 'v15 · BehaviorSubject + async pipe',
    code: `items$ = new BehaviorSubject<Item[]>([]);
total$ = this.items$.pipe(
  map(items => items.reduce((s, i) => s + i.price, 0)),
);
// template
{{ total$ | async }}`,
  },
  after: {
    label: 'v16 · signal / computed / effect',
    code: `items = signal<Item[]>([]);
total = computed(() =>
  this.items().reduce((s, i) => s + i.price, 0),
);
logger = effect(() => console.log(this.total()));
// template
{{ total() }}`,
  },
};

export const SEARCH: Pair = {
  before: {
    label: 'v15 · subscribe + manual unsubscribe',
    code: `ngOnInit() {
  this.sub = this.query.valueChanges.pipe(
    debounceTime(300),
    switchMap(q => this.api.search(q)),
  ).subscribe(r => this.results = r);
}
ngOnDestroy() { this.sub.unsubscribe(); }`,
  },
  after: {
    label: 'v16 · toObservable → RxJS → toSignal',
    code: `query = signal('');
results = toSignal(
  toObservable(this.query).pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(q => this.api.search({ q })),
  ),
  { initialValue: [] },
); // unsubscribes itself`,
  },
};

export const DESTROY: Pair = {
  before: {
    label: 'v15 · Subject + ngOnDestroy',
    code: `private destroy$ = new Subject<void>();
ngOnInit() {
  interval(500).pipe(takeUntil(this.destroy$))
    .subscribe(...);
}
ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}`,
  },
  after: {
    label: 'v16 · DestroyRef + takeUntilDestroyed',
    code: `private sub = interval(500)
  .pipe(takeUntilDestroyed())
  .subscribe(...);

constructor() {} // nothing to clean up
inject(DestroyRef).onDestroy(() => ...);`,
  },
};

export const REQUIRED_INPUT: Pair = {
  before: {
    label: 'v15 · runtime check + setter coercion',
    code: `@Input() set amount(v: string | number) {
  this._amount = Number(v);
}
ngOnInit() {
  if (this._amount == null) throw new Error('amount!');
}`,
  },
  after: {
    label: 'v16 · required + transform (signal form since v17.1)',
    code: `// v16: @Input({ required: true, transform: numberAttribute })
amount = input.required({ transform: numberAttribute });
discounted = input(false, { transform: booleanAttribute });

<app-price-tag amount="39995" discounted />`,
  },
};

export const INPUT_BINDING: Pair = {
  before: {
    label: 'v15 · ActivatedRoute subscription',
    code: `constructor(route: ActivatedRoute) {
  route.queryParamMap.subscribe(p =>
    this.vehicleId = p.get('vehicle'));
}`,
  },
  after: {
    label: 'v16 · withComponentInputBinding()',
    code: `provideRouter(routes, withComponentInputBinding());

// /v16?vehicle=bmw-i4
export default class V16Page {
  vehicle = input<string>(); // filled by the router
}`,
  },
};
