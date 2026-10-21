import { Component, computed, inject } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MenuButton, type MenuOption } from '@shared/ui/menu/menu-button';
import { LanguageService, isLanguage } from '../i18n/language.service';

const NATIVE_NAMES = { en: 'English', es: 'Español', de: 'Deutsch' } as const;

@Component({
  selector: 'app-language-switcher',
  imports: [MenuButton, TranslatePipe],
  template: `
    <app-menu-button
      [options]="options"
      [current]="language.current()"
      [triggerText]="language.current().toUpperCase()"
      [ariaLabel]="'layout.changeLanguage' | translate: { lang: currentName() }"
      (selected)="select($event)"
    />
  `,
})
export class LanguageSwitcher {
  protected readonly language = inject(LanguageService);
  private readonly translate = inject(TranslateService);

  // Each language is labelled in its own language (and tagged with lang) — WCAG 3.1.2.
  protected readonly options: readonly MenuOption[] = this.language.languages.map((lang) => ({
    value: lang,
    label: NATIVE_NAMES[lang],
    lang,
  }));
  protected readonly currentName = computed(() => NATIVE_NAMES[this.language.current()]);

  protected select(value: string): void {
    if (isLanguage(value)) {
      this.language.use(value).subscribe();
    }
  }
}
