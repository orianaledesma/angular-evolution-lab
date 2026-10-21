import { Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { VehicleApi } from '@core/api/vehicle-api';
import { type LoadState, failure, idle, loading, success } from '@core/models/load-state';
import { toProblemDetails } from '@core/http/error.interceptor';
import type { Vehicle } from '@core/models/vehicle';
import { Badge } from '@shared/ui/badge/badge';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { SEARCH } from './snippets';

export const SEARCH_DEBOUNCE_MS = 300;

@Component({
  selector: 'app-search-demo',
  imports: [TranslatePipe, Card, CodeCompare, Badge],
  templateUrl: './search-demo.html',
})
export class SearchDemo {
  private readonly api = inject(VehicleApi);
  protected readonly snippets = SEARCH;

  readonly query = signal('');
  readonly requests = signal(0);
  readonly cancelled = signal(0);

  // Signals in, RxJS for the time-based part, signal out. toSignal unsubscribes on destroy.
  readonly state = toSignal(
    toObservable(this.query).pipe(
      debounceTime(SEARCH_DEBOUNCE_MS),
      map((q) => q.trim()),
      distinctUntilChanged(),
      switchMap((q) => {
        if (!q) {
          return of(idle<Vehicle[]>());
        }
        this.requests.update((n) => n + 1);
        let completed = false;
        return this.api.search({ q }).pipe(
          map((vehicles) => success(vehicles)),
          catchError((error: unknown) => of(failure<Vehicle[]>(toProblemDetails(error)))),
          tap({ complete: () => (completed = true) }),
          // switchMap unsubscribes the stale request: count it to make cancellation visible.
          finalize(() => {
            if (!completed) {
              this.cancelled.update((n) => n + 1);
            }
          }),
          startWith(loading<Vehicle[]>()),
        );
      }),
    ),
    { initialValue: idle<Vehicle[]>() satisfies LoadState<Vehicle[]> },
  );

  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
}
