import { type ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideAppHttp } from './core/http/provide-http';
import { provideI18n } from './core/i18n/provide-i18n';
import { routes } from './app.routes';

// No provideZoneChangeDetection and no zone.js: Angular 22 is zoneless by default.
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions({ skipInitialTransition: true }),
    ),
    provideAppHttp(),
    provideI18n(),
  ],
};
