import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { Recommendations } from './recommendations';
import { DEFER_IDLE } from './snippets';

@Component({
  selector: 'app-defer-idle-demo',
  imports: [TranslatePipe, Card, CodeCompare, Recommendations],
  template: `
    <app-card [heading]="'v22.idle.title' | translate">
      <p class="muted">{{ 'v22.idle.description' | translate }}</p>
      <div class="demo-live" aria-live="polite">
        @defer (on idle(2000)) {
          <app-recommendations />
        } @placeholder {
          <ul class="rows" aria-hidden="true">
            @for (i of [1, 2, 3]; track i) {
              <li class="row skeleton">&nbsp;</li>
            }
          </ul>
          <p class="muted" data-testid="idle-placeholder">
            {{ 'v22.idle.placeholder' | translate }}
          </p>
        }
      </div>
      <app-code-compare [before]="snippets.before" [after]="snippets.after" />
    </app-card>
  `,
})
export class DeferIdleDemo {
  protected readonly snippets = DEFER_IDLE;
}
