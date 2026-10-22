import { Injectable, InjectionToken, computed, inject, signal } from '@angular/core';
import { type Deck, QUIZ_ITEMS, type QuizItem, type QuizText } from './quiz-items';

export const ROUND_SIZE = 10;
export const MAX_OPTIONS = 4;

/** Randomness is injectable so specs can make rounds deterministic. */
export const QUIZ_RANDOM = new InjectionToken<() => number>('QUIZ_RANDOM', {
  providedIn: 'root',
  factory: () => Math.random,
});

export type DeckChoice = Deck | 'all';
export type QuizStatus = 'idle' | 'playing' | 'finished';

/** A question as played in this round: its options already sampled and shuffled. */
export interface Card {
  readonly item: QuizItem;
  readonly options: readonly QuizText[];
  readonly correct: number;
}

/**
 * The current round. It lives in a root service so that following a "See it live" link to a
 * demo and coming back resumes the round where it was.
 */
@Injectable({ providedIn: 'root' })
export class QuizSession {
  private readonly random = inject(QUIZ_RANDOM);

  readonly deck = signal<DeckChoice>('all');
  readonly status = signal<QuizStatus>('idle');
  readonly cards = signal<readonly Card[]>([]);
  readonly index = signal(0);
  /** Chosen option per card position; undefined while unanswered. */
  readonly answers = signal<readonly (number | undefined)[]>([]);

  readonly current = computed<Card | undefined>(() => this.cards()[this.index()]);
  readonly currentAnswer = computed(() => this.answers()[this.index()]);
  readonly answered = computed(() => this.currentAnswer() !== undefined);
  readonly isLast = computed(() => this.index() === this.cards().length - 1);

  readonly score = computed(
    () => this.cards().filter((card, i) => this.answers()[i] === card.correct).length,
  );
  /** Consecutive correct answers up to the latest answered card. */
  readonly streak = computed(() => {
    let streak = 0;
    const answers = this.answers();
    for (let i = answers.length - 1; i >= 0; i--) {
      const chosen = answers[i];
      if (chosen === undefined) {
        continue;
      }
      if (chosen !== this.cards()[i]?.correct) {
        break;
      }
      streak++;
    }
    return streak;
  });
  readonly missed = computed(() =>
    this.cards().filter((card, i) => {
      const chosen = this.answers()[i];
      return chosen !== undefined && chosen !== card.correct;
    }),
  );

  static itemsOf(deck: DeckChoice): readonly QuizItem[] {
    return deck === 'all' ? QUIZ_ITEMS : QUIZ_ITEMS.filter((item) => item.deck === deck);
  }

  start(
    deck: DeckChoice = this.deck(),
    pool: readonly QuizItem[] = QuizSession.itemsOf(deck),
  ): void {
    this.deck.set(deck);
    const items = this.shuffle(pool).slice(0, ROUND_SIZE);
    this.cards.set(items.map((item) => this.deal(item)));
    this.answers.set(items.map(() => undefined));
    this.index.set(0);
    this.status.set(items.length ? 'playing' : 'idle');
  }

  retryMissed(): void {
    this.start(
      this.deck(),
      this.missed().map((card) => card.item),
    );
  }

  answer(option: number): void {
    if (this.status() !== 'playing' || this.answered()) {
      return;
    }
    this.answers.update((answers) => answers.map((a, i) => (i === this.index() ? option : a)));
  }

  next(): void {
    if (!this.answered()) {
      return;
    }
    if (this.isLast()) {
      this.status.set('finished');
    } else {
      this.index.update((i) => i + 1);
    }
  }

  reset(): void {
    this.status.set('idle');
    this.cards.set([]);
    this.answers.set([]);
    this.index.set(0);
  }

  /** Keeps the correct option and up to three wrong ones, in random order. */
  private deal(item: QuizItem): Card {
    const [right, ...wrong] = item.options;
    if (!right) {
      throw new Error(`Quiz item ${item.id} has no options`);
    }
    const options = this.shuffle([right, ...this.shuffle(wrong).slice(0, MAX_OPTIONS - 1)]);
    return { item, options, correct: options.indexOf(right) };
  }

  /** Fisher–Yates on a copy. */
  private shuffle<T>(list: readonly T[]): T[] {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      const swap = copy[i] as T;
      copy[i] = copy[j] as T;
      copy[j] = swap;
    }
    return copy;
  }
}
