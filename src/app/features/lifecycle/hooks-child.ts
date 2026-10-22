import {
  type AfterContentChecked,
  type AfterContentInit,
  type AfterViewChecked,
  type AfterViewInit,
  Component,
  DestroyRef,
  type DoCheck,
  type OnChanges,
  type OnDestroy,
  type OnInit,
  type SimpleChanges,
  afterNextRender,
  afterRenderEffect,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from '@shared/ui/button/button';
import { HooksLog } from './hooks-log';

/** Implements every classic hook and registers every modern one, logging each call. */
@Component({
  selector: 'app-hooks-child',
  imports: [TranslatePipe, Button],
  template: `
    <section class="child" data-testid="hooks-child">
      <h3>&lt;app-hooks-child&gt;</h3>
      <p>
        plate: <strong>{{ plate() }}</strong> · {{ 'lifecycle.hooks.clicks' | translate }}:
        <strong>{{ clicks() }}</strong>
      </p>
      <ng-content />
      <button app-button variant="secondary" size="sm" type="button" (click)="clickInside()">
        {{ 'lifecycle.hooks.clickInside' | translate }}
      </button>
    </section>
  `,
  styles: `
    .child {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      align-items: flex-start;
      padding: var(--space-3);
      background: var(--color-surface);
      border: 2px solid var(--color-accent);
      border-radius: var(--radius-md);
    }

    h3,
    p {
      margin: 0;
    }

    h3 {
      font-family: var(--font-mono);
      font-size: var(--font-size-sm);
    }
  `,
})
export class HooksChild
  implements
    OnChanges,
    OnInit,
    DoCheck,
    AfterContentInit,
    AfterContentChecked,
    AfterViewInit,
    AfterViewChecked,
    OnDestroy
{
  private readonly log = inject(HooksLog);
  readonly plate = input.required<string>();
  readonly clicked = output();
  protected readonly clicks = signal(0);

  // Field initializers run in the constructor, in order: this is the "constructor" step.
  private readonly created = this.log.record('constructor', 'classic', 'inject() works here');

  private readonly plateEffect = effect(() => {
    this.log.record('effect()', 'modern', `plate = ${this.plate()}`);
  });

  private readonly firstRender = afterNextRender(() => {
    this.log.record('afterNextRender()', 'modern', 'DOM is ready, once');
  });

  private readonly renderEffect = afterRenderEffect(() => {
    this.log.record('afterRenderEffect()', 'modern', `after render, plate = ${this.plate()}`);
  });

  private readonly destroyRef = inject(DestroyRef).onDestroy(() => {
    this.log.record('DestroyRef.onDestroy()', 'modern');
  });

  ngOnChanges(changes: SimpleChanges): void {
    this.log.record('ngOnChanges', 'classic', Object.keys(changes).join(', '));
  }

  ngOnInit(): void {
    this.log.record('ngOnInit', 'classic', 'inputs are set');
  }

  ngDoCheck(): void {
    this.log.record('ngDoCheck', 'classic');
  }

  ngAfterContentInit(): void {
    this.log.record('ngAfterContentInit', 'classic');
  }

  ngAfterContentChecked(): void {
    this.log.record('ngAfterContentChecked', 'classic');
  }

  ngAfterViewInit(): void {
    this.log.record('ngAfterViewInit', 'classic');
  }

  ngAfterViewChecked(): void {
    this.log.record('ngAfterViewChecked', 'classic');
  }

  ngOnDestroy(): void {
    this.log.record('ngOnDestroy', 'classic');
  }

  protected clickInside(): void {
    this.clicks.update((n) => n + 1);
    this.clicked.emit();
  }
}
