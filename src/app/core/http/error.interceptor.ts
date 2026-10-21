import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ProblemDetails, isProblemDetails } from '../models/problem-details';

const STATUS_TITLES: Readonly<Record<number, string>> = {
  400: 'Bad request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not found',
  409: 'Conflict',
  422: 'Validation failed',
  429: 'Too many requests',
  500: 'Internal server error',
  502: 'Bad gateway',
  503: 'Service unavailable',
  504: 'Gateway timeout',
};

export function toProblemDetails(error: unknown): ProblemDetails {
  if (error instanceof HttpErrorResponse) {
    if (isProblemDetails(error.error)) {
      return error.error;
    }
    if (error.status === 0) {
      return {
        type: 'about:blank#network',
        title: 'Network error',
        status: 0,
        detail: 'The server could not be reached.',
      };
    }
    return {
      type: 'about:blank',
      title: STATUS_TITLES[error.status] ?? 'Request failed',
      status: error.status,
      detail: error.message,
    };
  }
  return {
    type: 'about:blank#unexpected',
    title: 'Unexpected error',
    status: -1,
    detail: error instanceof Error ? error.message : String(error),
  };
}

/** Normalises every HTTP failure into RFC 9457 Problem Details, wrapped in an HttpErrorResponse. */
export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: unknown) => {
      const problem = toProblemDetails(error);
      return throwError(
        () =>
          new HttpErrorResponse({
            error: problem,
            status: problem.status,
            statusText: problem.title,
            url: req.url,
          }),
      );
    }),
  );
