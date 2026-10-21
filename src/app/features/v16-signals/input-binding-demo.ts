import { Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { type Observable, catchError, map, of, startWith, switchMap } from 'rxjs';
import { VehicleApi } from '@core/api/vehicle-api';
import { toProblemDetails } from '@core/http/error.interceptor';
import { LanguageService } from '@core/i18n/language.service';
import { type LoadState, failure, idle, loading, success } from '@core/models/load-state';
import type { Vehicle } from '@core/models/vehicle';
import { EurPipe } from '@shared/pipes/eur.pipe';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { INPUT_BINDING } from './snippets';

export const FEATURED_VEHICLES = ['vw-id3', 'bmw-i4', 'porsche-taycan', 'nope'] as const;

@Component({
  selector: 'app-input-binding-demo',
  imports: [TranslatePipe, Card, CodeCompare, RouterLink, EurPipe],
  templateUrl: './input-binding-demo.html',
})
export class InputBindingDemo {
  private readonly api = inject(VehicleApi);
  protected readonly lang = inject(LanguageService).current;
  protected readonly snippets = INPUT_BINDING;
  protected readonly featured = FEATURED_VEHICLES;

  /** Comes from `?vehicle=` through the page component (withComponentInputBinding). */
  readonly vehicleId = input<string>();

  readonly vehicle = toSignal(
    toObservable(this.vehicleId).pipe(
      switchMap((id) => (id ? this.load(id) : of(idle<Vehicle>()))),
    ),
    { initialValue: idle<Vehicle>() },
  );

  private load(id: string): Observable<LoadState<Vehicle>> {
    return this.api.byId(id).pipe(
      map((v): LoadState<Vehicle> => success(v)),
      catchError((error: unknown) => of(failure<Vehicle>(toProblemDetails(error)))),
      startWith(loading<Vehicle>()),
    );
  }
}
