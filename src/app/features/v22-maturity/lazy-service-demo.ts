import { httpResource } from '@angular/common/http';
import { Component, injectAsync, onIdle, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import type { Vehicle } from '@core/models/vehicle';
import { Badge } from '@shared/ui/badge/badge';
import { Button } from '@shared/ui/button/button';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { LAZY_SERVICE } from './snippets';

export type ExportState = 'idle' | 'loading' | 'ready';

@Component({
  selector: 'app-lazy-service-demo',
  imports: [TranslatePipe, Card, CodeCompare, Button, Badge],
  templateUrl: './lazy-service-demo.html',
})
export class LazyServiceDemo {
  protected readonly snippets = LAZY_SERVICE;

  /** The CSV service chunk is prefetched when the browser is idle (at most 4 s), or on first click. */
  private readonly csv = injectAsync(() => import('./csv-export.service'), {
    prefetch: () => onIdle({ timeout: 4000 }),
  });

  private readonly vehicles = httpResource<Vehicle[]>(() => 'api/vehicles', { defaultValue: [] });

  readonly state = signal<ExportState>('idle');
  readonly resolveMs = signal<number | null>(null);
  readonly preview = signal('');
  readonly downloaded = signal(false);

  async exportCsv(): Promise<void> {
    this.state.set('loading');
    const start = performance.now();
    const service = await this.csv();
    this.resolveMs.set(Math.round(performance.now() - start));
    const csv = service.toCsv(this.vehicles.hasValue() ? this.vehicles.value() : []);
    this.preview.set(csv.split('\n').slice(0, 6).join('\n'));
    this.downloaded.set(service.download('vehicle-stock.csv', csv));
    this.state.set('ready');
  }
}
