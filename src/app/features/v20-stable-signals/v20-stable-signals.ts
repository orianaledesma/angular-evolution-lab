import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Badge } from '@shared/ui/badge/badge';
import { HttpResourceDemo } from './http-resource-demo';
import { StabilityDemo } from './stability-demo';
import { TemplateExpressionsDemo } from './template-expressions-demo';

@Component({
  selector: 'app-v20-stable-signals',
  imports: [TranslatePipe, Badge, StabilityDemo, HttpResourceDemo, TemplateExpressionsDemo],
  template: `
    <section class="page">
      <header class="page-header">
        <div class="cluster">
          <app-badge tone="info">Angular 20 · 2025</app-badge>
          <app-badge tone="success">effect · linkedSignal · toSignal: stable</app-badge>
        </div>
        <h1>{{ 'v20.title' | translate }}</h1>
        <p>{{ 'v20.intro' | translate }}</p>
      </header>
      <div class="demo-list">
        <app-stability-demo />
        <app-http-resource-demo />
        <app-template-expressions-demo />
      </div>
    </section>
  `,
})
export default class V20StableSignals {}
