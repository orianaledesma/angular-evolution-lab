import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { CartDemo } from './cart-demo';

describe('CartDemo (signal · computed · effect)', () => {
  async function setup() {
    const user = userEvent.setup();
    const result = await render(CartDemo, { providers: [provideTranslateTesting()] });
    return { user, ...result };
  }

  it('derives count and total with computed signals', async () => {
    const { user } = await setup();
    await user.click(screen.getByRole('button', { name: 'Add one Wallbox 11 kW' }));
    await user.click(screen.getByRole('button', { name: 'Add one Wallbox 11 kW' }));
    await user.click(screen.getByRole('button', { name: 'Add one Roof box 420 l' }));

    expect(screen.getByTestId('count')).toHaveTextContent('3');
    // (2 × 1190 + 459) × 1.19 = 3378.41 → 2839 + 539 VAT
    expect(screen.getByTestId('total')).toHaveTextContent('€3,378');
  });

  it('runs the effect on each change and logs what it saw', async () => {
    const { user, fixture } = await setup();
    await user.click(screen.getByRole('button', { name: 'Add one Winter tyres set' }));
    await fixture.whenStable();
    expect(screen.getByText('effect ran → 1 items')).toBeInTheDocument();
    expect(screen.getByText('effect ran → 0 items')).toBeInTheDocument();
  });

  it('removes items, never below zero, and resets', async () => {
    const { user } = await setup();
    const remove = screen.getByRole('button', { name: 'Remove one Wallbox 11 kW' });
    expect(remove).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Add one Wallbox 11 kW' }));
    await user.click(remove);
    expect(screen.getByTestId('count')).toHaveTextContent('0');

    await user.click(screen.getByRole('button', { name: 'Add one Wallbox 11 kW' }));
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('keeps quantities at zero when removing an absent item', async () => {
    const { fixture } = await setup();
    fixture.componentInstance.remove('tyres');
    expect(fixture.componentInstance.qty('tyres')).toBe(0);
  });
});
