import {
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '@core/i18n/language.service';
import { EurPipe } from '@shared/pipes/eur.pipe';

export const DISCOUNT_RATE = 0.1;
const KW_TO_HP = 1.35962;

/** Required inputs with transforms: works with plain HTML attributes (`amount="39995" discounted`). */
@Component({
  selector: 'app-price-tag',
  imports: [EurPipe, TranslatePipe],
  template: `
    <div class="tag" [class.discounted]="discounted()">
      <span class="price">{{ finalPrice() | eur: lang() }}</span>
      @if (discounted()) {
        <s class="muted">{{ amount() | eur: lang() }}</s>
        <span class="flag">−{{ discountPercent }} %</span>
      }
      <span class="muted"
        >{{ powerKw() }} kW · {{ horsepower() }} {{ 'v16.required.hp' | translate }}</span
      >
    </div>
  `,
  styles: `
    .tag {
      display: inline-flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      align-items: baseline;
      padding: var(--space-2) var(--space-3);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
    }

    .price {
      font-size: var(--font-size-lg);
      font-weight: 700;
    }

    .flag {
      font-weight: 700;
      color: var(--color-success);
    }
  `,
})
export class PriceTag {
  protected readonly lang = inject(LanguageService).current;
  protected readonly discountPercent = DISCOUNT_RATE * 100;

  readonly amount = input.required({ transform: numberAttribute });
  readonly powerKw = input.required({ transform: numberAttribute });
  readonly discounted = input(false, { transform: booleanAttribute });

  readonly finalPrice = computed(() =>
    this.discounted() ? Math.round(this.amount() * (1 - DISCOUNT_RATE)) : this.amount(),
  );
  readonly horsepower = computed(() => Math.round(this.powerKw() * KW_TO_HP));
}
