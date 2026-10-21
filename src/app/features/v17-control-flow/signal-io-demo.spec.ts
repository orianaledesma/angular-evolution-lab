import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { SignalIoDemo } from './signal-io-demo';

describe('SignalIoDemo (input · model · output)', () => {
  it('syncs child → parent through model() and emits output()', async () => {
    const user = userEvent.setup();
    await render(SignalIoDemo, { providers: [provideTranslateTesting()] });
    const comfort = screen.getByRole('group', { name: 'Comfort' });
    expect(comfort).toBeInTheDocument();

    await user.click(screen.getAllByRole('radio', { name: '5 / 5' })[0]!);
    expect(screen.getByTestId('comfort')).toHaveTextContent('5');
    expect(screen.getByTestId('average')).toHaveTextContent('4.5');
    expect(screen.getByText('comfort → 5')).toBeInTheDocument();
  });

  it('syncs parent → child through model()', async () => {
    const user = userEvent.setup();
    await render(SignalIoDemo, { providers: [provideTranslateTesting()] });
    await user.click(screen.getByRole('button', { name: 'Set both to 1 from the parent' }));
    expect(
      screen.getAllByRole('radio', { name: '1 / 5' }).every((r) => (r as HTMLInputElement).checked),
    ).toBe(true);
    expect(screen.getByTestId('average')).toHaveTextContent('1');
  });
});
