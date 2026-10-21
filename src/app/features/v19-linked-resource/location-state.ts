import { Injectable, computed, inject, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { VehicleApi } from '@core/api/vehicle-api';
import type { Country } from '@core/models/vehicle';

export type CountryCode = Country['code'];

/** Page-scoped state shared by the linkedSignal and resource demos. */
@Injectable()
export class LocationState {
  private readonly api = inject(VehicleApi);

  readonly countries = rxResource({ stream: () => this.api.countries(), defaultValue: [] });
  readonly country = signal<CountryCode>('DE');
  readonly cities = computed(
    () => this.countries.value().find((c) => c.code === this.country())?.cities ?? [],
  );
  readonly city = linkedSignal<readonly { id: string }[], string | undefined>({
    source: this.cities,
    computation: (cities, previous) => {
      const kept =
        previous && cities.some((c) => c.id === previous.value) ? previous.value : undefined;
      return kept ?? cities[0]?.id;
    },
  });

  readonly cityName = computed(() => this.cities().find((c) => c.id === this.city())?.name);
}
