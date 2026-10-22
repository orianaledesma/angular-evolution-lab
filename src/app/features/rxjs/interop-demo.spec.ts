import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { InteropDemo } from './interop-demo';

describe('InteropDemo (signals vs Subject)', () => {
  it('a Subject sees every write, signal consumers only the last one', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(InteropDemo, { providers: [provideTranslateTesting()] });
    const seen = (channel: string) =>
      screen.getByTestId(`channel-${channel}`).querySelector('dd')?.textContent.trim();
    expect(seen('effect')).toBe('0');
    expect(seen('toObservable')).toBe('0');

    await user.click(screen.getByRole('button', { name: 'Write 3 values synchronously' }));
    await fixture.whenStable();
    expect(seen('subject')).toBe('10, 20, 30');
    expect(seen('toObservable')).toBe('0, 30');
    expect(seen('effect')).toBe('0, 30');
    expect(screen.getByText(/speed\(\) = 30 · toSignal\(speed\$\)\(\) = 30/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(seen('subject')).toBe('—');
  });

  it('lists when to use signals and when RxJS', async () => {
    await render(InteropDemo, { providers: [provideTranslateTesting()] });
    expect(
      screen.getByRole('rowheader', { name: 'a value derived from state' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('table')).not.toHaveTextContent('rxjs.interop');
  });
});
