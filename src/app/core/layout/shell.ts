import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LoadingService } from '../http/loading.service';
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
  protected readonly navOpen = signal(false);
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

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
