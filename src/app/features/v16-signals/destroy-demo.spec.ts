import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { DestroyDemo, TELEMETRY_INTERVAL_MS } from './destroy-demo';

describe('DestroyDemo (DestroyRef · takeUntilDestroyed)', () => {
  beforeEach(() => {
    jest.useFakeTimers({ advanceTimers: true });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('streams values while mounted and cleans up on unmount', async () => {
    const user = userEvent.setup({
      advanceTimers: (ms) => {
        jest.advanceTimersByTime(ms);
      },
    });
    const { fixture } = await render(DestroyDemo, { providers: [provideTranslateTesting()] });
    expect(screen.getByTestId('active-subs')).toHaveTextContent('1');

    jest.advanceTimersByTime(TELEMETRY_INTERVAL_MS * 3);
    await fixture.whenStable();
    expect(screen.getByText(/km\/h/)).toBeInTheDocument();
    expect(screen.getByText('Values received').nextElementSibling).toHaveTextContent('3');

    await user.click(screen.getByRole('button', { name: 'Unmount telemetry' }));
    expect(screen.getByTestId('active-subs')).toHaveTextContent('0');
    expect(screen.getByText(/no subscription left behind/)).toBeInTheDocument();

    jest.advanceTimersByTime(TELEMETRY_INTERVAL_MS * 3);
    await fixture.whenStable();
    expect(screen.getByText('Values received').nextElementSibling).toHaveTextContent('3');

    await user.click(screen.getByRole('button', { name: 'Mount telemetry' }));
    expect(screen.getByTestId('active-subs')).toHaveTextContent('1');
  });
});
