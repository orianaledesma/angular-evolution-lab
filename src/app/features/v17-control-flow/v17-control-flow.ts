import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Badge } from '@shared/ui/badge/badge';
import { DeferDemo } from './defer-demo';
import { ForDemo } from './for-demo';
import { QueriesDemo } from './queries-demo';
import { SignalIoDemo } from './signal-io-demo';
import { type Layout, ViewTransitionsDemo } from './view-transitions-demo';

@Component({
  selector: 'app-v17-control-flow',
  imports: [
    TranslatePipe,
    Badge,
    ForDemo,
    DeferDemo,
    SignalIoDemo,
    QueriesDemo,
    ViewTransitionsDemo,
  ],
  template: `
    <section class="page">
      <header class="page-header">
        <div class="cluster">
          <app-badge tone="info">Angular 17 · 2023</app-badge>
          <app-badge tone="success">control flow · defer</app-badge>
        </div>
        <h1>{{ 'v17.title' | translate }}</h1>
        <p>{{ 'v17.intro' | translate }}</p>
      </header>
      <div class="demo-list">
        <app-for-demo />
        <app-signal-io-demo />
        <app-queries-demo />
        <app-view-transitions-demo [layout]="layout() ?? 'grid'" />
        <app-defer-demo />
      </div>
    </section>
  `,
})
export default class V17ControlFlow {
  /** `?layout=grid|list`, bound by the router. */
  readonly layout = input<Layout>();
}
