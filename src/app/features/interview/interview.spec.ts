import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import en from '../../../../public/i18n/en.json';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { routes } from '../../app.routes';
import Interview, { normalize } from './interview';
import { QUESTIONS } from './questions';

/** Source file of the page that renders each route, to check that demo anchors exist. */
const PAGE_SOURCES: Record<string, string> = {
  '/': 'features/home/home.html',
  '/v16': 'features/v16-signals/v16-signals.ts',
  '/v17': 'features/v17-control-flow/v17-control-flow.ts',
  '/v18': 'features/v18-zoneless/v18-zoneless.ts',
  '/v19': 'features/v19-linked-resource/v19-linked-resource.ts',
  '/v20': 'features/v20-stable-signals/v20-stable-signals.ts',
  '/v21': 'features/v21-signal-forms/v21-signal-forms.ts',
  '/v22': 'features/v22-maturity/v22-maturity.ts',
  '/lifecycle': 'features/lifecycle/lifecycle.ts',
  '/rxjs': 'features/rxjs/rxjs.ts',
  '/requirements': 'features/requirements/requirements.html',
};
const APP = join(__dirname, '..', '..');

describe('Interview questions data', () => {
  const texts = en.interview.q as Record<string, { q: string; short: string; long: string }>;

  it('has unique ids and a question, short answer and long answer for each', () => {
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length);
    for (const q of QUESTIONS) {
      expect(texts[q.id]?.q).toMatch(/\?$/);
      expect(texts[q.id]?.short.length).toBeGreaterThan(20);
      expect(texts[q.id]?.long.length).toBeGreaterThan(texts[q.id]?.short.length ?? 0);
    }
    expect(Object.keys(texts).sort()).toEqual(QUESTIONS.map((q) => q.id).sort());
  });

  it.each(QUESTIONS.filter((q) => q.demo).map((q) => [q.id, q.demo!.path, q.demo!.anchor ?? '']))(
    '%s → %s#%s is a real route and anchor',
    (_id, path, anchor) => {
      const routePath = path.slice(1);
      expect(routes.some((r) => r.path === routePath)).toBe(true);
      const source = PAGE_SOURCES[path];
      expect(source).toBeDefined();
      if (anchor) {
        expect(readFileSync(join(APP, source ?? ''), 'utf8')).toContain(`id="${anchor}"`);
      }
    },
  );
});

describe('normalize', () => {
  it('ignores case and accents', () => {
    expect(normalize('Änderung Módulo')).toBe('anderung modulo');
  });
});

describe('Interview page', () => {
  async function setup(lang = 'en') {
    const user = userEvent.setup();
    const result = await render(Interview, {
      providers: [provideTranslateTesting(lang)],
      routes: [{ path: '**', component: Interview }],
    });
    const count = () => screen.getByTestId('interview-count').textContent.trim();
    return { ...result, user, count };
  }

  beforeEach(() => {
    localStorage.clear();
  });

  it('lists every question with its short answer and a link to its live demo', async () => {
    const { count } = await setup();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Interview questions' }),
    ).toBeInTheDocument();
    expect(count()).toBe(`Showing ${QUESTIONS.length} of ${QUESTIONS.length} questions`);

    const article = screen.getByRole('article', {
      name: 'How do you choose a flattening operator, and what is the failure mode of each?',
    });
    expect(within(article).getByText(/switch drops responses, merge races/)).toBeInTheDocument();
    expect(
      within(article).getByRole('link', { name: /See it live: RxJS in practice/ }),
    ).toHaveAttribute('href', '/rxjs#flattening-demo');
  });

  it('targets a senior role: no level filter, and no definition-style questions', async () => {
    await setup();
    expect(screen.queryByRole('group', { name: 'Level' })).not.toBeInTheDocument();
    const texts = en.interview.q as Record<string, { q: string }>;
    for (const q of QUESTIONS) {
      expect(texts[q.id]?.q).not.toMatch(/^What (is|are|does|problem) /);
    }
  });

  it('filters by topic and accent-insensitive text', async () => {
    const { user, count } = await setup();
    await user.click(screen.getByRole('radio', { name: /^RxJS/ }));
    expect(count()).toBe(`Showing 6 of ${QUESTIONS.length} questions`);

    await user.click(screen.getByRole('radio', { name: /^All \(/ }));
    await user.type(
      screen.getByRole('searchbox', { name: 'Search questions and answers' }),
      'NG0203',
    );
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(
      screen.getByRole('heading', { level: 2, name: /reusable inject\(\)-based functions/ }),
    ).toBeInTheDocument();

    await user.clear(screen.getByRole('searchbox'));
    await user.type(screen.getByRole('searchbox'), 'no such topic');
    expect(screen.getByText('No question matches these filters.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getAllByRole('article')).toHaveLength(QUESTIONS.length);
  });

  it('practice mode hides answers until revealed, and remembers the choice', async () => {
    const { user } = await setup();
    await user.click(screen.getByRole('switch', { name: 'Practice mode' }));
    expect(screen.queryByText('In one sentence')).not.toBeInTheDocument();

    const article = screen.getByRole('article', { name: /How do signals work under the hood/ });
    const toggle = within(article).getByRole('button', { name: 'Show answer' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(within(article).getByText('In one sentence')).toBeInTheDocument();
    expect(screen.getAllByText('In one sentence')).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Reveal all' }));
    expect(screen.getAllByText('In one sentence')).toHaveLength(QUESTIONS.length);
    await user.click(screen.getByRole('button', { name: 'Hide all' }));
    expect(screen.queryByText('In one sentence')).not.toBeInTheDocument();
    expect(localStorage.getItem('ael.interview.practice')).toBe('true');
  });

  it('opens the question named in the fragment when coming back from a demo', async () => {
    localStorage.setItem('ael.interview.practice', 'true');
    const { user, fixture } = await setup();
    await user.click(screen.getByRole('radio', { name: /^RxJS/ }));

    await TestBed.inject(Router).navigate(['/interview'], { fragment: 'q-onPush' });
    await fixture.whenStable();
    const article = screen.getByRole('article', { name: /makes OnPush the default/ });
    expect(within(article).getByText('In one sentence')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^All \(/ })).toBeChecked();
  });

  it('searches in the current language', async () => {
    const { user } = await setup('de');
    await user.type(
      screen.getByRole('searchbox', { name: 'Fragen und Antworten durchsuchen' }),
      'Fangfrage',
    );
    expect(screen.getAllByRole('article').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { level: 1, name: 'Interviewfragen' })).toBeInTheDocument();
  });
});
