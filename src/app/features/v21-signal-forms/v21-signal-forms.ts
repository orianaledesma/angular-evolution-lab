import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Badge } from '@shared/ui/badge/badge';
import { AriaDemo } from './aria-demo';
import { CleanupDemo } from './cleanup-demo';
import { DealerContactForm } from './dealer-contact-form';

@Component({
  selector: 'app-v21-signal-forms',
  imports: [TranslatePipe, Badge, DealerContactForm, AriaDemo, CleanupDemo],
  template: `
    <section class="page">
      <header class="page-header">
        <div class="cluster">
          <app-badge tone="info">Angular 21 · 2025</app-badge>
          <app-badge tone="warning">Signal Forms: experimental</app-badge>
          <app-badge tone="success">zoneless by default</app-badge>
        </div>
        <h1>{{ 'v21.title' | translate }}</h1>
        <p>{{ 'v21.intro' | translate }}</p>
      </header>
      <div class="demo-list">
        <app-dealer-contact-form />
        <app-aria-demo />
        <app-cleanup-demo />
      </div>
    </section>
  `,
})
export default class V21SignalForms {}
