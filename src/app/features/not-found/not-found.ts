import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, TranslatePipe],
  template: `
    <section class="page">
      <header class="page-header">
        <h1>{{ 'common.notFound' | translate }}</h1>
      </header>
      <p>
        <a routerLink="/">{{ 'common.backHome' | translate }}</a>
      </p>
    </section>
  `,
})
export default class NotFound {}
