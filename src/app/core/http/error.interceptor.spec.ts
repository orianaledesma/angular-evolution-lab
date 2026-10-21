import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { errorInterceptor, toProblemDetails } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let ctrl: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    ctrl = TestBed.inject(HttpTestingController);
  });

  function failWith(body: object | string, status: number, statusText: string) {
    let received: HttpErrorResponse | undefined;
    http.get('/x').subscribe({ error: (e: HttpErrorResponse) => (received = e) });
    ctrl.expectOne('/x').flush(body, { status, statusText });
    return received!;
  }

  it('passes through a Problem Details body unchanged', () => {
    const problem = { type: 't', title: 'Validation failed', status: 422, detail: 'bad' };
    expect(failWith(problem, 422, 'Unprocessable').error).toEqual(problem);
  });

  it('maps a plain error into Problem Details', () => {
    const error = failWith('boom', 500, 'Server Error');
    expect(error.status).toBe(500);
    expect(error.error).toEqual(
      expect.objectContaining({ title: 'Internal server error', status: 500, type: 'about:blank' }),
    );
  });

  it('maps network failures (status 0)', () => {
    let received: HttpErrorResponse | undefined;
    http.get('/x').subscribe({ error: (e: HttpErrorResponse) => (received = e) });
    ctrl.expectOne('/x').error(new ProgressEvent('error'));
    expect(received?.error).toEqual(expect.objectContaining({ title: 'Network error', status: 0 }));
  });
});

describe('toProblemDetails', () => {
  it('handles non-HTTP errors', () => {
    expect(toProblemDetails(new Error('nope'))).toEqual(
      expect.objectContaining({ title: 'Unexpected error', detail: 'nope', status: -1 }),
    );
    expect(toProblemDetails('raw').detail).toBe('raw');
  });

  it('falls back to a generic title for unknown statuses', () => {
    const problem = toProblemDetails(new HttpErrorResponse({ status: 418 }));
    expect(problem).toEqual(expect.objectContaining({ title: 'Request failed', status: 418 }));
  });
});
