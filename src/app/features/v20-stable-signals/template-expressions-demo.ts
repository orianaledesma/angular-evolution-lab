import { Component, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '@core/i18n/language.service';
import { EurPipe } from '@shared/pipes/eur.pipe';
import { Button } from '@shared/ui/button/button';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { EXPRESSIONS } from './snippets';

export const EQUIPMENT_OPTIONS = ['heatPump', 'towBar', 'matrixLed'] as const;
export type Equipment = Partial<Record<(typeof EQUIPMENT_OPTIONS)[number], true>>;

@Component({
  selector: 'app-template-expressions-demo',
  imports: [TranslatePipe, Card, CodeCompare, EurPipe, Button],
  templateUrl: './template-expressions-demo.html',
})
export class TemplateExpressionsDemo {
  protected readonly lang = inject(LanguageService).current;
  protected readonly snippets = EXPRESSIONS;
  protected readonly options = EQUIPMENT_OPTIONS;

  readonly brand = signal('Volkswagen');
  readonly model = signal('ID.7 Tourer');
  readonly price = signal(54995);
  readonly depreciation = signal(0.15);
  readonly years = signal(3);
  readonly equipment = signal<Equipment>({ heatPump: true });
  readonly saves = signal(0);

  toggle(option: (typeof EQUIPMENT_OPTIONS)[number]): void {
    this.equipment.update((current) =>
      Object.fromEntries(
        option in current
          ? Object.entries(current).filter(([key]) => key !== option)
          : [...Object.entries(current), [option, true]],
      ),
    );
  }

  /** Returns a value on purpose: `void save()` in the template discards it. */
  save(): number {
    this.saves.update((n) => n + 1);
    return this.saves();
  }

  protected setYears(event: Event): void {
    this.years.set(Number((event.target as HTMLInputElement).value));
  }
}
