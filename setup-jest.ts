import '@testing-library/jest-dom';
import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';

setupZonelessTestEnv();

// jsdom has no <dialog> modal API yet; emulate the parts the Dialog component uses.
if (typeof HTMLDialogElement !== 'undefined' && !('showModal' in HTMLDialogElement.prototype)) {
  Object.assign(HTMLDialogElement.prototype, {
    showModal(this: HTMLDialogElement) {
      this.setAttribute('open', '');
    },
    close(this: HTMLDialogElement) {
      if (this.hasAttribute('open')) {
        this.removeAttribute('open');
        this.dispatchEvent(new Event('close'));
      }
    },
  });
}

// jsdom does not implement scrolling.
window.scrollTo = () => undefined;

// jsdom has no IntersectionObserver (used by @defer on viewport). Tests drive defer blocks manually.
if (!('IntersectionObserver' in window)) {
  class NoopIntersectionObserver {
    readonly root = null;
    readonly rootMargin = '';
    readonly thresholds = [];
    observe(): void {
      /* noop */
    }
    unobserve(): void {
      /* noop */
    }
    disconnect(): void {
      /* noop */
    }
    takeRecords(): [] {
      return [];
    }
  }
  Object.assign(window, { IntersectionObserver: NoopIntersectionObserver });
}

// jsdom has no scrollIntoView / matchMedia (used by AnchorFocus and motion-aware demos).
Element.prototype.scrollIntoView = function scrollIntoView() {
  /* noop */
};
if (!('matchMedia' in window)) {
  Object.assign(window, {
    matchMedia: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}
