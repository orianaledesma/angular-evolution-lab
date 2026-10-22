import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, map, pairwise, startWith } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { LoadingService } from '../http/loading.service';
import { AnchorFocus } from '../navigation/anchor-focus';
import { sectionOf } from '../navigation/section';
import { LanguageSwitcher } from './language-switcher';
import { Sidenav } from './sidenav';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, TranslatePipe, Sidenav, LanguageSwitcher],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  protected readonly loading = inject(LoadingService);
  /** Also starts listening for `#fragment` jumps. */
  protected readonly anchors = inject(AnchorFocus);
  protected readonly navOpen = signal(false);
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

  /** Scroll to top only when the section changes — demos navigate within a page (query params, child routes). */
  private readonly scrollOnSectionChange = this.router.events
    .pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => sectionOf(e.urlAfterRedirects)),
      startWith(sectionOf(this.router.url)),
      pairwise(),
      filter(([previous, current]) => previous !== current),
      takeUntilDestroyed(),
    )
    .subscribe(() => {
      this.document.defaultView?.scrollTo({ top: 0 });
    });

  /** Real href for no-JS/copy-link; the click handler avoids the router treating `#` as a route. */
  protected skipHref(): string {
    return `${this.router.url.split('#')[0] ?? ''}#main-content`;
  }

  protected skipToMain(event: Event): void {
    event.preventDefault();
    this.main().nativeElement.focus();
    this.document.defaultView?.scrollTo({ top: 0 });
  }

  protected toggleNav(): void {
    this.navOpen.update((open) => !open);
  }

  protected closeNav(): void {
    this.navOpen.set(false);
  }
}
