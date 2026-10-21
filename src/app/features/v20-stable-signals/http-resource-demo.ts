import { httpResource } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { toProblemDetails } from '@core/http/error.interceptor';
import { LanguageService } from '@core/i18n/language.service';
import type { Vehicle } from '@core/models/vehicle';
import { EurPipe } from '@shared/pipes/eur.pipe';
import { Badge } from '@shared/ui/badge/badge';
import { Button } from '@shared/ui/button/button';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { HTTP_RESOURCE } from './snippets';

export const SCENARIOS = ['normal', 'empty', 'error', 'slow'] as const;
export type Scenario = (typeof SCENARIOS)[number];

@Component({
  selector: 'app-http-resource-demo',
  imports: [TranslatePipe, Card, CodeCompare, Button, Badge, EurPipe],
  templateUrl: './http-resource-demo.html',
})
export class HttpResourceDemo {
  protected readonly lang = inject(LanguageService).current;
  protected readonly snippets = HTTP_RESOURCE;
  protected readonly scenarios = SCENARIOS;
  readonly scenario = signal<Scenario>('normal');

  // Goes through HttpClient, so the whole interceptor chain applies.
  readonly vehicles = httpResource<Vehicle[]>(
    () => {
      const scenario = this.scenario();
      const params: Record<string, string> = scenario === 'normal' ? {} : { simulate: scenario };
      return { url: 'api/vehicles', params };
    },
    { defaultValue: [] },
  );

  readonly problem = computed(() => {
    const error = this.vehicles.error();
    return error ? toProblemDetails(error) : null;
  });
}
