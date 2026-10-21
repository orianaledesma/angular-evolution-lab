import { Component, input, output } from '@angular/core';
import { Menu, MenuItem, MenuTrigger } from '@angular/aria/menu';

export interface MenuOption {
  readonly value: string;
  readonly label: string;
  readonly lang?: string;
}

/** Menu button on Angular Aria: arrow keys, typeahead, Escape and focus return built in. */
@Component({
  selector: 'app-menu-button',
  imports: [Menu, MenuItem, MenuTrigger],
  templateUrl: './menu-button.html',
  styleUrl: './menu-button.scss',
})
export class MenuButton {
  readonly options = input.required<readonly MenuOption[]>();
  readonly triggerText = input.required<string>();
  /** Extra text for screen readers, appended to the visible label (never replacing it). */
  readonly srText = input<string>();
  readonly current = input<string>();
  readonly selected = output<string>();

  protected onSelected(value: string | undefined): void {
    if (value !== undefined) {
      this.selected.emit(value);
    }
  }
}
