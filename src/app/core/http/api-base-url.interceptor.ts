import { HttpInterceptorFn } from '@angular/common/http';
import { InjectionToken, inject } from '@angular/core';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => '/api',
});

/** Services request `api/...`; this interceptor resolves it against the configured base URL. */
export const apiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('api/')) {
    return next(req);
  }
  const base = inject(API_BASE_URL).replace(/\/$/, '');
  return next(req.clone({ url: `${base}/${req.url.slice('api/'.length)}` }));
};
