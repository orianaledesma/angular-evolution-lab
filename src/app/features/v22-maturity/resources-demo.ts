import { httpResource } from '@angular/common/http';
import { Component, computed, debounced, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { toProblemDetails } from '@core/http/error.interceptor';
import { LanguageService } from '@core/i18n/language.service';
import type { Vehicle } from '@core/models/vehicle';
import { EurPipe } from '@shared/pipes/eur.pipe';
import { Badge } from '@shared/ui/badge/badge';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { RESOURCES } from './snippets';

export const DEBOUNCE_MS = 300;

@Component({
  selector: 'app-resources-demo',
  imports: [TranslatePipe, Card, CodeCompare, Badge, EurPipe],
  templateUrl: './resources-demo.html',
})
export class ResourcesDemo {
  protected readonly lang = inject(LanguageService).current;
  protected readonly snippets = RESOURCES;

  readonly query = signal('');
  /** v22 (experimental): a Resource that settles DEBOUNCE_MS after the last change. */
  readonly term = debounced(() => this.query().trim(), DEBOUNCE_MS);

  readonly results = httpResource<Vehicle[]>(
    () => {
      const q = this.term.value();
      return q ? { url: 'api/vehicles', params: { q } } : undefined;
    },
    { defaultValue: [] },
  );

  /** chain(): only requests once `results` resolved, and mirrors its loading/error status. */
  readonly top = httpResource<Vehicle>(({ chain }) => {
    const [first] = chain(this.results);
    return first ? `api/vehicles/${first.id}` : undefined;
  });

  readonly problem = computed(() => {
    const error = this.results.error();
    return error ? toProblemDetails(error) : null;
  });

  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
}
