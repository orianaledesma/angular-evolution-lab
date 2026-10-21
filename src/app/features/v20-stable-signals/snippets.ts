import type { CodeSample } from '@shared/ui/code-compare/code-compare';

type Pair = Readonly<{ before: CodeSample; after: CodeSample }>;

export const HTTP_RESOURCE: Pair = {
  before: {
    label: 'v19 · HttpClient + toSignal + manual states',
    code: `state = toSignal(this.http.get<Vehicle[]>('api/vehicles').pipe(
  map(data => ({ status: 'success', data })),
  catchError(error => of({ status: 'error', error })),
  startWith({ status: 'loading' }),
));
// reload? → a Subject + switchMap`,
  },
  after: {
    label: 'v19.2 → stable in v22 · httpResource',
    code: `vehicles = httpResource<Vehicle[]>(
  () => ({ url: 'api/vehicles', params: this.params() }),
  { defaultValue: [] },
);
vehicles.status();     // 'loading' | 'resolved' | 'error' | …
vehicles.statusCode(); // 200
vehicles.reload();`,
  },
};

export const EXPRESSIONS: Pair = {
  before: {
    label: 'v19 · helpers in the component class',
    code: `get title() { return this.brand + ' ' + this.model; }
residual() { return this.price * Math.pow(0.85, this.years); }
hasHeatPump() { return 'heatPump' in this.equipment; }
(click)="save(); $event.preventDefault()"`,
  },
  after: {
    label: 'v19.2 / v20 · template literals, **, in, void',
    code: `{{ \`\${brand()} \${model()}\` }}
{{ price() * (1 - depreciation()) ** years() }}
{{ 'heatPump' in equipment() }}
<button (click)="void save()">Save</button>`,
  },
};
