import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { FlatteningDemo, REQUEST_MS, WINDOW_MS } from './flattening-demo';

describe('FlatteningDemo (four operators, same clicks)', () => {
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
    const result = await render(FlatteningDemo, { providers: [provideTranslateTesting()] });
    const row = (op: string) => {
      const cells = within(screen.getByTestId(`summary-${op}`)).getAllByRole('cell');
      return {
        emitted: cells[0]?.textContent.trim(),
        cancelled: cells[1]?.textContent.trim(),
        ignored: cells[2]?.textContent.trim(),
      };
    };
    return { ...result, user, row };
  }

  it('plays the scenario: switch cancels, merge runs all, concat queues, exhaust ignores', async () => {
    const { user, row, fixture } = await setup();
    await user.click(screen.getByRole('button', { name: /Play scenario/ }));
    await jest.advanceTimersByTimeAsync(WINDOW_MS + 100);
    fixture.detectChanges();

    expect(row('switchMap')).toEqual({ emitted: '#3 #5', cancelled: '#1 #2 #4', ignored: '—' });
    expect(row('mergeMap')).toEqual({ emitted: '#1 #2 #3 #4 #5', cancelled: '—', ignored: '—' });
    expect(row('concatMap')).toEqual({ emitted: '#1 #2 #3 #4 #5', cancelled: '—', ignored: '—' });
    expect(row('exhaustMap')).toEqual({ emitted: '#1 #4', cancelled: '—', ignored: '#2 #3 #5' });

    expect(screen.getByRole('button', { name: 'Send a request' })).toBeDisabled();
    expect(screen.getByText(/time window over/)).toBeInTheDocument();
  });

  it('shows a running request on every lane, then completes it', async () => {
    const { user, fixture } = await setup();
    await user.click(screen.getByRole('button', { name: 'Send a request' }));
    await jest.advanceTimersByTimeAsync(100);
    fixture.detectChanges();
    expect(screen.getByTestId('lane-mergeMap').querySelector('.bar--running')).not.toBeNull();

    await jest.advanceTimersByTimeAsync(REQUEST_MS);
    fixture.detectChanges();
    for (const op of ['switchMap', 'mergeMap', 'concatMap', 'exhaustMap']) {
      const lane = screen.getByTestId(`lane-${op}`);
      expect(lane.querySelector('.bar--done')).not.toBeNull();
      expect(lane.querySelector('.marble--out')).toHaveTextContent('1');
    }
  });

  it('resets the lanes and the clock', async () => {
    const { user, row, fixture } = await setup();
    await user.click(screen.getByRole('button', { name: 'Send a request' }));
    await jest.advanceTimersByTimeAsync(REQUEST_MS + 100);
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    fixture.detectChanges();
    expect(row('mergeMap').emitted).toBe('—');
    expect(screen.getByText('t = 0.0 s')).toBeInTheDocument();
  });
});
