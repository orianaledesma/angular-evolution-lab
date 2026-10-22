import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import en from '../../../../public/i18n/en.json';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import Quiz from './quiz';
import { QUIZ_RANDOM, QuizSession, ROUND_SIZE } from './quiz-session';

async function setup() {
  const user = userEvent.setup();
  await render(Quiz, {
    providers: [
      provideRouter([]),
      provideTranslateTesting(),
      { provide: QUIZ_RANDOM, useValue: () => 0.5 },
    ],
  });
  return { user, session: TestBed.inject(QuizSession) };
}

function options() {
  return within(screen.getByRole('list', { name: 'Answer options' })).getAllByRole('button');
}

describe('Quiz', () => {
  it('starts a round on the chosen deck and moves focus to the question', async () => {
    const { user, session } = await setup();
    await user.click(screen.getByRole('radio', { name: /Use cases/ }));
    await user.click(screen.getByRole('button', { name: 'Start round' }));

    expect(screen.getByTestId('quiz-progress')).toHaveTextContent(`Question 1 of ${ROUND_SIZE}`);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveFocus();
    expect(session.current()?.item.deck).toBe('cases');
    expect(options().length).toBe(session.current()?.options.length);
  });

  it('on a wrong answer shows the right one, the reused explanation and the demo link', async () => {
    const { user, session } = await setup();
    await user.click(screen.getByRole('radio', { name: /Theory/ }));
    await user.click(screen.getByRole('button', { name: 'Start round' }));
    const card = session.current()!;

    await user.click(options()[(card.correct + 1) % card.options.length]!);

    const feedback = screen.getByTestId('quiz-feedback');
    expect(feedback).toHaveFocus();
    expect(feedback).toHaveTextContent('Not quite.');
    expect(feedback).toHaveTextContent('The right answer is:');
    expect(options().every((b) => (b as HTMLButtonElement).disabled)).toBe(true);
    expect(options()[card.correct]).toHaveTextContent('(correct answer)');
    expect(within(feedback).getByRole('link', { name: /See it live/ })).toHaveAttribute(
      'href',
      `${card.item.demo!.path}#${card.item.demo!.anchor!}`,
    );
    expect(screen.getByTestId('quiz-score')).toHaveTextContent('0');
  });

  it('on a right answer keeps the explanation behind "Why?" and reuses the interview answer', async () => {
    const { user, session } = await setup();
    await user.click(screen.getByRole('radio', { name: /Interview questions/ }));
    await user.click(screen.getByRole('button', { name: 'Start round' }));
    const card = session.current()!;
    const id = card.item.question!.id as keyof typeof en.interview.q;

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(en.interview.q[id].q);
    await user.click(options()[card.correct]!);

    const feedback = screen.getByTestId('quiz-feedback');
    expect(feedback).toHaveTextContent('Correct!');
    await user.click(within(feedback).getByText('Why?'));
    expect(within(feedback).getByText(en.interview.q[id].long)).toBeVisible();
    expect(screen.getByTestId('quiz-score')).toHaveTextContent('1');
  });

  it('shows the results with the missed questions and can retry them', async () => {
    const { user, session } = await setup();
    await user.click(screen.getByRole('button', { name: 'Start round' }));

    for (let i = 0; i < ROUND_SIZE; i++) {
      const card = session.current()!;
      await user.click(
        options()[i === 0 ? (card.correct + 1) % card.options.length : card.correct]!,
      );
      await user.click(
        screen.getByRole('button', {
          name: i === ROUND_SIZE - 1 ? 'See results' : 'Next question',
        }),
      );
    }

    expect(screen.getByRole('heading', { name: 'Round complete' })).toHaveFocus();
    expect(screen.getByTestId('quiz-result')).toHaveTextContent(
      `${String(ROUND_SIZE - 1)} of ${String(ROUND_SIZE)} correct`,
    );
    expect(screen.getByText('Interview-ready on this deck.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Retry the 1 you missed' }));
    expect(screen.getByTestId('quiz-progress')).toHaveTextContent('Question 1 of 1');

    await user.click(screen.getByRole('button', { name: 'End round' }));
    expect(screen.getByRole('button', { name: 'Start round' })).toBeInTheDocument();
  });
});
