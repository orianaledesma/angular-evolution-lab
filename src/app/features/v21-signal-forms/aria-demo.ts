import { Component, computed, inject, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '@core/i18n/language.service';
import { EurPipe } from '@shared/pipes/eur.pipe';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { Listbox } from '@shared/ui/listbox/listbox';
import { MenuButton } from '@shared/ui/menu/menu-button';
import { TabPanelDef, Tabs } from '@shared/ui/tabs/tabs';
import { ARIA } from './snippets';

export const TRIMS = [
  { value: 'pure', priceEur: 39995 },
  { value: 'pro', priceEur: 44995 },
  { value: 'gtx', priceEur: 52995 },
] as const;

export const EXPORT_FORMATS = ['pdf', 'csv', 'ical'] as const;

@Component({
  selector: 'app-aria-demo',
  imports: [TranslatePipe, Card, CodeCompare, Tabs, TabPanelDef, Listbox, MenuButton, EurPipe],
  templateUrl: './aria-demo.html',
})
export class AriaDemo {
  private readonly translate = inject(TranslateService);
  protected readonly lang = inject(LanguageService).current;
  protected readonly snippets = ARIA;

  readonly tab = signal<string | undefined>('overview');
  readonly trim = signal<string | undefined>('pro');
  readonly lastExport = signal<string | null>(null);

  protected readonly trimOptions = computed(() => {
    this.lang();
    return TRIMS.map((t) => ({
      value: t.value,
      label: this.translate.instant(`v21.aria.trims.${t.value}`) as string,
    }));
  });
  protected readonly exportOptions = computed(() => {
    this.lang();
    return EXPORT_FORMATS.map((f) => ({
      value: f,
      label: this.translate.instant(`v21.aria.formats.${f}`) as string,
    }));
  });
  protected readonly trimPrice = computed(
    () => TRIMS.find((t) => t.value === this.trim())?.priceEur ?? 0,
  );
}
