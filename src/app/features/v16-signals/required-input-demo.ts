import { Component, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { PriceTag } from './price-tag';
import { REQUIRED_INPUT } from './snippets';

@Component({
  selector: 'app-required-input-demo',
  imports: [TranslatePipe, Card, CodeCompare, PriceTag],
  templateUrl: './required-input-demo.html',
})
export class RequiredInputDemo {
  protected readonly snippets = REQUIRED_INPUT;
  // Kept as strings on purpose: the transforms on PriceTag turn them into numbers/booleans.
  readonly power = signal('150');
  readonly discounted = signal(false);

  protected onPower(event: Event): void {
    this.power.set((event.target as HTMLInputElement).value);
  }

  protected onDiscount(event: Event): void {
    this.discounted.set((event.target as HTMLInputElement).checked);
  }
}
