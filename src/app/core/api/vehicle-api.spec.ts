import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { VehicleApi } from './vehicle-api';

describe('VehicleApi', () => {
  let api: VehicleApi;
  let ctrl: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(VehicleApi);
    ctrl = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    ctrl.verify();
  });

  it('drops empty query params', () => {
    api.search({ q: 'id', fuel: '', simulate: '' }).subscribe();
    const req = ctrl.expectOne((r) => r.url === 'api/vehicles');
    expect(req.request.params.keys()).toEqual(['q']);
    req.flush([]);
  });

  it('builds resource URLs', () => {
    api.byId('vw id3').subscribe();
    ctrl.expectOne('api/vehicles/vw%20id3').flush({});
    api.countries().subscribe();
    ctrl.expectOne('api/countries').flush([]);
    api.dealers('muc').subscribe();
    ctrl.expectOne('api/dealers?cityId=muc').flush([]);
    api.search().subscribe();
    ctrl.expectOne('api/vehicles').flush([]);
  });

  it('posts test-drive bookings', () => {
    const body = {
      fullName: 'A',
      email: 'a@b.de',
      vehicleId: 'x',
      date: '2026-01-01',
      consent: true,
    };
    api.bookTestDrive(body).subscribe();
    const req = ctrl.expectOne('api/test-drives');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ ...body, reference: 'R' });
  });
});
