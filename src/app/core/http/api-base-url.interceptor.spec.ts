import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL, apiBaseUrlInterceptor } from './api-base-url.interceptor';

describe('apiBaseUrlInterceptor', () => {
  function setup(base?: string) {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiBaseUrlInterceptor])),
        provideHttpClientTesting(),
        ...(base ? [{ provide: API_BASE_URL, useValue: base }] : []),
      ],
    });
    return { http: TestBed.inject(HttpClient), ctrl: TestBed.inject(HttpTestingController) };
  }

  it('prefixes api/ requests with the default base URL', () => {
    const { http, ctrl } = setup();
    http.get('api/vehicles').subscribe();
    ctrl.expectOne('/api/vehicles').flush([]);
    ctrl.verify();
  });

  it('uses a configured base URL and tolerates a trailing slash', () => {
    const { http, ctrl } = setup('https://api.example.com/v1/');
    http.get('api/vehicles').subscribe();
    ctrl.expectOne('https://api.example.com/v1/vehicles').flush([]);
  });

  it('leaves other URLs untouched', () => {
    const { http, ctrl } = setup();
    http.get('/i18n/en.json').subscribe();
    ctrl.expectOne('/i18n/en.json').flush({});
  });
});
