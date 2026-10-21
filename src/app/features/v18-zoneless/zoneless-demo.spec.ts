import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { ZonelessDemo } from './zoneless-demo';

describe('ZonelessDemo', () => {
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
    const result = await render(ZonelessDemo, { providers: [provideTranslateTesting()] });
    const checks = () =>
      Number(screen.getByTestId('cd-counter').querySelector('output')?.textContent);
    const flush = async () => {
      jest.runOnlyPendingTimers();
      await result.fixture.whenStable();
    };
    return { user, checks, flush, ...result };
  }

  it('re-renders when a signal changes inside setTimeout', async () => {
    const { user, flush } = await setup();
    await user.click(screen.getByRole('button', { name: /signal \+100 km/ }));
    await flush();
    expect(screen.getByTestId('signal')).toHaveTextContent('100 km');
  });

  it('does not re-render a plain field changed inside setTimeout until markForCheck()', async () => {
    const { user, flush, checks, fixture } = await setup();
    await user.click(screen.getByRole('button', { name: /plain field \+100 km/ }));
    await flush();
    const afterTimer = checks();
    expect(fixture.componentInstance.plainOdometer).toBe(100);
    expect(screen.getByTestId('plain')).toHaveTextContent('0 km');

    await user.click(screen.getByRole('button', { name: 'markForCheck()' }));
    await flush();
    expect(screen.getByTestId('plain')).toHaveTextContent('100 km');
    expect(checks()).toBeGreaterThan(afterTimer);
  });
});
