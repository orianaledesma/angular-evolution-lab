import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { AriaDemo } from './aria-demo';

describe('AriaDemo (Angular Aria tabs · listbox · menu)', () => {
  it('navigates tabs with the keyboard and selects a trim in the listbox', async () => {
    const user = userEvent.setup();
    await render(AriaDemo, { providers: [provideTranslateTesting()] });
    expect(screen.getByRole('tablist', { name: 'Vehicle details' })).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Overview' }));
    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Trim level' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    expect(await screen.findByRole('listbox', { name: 'Choose a trim level' })).toBeInTheDocument();
    expect(screen.getByTestId('trim-price')).toHaveTextContent('€44,995');
    await user.click(screen.getByRole('option', { name: 'GTX' }));
    expect(screen.getByTestId('trim-price')).toHaveTextContent('€52,995');
  });

  it('exports through the menu button', async () => {
    const user = userEvent.setup();
    await render(AriaDemo, { providers: [provideTranslateTesting()] });
    await user.click(screen.getByRole('button', { name: 'Export offer' }));
    await user.click(screen.getByRole('menuitem', { name: 'CSV spec sheet' }));
    expect(screen.getByTestId('last-export')).toHaveTextContent('Exported: CSV spec sheet');
  });
});
