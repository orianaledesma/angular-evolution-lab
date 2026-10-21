import { Component, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '@core/i18n/language.service';
import { EurPipe } from '@shared/pipes/eur.pipe';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { LET } from './snippets';

export const TERMS = [24, 36, 48] as const;

@Component({
  selector: 'app-let-demo',
  imports: [TranslatePipe, Card, CodeCompare, EurPipe],
  templateUrl: './let-demo.html',
})
export class LetDemo {
  protected readonly lang = inject(LanguageService).current;
  protected readonly snippets = LET;
  protected readonly terms = TERMS;
  readonly price = signal(48900);
  readonly deposit = signal(5000);
  readonly months = signal<number>(36);
  readonly apr = signal(3.9);

  protected setNumber(target: 'price' | 'deposit', event: Event): void {
    this[target].set(Number((event.target as HTMLInputElement).value));
  }

  protected setMonths(event: Event): void {
    this.months.set(Number((event.target as HTMLSelectElement).value));
  }
}
