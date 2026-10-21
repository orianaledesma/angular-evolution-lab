import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { MenuButton } from './menu-button';

describe('MenuButton (Angular Aria)', () => {
  const options = [
    { value: 'csv', label: 'CSV' },
    { value: 'json', label: 'JSON' },
  ];

  it('opens with the keyboard and emits the chosen value', async () => {
    const user = userEvent.setup();
    const selected = jest.fn();
    await render(MenuButton, {
      inputs: { options, triggerText: 'Export', current: 'csv' },
      on: { selected },
    });
    const trigger = screen.getByRole('button', { name: 'Export' });
    trigger.focus();
    await user.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('menuitem')).toHaveLength(2);

    await user.click(screen.getByRole('menuitem', { name: 'JSON' }));
    expect(selected).toHaveBeenCalledWith('json');
  });

  it('appends screen-reader text after the visible label (label in name)', async () => {
    await render(MenuButton, { inputs: { options, triggerText: 'EN', srText: 'Change language' } });
    expect(screen.getByRole('button', { name: 'EN Change language' })).toBeInTheDocument();
  });
});
