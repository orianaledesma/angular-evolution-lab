import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

export const LANGUAGES = ['en', 'es', 'de', 'lt'] as const;
export type Language = (typeof LANGUAGES)[number];

const STORAGE_KEY = 'ael.lang';

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);

  readonly languages = LANGUAGES;
  readonly current = signal<Language>('en');

  // Keeps <html lang> in sync so screen readers switch pronunciation with the UI.
  private readonly syncHtmlLang = effect(() => {
    this.document.documentElement.lang = this.current();
  });

  /** Picks stored → browser → default language. */
  initialLanguage(): Language {
    const stored = this.readStored();
    if (stored) {
      return stored;
    }
    const browser = this.document.defaultView?.navigator.language.slice(0, 2);
    return isLanguage(browser) ? browser : 'en';
  }

  use(lang: Language): Observable<unknown> {
    this.current.set(lang);
    this.persist(lang);
    return this.translate.use(lang);
  }

  private readStored(): Language | null {
    try {
      const value = this.document.defaultView?.localStorage.getItem(STORAGE_KEY);
      return isLanguage(value) ? value : null;
    } catch {
      return null;
    }
  }

  private persist(lang: Language): void {
    try {
      this.document.defaultView?.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Storage can be unavailable (private mode); language still applies for the session.
    }
  }
}
