import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '@core/i18n/language.service';
import { EurPipe } from '@shared/pipes/eur.pipe';
import { Button } from '@shared/ui/button/button';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { CART } from './snippets';

export interface Accessory {
  readonly id: string;
  readonly priceEur: number;
}

export const ACCESSORIES: readonly Accessory[] = [
  { id: 'wallbox', priceEur: 1190 },
  { id: 'tyres', priceEur: 890 },
  { id: 'roofbox', priceEur: 459 },
];

export const VAT_RATE = 0.19;

@Component({
  selector: 'app-cart-demo',
  imports: [TranslatePipe, Card, CodeCompare, Button, EurPipe],
  templateUrl: './cart-demo.html',
})
export class CartDemo {
  protected readonly lang = inject(LanguageService).current;
  protected readonly snippets = CART;
  protected readonly accessories = ACCESSORIES;

  readonly quantities = signal<Readonly<Record<string, number>>>({});
  readonly count = computed(() =>
    Object.values(this.quantities()).reduce((sum, qty) => sum + qty, 0),
  );
  readonly subtotal = computed(() =>
    ACCESSORIES.reduce((sum, a) => sum + a.priceEur * (this.quantities()[a.id] ?? 0), 0),
  );
  readonly vat = computed(() => Math.round(this.subtotal() * VAT_RATE));
  readonly total = computed(() => this.subtotal() + this.vat());

  /** What the effect saw on each run — shown live so the side effect is visible. */
  readonly effectLog = signal<readonly number[]>([]);
  private readonly logEffect = effect(() => {
    const count = this.count();
    untracked(() => {
      this.effectLog.update((log) => [count, ...log].slice(0, 4));
    });
  });

  qty(id: string): number {
    return this.quantities()[id] ?? 0;
  }

  add(id: string): void {
    this.quantities.update((q) => ({ ...q, [id]: (q[id] ?? 0) + 1 }));
  }

  remove(id: string): void {
    this.quantities.update((q) => ({ ...q, [id]: Math.max(0, (q[id] ?? 0) - 1) }));
  }

  clear(): void {
    this.quantities.set({});
  }
}
