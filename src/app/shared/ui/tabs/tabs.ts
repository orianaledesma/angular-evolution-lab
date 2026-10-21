import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  Directive,
  TemplateRef,
  contentChildren,
  inject,
  input,
  linkedSignal,
  model,
} from '@angular/core';
import { Tab, TabContent, TabList, TabPanel, Tabs as AriaTabs } from '@angular/aria/tabs';

/** Declares one tab: `<ng-template appTabPanel="id" label="Label">…</ng-template>`. */
@Directive({ selector: 'ng-template[appTabPanel]' })
export class TabPanelDef {
  readonly value = input.required<string>({ alias: 'appTabPanel' });
  readonly label = input.required<string>();
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

/** Styled tabs on top of Angular Aria (roving focus, arrow keys, ARIA roles). */
@Component({
  selector: 'app-tabs',
  imports: [AriaTabs, TabList, Tab, TabPanel, TabContent, NgTemplateOutlet],
  templateUrl: './tabs.html',
  styleUrl: './tabs.scss',
})
export class Tabs {
  readonly ariaLabel = input.required<string>();
  readonly selected = model<string>();
  protected readonly panels = contentChildren(TabPanelDef);
  protected readonly active = linkedSignal(() => this.selected() ?? this.panels()[0]?.value());

  protected onSelect(value: string | undefined): void {
    this.active.set(value);
    this.selected.set(value);
  }
}
