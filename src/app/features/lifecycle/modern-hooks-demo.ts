import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { HOOK_MAPPINGS, RENDER_PHASES } from './snippets';

@Component({
  selector: 'app-modern-hooks-demo',
  imports: [TranslatePipe, Card, CodeCompare],
  template: `
    <app-card [heading]="'lifecycle.modern.title' | translate">
      <p class="muted">{{ 'lifecycle.modern.description' | translate }}</p>
      <div
        class="table-scroll"
        tabindex="0"
        role="region"
        [attr.aria-label]="'lifecycle.modern.title' | translate"
      >
        <table class="data-table">
          <thead>
            <tr>
              <th scope="col">{{ 'lifecycle.modern.classic' | translate }}</th>
              <th scope="col">{{ 'lifecycle.modern.modern' | translate }}</th>
              <th scope="col">{{ 'lifecycle.modern.note' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            @for (row of mappings; track row.id) {
              <tr>
                <th scope="row">
                  <code>{{ row.classic }}</code>
                </th>
                <td>
                  <code>{{ row.modern }}</code>
                </td>
                <td>{{ 'lifecycle.modern.rows.' + row.id | translate }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <h3>{{ 'lifecycle.modern.phasesTitle' | translate }}</h3>
      <ol class="phases">
        <li><code>earlyRead</code> — {{ 'lifecycle.modern.phases.earlyRead' | translate }}</li>
        <li><code>write</code> — {{ 'lifecycle.modern.phases.write' | translate }}</li>
        <li><code>mixedReadWrite</code> — {{ 'lifecycle.modern.phases.mixed' | translate }}</li>
        <li><code>read</code> — {{ 'lifecycle.modern.phases.read' | translate }}</li>
      </ol>
      <p class="explain">{{ 'lifecycle.modern.phasesExplain' | translate }}</p>

      <app-code-compare [before]="snippets.before" [after]="snippets.after" />
    </app-card>
  `,
  styles: `
    .phases {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      margin: 0;
    }
  `,
})
export class ModernHooksDemo {
  protected readonly mappings = HOOK_MAPPINGS;
  protected readonly snippets = RENDER_PHASES;
}
