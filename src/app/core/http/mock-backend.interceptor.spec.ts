import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import countries from '../../../../public/mock-api/countries.json';
import dealers from '../../../../public/mock-api/dealers.json';
import vehicles from '../../../../public/mock-api/vehicles.json';
import type { Dealer, TestDriveConfirmation, Vehicle } from '../models/vehicle';
import { MOCK_BACKEND_CONFIG } from './mock-backend.interceptor';
import { provideAppHttp } from './provide-http';

describe('mockBackendInterceptor (full interceptor chain)', () => {
  let http: HttpClient;
  let ctrl: HttpTestingController;

  function setup(enabled = true) {
    TestBed.configureTestingModule({
      providers: [
        provideAppHttp(),
        provideHttpClientTesting(),
        { provide: MOCK_BACKEND_CONFIG, useValue: { latencyMs: 0, enabled } },
      ],
    });
    http = TestBed.inject(HttpClient);
    ctrl = TestBed.inject(HttpTestingController);
  }

  async function expectProblem(promise: Promise<unknown>, status: number) {
    const error = (await promise.catch((e: unknown) => e)) as HttpErrorResponse;
    expect(error).toBeInstanceOf(HttpErrorResponse);
    expect(error.status).toBe(status);
    return error;
  }

  it('serves and filters vehicles by query and fuel', async () => {
    setup();
    const result = firstValueFrom(
      http.get<Vehicle[]>('api/vehicles', { params: { q: 'bmw', fuel: 'electric' } }),
    );
    ctrl.expectOne('mock-api/vehicles.json').flush(vehicles);
    expect((await result).map((v) => v.id)).toEqual(['bmw-i4']);
  });

  it('simulates an empty response', async () => {
    setup();
    const result = firstValueFrom(
      http.get<Vehicle[]>('api/vehicles', { params: { simulate: 'empty' } }),
    );
    ctrl.expectOne('mock-api/vehicles.json').flush(vehicles);
    expect(await result).toEqual([]);
  });

  it('simulates a 503 as Problem Details', async () => {
    setup();
    const error = await expectProblem(
      firstValueFrom(http.get('api/vehicles', { params: { simulate: 'error' } })),
      503,
    );
    expect(error.error).toEqual(expect.objectContaining({ title: 'Service unavailable' }));
  });

  it('returns a single vehicle or a 404', async () => {
    setup();
    const found = firstValueFrom(http.get<Vehicle>('api/vehicles/audi-q4'));
    ctrl.expectOne('mock-api/vehicles.json').flush(vehicles);
    expect((await found).model).toBe('Q4 e-tron');

    const missing = firstValueFrom(http.get('api/vehicles/nope'));
    ctrl.expectOne('mock-api/vehicles.json').flush(vehicles);
    await expectProblem(missing, 404);
  });

  it('serves countries and dealers filtered by city', async () => {
    setup();
    const c = firstValueFrom(http.get<unknown[]>('api/countries'));
    ctrl.expectOne('mock-api/countries.json').flush(countries);
    expect(await c).toHaveLength(3);

    const d = firstValueFrom(http.get<Dealer[]>('api/dealers', { params: { cityId: 'vie' } }));
    ctrl.expectOne('mock-api/dealers.json').flush(dealers);
    expect((await d).every((dealer) => dealer.cityId === 'vie')).toBe(true);

    const all = firstValueFrom(http.get<Dealer[]>('api/dealers'));
    ctrl.expectOne('mock-api/dealers.json').flush(dealers);
    expect(await all).toHaveLength(dealers.length);
  });

  it('accepts test-drive bookings and rejects blocked domains with field errors', async () => {
    setup();
    const body = {
      fullName: 'A',
      email: 'a@b.de',
      vehicleId: 'vw-id3',
      date: '2026-11-02',
      consent: true,
    };
    const ok = await firstValueFrom(http.post<TestDriveConfirmation>('api/test-drives', body));
    expect(ok.reference).toBe('TD-VW-ID3-20261102');

    const error = await expectProblem(
      firstValueFrom(http.post('api/test-drives', { ...body, email: 'x@blocked.test' })),
      422,
    );
    expect(error.error).toEqual(expect.objectContaining({ errors: { email: expect.any(Array) } }));
  });

  it('answers unknown routes with 404', async () => {
    setup();
    await expectProblem(firstValueFrom(http.delete('api/vehicles')), 404);
  });

  it('passes requests through when disabled', () => {
    setup(false);
    http.get('api/vehicles').subscribe();
    ctrl.expectOne('/api/vehicles').flush([]);
  });
});
