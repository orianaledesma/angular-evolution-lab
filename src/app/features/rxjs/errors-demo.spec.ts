import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { ErrorsDemo } from './errors-demo';

describe('ErrorsDemo (where to catch)', () => {
  beforeEach(() => {
    jest.useFakeTimers({ advanceTimers: true });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  async function setup() {
    const user = userEvent.setup({
      advanceTimers: (ms) => {
        jest.advanceTimersByTime(ms);
      },
    });
    const result = await render(ErrorsDemo, { providers: [provideTranslateTesting()] });
    const column = (s: string) => screen.getByTestId(`strategy-${s}`);
    const load = async () => {
      await user.click(screen.getByRole('button', { name: 'Load data' }));
      await jest.advanceTimersByTimeAsync(5000);
      result.fixture.detectChanges();
    };
    return { ...result, user, column, load };
  }

  it('without handling, the first error closes the stream for good', async () => {
    const { column, load } = await setup();
    await load();
    expect(within(column('none')).getByText('stream closed')).toBeInTheDocument();
    await load();
    expect(column('none')).toHaveTextContent('calls: 1');
  });

  it('catchError inside switchMap keeps the stream alive with a fallback', async () => {
    const { column, load } = await setup();
    await load();
    await load();
    expect(within(column('catch')).getByText('stream alive')).toBeInTheDocument();
    expect(column('catch')).toHaveTextContent('→ value: fallback');
    await load();
    expect(column('catch')).toHaveTextContent('✓ call #3 → 200');
    expect(column('catch')).toHaveTextContent('→ value: 200 #3');
  });

  it('retry with backoff recovers on the first click', async () => {
    const { column, load } = await setup();
    await load();
    const retry = column('retry');
    expect(retry).toHaveTextContent('↻ retry in 400 ms');
    expect(retry).toHaveTextContent('↻ retry in 800 ms');
    expect(retry).toHaveTextContent('→ value: 200 #3');
    expect(retry).toHaveTextContent('calls: 3');
  });

  it('reset reopens a dead stream', async () => {
    const { column, load, user, fixture } = await setup();
    await load();
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    fixture.detectChanges();
    expect(within(column('none')).getByText('stream alive')).toBeInTheDocument();
    await load();
    expect(column('none')).toHaveTextContent('calls: 1');
  });
});
