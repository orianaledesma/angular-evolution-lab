import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Badge } from '@shared/ui/badge/badge';
import { LinkedDemo } from './linked-demo';
import { LocationState } from './location-state';
import { ResourceDemo } from './resource-demo';
import { RxResourceDemo } from './rx-resource-demo';

@Component({
  selector: 'app-v19-linked-resource',
  imports: [TranslatePipe, Badge, LinkedDemo, ResourceDemo, RxResourceDemo],
  providers: [LocationState],
  template: `
    <section class="page">
      <header class="page-header">
        <div class="cluster">
          <app-badge tone="info">Angular 19 · 2024</app-badge>
          <app-badge tone="warning">resource: experimental</app-badge>
          <app-badge tone="success">&#64;let: stable</app-badge>
        </div>
        <h1>{{ 'v19.title' | translate }}</h1>
        <p>{{ 'v19.intro' | translate }}</p>
      </header>
      <div class="demo-list">
        <app-linked-demo />
        <app-resource-demo />
        <app-rx-resource-demo />
      </div>
    </section>
  `,
})
export default class V19LinkedResource {}
