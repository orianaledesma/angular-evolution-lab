import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Badge } from '@shared/ui/badge/badge';
import { FallbackDemo } from './fallback-demo';
import { FormEventsDemo } from './form-events-demo';
import { LetDemo } from './let-demo';
import { RedirectDemo } from './redirect-demo';
import { ZonelessDemo } from './zoneless-demo';

@Component({
  selector: 'app-v18-zoneless',
  imports: [
    TranslatePipe,
    Badge,
    ZonelessDemo,
    LetDemo,
    FallbackDemo,
    FormEventsDemo,
    RedirectDemo,
  ],
  template: `
    <section class="page">
      <header class="page-header">
        <div class="cluster">
          <app-badge tone="info">Angular 18 · 2024</app-badge>
          <app-badge tone="warning">zoneless: experimental</app-badge>
        </div>
        <h1>{{ 'v18.title' | translate }}</h1>
        <p>{{ 'v18.intro' | translate }}</p>
      </header>
      <div class="demo-list">
        <app-zoneless-demo id="zoneless-demo" />
        <app-let-demo id="let-demo" />
        <app-fallback-demo id="fallback-demo" />
        <app-form-events-demo id="form-events-demo" />
        <app-redirect-demo id="redirect-demo" [redirectedFrom]="redirectedFrom()" />
      </div>
    </section>
  `,
})
export default class V18Zoneless {
  /** Set by the functional redirectTo in v18.routes.ts. */
  readonly redirectedFrom = input<string>();
}
