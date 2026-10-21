import { Component, inject } from '@angular/core';
import { Router, isActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { DEMO_NAV } from '@core/navigation/demo-nav';
import { Badge } from '@shared/ui/badge/badge';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { IS_ACTIVE } from './snippets';

@Component({
  selector: 'app-is-active-demo',
  imports: [TranslatePipe, Card, CodeCompare, Badge],
  template: `
    <app-card [heading]="'v22.active.title' | translate">
      <p class="muted">{{ 'v22.active.description' | translate }}</p>
      <div class="demo-live">
        <table class="data-table">
          <caption class="visually-hidden">
            {{
              'v22.active.caption' | translate
            }}
          </caption>
          <thead>
            <tr>
              <th scope="col">URL</th>
              <th scope="col">isActive(…, &#123; paths: 'subset' &#125;)</th>
            </tr>
          </thead>
          <tbody>
            @for (row of rows; track row.path) {
              <tr>
                <th scope="row">
                  <code>{{ row.path }}</code>
                </th>
                <td>
                  <app-badge [tone]="row.active() ? 'success' : 'neutral'">{{
                    row.active()
                  }}</app-badge>
                </td>
              </tr>
            }
          </tbody>
        </table>
        <p class="explain">{{ 'v22.active.explain' | translate }}</p>
      </div>
      <app-code-compare [before]="snippets.before" [after]="snippets.after" />
    </app-card>
  `,
})
export class IsActiveDemo {
  private readonly router = inject(Router);
  protected readonly snippets = IS_ACTIVE;
  protected readonly rows = DEMO_NAV.filter((item) => item.path !== '/').map((item) => ({
    path: item.path,
    active: isActive(item.path, this.router, { paths: 'subset' }),
  }));
}
