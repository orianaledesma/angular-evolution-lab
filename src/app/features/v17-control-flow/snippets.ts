import type { CodeSample } from '@shared/ui/code-compare/code-compare';

type Pair = Readonly<{ before: CodeSample; after: CodeSample }>;

export const FOR: Pair = {
  before: {
    label: 'v16 · *ngFor + trackBy + *ngIf for empty',
    code: `<tr *ngFor="let car of stock; trackBy: trackById">…</tr>
<tr *ngIf="!stock.length"><td>No vehicles</td></tr>

trackById(_: number, car: Car) { return car.id; }`,
  },
  after: {
    label: 'v17 · @for (track is mandatory) + @empty',
    code: `@for (car of stock(); track car.id) {
  <tr>…</tr>
} @empty {
  <tr><td>No vehicles</td></tr>
}`,
  },
};

export const DEFER: Pair = {
  before: {
    label: 'v16 · lazy component by hand',
    code: `async ngAfterViewInit() {
  const io = new IntersectionObserver(async ([e]) => {
    if (!e.isIntersecting) return;
    const { PowerChart } = await import('./power-chart');
    this.host.createComponent(PowerChart);
  });
  io.observe(this.anchor.nativeElement);
}`,
  },
  after: {
    label: 'v17 · @defer (on viewport)',
    code: `@defer (on viewport) {
  <app-power-chart />
} @placeholder {
  <p>Scroll to load the chart</p>
} @loading (minimum 600ms) {
  <p>Loading chunk…</p>
}`,
  },
};

export const SIGNAL_IO: Pair = {
  before: {
    label: 'v16 · @Input / @Output / two-way by convention',
    code: `@Input() value = 0;
@Output() valueChange = new EventEmitter<number>();
@Output() committed = new EventEmitter<number>();
@Input() label!: string;`,
  },
  after: {
    label: 'v17.1+ · input() / model() / output()',
    code: `label = input.required<string>();
value = model(0);            // [(value)] two-way
committed = output<number>();

<app-rating label="Comfort" [(value)]="comfort" />`,
  },
};

export const QUERIES: Pair = {
  before: {
    label: 'v16 · decorator queries + ngAfterViewInit',
    code: `@ViewChildren(ChecklistItem) items!: QueryList<ChecklistItem>;
@ViewChild('newItem') input!: ElementRef;
ngAfterViewInit() {
  this.items.changes.subscribe(() => this.recount());
}`,
  },
  after: {
    label: 'v17.2+ · signal queries',
    code: `items = viewChildren(ChecklistItem);
input = viewChild.required<ElementRef>('newItem');
done = computed(() =>
  this.items().filter(i => i.checked()).length,
);`,
  },
};

export const VIEW_TRANSITIONS: Pair = {
  before: {
    label: 'v16 · manual animation on route change',
    code: `router.events.pipe(filter(e => e instanceof NavigationEnd))
  .subscribe(() => this.animate());
// + @angular/animations triggers per element`,
  },
  after: {
    label: 'v17 · withViewTransitions()',
    code: `provideRouter(routes, withViewTransitions());

/* CSS */
.vehicle { view-transition-name: var(--vt-name); }`,
  },
};
