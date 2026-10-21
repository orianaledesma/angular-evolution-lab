import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { VehicleApi } from '@core/api/vehicle-api';
import { LanguageService } from '@core/i18n/language.service';
import type { FuelType } from '@core/models/vehicle';
import { EurPipe } from '@shared/pipes/eur.pipe';
import { Badge } from '@shared/ui/badge/badge';
import { Button } from '@shared/ui/button/button';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { RX_RESOURCE } from './snippets';

export const FUELS: readonly FuelType[] = ['electric', 'hybrid', 'petrol', 'diesel'];

@Component({
  selector: 'app-rx-resource-demo',
  imports: [TranslatePipe, Card, CodeCompare, Button, Badge, EurPipe],
  templateUrl: './rx-resource-demo.html',
})
export class RxResourceDemo {
  private readonly api = inject(VehicleApi);
  protected readonly lang = inject(LanguageService).current;
  protected readonly snippets = RX_RESOURCE;
  protected readonly fuels = FUELS;

  readonly fuel = signal<FuelType>('electric');
  readonly failNext = signal(false);

  readonly vehicles = rxResource({
    params: () => ({
      fuel: this.fuel(),
      simulate: this.failNext() ? ('error' as const) : ('' as const),
    }),
    stream: ({ params }) => this.api.search(params),
  });
}
