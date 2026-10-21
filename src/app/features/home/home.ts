import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  imports: [TranslatePipe],
  template: `
    <section class="page">
      <header class="page-header">
        <h1>{{ 'app.title' | translate }}</h1>
        <p>{{ 'app.tagline' | translate }}</p>
      </header>
    </section>
  `,
})
export default class Home {}
