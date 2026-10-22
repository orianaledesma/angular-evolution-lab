/** Code shown under an answer, by question id. May contain legacy code on purpose (contrast). */
export const ANSWER_SNIPPETS: Readonly<Record<string, string>> = {
  signals: `const speed = signal(0);            // value now, sync read: speed()
const kmh = computed(() => speed() * 3.6);
speed.set(120);                       // kmh() === 432, lazily

const speed$ = new BehaviorSubject(0); // stream: values over time,
speed$.pipe(map(s => s * 3.6))         // needs subscribe/unsubscribe`,
  computedEffect: `total = computed(() =>                  // derive values: pure, cached
  this.items().reduce((s, i) => s + i.price * i.qty, 0));

saveDraft = effect(() =>                // side effects only:
  localStorage.setItem('cart', JSON.stringify(this.items())));`,
  linkedSignal: `country = signal<Country>('AT');
city = linkedSignal(() => CITIES[this.country()][0]); // derived…

this.city.set('Graz');   // …but writable; resets when country changes`,
  zoneless: `bootstrapApplication(App, { providers: [] }); // v21+: zoneless default

// What schedules change detection now:
count.set(1);                    // signal read by a template
(click)="…"                      // template/host listener
input change · markForCheck() · AsyncPipe`,
  onPush: `@Component({ … })   // v22: OnPush unless you say otherwise

@Component({
  changeDetection: ChangeDetectionStrategy.Eager, // the old Default
})`,
  lifecycleOrder: `constructor → ngOnChanges → ngOnInit → ngDoCheck
→ ngAfterContentInit → ngAfterContentChecked
→ ngAfterViewInit → ngAfterViewChecked
→ afterNextRender / afterRenderEffect   …   ngOnDestroy → DestroyRef`,
  afterRender: `focusFirst = afterNextRender(() => this.input().nativeElement.focus());

resize = afterRenderEffect({
  earlyRead: () => this.list().nativeElement.scrollHeight,
  write: (h) => { this.panel().nativeElement.style.height = h() + 'px'; },
});`,
  diHierarchy: `@Component({
  providers: [TripMeter],          // element injector: one per instance
})
export class TripPanel {
  meter = inject(TripMeter);       // found here first
  clock = inject(FleetClock);      // not here → … → route → root
  maybe = inject(Logger, { optional: true });
}`,
  injectionContext: `export class Gauge {
  api = inject(Api);                         // ✓ field initializer
  load() {
    inject(Api);                             // ✗ NG0203
    runInInjectionContext(this.injector, () => inject(Api)); // ✓
  }
}`,
  standalone: `// Before: declarations + imports in an NgModule
@NgModule({ declarations: [Gauge], imports: [CommonModule] })

// Now: the component declares its own dependencies
@Component({ selector: 'app-gauge', imports: [DecimalPipe] })
bootstrapApplication(App, appConfig);`,
  signalInputs: `plate = input.required<string>();             // was @Input({ required })
price = input(0, { transform: numberAttribute });
changed = output<string>();                   // was @Output() + EventEmitter
rating = model(0);                            // two-way: [(rating)]`,
  controlFlow: `@for (car of cars(); track car.vin) {
  <app-car [car]="car" />
} @empty {
  <p>No cars in stock.</p>
}`,
  deferBlocks: `@defer (on viewport; prefetch on idle) {
  <app-power-chart />            <!-- own lazy chunk -->
} @placeholder (minimum 300ms) {
  <div class="skeleton"></div>
} @loading { … } @error { … }`,
  resourceApi: `vehicleId = input.required<string>();
vehicle = httpResource<Vehicle>(() => \`/api/vehicles/\${this.vehicleId()}\`);

@if (vehicle.error()) { … } @else if (vehicle.hasValue()) {
  {{ vehicle.value().model }}
}`,
  signalForms: `model = signal({ email: '', date: '' });
f = form(this.model, (p) => {
  required(p.email);
  email(p.email);
});
<input [formField]="f.email" />   @if (f.email().invalid()) { … }`,
  routeParams: `provideRouter(routes, withComponentInputBinding());

export class VehiclePage {
  id = input.required<string>();   // from :id, ?id= or route data
}`,
  flattening: `search$.pipe(switchMap(q => api.search(q)))   // latest wins
uploads$.pipe(mergeMap(f => api.upload(f), 3)) // parallel
saves$.pipe(concatMap(d => api.save(d)))      // ordered
submit$.pipe(exhaustMap(() => api.pay()))      // ignore re-clicks`,
  hotCold: `const cold$ = this.http.get('/api/cars');      // 1 request per subscribe
const shared$ = cold$.pipe(
  shareReplay({ bufferSize: 1, refCount: true }), // 1 request, cached
);`,
  subjects: `new Subject<T>()          // no initial value, late subscribers miss values
new BehaviorSubject(init) // current value, given on subscribe
new ReplaySubject<T>(n)   // replays the last n values

private state$ = new BehaviorSubject(0);
readonly value$ = this.state$.asObservable(); // no next() for consumers`,
  rxjsErrors: `clicks$.pipe(
  switchMap(() => api.load().pipe(
    retry({ count: 3, delay: (_, i) => timer(400 * 2 ** (i - 1)) }),
    catchError(() => of(FALLBACK)),  // inside: the outer stream survives
  )),
)`,
  unsubscribe: `ticks = this.feed.ticks$
  .pipe(takeUntilDestroyed())          // in an injection context
  .subscribe(v => this.value.set(v));

value = toSignal(this.feed.ticks$, { initialValue: 0 }); // or this`,
  stillRxjs: `query = signal('');
results = toSignal(toObservable(this.query).pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(q => this.api.search(q)),
), { initialValue: [] });`,
  structure: `src/app/
  core/       singletons: http interceptors, i18n, layout, models
  shared/ui/  presentational components, no business logic
  features/   one folder per feature, lazy-loaded via loadComponent
              → own routes, services and state`,
  stateManagement: `@Service()                          // global, app-wide state
export class Session { user = signal<User | null>(null); }

@Component({ providers: [Wizard] }) // state of one widget instance
cart = signal<Item[]>([]);          // local UI state
// NgRx Signal Store when many features share complex flows`,
  httpErrors: `export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((e: HttpErrorResponse) => throwError(() => toProblemDetails(e))),
  );

provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]));`,
  testing: `it('shows the price per km', async () => {
  await render(PriceTag, { inputs: { amount: 100, km: 4 } });
  expect(screen.getByRole('status')).toHaveTextContent('25 €/km');
});
// unit: Jest + Testing Library · e2e: Playwright + axe`,
  accessibility: `<button type="button" [attr.aria-expanded]="open()" aria-controls="menu">
<div aria-live="polite">@if (saved()) { Saved }</div>

// Composite widgets: Angular Aria (ngTabs, ngListbox, ngMenu)
// CI: axe on every route, light and dark; a keyboard-only test`,
  performance: `@defer (on viewport) { <app-chart /> }   // code splitting
@for (row of rows(); track row.id) { … }    // keep DOM nodes
loadComponent: () => import('./page')       // lazy routes
// measure first: Angular DevTools profiler, Lighthouse, budgets`,
  bundle: `"budgets": [{ "type": "initial", "maximumWarning": "300kB" }]

private exporter = injectAsync(() => import('./csv-export.service'), {
  prefetch: () => onIdle({ timeout: 2000 }),
});`,
  i18n: `// Runtime (ngx-translate): one build, switch language live
{{ 'cart.total' | translate: { amount } }}

// Build-time (@angular/localize): one build per locale, $localize\`…\`
// fastest at runtime, but a reload to switch language`,
  effectSync: `// ✗ effect to copy state: extra render, possible loops
effect(() => this.city.set(CITIES[this.country()][0]));

// ✓ derive it
city = linkedSignal(() => CITIES[this.country()][0]);`,
  mutation: `this.items().push(newItem);            // ✗ same reference: no notification
this.items.update(list => [...list, newItem]); // ✓ new array, views refresh`,
  switchMapSave: `save$.pipe(switchMap(d => api.save(d)))   // ✗ cancels earlier saves —
                                          //   the server may have applied them
save$.pipe(concatMap(d => api.save(d)))   // ✓ ordered
submit$.pipe(exhaustMap(() => api.pay())) // ✓ ignore double clicks`,
  requiredInput: `amount = input.required<number>();
label = \`\${this.amount()} €\`;            // ✗ NG0950: no value yet

label = computed(() => \`\${this.amount()} €\`); // ✓ read lazily`,
  thirdParty: `map.on('moveend', () => {
  this.center = map.getCenter();          // ✗ plain field: no refresh
  this.center.set(map.getCenter());       // ✓ signal notifies Angular
});`,
  trackIndex: `@for (car of cars(); track $index) { <app-car-row [car]="car" /> }
// ✗ on reorder, rows keep their DOM and component state but get another car

@for (car of cars(); track car.vin) { … }  // ✓ stable identity`,
  ng0100: `// ✗ changes a bound value during the same check
ngAfterViewInit() { this.title = 'Ready'; }   // NG0100 in dev mode

// ✓ make it reactive or move the change out of the check
title = signal('Loading');
afterNextRender(() => this.title.set('Ready'));`,
};
