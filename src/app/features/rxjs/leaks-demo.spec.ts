import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { LeaksDemo, TICK_MS, TelemetryFeed } from './leaks-demo';

describe('LeaksDemo (takeUntilDestroyed vs no cleanup)', () => {
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
    const result = await render(LeaksDemo, { providers: [provideTranslateTesting()] });
    const press = async (name: string) => {
      await user.click(screen.getByRole('button', { name }));
      await result.fixture.whenStable();
    };
    const active = () => screen.getByTestId('active-subscriptions').textContent.trim();
    return { ...result, press, active };
  }

  it('the safe widget unsubscribes on destroy', async () => {
    const { press, active } = await setup();
    await press('Mount safe widget');
    expect(active()).toBe('1');
    await jest.advanceTimersByTimeAsync(TICK_MS * 2);
    expect(await screen.findByText('✓ safe · 2')).toBeInTheDocument();

    await press('Unmount safe widget');
    expect(active()).toBe('0');
  });

  it('the leaky widget keeps its subscription and gets updates after destroy', async () => {
    const { press, active, fixture } = await setup();
    await press('Mount leaky widget');
    await press('Unmount leaky widget');
    await press('Mount leaky widget');
    await press('Unmount leaky widget');
    expect(active()).toBe('2');

    await jest.advanceTimersByTimeAsync(TICK_MS * 2);
    fixture.detectChanges();
    expect(Number(screen.getByTestId('ghost-updates').textContent)).toBeGreaterThanOrEqual(4);

    await press('Complete all subscriptions');
    expect(active()).toBe('0');
    expect(screen.getByTestId('ghost-updates')).toHaveTextContent('0');
  });

  it('completes leaked subscriptions when the demo itself is destroyed', async () => {
    const { press, fixture } = await setup();
    await press('Mount leaky widget');
    const feed = fixture.debugElement.injector.get(TelemetryFeed);
    fixture.destroy();
    expect(feed.active()).toBe(0);
  });
});
