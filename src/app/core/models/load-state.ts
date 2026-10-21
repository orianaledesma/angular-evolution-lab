import type { ProblemDetails } from './problem-details';

/** Loading state as a discriminated union: impossible states are unrepresentable. */
export type LoadState<T> =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'success'; readonly data: T }
  | { readonly status: 'error'; readonly error: ProblemDetails };

export const idle = <T>(): LoadState<T> => ({ status: 'idle' });
export const loading = <T>(): LoadState<T> => ({ status: 'loading' });
export const success = <T>(data: T): LoadState<T> => ({ status: 'success', data });
export const failure = <T>(error: ProblemDetails): LoadState<T> => ({ status: 'error', error });
