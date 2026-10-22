import { HttpBackend, HttpResponse, type HttpRequest } from '@angular/common/http';
import type { Provider } from '@angular/core';
import { of } from 'rxjs';
import countries from '../../public/mock-api/countries.json';
import dealers from '../../public/mock-api/dealers.json';
import vehicles from '../../public/mock-api/vehicles.json';

const FILES: Record<string, unknown> = {
  'mock-api/vehicles.json': vehicles,
  'mock-api/countries.json': countries,
  'mock-api/dealers.json': dealers,
};

/**
 * Answers the mock backend's static JSON requests synchronously, so components using
 * httpResource/resource can be rendered (and awaited with whenStable) without a pending request.
 */
export function provideStaticBackend(): Provider {
  return {
    provide: HttpBackend,
    useValue: {
      handle: (req: HttpRequest<unknown>) =>
        of(
          new HttpResponse({
            status: FILES[req.url] ? 200 : 404,
            body: FILES[req.url] ?? null,
            url: req.url,
          }),
        ),
    },
  };
}
