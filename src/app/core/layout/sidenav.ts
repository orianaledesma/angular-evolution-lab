import { Component, inject, output } from '@angular/core';
import { Router, RouterLink, isActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { DEMO_NAV } from '../navigation/demo-nav';

@Component({
  selector: 'app-sidenav',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './sidenav.html',
  styleUrl: './sidenav.scss',
})
export class Sidenav {
  private readonly router = inject(Router);

  readonly navigate = output();

  // v22: isActive() returns a Signal<boolean> — no RouterLinkActive directive needed.
  protected readonly items = DEMO_NAV.map((item) => ({
    ...item,
    active: isActive(item.path, this.router, {
      paths: item.path === '/' ? 'exact' : 'subset',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored',
    }),
  }));
}
