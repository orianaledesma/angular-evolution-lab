import type { CodeSample } from '@shared/ui/code-compare/code-compare';

type Pair = Readonly<{ before: CodeSample; after: CodeSample }>;

export const ZONELESS: Pair = {
  before: {
    label: 'v17 · zone.js patches every async API',
    code: `// angular.json → "polyfills": ["zone.js"]
bootstrapApplication(App, {
  providers: [provideZoneChangeDetection({ eventCoalescing: true })],
});
// any setTimeout / XHR / event → check the whole tree`,
  },
  after: {
    label: 'v18 experimental → v20 stable → v21 default',
    code: `// v18: provideExperimentalZonelessChangeDetection()
// v20: provideZonelessChangeDetection()
// v21+: zoneless is the default — no provider, no polyfill
bootstrapApplication(App, appConfig);

// CD is scheduled by: signals, markForCheck(),
// template listeners, AsyncPipe, setInput()`,
  },
};

export const LET: Pair = {
  before: {
    label: 'v17 · repeated expressions or *ngIf "as" hacks',
    code: `<ng-container *ngIf="{ rate: price * factor / months } as vm">
  {{ vm.rate | currency }} · {{ vm.rate * months | currency }}
</ng-container>`,
  },
  after: {
    label: 'v18.1 · @let',
    code: `@let net = price() - deposit();
@let rate = net * (1 + apr() / 100) / months();
<p>{{ rate | eur }} / month</p>
<p>{{ rate * months() | eur }} total</p>`,
  },
};

export const FALLBACK: Pair = {
  before: {
    label: 'v17 · extra input + @if for defaults',
    code: `@if (hasTitle) {
  <ng-content select="[card-title]" />
} @else {
  <h2>{{ heading }}</h2>
}`,
  },
  after: {
    label: 'v18 · ng-content fallback',
    code: `<ng-content select="[card-title]">
  <h2>{{ heading() }}</h2>  <!-- shown if nothing is projected -->
</ng-content>`,
  },
};

export const FORM_EVENTS: Pair = {
  before: {
    label: 'v17 · one observable per concern',
    code: `form.valueChanges.subscribe(...);
form.statusChanges.subscribe(...);
// touched / pristine / submit / reset: no observable at all`,
  },
  after: {
    label: 'v18 · control.events unified stream',
    code: `form.events.pipe(takeUntilDestroyed()).subscribe(e => {
  if (e instanceof TouchedChangeEvent) …
  if (e instanceof PristineChangeEvent) …
  if (e instanceof FormSubmittedEvent) …
  if (e instanceof FormResetEvent) …
});`,
  },
};

export const REDIRECT: Pair = {
  before: {
    label: 'v17 · redirectTo is a static string',
    code: `{ path: 'legacy/:model', redirectTo: '/v18' }
// params lost — a guard or resolver was needed to keep them`,
  },
  after: {
    label: 'v18 · redirectTo as a function',
    code: `{
  path: 'legacy/:model',
  redirectTo: ({ params }) =>
    inject(Router).createUrlTree(['/v18'], {
      queryParams: { redirectedFrom: params['model'] },
    }),
}`,
  },
};
