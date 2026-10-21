import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpParams,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { InjectionToken, inject } from '@angular/core';
import { Observable, delay, map, mergeMap, of, throwError, timer } from 'rxjs';
import type { ProblemDetails } from '../models/problem-details';
import type { Dealer, TestDriveRequest, Vehicle } from '../models/vehicle';
import { API_BASE_URL } from './api-base-url.interceptor';

export interface MockBackendConfig {
  readonly latencyMs: number;
  readonly enabled: boolean;
}

export const MOCK_BACKEND_CONFIG = new InjectionToken<MockBackendConfig>('MOCK_BACKEND_CONFIG', {
  providedIn: 'root',
  factory: () => ({ latencyMs: 450, enabled: true }),
});

const problem = (
  status: number,
  title: string,
  detail: string,
  extra: Partial<ProblemDetails> = {},
) =>
  new HttpErrorResponse({
    status,
    statusText: title,
    error: {
      type: `https://evolution-lab.dev/problems/${String(status)}`,
      title,
      status,
      detail,
      ...extra,
    },
  });

function serveJson<T>(
  req: HttpRequest<unknown>,
  file: string,
  next: (r: HttpRequest<unknown>) => Observable<unknown>,
): Observable<T> {
  return next(
    req.clone({ url: `/mock-api/${file}.json`, method: 'GET', params: new HttpParams() }),
  ).pipe(mergeMap((event) => (event instanceof HttpResponse ? of(event.body as T) : [])));
}

/**
 * In-memory backend for the demos: serves `public/mock-api/*.json` under `${API_BASE_URL}`
 * with simulated latency. `?simulate=error|empty|slow` forces the corresponding scenario.
 */
export const mockBackendInterceptor: HttpInterceptorFn = (req, next) => {
  const config = inject(MOCK_BACKEND_CONFIG);
  const base = inject(API_BASE_URL).replace(/\/$/, '');
  if (!config.enabled || !req.url.startsWith(`${base}/`)) {
    return next(req);
  }

  const path = req.url.slice(base.length + 1);
  const simulate = req.params.get('simulate');
  const latency = simulate === 'slow' ? config.latencyMs * 4 : config.latencyMs;

  if (simulate === 'error') {
    return timer(latency).pipe(
      mergeMap(() =>
        throwError(() =>
          problem(503, 'Service unavailable', 'The vehicle service is temporarily down.'),
        ),
      ),
    );
  }

  const respond = <T>(body$: Observable<T>) =>
    body$.pipe(
      map((body) => new HttpResponse<T>({ status: 200, body, url: req.url })),
      delay(latency),
    );

  if (req.method === 'GET' && path === 'vehicles') {
    const q = (req.params.get('q') ?? '').trim().toLowerCase();
    const fuel = req.params.get('fuel');
    return respond(
      serveJson<Vehicle[]>(req, 'vehicles', next).pipe(
        map((vehicles) =>
          simulate === 'empty'
            ? []
            : vehicles.filter(
                (v) =>
                  (!q || `${v.brand} ${v.model}`.toLowerCase().includes(q)) &&
                  (!fuel || v.fuel === fuel),
              ),
        ),
      ),
    );
  }

  const vehicleMatch = /^vehicles\/([\w-]+)$/.exec(path);
  if (req.method === 'GET' && vehicleMatch) {
    const id = vehicleMatch[1];
    return serveJson<Vehicle[]>(req, 'vehicles', next).pipe(
      mergeMap((vehicles) => {
        const vehicle = vehicles.find((v) => v.id === id);
        return vehicle
          ? of(new HttpResponse({ status: 200, body: vehicle, url: req.url }))
          : throwError(() => problem(404, 'Not found', `Vehicle ${String(id)} does not exist.`));
      }),
      delay(latency),
    );
  }

  if (req.method === 'GET' && path === 'countries') {
    return respond(serveJson(req, 'countries', next));
  }

  if (req.method === 'GET' && path === 'dealers') {
    const cityId = req.params.get('cityId');
    return respond(
      serveJson<Dealer[]>(req, 'dealers', next).pipe(
        map((dealers) => (cityId ? dealers.filter((d) => d.cityId === cityId) : dealers)),
      ),
    );
  }

  if (req.method === 'POST' && path === 'test-drives') {
    const body = req.body as TestDriveRequest;
    if (body.email.endsWith('@blocked.test')) {
      return timer(latency).pipe(
        mergeMap(() =>
          throwError(() =>
            problem(422, 'Validation failed', 'The request contains invalid fields.', {
              errors: { email: ['This e-mail domain is not accepted.'] },
            }),
          ),
        ),
      );
    }
    return of(
      new HttpResponse({
        status: 201,
        body: {
          ...body,
          reference: `TD-${body.vehicleId.toUpperCase()}-${body.date.replaceAll('-', '')}`,
        },
        url: req.url,
      }),
    ).pipe(delay(latency));
  }

  return timer(latency).pipe(
    mergeMap(() =>
      throwError(() => problem(404, 'Not found', `No mock route for ${req.method} ${path}.`)),
    ),
  );
};
