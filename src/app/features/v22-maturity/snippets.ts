import type { CodeSample } from '@shared/ui/code-compare/code-compare';

type Pair = Readonly<{ before: CodeSample; after: CodeSample }>;

export const CD_STRATEGY: Pair = {
  before: {
    label: 'v21 · Default (CheckAlways) unless you opt in',
    code: `@Component({
  changeDetection: ChangeDetectionStrategy.OnPush, // on every component
})`,
  },
  after: {
    label: 'v22 · OnPush by default, opt out with Eager',
    code: `@Component({ … })              // OnPush — nothing to write
@Component({
  changeDetection: ChangeDetectionStrategy.Eager, // was "Default"
})`,
  },
};

export const FORMS_COMPARE: Pair = {
  before: {
    label: 'Reactive Forms · server error mapping',
    code: `this.api.bookTestDrive(this.form.getRawValue()).subscribe({
  next: (res) => this.confirmation.set(res),
  error: (e) => this.form.controls.email
    .setErrors({ server: e.error.errors.email[0] }),
});`,
  },
  after: {
    label: 'Signal Forms · submission + FormRoot',
    code: `f = form(this.model, schema, {
  submission: {
    action: async (f) => {
      try { this.confirmation.set(await book(f().value())); }
      catch (e) {
        return { kind: 'server', fieldTree: f.email, message };
      }
    },
  },
});
<form [formRoot]="f">…</form>`,
  },
};

export const RESOURCES: Pair = {
  before: {
    label: 'v16 · RxJS for debounce + dependent request',
    code: `results = toSignal(toObservable(this.query).pipe(
  debounceTime(300),
  switchMap(q => this.api.search({ q })),
));
top = toSignal(toObservable(this.results).pipe(
  switchMap(r => r?.[0] ? this.api.byId(r[0].id) : of(null)),
));`,
  },
  after: {
    label: 'v22 · debounced() + httpResource + chain()',
    code: `term = debounced(() => this.query(), 300);
results = httpResource<Vehicle[]>(() =>
  this.term.value() ? \`api/vehicles?q=\${this.term.value()}\` : undefined);
top = httpResource<Vehicle>(({ chain }) => {
  const [first] = chain(this.results);
  return first ? \`api/vehicles/\${first.id}\` : undefined;
});`,
  },
};

export const LAZY_SERVICE: Pair = {
  before: {
    label: 'v21 · dynamic import + manual injector wiring',
    code: `async export() {
  const { CsvExport } = await import('./csv-export');
  const svc = this.injector.get(CsvExport); // must be provided somewhere
  svc.download(rows);
}`,
  },
  after: {
    label: 'v22 · @Service() + injectAsync() with prefetch',
    code: `@Service()                 // auto-provided, tree-shakable
export class CsvExport { … }

csv = injectAsync(() => import('./csv-export'), {
  prefetch: () => onIdle({ timeout: 4000 }),
});
(await this.csv()).download(rows);`,
  },
};

export const SWITCH: Pair = {
  before: {
    label: 'v21 · one @case per value, no exhaustiveness',
    code: `@switch (status) {
  @case ('ordered') { … }
  @case ('confirmed') { … }   <!-- duplicated markup -->
  @default { <!-- silently hides new statuses --> }
}`,
  },
  after: {
    label: 'v22 · grouped @case + @default never',
    code: `@let current = status();
@switch (current) {
  @case ('ordered') @case ('confirmed') { Processing }
  @case ('in-production') @case ('quality-check') { Factory }
  @case ('in-transit') { On the road }
  @case ('at-dealer') @case ('delivered') { Ready }
  @default never;   <!-- compile error if a status is missing -->
}`,
  },
};

export const DEFER_IDLE: Pair = {
  before: {
    label: 'v17 · on idle (no upper bound)',
    code: `@defer (on idle) {
  <app-recommendations />
}`,
  },
  after: {
    label: 'v22 · on idle(2000) — idle, but at most 2 s',
    code: `@defer (on idle(2000)) {
  <app-recommendations />
} @placeholder {
  <p>Waiting for an idle moment…</p>
}`,
  },
};

export const IS_ACTIVE: Pair = {
  before: {
    label: 'v20 · RouterLinkActive directive',
    code: `<a routerLink="/v22" routerLinkActive="active"
   ariaCurrentWhenActive="page">v22</a>`,
  },
  after: {
    label: 'v21.1+ · isActive() signal',
    code: `active = isActive('/v22', this.router, { paths: 'subset' });

<a routerLink="/v22" [class.active]="active()"
   [attr.aria-current]="active() ? 'page' : null">v22</a>`,
  },
};
