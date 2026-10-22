import type { CodeSample } from '@shared/ui/code-compare/code-compare';

type Pair = Readonly<{ before: CodeSample; after: CodeSample }>;

export const HOOKS: Pair = {
  before: {
    label: 'Classic hooks · decorators + interfaces',
    code: `export class Gauge implements OnChanges, OnInit, AfterViewInit, OnDestroy {
  @Input() speed = 0;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  label = '';
  private sub?: Subscription;

  ngOnChanges(c: SimpleChanges) {
    if (c['speed']) this.label = \`\${this.speed} km/h\`;
  }
  ngOnInit() { this.sub = this.ticks$.subscribe(…); }
  ngAfterViewInit() { this.draw(this.canvas.nativeElement); }
  ngOnDestroy() { this.sub?.unsubscribe(); }
}`,
  },
  after: {
    label: 'Signals · derived state, effects and render hooks',
    code: `export class Gauge {
  speed = input(0);
  canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  label = computed(() => \`\${this.speed()} km/h\`);  // no ngOnChanges

  ticks = toSignal(this.ticks$);                     // unsubscribes itself

  draw = afterRenderEffect(() =>                     // no ngAfterViewInit
    paint(this.canvas().nativeElement, this.speed()));

  _ = inject(DestroyRef).onDestroy(() => …);         // no ngOnDestroy
}`,
  },
};

export const CD_TREE: Pair = {
  before: {
    label: 'zone.js · any async event checks the whole tree',
    code: `// setTimeout, fetch, click… anywhere in the app
// → zone.js → ApplicationRef.tick()
// → every Default component is checked, top-down;
//   OnPush subtrees only if an input changed or
//   markForCheck() was called.
this.cdr.markForCheck();   // the classic escape hatch`,
  },
  after: {
    label: 'zoneless · only notified views are refreshed',
    code: `// Notifications: signal set, template event,
// input change, markForCheck(), async pipe.
count = signal(0);
this.count.set(1);   // only views that read count() refresh;
                     // ancestors are traversed, not re-rendered
this.plain = 1;      // no notification → nothing happens`,
  },
};

export const RENDER_PHASES: Pair = {
  before: {
    label: 'ngAfterViewChecked · read and write mixed',
    code: `ngAfterViewChecked() {
  const h = this.list.nativeElement.scrollHeight; // read → forces layout
  this.panel.nativeElement.style.height = h + 'px'; // write
  // …runs after EVERY check, interleaved with other components'
  // reads and writes → layout thrashing
}`,
  },
  after: {
    label: 'afterRenderEffect · phases batch reads and writes',
    code: `resize = afterRenderEffect({
  earlyRead: () => this.list().nativeElement.scrollHeight,
  write: (height) => {
    this.panel().nativeElement.style.height = height() + 'px';
  },
}); // reruns only when a signal it read changed`,
  },
};

export const INJECTORS: Pair = {
  before: {
    label: 'NgModule era · providers in modules',
    code: `@NgModule({ providers: [TripMeter] })  // one per module
export class GarageModule {}

constructor(private meter: TripMeter) {}  // constructor DI`,
  },
  after: {
    label: 'Standalone · root, component and route injectors',
    code: `@Service() export class FleetClock {}  // root, tree-shakable

@Component({ providers: [TripMeter] })  // one per instance,
export class TripPanel {                // destroyed with it
  meter = inject(TripMeter);
}

{ path: 'garage', providers: [Bay], … } // route injector,
// destroyed on leave with withAutoCleanupInjectors()`,
  },
};

export interface HookMapping {
  readonly id: string;
  readonly classic: string;
  readonly modern: string;
}

/** Classic hook → what replaces it in signal-based components. Notes are i18n keys by id. */
export const HOOK_MAPPINGS: readonly HookMapping[] = [
  { id: 'constructor', classic: 'constructor(private x: X)', modern: 'x = inject(X)' },
  { id: 'onChanges', classic: 'ngOnChanges', modern: 'input() + computed() / linkedSignal()' },
  { id: 'onInit', classic: 'ngOnInit', modern: 'computed() · resource() · ngOnInit' },
  { id: 'doCheck', classic: 'ngDoCheck', modern: 'signals (no polling)' },
  { id: 'content', classic: 'ngAfterContentInit', modern: 'contentChild() / contentChildren()' },
  { id: 'viewInit', classic: 'ngAfterViewInit', modern: 'viewChild() + afterNextRender()' },
  { id: 'viewChecked', classic: 'ngAfterViewChecked', modern: 'afterRenderEffect()' },
  { id: 'onDestroy', classic: 'ngOnDestroy', modern: 'DestroyRef · takeUntilDestroyed()' },
];
