import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Badge } from '@shared/ui/badge/badge';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { FALLBACK } from './snippets';

@Component({
  selector: 'app-fallback-demo',
  imports: [TranslatePipe, Card, CodeCompare, Badge],
  template: `
    <app-card [heading]="'v18.fallback.title' | translate">
      <p class="muted">{{ 'v18.fallback.description' | translate }}</p>
      <div class="demo-grid">
        <app-card [heading]="'v18.fallback.defaultTitle' | translate">
          <app-badge card-actions>fallback</app-badge>
          <p>{{ 'v18.fallback.defaultBody' | translate }}</p>
        </app-card>
        <app-card heading="ignored">
          <h3 card-title>⚡ {{ 'v18.fallback.customTitle' | translate }}</h3>
          <app-badge card-actions tone="success">projected</app-badge>
          <p>{{ 'v18.fallback.customBody' | translate }}</p>
        </app-card>
      </div>
      <app-code-compare [before]="snippets.before" [after]="snippets.after" />
    </app-card>
  `,
})
export class FallbackDemo {
  protected readonly snippets = FALLBACK;
}
