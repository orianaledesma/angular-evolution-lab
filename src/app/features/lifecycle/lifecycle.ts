import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Badge } from '@shared/ui/badge/badge';
import { CdTreeDemo } from './cd-tree-demo';
import { HooksDemo } from './hooks-demo';
import { InjectorsDemo } from './injectors-demo';
import { ModernHooksDemo } from './modern-hooks-demo';

@Component({
  selector: 'app-lifecycle',
  imports: [TranslatePipe, Badge, HooksDemo, ModernHooksDemo, CdTreeDemo, InjectorsDemo],
  template: `
    <section class="page">
      <header class="page-header">
        <div class="cluster">
          <app-badge tone="info">{{ 'nav.groups.fundamentals' | translate }}</app-badge>
          <app-badge tone="success">Angular 22 · zoneless · OnPush</app-badge>
        </div>
        <h1>{{ 'lifecycle.title' | translate }}</h1>
        <p>{{ 'lifecycle.intro' | translate }}</p>
      </header>
      <div class="demo-list">
        <app-hooks-demo id="hooks-demo" />
        <app-modern-hooks-demo id="modern-hooks-demo" />
        <app-cd-tree-demo id="cd-tree-demo" />
        <app-injectors-demo id="injectors-demo" />
      </div>
    </section>
  `,
})
export default class Lifecycle {}
