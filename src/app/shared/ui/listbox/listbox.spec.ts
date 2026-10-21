import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { Listbox } from './listbox';

describe('Listbox (Angular Aria)', () => {
  const template = `
    <span id="lbl">City</span>
    <app-listbox labelledBy="lbl" [options]="options" [(value)]="value" />
    <output data-testid="value">{{ value }}</output>
  `;
  const options = [
    { value: 'muc', label: 'München' },
    { value: 'ber', label: 'Berlin' },
  ];

  it('is labelled and selects with click and keyboard', async () => {
    const user = userEvent.setup();
    await render(template, { imports: [Listbox], componentProperties: { options, value: 'muc' } });
    expect(screen.getByRole('listbox', { name: 'City' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'München' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await user.click(screen.getByRole('option', { name: 'Berlin' }));
    expect(screen.getByTestId('value')).toHaveTextContent('ber');
    expect(screen.getByRole('option', { name: 'Berlin' })).toHaveAttribute('aria-selected', 'true');
  });

  it('shows an empty placeholder without options', async () => {
    await render(template, {
      imports: [Listbox],
      componentProperties: { options: [], value: undefined },
    });
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
