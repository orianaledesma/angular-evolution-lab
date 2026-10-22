import type { EnvironmentProviders, Provider } from '@angular/core';
import { type TranslationObject, provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import de from '../../public/i18n/de.json';
import en from '../../public/i18n/en.json';
import es from '../../public/i18n/es.json';
import lt from '../../public/i18n/lt.json';

export const TRANSLATIONS: Record<string, TranslationObject> = { en, es, de, lt };

/** Real translation files, loaded synchronously — tests query by the same text users see. */
export function provideTranslateTesting(lang = 'en'): (Provider | EnvironmentProviders)[] {
  return [
    provideTranslateService({
      loader: () => ({ getTranslation: (l: string) => of(TRANSLATIONS[l] ?? {}) }),
      lang,
      fallbackLang: 'en',
    }),
  ];
}
