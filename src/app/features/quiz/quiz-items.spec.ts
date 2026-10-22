import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import de from '../../../../public/i18n/de.json';
import en from '../../../../public/i18n/en.json';
import es from '../../../../public/i18n/es.json';
import lt from '../../../../public/i18n/lt.json';
import { QUESTIONS } from '../interview/questions';
import { DECKS, QUIZ_ITEMS, type QuizText } from './quiz-items';

const PAGES: Record<string, string> = {
  '/lifecycle': 'lifecycle/lifecycle.ts',
  '/rxjs': 'rxjs/rxjs.ts',
  '/v19': 'v19-linked-resource/v19-linked-resource.ts',
};

function lookup(tree: object, key: string): unknown {
  return key
    .split('.')
    .reduce<unknown>((node, k) => (node as Record<string, unknown> | undefined)?.[k], tree);
}

function keysOf(t: QuizText): string[] {
  return 'code' in t ? [] : [t.key, ...Object.values(t.paramKeys ?? {})];
}

function english(t: QuizText): string {
  if ('code' in t) {
    return t.code;
  }
  let text = lookup(en, t.key) as string;
  const params = { ...t.params };
  for (const [name, k] of Object.entries(t.paramKeys ?? {})) {
    params[name] = lookup(en, k) as string;
  }
  for (const [name, value] of Object.entries(params)) {
    text = text.replace(`{{${name}}}`, value);
  }
  return text;
}

describe('Quiz items', () => {
  it('has unique ids and every deck is populated', () => {
    expect(new Set(QUIZ_ITEMS.map((i) => i.id)).size).toBe(QUIZ_ITEMS.length);
    for (const deck of DECKS) {
      expect(QUIZ_ITEMS.filter((i) => i.deck === deck).length).toBeGreaterThanOrEqual(10);
    }
  });

  it('turns every interview question into a quiz item with two distractors', () => {
    const interview = QUIZ_ITEMS.filter((i) => i.deck === 'interview');
    expect(interview.map((i) => i.question?.id)).toEqual(QUESTIONS.map((q) => q.id));
    expect(interview.every((i) => i.options.length === 3)).toBe(true);
  });

  it.each([
    ['en', en],
    ['es', es],
    ['de', de],
    ['lt', lt],
  ])('only uses i18n keys that exist in %s', (_lang, tree) => {
    const missing = QUIZ_ITEMS.flatMap((item) =>
      [item.prompt, ...item.options, ...(item.explain ?? [])].flatMap(keysOf),
    ).filter((k) => typeof lookup(tree, k) !== 'string');
    expect(missing).toEqual([]);
  });

  it('fills every placeholder and never repeats an option', () => {
    for (const item of QUIZ_ITEMS) {
      const texts = [item.prompt, ...item.options].map(english);
      expect(texts.join(' ')).not.toMatch(/\{\{/);
      expect(new Set(item.options.map(english)).size).toBe(item.options.length);
    }
  });

  it('links each non-interview item to a demo that exists', () => {
    for (const item of QUIZ_ITEMS.filter((i) => i.deck !== 'interview')) {
      const demo = item.demo!;
      const source = readFileSync(join(__dirname, '..', PAGES[demo.path]!), 'utf8');
      expect(source).toContain(`id="${demo.anchor!}"`);
      expect(item.explain?.length).toBeGreaterThan(0);
    }
  });
});
