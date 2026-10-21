import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { REDIRECT } from './snippets';

export const LEGACY_MODELS = ['golf-7', 'passat-b8', 'e-up'] as const;

@Component({
  selector: 'app-redirect-demo',
  imports: [TranslatePipe, Card, CodeCompare, RouterLink],
  template: `
    <app-card [heading]="'v18.redirect.title' | translate">
      <p class="muted">{{ 'v18.redirect.description' | translate }}</p>
      <div class="demo-live">
        <nav class="toolbar" [attr.aria-label]="'v18.redirect.navLabel' | translate">
          @for (model of models; track model) {
            <a [routerLink]="['/v18/legacy', model]">/v18/legacy/{{ model }}</a>
          }
        </nav>
        <div aria-live="polite">
          @if (redirectedFrom(); as from) {
            <p class="status" data-testid="redirect-result">
              ↪ {{ 'v18.redirect.result' | translate: { model: from } }}
            </p>
          } @else {
            <p class="muted">{{ 'v18.redirect.hint' | translate }}</p>
          }
        </div>
      </div>
      <app-code-compare [before]="snippets.before" [after]="snippets.after" />
    </app-card>
  `,
})
export class RedirectDemo {
  protected readonly snippets = REDIRECT;
  protected readonly models = LEGACY_MODELS;
  readonly redirectedFrom = input<string>();
}
