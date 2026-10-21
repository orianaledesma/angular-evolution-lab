import { Component, computed, input, model } from '@angular/core';
import { Listbox as AriaListbox, Option } from '@angular/aria/listbox';

export interface ListboxOption {
  readonly value: string;
  readonly label: string;
}

/** Single-select listbox on Angular Aria. */
@Component({
  selector: 'app-listbox',
  imports: [AriaListbox, Option],
  templateUrl: './listbox.html',
  styleUrl: './listbox.scss',
})
export class Listbox {
  readonly options = input.required<readonly ListboxOption[]>();
  readonly labelledBy = input.required<string>();
  readonly value = model<string | undefined>();
  protected readonly selection = computed(() => {
    const value = this.value();
    return value === undefined ? [] : [value];
  });

  protected onChange(values: string[]): void {
    this.value.set(values[0]);
  }
}
