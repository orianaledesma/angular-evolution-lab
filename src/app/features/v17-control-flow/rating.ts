import { Component, input, model, output } from '@angular/core';
import { uniqueId } from '@shared/unique-id';

/** Star rating as a native radio group: model() for two-way binding, output() for commits. */
@Component({
  selector: 'app-rating',
  template: `
    <fieldset class="rating">
      <legend>{{ label() }}</legend>
      @for (star of stars; track star) {
        <label [class.on]="star <= value()">
          <input
            type="radio"
            class="visually-hidden"
            [name]="name"
            [value]="star"
            [checked]="star === value()"
            (change)="choose(star)"
          />
          <span aria-hidden="true">★</span>
          <span class="visually-hidden">{{ star }} / {{ stars.length }}</span>
        </label>
      }
    </fieldset>
  `,
  styles: `
    .rating {
      display: inline-flex;
      gap: var(--space-1);
      padding: 0;
      margin: 0;
      border: 0;
    }

    legend {
      margin-bottom: var(--space-1);
      font-weight: 600;
    }

    label {
      font-size: 1.75rem;
      line-height: 1;
      color: var(--color-border);
      cursor: pointer;

      &.on {
        color: var(--color-warning);
      }

      &:focus-within {
        outline: var(--focus-ring);
        outline-offset: 2px;
        border-radius: var(--radius-sm);
      }
    }
  `,
})
export class Rating {
  readonly label = input.required<string>();
  readonly value = model(0);
  readonly committed = output<number>();
  protected readonly stars = [1, 2, 3, 4, 5] as const;
  protected readonly name = uniqueId('rating');

  protected choose(star: number): void {
    this.value.set(star);
    this.committed.emit(star);
  }
}
