import type { CodeSample } from '@shared/ui/code-compare/code-compare';

type Pair = Readonly<{ before: CodeSample; after: CodeSample }>;

export const SIGNAL_FORMS: Pair = {
  before: {
    label: 'v20 · Reactive Forms',
    code: `form = new FormGroup({
  email: new FormControl('', [Validators.required, Validators.email]),
  postcode: new FormControl('', Validators.pattern(/^\\d{4,5}$/)),
});
<input [formControl]="form.controls.email" />
form.controls.email.errors?.['required']`,
  },
  after: {
    label: 'v21 · Signal Forms (stable in v22)',
    code: `model = signal({ email: '', postcode: '' });
f = form(this.model, (p) => {
  required(p.email);
  email(p.email);
  pattern(p.postcode, /^\\d{4,5}$/);
});
<input [formField]="f.email" />
f.email().errors()   // signal of ValidationError[]`,
  },
};

export const ARIA: Pair = {
  before: {
    label: 'v20 · hand-rolled ARIA widgets',
    code: `<div role="tablist" (keydown)="onKey($event)">
  <button role="tab" [attr.aria-selected]="i === active"
          [attr.tabindex]="i === active ? 0 : -1" …>
// + roving tabindex, Home/End, focus management…`,
  },
  after: {
    label: 'v21 · Angular Aria (headless, you own the styles)',
    code: `<div ngTabs>
  <div ngTabList [(selectedTab)]="tab">
    <div ngTab value="specs">Specs</div>
  </div>
  <div ngTabPanel value="specs">
    <ng-template ngTabContent>…</ng-template>
  </div>
</div>`,
  },
};

export const CLEANUP: Pair = {
  before: {
    label: 'v20 · route injectors live until the app is destroyed',
    code: `{ path: 'bay-a', providers: [BayTelemetry], … }
// leave the route → BayTelemetry stays alive,
// its intervals and subscriptions keep running`,
  },
  after: {
    label: 'v21 experimental → v22.2 withAutoCleanupInjectors()',
    code: `provideRouter(routes, withAutoCleanupInjectors());
// leaving the route destroys its EnvironmentInjector:
// BayTelemetry.ngOnDestroy() runs automatically`,
  },
};
