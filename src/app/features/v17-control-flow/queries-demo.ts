import { Component, ElementRef, computed, signal, viewChild, viewChildren } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from '@shared/ui/button/button';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { ChecklistItem } from './checklist-item';
import { QUERIES } from './snippets';

export const DEFAULT_CHECKS = ['tyrePressure', 'chargingCable', 'software', 'paint'] as const;

@Component({
  selector: 'app-queries-demo',
  imports: [TranslatePipe, Card, CodeCompare, Button, ChecklistItem],
  templateUrl: './queries-demo.html',
})
export class QueriesDemo {
  protected readonly snippets = QUERIES;
  protected readonly defaultChecks = DEFAULT_CHECKS;
  readonly labels = signal<readonly string[]>([]);
  readonly draft = signal('');

  readonly items = viewChildren(ChecklistItem);
  private readonly newItem = viewChild.required<ElementRef<HTMLInputElement>>('newItem');

  readonly total = computed(() => this.items().length);
  readonly done = computed(() => this.items().filter((item) => item.checked()).length);

  add(event: Event): void {
    event.preventDefault();
    const label = this.draft().trim();
    if (label) {
      this.labels.update((l) => [...l, label]);
      this.draft.set('');
    }
    this.focusInput();
  }

  focusInput(): void {
    this.newItem().nativeElement.focus();
  }

  protected onDraft(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
  }
}
