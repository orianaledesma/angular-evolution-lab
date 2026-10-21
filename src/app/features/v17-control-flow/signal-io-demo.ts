import { Component, computed, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from '@shared/ui/button/button';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { Rating } from './rating';
import { SIGNAL_IO } from './snippets';

@Component({
  selector: 'app-signal-io-demo',
  imports: [TranslatePipe, Card, CodeCompare, Button, Rating],
  templateUrl: './signal-io-demo.html',
})
export class SignalIoDemo {
  protected readonly snippets = SIGNAL_IO;
  readonly comfort = signal(3);
  readonly range = signal(4);
  readonly commits = signal<readonly string[]>([]);
  readonly average = computed(() => (this.comfort() + this.range()) / 2);

  log(field: string, value: number): void {
    this.commits.update((c) => [`${field} → ${String(value)}`, ...c].slice(0, 5));
  }

  resetFromParent(): void {
    this.comfort.set(1);
    this.range.set(1);
  }
}
