import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Badge } from '@shared/ui/badge/badge';
import { CdStrategyDemo } from './cd-strategy-demo';
import { DeferIdleDemo } from './defer-idle-demo';
import { DeliveryDemo } from './delivery-demo';
import { IsActiveDemo } from './is-active-demo';
import { LazyServiceDemo } from './lazy-service-demo';
import { ResourcesDemo } from './resources-demo';
import { TestDriveDemo } from './test-drive-demo';

@Component({
  selector: 'app-v22-maturity',
  imports: [
    TranslatePipe,
    Badge,
    CdStrategyDemo,
    TestDriveDemo,
    ResourcesDemo,
    LazyServiceDemo,
    DeliveryDemo,
    DeferIdleDemo,
    IsActiveDemo,
  ],
  template: `
    <section class="page">
      <header class="page-header">
        <div class="cluster">
          <app-badge tone="info">Angular 22 · 2026</app-badge>
          <app-badge tone="success">Signal Forms · Resource API: stable</app-badge>
          <app-badge tone="warning">debounced(): experimental</app-badge>
        </div>
        <h1>{{ 'v22.title' | translate }}</h1>
        <p>{{ 'v22.intro' | translate }}</p>
      </header>
      <div class="demo-list">
        <app-cd-strategy-demo id="cd-strategy-demo" />
        <app-test-drive-demo id="test-drive-demo" />
        <app-resources-demo id="resources-demo" />
        <app-lazy-service-demo id="lazy-service-demo" />
        <app-delivery-demo id="delivery-demo" />
        <app-defer-idle-demo id="defer-idle-demo" />
        <app-is-active-demo id="is-active-demo" />
      </div>
    </section>
  `,
})
export default class V22Maturity {}
