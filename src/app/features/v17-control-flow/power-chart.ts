import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { VehicleApi } from '@core/api/vehicle-api';
import type { Vehicle } from '@core/models/vehicle';
import { uniqueId } from '@shared/unique-id';

/** Deliberately its own lazy chunk: only loaded when @defer triggers. */
@Component({
  selector: 'app-power-chart',
  imports: [TranslatePipe],
  template: `
    <figure class="chart" [attr.aria-labelledby]="captionId">
      <figcaption [id]="captionId">{{ 'v17.defer.chartTitle' | translate }}</figcaption>
      <ul>
        @for (bar of bars(); track bar.id) {
          <li>
            <span class="label">{{ bar.name }}</span>
            <span class="bar" [style.inline-size.%]="bar.percent" aria-hidden="true"></span>
            <span class="value">{{ bar.powerKw }} kW</span>
          </li>
        }
      </ul>
    </figure>
  `,
  styles: `
    .chart {
      margin: 0;
    }

    figcaption {
      margin-bottom: var(--space-2);
      font-weight: 600;
    }

    ul {
      display: grid;
      gap: var(--space-1);
      padding: 0;
      margin: 0;
      list-style: none;
    }

    li {
      display: grid;
      grid-template-columns: minmax(8rem, 12rem) 1fr 4.5rem;
      gap: var(--space-2);
      align-items: center;
      font-size: var(--font-size-sm);
    }

    .bar {
      display: block;
      height: 0.75rem;
      background: var(--color-accent);
      border-radius: 999px;
    }

    .value {
      font-family: var(--font-mono);
      text-align: end;
    }
  `,
})
export class PowerChart {
  protected readonly captionId = uniqueId('power-chart');
  private readonly vehicles = toSignal(inject(VehicleApi).search(), {
    initialValue: [] as Vehicle[],
  });

  readonly bars = computed(() => {
    const top = [...this.vehicles()].sort((a, b) => b.powerKw - a.powerKw).slice(0, 8);
    const max = top[0]?.powerKw ?? 1;
    return top.map((v) => ({
      id: v.id,
      name: `${v.brand} ${v.model}`,
      powerKw: v.powerKw,
      percent: Math.round((v.powerKw / max) * 100),
    }));
  });
}
