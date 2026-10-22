import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Badge } from '@shared/ui/badge/badge';
import { ErrorsDemo } from './errors-demo';
import { FlatteningDemo } from './flattening-demo';
import { InteropDemo } from './interop-demo';
import { LeaksDemo } from './leaks-demo';
import { SubjectsDemo } from './subjects-demo';

@Component({
  selector: 'app-rxjs',
  imports: [TranslatePipe, Badge, FlatteningDemo, SubjectsDemo, InteropDemo, ErrorsDemo, LeaksDemo],
  template: `
    <section class="page">
      <header class="page-header">
        <div class="cluster">
          <app-badge tone="info">{{ 'nav.groups.fundamentals' | translate }}</app-badge>
          <app-badge tone="success">RxJS 7.8 · rxjs-interop</app-badge>
        </div>
        <h1>{{ 'rxjs.title' | translate }}</h1>
        <p>{{ 'rxjs.intro' | translate }}</p>
      </header>
      <div class="demo-list">
        <app-flattening-demo id="flattening-demo" />
        <app-subjects-demo id="subjects-demo" />
        <app-interop-demo id="interop-demo" />
        <app-errors-demo id="errors-demo" />
        <app-leaks-demo id="leaks-demo" />
      </div>
    </section>
  `,
})
export default class Rxjs {}
