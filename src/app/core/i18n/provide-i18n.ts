import {
  type EnvironmentProviders,
  type Provider,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { LanguageService } from './language.service';

export function provideI18n(): (Provider | EnvironmentProviders)[] {
  return [
    provideTranslateService({
      // HttpBackend bypasses the app interceptors: translations never toggle the loading bar.
      loader: provideTranslateHttpLoader({
        prefix: 'i18n/',
        suffix: '.json',
        useHttpBackend: true,
      }),
      fallbackLang: 'en',
    }),
    makeEnvironmentProviders([
      provideAppInitializer(() => {
        const language = inject(LanguageService);
        return language.use(language.initialLanguage());
      }),
    ]),
  ];
}
