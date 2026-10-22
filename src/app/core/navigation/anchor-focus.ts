import { DOCUMENT } from '@angular/common';
import { Injectable, Injector, afterNextRender, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { sectionOf } from './section';

/** Where the "back" link of a cross-page jump leads (e.g. from a demo back to its interview question). */
export interface ReturnTarget {
  readonly path: string;
  readonly fragment: string;
  readonly labelKey: string;
}

/** Router navigation state understood by {@link AnchorFocus}. */
export interface AnchorState {
  readonly returnTo?: ReturnTarget;
}

export const HIGHLIGHT_CLASS = 'anchor-highlight';
export const HIGHLIGHT_MS = 2400;
/** Lazy routes and @defer blocks can render the target a bit later than NavigationEnd. */
const WAIT_FOR_TARGET_MS = 3000;

/**
 * Turns `routerLink` + `fragment` into an accessible jump: after the route renders it scrolls the
 * element with that id into view, moves focus to it (so screen readers and keyboard users land
 * there too) and highlights it briefly. It also remembers an optional {@link ReturnTarget}.
 */
@Injectable({ providedIn: 'root' })
export class AnchorFocus {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private section: string | null = null;

  readonly returnTo = signal<ReturnTarget | null>(null);

  private readonly navigationEnd = this.router.events
    .pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      takeUntilDestroyed(),
    )
    .subscribe((e) => {
      this.onNavigationEnd(e.urlAfterRedirects);
    });

  private onNavigationEnd(url: string): void {
    const state = this.router.lastSuccessfulNavigation()?.extras.state as AnchorState | undefined;
    const section = sectionOf(url);
    if (state?.returnTo) {
      this.returnTo.set(state.returnTo);
    } else if (section !== this.section) {
      this.returnTo.set(null);
    }
    this.section = section;

    const fragment = this.router.parseUrl(url).fragment;
    if (fragment) {
      afterNextRender(
        () => {
          void this.waitFor(fragment).then((target) => {
            if (target) {
              this.reveal(target);
            }
          });
        },
        { injector: this.injector },
      );
    }
  }

  private waitFor(id: string): Promise<HTMLElement | null> {
    const found = this.document.getElementById(id);
    if (found) {
      return Promise.resolve(found);
    }
    return new Promise((resolve) => {
      const observer = new MutationObserver(() => {
        const target = this.document.getElementById(id);
        if (target) {
          finish(target);
        }
      });
      const timer = setTimeout(() => {
        finish(null);
      }, WAIT_FOR_TARGET_MS);
      const finish = (target: HTMLElement | null) => {
        observer.disconnect();
        clearTimeout(timer);
        resolve(target);
      };
      observer.observe(this.document.body, { childList: true, subtree: true });
    });
  }

  private reveal(target: HTMLElement): void {
    if (!target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1');
    }
    const reduceMotion = this.document.defaultView?.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
    target.classList.add(HIGHLIGHT_CLASS);
    setTimeout(() => {
      target.classList.remove(HIGHLIGHT_CLASS);
    }, HIGHLIGHT_MS);
  }
}

/** Navigation state for a link that should offer a way back to `path#fragment`. */
export function returnTo(path: string, fragment: string, labelKey: string): AnchorState {
  return { returnTo: { path, fragment, labelKey } };
}
