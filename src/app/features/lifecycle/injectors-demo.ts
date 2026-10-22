import { Component, Injector, inject, input, runInInjectionContext, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { returnTo } from '@core/navigation/anchor-focus';
import { Button } from '@shared/ui/button/button';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { FleetClock, ScopeLog, TripMeter } from './scoped-services';
import { INJECTORS } from './snippets';

/** A child of the panel: resolves TripMeter from the panel's injector, FleetClock from root. */
@Component({
  selector: 'app-trip-gauge',
  imports: [TranslatePipe, Button],
  template: `
    <div class="gauge">
      <p>
        {{ 'lifecycle.injectors.gauge' | translate }} → TripMeter
        <strong>#{{ meter.instance }}</strong> · FleetClock <strong>#{{ clock.id }}</strong>
      </p>
      <button app-button variant="secondary" size="sm" type="button" (click)="drive()">
        +10 km
      </button>
    </div>
  `,
  styles: `
    .gauge {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      align-items: center;
      padding: var(--space-2);
      border: 1px dashed var(--color-border);
      border-radius: var(--radius-sm);
    }

    p {
      margin: 0;
      font-size: var(--font-size-sm);
    }
  `,
})
export class TripGauge {
  protected readonly meter = inject(TripMeter);
  protected readonly clock = inject(FleetClock);

  protected drive(): void {
    this.meter.km.update((km) => km + 10);
  }
}

@Component({
  selector: 'app-trip-panel',
  imports: [TranslatePipe, TripGauge],
  providers: [TripMeter],
  template: `
    <section class="panel" [attr.aria-label]="name()" [attr.data-testid]="'panel-' + name()">
      <h4>{{ name() }}</h4>
      <p>
        TripMeter <strong>#{{ meter.instance }}</strong> · {{ meter.km() }} km ·
        {{ 'lifecycle.injectors.shared' | translate }}
      </p>
      <app-trip-gauge />
    </section>
  `,
  styles: `
    .panel {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      padding: var(--space-3);
      background: var(--color-surface);
      border: 2px solid var(--color-accent);
      border-radius: var(--radius-md);
    }

    h4,
    p {
      margin: 0;
    }

    p {
      font-size: var(--font-size-sm);
    }
  `,
})
export class TripPanel {
  readonly name = input.required<string>();
  protected readonly meter = inject(TripMeter);
}

@Component({
  selector: 'app-injectors-demo',
  imports: [TranslatePipe, Card, CodeCompare, Button, TripPanel, RouterLink],
  providers: [ScopeLog],
  templateUrl: './injectors-demo.html',
})
export class InjectorsDemo {
  private readonly injector = inject(Injector);
  protected readonly log = inject(ScopeLog);
  protected readonly clock = inject(FleetClock);
  protected readonly snippets = INJECTORS;
  protected readonly back = returnTo('/lifecycle', 'injectors-demo', 'lifecycle.backHere');

  readonly panelA = signal(true);
  readonly panelB = signal(false);
  readonly injectResult = signal<{ ok: boolean; message: string } | null>(null);

  togglePanel(panel: 'a' | 'b'): void {
    (panel === 'a' ? this.panelA : this.panelB).update((open) => !open);
  }

  /** A click handler is not an injection context: inject() throws NG0203. */
  injectInHandler(): void {
    try {
      inject(FleetClock);
      this.injectResult.set({ ok: true, message: '' });
    } catch (error) {
      this.injectResult.set({ ok: false, message: (error as Error).message.split('\n')[0] ?? '' });
    }
  }

  injectInContext(): void {
    const clock = runInInjectionContext(this.injector, () => inject(FleetClock));
    this.injectResult.set({ ok: true, message: `FleetClock #${clock.id}` });
  }
}
