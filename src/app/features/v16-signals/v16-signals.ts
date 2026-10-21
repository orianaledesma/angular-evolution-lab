import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Badge } from '@shared/ui/badge/badge';
import { CartDemo } from './cart-demo';
import { DestroyDemo } from './destroy-demo';
import { InputBindingDemo } from './input-binding-demo';
import { RequiredInputDemo } from './required-input-demo';
import { SearchDemo } from './search-demo';

@Component({
  selector: 'app-v16-signals',
  imports: [
    TranslatePipe,
    Badge,
    CartDemo,
    SearchDemo,
    DestroyDemo,
    RequiredInputDemo,
    InputBindingDemo,
  ],
  template: `
    <section class="page">
      <header class="page-header">
        <div class="cluster">
          <app-badge tone="info">Angular 16 · 2023</app-badge>
          <app-badge tone="warning">signals: developer preview</app-badge>
        </div>
        <h1>{{ 'v16.title' | translate }}</h1>
        <p>{{ 'v16.intro' | translate }}</p>
      </header>
      <div class="demo-list">
        <app-cart-demo />
        <app-search-demo />
        <app-destroy-demo />
        <app-required-input-demo />
        <app-input-binding-demo [vehicleId]="vehicle()" />
      </div>
    </section>
  `,
})
export default class V16Signals {
  /** Bound from the `?vehicle=` query param by withComponentInputBinding(). */
  readonly vehicle = input<string>();
}
