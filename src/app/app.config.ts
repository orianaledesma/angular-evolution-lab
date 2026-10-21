import { type ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  TitleStrategy,
  provideRouter,
  withAutoCleanupInjectors,
  withComponentInputBinding,
  withViewTransitions,
} from '@angular/router';
import { provideAppHttp } from './core/http/provide-http';
import { provideI18n } from './core/i18n/provide-i18n';
import { TranslatedTitleStrategy } from './core/i18n/translated-title-strategy';
import { routes } from './app.routes';

// No provideZoneChangeDetection and no zone.js: Angular 22 is zoneless by default.
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions({ skipInitialTransition: true }),
      // v21 experimental, stable as withAutoCleanupInjectors() in 22.2: see the v21 demo.
      withAutoCleanupInjectors(),
    ),
    provideAppHttp(),
    provideI18n(),
    { provide: TitleStrategy, useClass: TranslatedTitleStrategy },
  ],
};
