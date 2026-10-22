import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import en from '../../../../public/i18n/en.json';
import { returnTo } from '@core/navigation/anchor-focus';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { AnswerDetail } from './answer-detail';
import { QUESTIONS } from './questions';

const onPush = QUESTIONS.find((q) => q.id === 'onPush')!;
const microFrontends = QUESTIONS.find((q) => q.id === 'microFrontends')!;

async function setup(inputs: Record<string, unknown>) {
  return render(AnswerDetail, {
    inputs,
    providers: [provideRouter([]), provideTranslateTesting()],
  });
}

describe('AnswerDetail', () => {
  it('shows the short answer, the reasoning, the code and a link to the demo', async () => {
    await setup({ question: onPush, back: returnTo('/quiz', 'quiz-card', 'quiz.back') });

    expect(screen.getByText(en.interview.q.onPush.short)).toBeInTheDocument();
    expect(screen.getByText(en.interview.q.onPush.long)).toBeInTheDocument();
    expect(screen.getByLabelText('Code example')).toHaveTextContent(
      'ChangeDetectionStrategy.Eager',
    );
    expect(screen.getByRole('link', { name: /See it live: OnPush by default/ })).toHaveAttribute(
      'href',
      '/v22#cd-strategy-demo',
    );
  });

  it('can leave out the short answer and has no link without a demo', async () => {
    await setup({ question: microFrontends, showShort: false });

    expect(screen.queryByText(en.interview.q.microFrontends.short)).not.toBeInTheDocument();
    expect(screen.getByText(en.interview.q.microFrontends.long)).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
