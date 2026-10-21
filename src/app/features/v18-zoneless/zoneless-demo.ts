import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from '@shared/ui/button/button';
import { Card } from '@shared/ui/card/card';
import { CdCounter } from '@shared/ui/cd-counter/cd-counter';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { ZONELESS } from './snippets';

@Component({
  selector: 'app-zoneless-demo',
  imports: [TranslatePipe, Card, CodeCompare, Button, CdCounter],
  templateUrl: './zoneless-demo.html',
})
export class ZonelessDemo {
  private readonly cdr = inject(ChangeDetectorRef);
  protected readonly snippets = ZONELESS;

  /** Plain field: zoneless Angular is never told it changed. */
  plainOdometer = 0;
  readonly signalOdometer = signal(0);

  plainLater(): void {
    setTimeout(() => {
      this.plainOdometer += 100;
    });
  }

  signalLater(): void {
    setTimeout(() => {
      this.signalOdometer.update((km) => km + 100);
    });
  }

  markForCheck(): void {
    this.cdr.markForCheck();
  }
}
