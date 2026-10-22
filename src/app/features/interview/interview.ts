import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';
import { type AnchorState, returnTo } from '@core/navigation/anchor-focus';
import { DEMO_NAV } from '@core/navigation/demo-nav';
import { Badge } from '@shared/ui/badge/badge';
import { Button } from '@shared/ui/button/button';
import { CATEGORIES, type Category, QUESTIONS, type Question } from './questions';
import { ANSWER_SNIPPETS } from './snippets';

const PRACTICE_KEY = 'ael.interview.practice';

/** Lowercase, without accents: "Änderung" matches "anderung", "módulo" matches "modulo". */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

@Component({
  selector: 'app-interview',
  imports: [TranslatePipe, RouterLink, Badge, Button],
  templateUrl: './interview.html',
  styleUrl: './interview.scss',
})
export default class Interview {
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);
  private readonly route = inject(ActivatedRoute);

  protected readonly categories = CATEGORIES;
  protected readonly total = QUESTIONS.length;
  protected readonly snippets = ANSWER_SNIPPETS;

  readonly query = signal('');
  readonly category = signal<Category | 'all'>('all');
  readonly practice = signal(this.readPractice());
  readonly revealed = signal<ReadonlySet<string>>(new Set());

  /** Re-run the text search when the language (and its loaded translations) changes. */
  private readonly lang = toSignal(
    this.translate.onLangChange.pipe(map((e): string | null => e.lang)),
    {
      initialValue: this.translate.getCurrentLang(),
    },
  );

  protected readonly counts = computed(() => {
    const counts = { all: QUESTIONS.length } as Record<Category | 'all', number>;
    for (const category of CATEGORIES) {
      counts[category] = QUESTIONS.filter((q) => q.category === category).length;
    }
    return counts;
  });

  readonly visible = computed(() => {
    this.lang();
    const terms = normalize(this.query().trim()).split(/\s+/).filter(Boolean);
    const category = this.category();
    return QUESTIONS.filter((q) => {
      if (category !== 'all' && q.category !== category) {
        return false;
      }
      if (!terms.length) {
        return true;
      }
      const haystack = normalize(this.searchableText(q));
      return terms.every((term) => haystack.includes(term));
    });
  });

  private readonly persistPractice = effect(() => {
    const on = this.practice();
    try {
      this.document.defaultView?.localStorage.setItem(PRACTICE_KEY, String(on));
    } catch {
      // Storage unavailable: the mode still works for this visit.
    }
  });

  /** Coming back from a demo (#q-<id>): make sure that question is listed and its answer open. */
  private readonly openFromFragment = this.route.fragment
    .pipe(takeUntilDestroyed())
    .subscribe((fragment) => {
      const id = fragment?.startsWith('q-') ? fragment.slice(2) : null;
      if (id && QUESTIONS.some((q) => q.id === id)) {
        this.clearFilters();
        this.reveal(id);
      }
    });

  protected isOpen(id: string): boolean {
    return !this.practice() || this.revealed().has(id);
  }

  reveal(id: string): void {
    this.revealed.update((set) => new Set(set).add(id));
  }

  hide(id: string): void {
    this.revealed.update((set) => {
      const next = new Set(set);
      next.delete(id);
      return next;
    });
  }

  revealAll(): void {
    this.revealed.set(new Set(this.visible().map((q) => q.id)));
  }

  hideAll(): void {
    this.revealed.set(new Set());
  }

  clearFilters(): void {
    this.query.set('');
    this.category.set('all');
  }

  protected onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected setPractice(event: Event): void {
    this.practice.set((event.target as HTMLInputElement).checked);
    this.revealed.set(new Set());
  }

  protected backState(id: string): AnchorState {
    return returnTo('/interview', `q-${id}`, 'layout.backToQuestion');
  }

  /** Nav label key of the demo's page, for the link text. */
  protected pageKey(path: string): string {
    return DEMO_NAV.find((item) => item.path === path)?.labelKey ?? 'nav.home';
  }

  private searchableText(q: Question): string {
    const base = `interview.q.${q.id}`;
    return [
      this.translate.instant(`${base}.q`),
      this.translate.instant(`${base}.short`),
      this.translate.instant(`${base}.long`),
      this.translate.instant(`interview.categories.${q.category}`),
      ANSWER_SNIPPETS[q.id] ?? '',
    ].join(' ');
  }

  private readPractice(): boolean {
    try {
      return this.document.defaultView?.localStorage.getItem(PRACTICE_KEY) === 'true';
    } catch {
      return false;
    }
  }
}
