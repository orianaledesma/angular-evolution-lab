import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { CdStrategyDemo } from './cd-strategy-demo';

describe('CdStrategyDemo (OnPush default vs Eager)', () => {
  const count = (testId: string) =>
    Number(
      within(screen.getByTestId(testId)).getByTestId('cd-counter').querySelector('output')
        ?.textContent,
    );

  it('checks the Eager child with its parent but skips the OnPush child', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(CdStrategyDemo, { providers: [provideTranslateTesting()] });
    const onPushBefore = count('onpush-child');
    const eagerBefore = count('eager-child');

    await user.click(screen.getByRole('button', { name: 'Change parent-only state' }));
    await user.click(screen.getByRole('button', { name: 'Change parent-only state' }));
    await fixture.whenStable();

    expect(screen.getByText('parentClicks() = 2')).toBeInTheDocument();
    expect(count('eager-child')).toBeGreaterThanOrEqual(eagerBefore + 2);
    expect(count('onpush-child')).toBe(onPushBefore);
  });

  it('checks the OnPush child when its input changes', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(CdStrategyDemo, { providers: [provideTranslateTesting()] });
    const onPushBefore = count('onpush-child');

    await user.click(screen.getByRole('button', { name: "Change the children's input" }));
    await fixture.whenStable();
    expect(count('onpush-child')).toBe(onPushBefore + 1);
    expect(within(screen.getByTestId('onpush-child')).getByText('W-12345E')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: "Change the children's input" }));
    expect(within(screen.getByTestId('eager-child')).getByText('M-EV 2026')).toBeInTheDocument();
  });
});
