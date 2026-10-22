import {
  Component,
  type ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';
import { type AnchorState, returnTo } from '@core/navigation/anchor-focus';
import { DEMO_NAV } from '@core/navigation/demo-nav';
import { Badge } from '@shared/ui/badge/badge';
import { Button } from '@shared/ui/button/button';
import { AnswerDetail } from '../interview/answer-detail';
import { DECKS, QUIZ_ITEMS, type QuizText } from './quiz-items';
import { type Card, type DeckChoice, QuizSession, ROUND_SIZE } from './quiz-session';

export interface ResolvedText {
  readonly text: string;
  readonly code: boolean;
}

const LETTERS = ['A', 'B', 'C', 'D'] as const;

@Component({
  selector: 'app-quiz',
  imports: [TranslatePipe, RouterLink, NgTemplateOutlet, Badge, Button, AnswerDetail],
  templateUrl: './quiz.html',
  styleUrl: './quiz.scss',
})
export default class Quiz {
  private readonly translate = inject(TranslateService);
  private readonly injector = inject(Injector);
  protected readonly session = inject(QuizSession);

  protected readonly decks: readonly DeckChoice[] = ['all', ...DECKS];
  protected readonly total = QUIZ_ITEMS.length;
  protected readonly roundSize = ROUND_SIZE;
  protected readonly letters = LETTERS;
  protected readonly back: AnchorState = returnTo('/quiz', 'quiz-card', 'quiz.backToQuiz');

  private readonly prompt = viewChild<ElementRef<HTMLElement>>('prompt');
  private readonly feedback = viewChild<ElementRef<HTMLElement>>('feedback');
  private readonly results = viewChild<ElementRef<HTMLElement>>('results');

  /** Texts are resolved in code (some params are keys themselves), so follow language changes. */
  private readonly lang = toSignal(
    this.translate.onLangChange.pipe(map((e): string | null => e.lang)),
    { initialValue: this.translate.getCurrentLang() },
  );

  protected readonly counts = computed(() =>
    Object.fromEntries(this.decks.map((d) => [d, QuizSession.itemsOf(d).length])),
  );

  protected readonly view = computed(() => {
    this.lang();
    const card = this.session.current();
    return card ? this.resolveCard(card) : undefined;
  });

  protected readonly missed = computed(() => {
    this.lang();
    return this.session.missed().map((card) => this.resolveCard(card));
  });

  protected readonly verdict = computed(() => {
    const ratio = this.session.score() / Math.max(1, this.session.cards().length);
    return ratio >= 0.8 ? 'great' : ratio >= 0.5 ? 'good' : 'low';
  });

  start(deck: DeckChoice): void {
    this.session.start(deck);
    this.focusLater(this.prompt);
  }

  answer(option: number): void {
    this.session.answer(option);
    this.focusLater(this.feedback);
  }

  next(): void {
    this.session.next();
    this.focusLater(this.session.status() === 'finished' ? this.results : this.prompt);
  }

  retryMissed(): void {
    this.session.retryMissed();
    this.focusLater(this.prompt);
  }

  quit(): void {
    this.session.reset();
  }

  protected onDeck(event: Event): void {
    this.session.deck.set((event.target as HTMLInputElement).value as DeckChoice);
  }

  /** Nav label key of the demo's page, for the link text. */
  protected pageKey(path: string): string {
    return DEMO_NAV.find((item) => item.path === path)?.labelKey ?? 'nav.home';
  }

  private resolveCard(card: Card) {
    return {
      card,
      prompt: this.resolve(card.item.prompt),
      options: card.options.map((o) => this.resolve(o)),
      correctOption: this.resolve(card.options[card.correct] ?? { code: '' }),
      explain: (card.item.explain ?? []).map((t) => this.resolve(t).text),
    };
  }

  private resolve(t: QuizText): ResolvedText {
    if ('code' in t) {
      return { text: t.code, code: true };
    }
    const params: Record<string, string> = { ...t.params };
    for (const [name, k] of Object.entries(t.paramKeys ?? {})) {
      params[name] = this.translate.instant(k) as string;
    }
    return { text: this.translate.instant(t.key, params) as string, code: false };
  }

  /** Buttons that disappear or get disabled would drop focus to <body>; move it on purpose. */
  private focusLater(target: () => ElementRef<HTMLElement> | undefined): void {
    afterNextRender(
      () => {
        target()?.nativeElement.focus();
      },
      { injector: this.injector },
    );
  }
}
