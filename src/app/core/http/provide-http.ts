import { provideHttpClient, withInterceptors } from '@angular/common/http';
import type { EnvironmentProviders } from '@angular/core';
import { apiBaseUrlInterceptor } from './api-base-url.interceptor';
import { errorInterceptor } from './error.interceptor';
import { loadingInterceptor } from './loading.interceptor';
import { mockBackendInterceptor } from './mock-backend.interceptor';

/** Order matters: requests flow top → bottom, responses bottom → top. */
export const APP_INTERCEPTORS = [
  apiBaseUrlInterceptor,
  loadingInterceptor,
  errorInterceptor,
  mockBackendInterceptor,
];

export function provideAppHttp(): EnvironmentProviders {
  // FetchBackend is the default HttpBackend since v21 — no withFetch() needed.
  return provideHttpClient(withInterceptors(APP_INTERCEPTORS));
}
