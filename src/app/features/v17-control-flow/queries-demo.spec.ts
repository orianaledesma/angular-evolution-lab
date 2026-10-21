import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { QueriesDemo } from './queries-demo';

describe('QueriesDemo (viewChild · viewChildren)', () => {
  it('derives progress from child queries and grows with new children', async () => {
    const user = userEvent.setup();
    await render(QueriesDemo, { providers: [provideTranslateTesting()] });
    expect(screen.getByTestId('done')).toHaveTextContent('0 of 4 checks done');

    await user.click(screen.getByRole('checkbox', { name: 'Tyre pressure' }));
    await user.click(screen.getByRole('checkbox', { name: 'Paint inspection' }));
    expect(screen.getByTestId('done')).toHaveTextContent('2 of 4 checks done');

    await user.type(screen.getByRole('textbox', { name: 'New check' }), 'Floor mats{Enter}');
    expect(screen.getByTestId('done')).toHaveTextContent('2 of 5 checks done');
    expect(screen.getByRole('checkbox', { name: 'Floor mats' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'New check' })).toHaveFocus();
  });

  it('focuses the input through viewChild and ignores blank items', async () => {
    const user = userEvent.setup();
    await render(QueriesDemo, { providers: [provideTranslateTesting()] });
    await user.click(screen.getByRole('button', { name: 'viewChild → focus()' }));
    expect(screen.getByRole('textbox', { name: 'New check' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Add check' }));
    expect(screen.getByTestId('done')).toHaveTextContent('0 of 4 checks done');
  });
});
