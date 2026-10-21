import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SKIP_LOADING, loadingInterceptor } from './loading.interceptor';
import { LoadingService } from './loading.service';

describe('loadingInterceptor', () => {
  let http: HttpClient;
  let ctrl: HttpTestingController;
  let loading: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    ctrl = TestBed.inject(HttpTestingController);
    loading = TestBed.inject(LoadingService);
  });

  it('tracks concurrent requests in a global signal', () => {
    http.get('/a').subscribe();
    http.get('/b').subscribe();
    expect(loading.inFlight()).toBe(2);
    expect(loading.isLoading()).toBe(true);

    ctrl.expectOne('/a').flush({});
    expect(loading.inFlight()).toBe(1);
    ctrl.expectOne('/b').flush('x', { status: 500, statusText: 'err' });
    expect(loading.isLoading()).toBe(false);
  });

  it('ignores requests marked with SKIP_LOADING', () => {
    http.get('/bg', { context: new HttpContext().set(SKIP_LOADING, true) }).subscribe();
    expect(loading.isLoading()).toBe(false);
    ctrl.expectOne('/bg').flush({});
  });

  it('never goes below zero', () => {
    loading.stop();
    expect(loading.inFlight()).toBe(0);
  });
});
