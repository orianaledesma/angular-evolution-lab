import type { CodeSample } from '@shared/ui/code-compare/code-compare';

type Pair = Readonly<{ before: CodeSample; after: CodeSample }>;

export const LINKED: Pair = {
  before: {
    label: 'v18 · effect() that writes another signal',
    code: `city = signal<string | undefined>(undefined);
resetCity = effect(() => {
  const cities = this.cities();
  // runs after render → one frame with a stale city
  this.city.set(cities[0]?.id);
}, { allowSignalWrites: true });`,
  },
  after: {
    label: 'v19 · linkedSignal (writable, resets with its source)',
    code: `city = linkedSignal({
  source: this.cities,
  computation: (cities, previous) =>
    cities.some(c => c.id === previous?.value)
      ? previous!.value
      : cities[0]?.id,
});
this.city.set('ber'); // still writable`,
  },
};

export const RESOURCE: Pair = {
  before: {
    label: 'v18 · switchMap + manual status flags',
    code: `loading = signal(false);
error = signal<unknown>(null);
dealers = toSignal(toObservable(this.cityId).pipe(
  tap(() => this.loading.set(true)),
  switchMap(id => this.http.get(…).pipe(
    catchError(e => (this.error.set(e), of([]))),
    finalize(() => this.loading.set(false)),
  )),
));`,
  },
  after: {
    label: 'v19 · resource() with params + abortSignal',
    code: `dealers = resource({
  params: () => ({ cityId: this.cityId() }),
  loader: ({ params, abortSignal }) =>
    fetchDealers(params.cityId, abortSignal),
});
// dealers.status() · isLoading() · value() · error() · reload()`,
  },
};

export const RX_RESOURCE: Pair = {
  before: {
    label: 'v18 · Observable + async pipe + error handling',
    code: `vehicles$ = this.fuel$.pipe(
  switchMap(fuel => this.api.search({ fuel })),
  shareReplay(1),
);
{{ vehicles$ | async }}`,
  },
  after: {
    label: 'v19 · rxResource (option renamed to stream in v20)',
    code: `vehicles = rxResource({
  params: () => ({ fuel: this.fuel() }),
  stream: ({ params }) => this.api.search(params),
});
@let list = vehicles.value() ?? [];`,
  },
};
