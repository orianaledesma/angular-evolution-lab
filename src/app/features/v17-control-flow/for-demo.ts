import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
  Injector,
  InjectionToken,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '@core/i18n/language.service';
import { EurPipe } from '@shared/pipes/eur.pipe';
import { Button } from '@shared/ui/button/button';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { FOR } from './snippets';
import { type StockUnit, generateStock, shuffle } from './stock';

export type TrackMode = 'id' | 'identity';

/** Rows rendered by the demo; tests lower it to keep jsdom fast. */
export const STOCK_SIZE = new InjectionToken<number>('STOCK_SIZE', { factory: () => 5000 });

@Component({
  selector: 'app-for-demo',
  imports: [TranslatePipe, Card, CodeCompare, Button, EurPipe],
  templateUrl: './for-demo.html',
  styleUrl: './for-demo.scss',
})
export class ForDemo {
  private readonly injector = inject(Injector);
  protected readonly lang = inject(LanguageService).current;
  protected readonly snippets = FOR;

  readonly rows = input(inject(STOCK_SIZE));
  readonly stock = signal<readonly StockUnit[]>([]);
  readonly filter = signal('');
  readonly trackMode = signal<TrackMode>('id');
  readonly renderMs = signal<number | null>(null);
  readonly nodesCreated = signal(0);

  readonly visible = computed(() => {
    const term = this.filter().trim().toLowerCase();
    return term
      ? this.stock().filter((u) => `${u.model} ${u.dealer} ${u.vin}`.toLowerCase().includes(term))
      : this.stock();
  });

  private readonly tbody = viewChild.required<ElementRef<HTMLElement>>('tbody');
  private seed = 1;

  // Counts <tr> elements the browser actually had to create — the cost tracking avoids.
  private readonly observer = (() => {
    const observer =
      typeof MutationObserver === 'undefined'
        ? null
        : new MutationObserver((records) => {
            const added = records.reduce(
              (sum, r) =>
                sum + [...r.addedNodes].filter((n) => n instanceof HTMLTableRowElement).length,
              0,
            );
            if (added) {
              this.nodesCreated.update((n) => n + added);
            }
          });
    afterNextRender(() => observer?.observe(this.tbody().nativeElement, { childList: true }));
    inject(DestroyRef).onDestroy(() => observer?.disconnect());
    return observer;
  })();

  private readonly initial = afterNextRender(() => {
    this.measure(() => {
      this.stock.set(generateStock(this.rows()));
    });
  });

  /** Same ids, brand-new objects: identity tracking must rebuild every row. */
  refresh(): void {
    this.measure(() => {
      this.stock.update((s) => s.map((u) => ({ ...u })));
    });
  }

  shuffleRows(): void {
    this.seed += 1;
    const seed = this.seed;
    this.measure(() => {
      this.stock.update((s) => shuffle(s, seed));
    });
  }

  setTrackMode(mode: TrackMode): void {
    this.measure(() => {
      this.trackMode.set(mode);
    });
  }

  protected onFilter(event: Event): void {
    this.filter.set((event.target as HTMLInputElement).value);
  }

  private measure(update: () => void): void {
    this.nodesCreated.set(0);
    const start = performance.now();
    update();
    afterNextRender(
      () => {
        this.renderMs.set(Math.round(performance.now() - start));
      },
      { injector: this.injector },
    );
  }
}
