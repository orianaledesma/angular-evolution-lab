import { TestBed } from '@angular/core/testing';
import { QUIZ_ITEMS } from './quiz-items';
import { MAX_OPTIONS, QUIZ_RANDOM, QuizSession, ROUND_SIZE } from './quiz-session';

function setup(random = () => 0.5) {
  TestBed.configureTestingModule({ providers: [{ provide: QUIZ_RANDOM, useValue: random }] });
  return TestBed.inject(QuizSession);
}

describe('QuizSession', () => {
  it('deals a round from the chosen deck with the right answer among at most four options', () => {
    const session = setup();
    session.start('cases');

    expect(session.status()).toBe('playing');
    expect(session.cards()).toHaveLength(ROUND_SIZE);
    for (const card of session.cards()) {
      expect(card.item.deck).toBe('cases');
      expect(card.options.length).toBeLessThanOrEqual(MAX_OPTIONS);
      expect(card.options[card.correct]).toBe(card.item.options[0]);
    }
  });

  it('shuffles with the injected random source', () => {
    const first = setup(() => 0);
    first.start('theory');
    const order = first.cards().map((c) => c.item.id);
    TestBed.resetTestingModule();
    const second = setup(() => 0.99);
    second.start('theory');
    expect(second.cards().map((c) => c.item.id)).not.toEqual(order);
  });

  it('scores answers, counts the streak and ignores a second answer', () => {
    const session = setup();
    session.start('theory');
    const [first, second] = session.cards();

    session.answer(first!.correct);
    session.answer((first!.correct + 1) % first!.options.length);
    expect(session.score()).toBe(1);
    expect(session.streak()).toBe(1);

    session.next();
    session.answer((second!.correct + 1) % second!.options.length);
    expect(session.score()).toBe(1);
    expect(session.streak()).toBe(0);
    expect(session.missed().map((c) => c.item.id)).toEqual([second!.item.id]);
  });

  it('does not move on before an answer, finishes after the last card and retries the missed ones', () => {
    const session = setup();
    session.start('interview');
    session.next();
    expect(session.index()).toBe(0);

    for (let i = 0; i < ROUND_SIZE; i++) {
      const card = session.current()!;
      session.answer(i < 3 ? (card.correct + 1) % card.options.length : card.correct);
      session.next();
    }
    expect(session.status()).toBe('finished');
    expect(session.score()).toBe(ROUND_SIZE - 3);

    const missed = session.missed().map((c) => c.item.id);
    session.retryMissed();
    expect(session.status()).toBe('playing');
    expect(
      session
        .cards()
        .map((c) => c.item.id)
        .sort(),
    ).toEqual(missed.sort());
  });

  it('mixes every deck in "all" and resets to idle', () => {
    const session = setup();
    expect(QuizSession.itemsOf('all')).toHaveLength(QUIZ_ITEMS.length);
    session.start('all');
    session.reset();
    expect(session.status()).toBe('idle');
    expect(session.cards()).toEqual([]);
  });
});
