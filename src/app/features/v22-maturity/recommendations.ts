import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

export const RECOMMENDED = ['wallbox', 'tyres', 'roofbox'] as const;

/** Lazy chunk rendered by @defer (on idle(2000)). */
@Component({
  selector: 'app-recommendations',
  imports: [TranslatePipe],
  template: `
    <ul class="rows" data-testid="recommendations">
      @for (item of items; track item) {
        <li class="row">
          <strong>{{ 'v16.cart.items.' + item | translate }}</strong>
          <span class="muted">{{ 'v22.idle.forYou' | translate }}</span>
          <span aria-hidden="true">★</span>
        </li>
      }
    </ul>
  `,
})
export class Recommendations {
  protected readonly items = RECOMMENDED;
}
