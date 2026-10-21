import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { DELIVERY_STEPS, DeliveryDemo } from './delivery-demo';

describe('DeliveryDemo (@switch grouped cases + @default never)', () => {
  it('maps every status to its grouped phase', async () => {
    const user = userEvent.setup();
    await render(DeliveryDemo, { providers: [provideTranslateTesting()] });
    const phase = () => screen.getByTestId('delivery-phase').textContent;
    const seen: string[] = [];
    for (let i = 0; i < DELIVERY_STEPS.length; i++) {
      seen.push(phase().trim());
      expect(screen.getByRole('listitem', { current: 'step' })).toBeInTheDocument();
      if (i < DELIVERY_STEPS.length - 1) {
        await user.click(screen.getByRole('button', { name: /Next/ }));
      }
    }
    expect(new Set(seen).size).toBe(4);
    expect(seen[0]).toContain('being processed');
    expect(seen[6]).toContain('pick up the keys');
    expect(screen.getByRole('button', { name: /Next/ })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /Previous/ }));
    expect(screen.getByRole('listitem', { current: 'step' })).toHaveTextContent('At the dealer');
  });
});
