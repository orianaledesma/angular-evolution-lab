import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { FORMS_COMPARE } from './snippets';
import { ReactiveTestDrive } from './test-drive/reactive-test-drive';
import { SignalTestDrive } from './test-drive/signal-test-drive';

@Component({
  selector: 'app-test-drive-demo',
  imports: [TranslatePipe, Card, CodeCompare, ReactiveTestDrive, SignalTestDrive],
  template: `
    <app-card [heading]="'v22.forms.title' | translate">
      <p class="muted">{{ 'v22.forms.description' | translate }}</p>
      <div class="demo-grid">
        <div class="demo-live"><app-reactive-test-drive /></div>
        <div class="demo-live"><app-signal-test-drive /></div>
      </div>
      <app-code-compare [before]="snippets.before" [after]="snippets.after" />
    </app-card>
  `,
})
export class TestDriveDemo {
  protected readonly snippets = FORMS_COMPARE;
}
