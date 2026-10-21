import { Component, computed, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from '@shared/ui/button/button';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { Listbox } from '@shared/ui/listbox/listbox';
import { LocationState } from './location-state';
import { LINKED } from './snippets';

@Component({
  selector: 'app-linked-demo',
  imports: [TranslatePipe, Card, CodeCompare, Button, Listbox],
  templateUrl: './linked-demo.html',
})
export class LinkedDemo {
  protected readonly state = inject(LocationState);
  protected readonly snippets = LINKED;
  protected readonly cityOptions = computed(() =>
    this.state.cities().map((c) => ({ value: c.id, label: c.name })),
  );
}
