import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { Dialog } from './dialog';

describe('Dialog', () => {
  const template = `
    <button type="button" (click)="open = true">Open</button>
    <app-dialog heading="Export ready" closeLabel="Close dialog" [(open)]="open"><p>Done</p></app-dialog>
    <output data-testid="state">{{ open }}</output>
  `;

  it('opens as a labelled modal and closes from the close button', async () => {
    const user = userEvent.setup();
    await render(template, { imports: [Dialog], componentProperties: { open: false } });
    await user.click(screen.getByRole('button', { name: 'Open' }));

    const dialog = screen.getByRole('dialog', { name: 'Export ready' });
    expect(dialog).toHaveAttribute('open');
    await user.click(screen.getByRole('button', { name: 'Close dialog' }));
    expect(dialog).not.toHaveAttribute('open');
    expect(screen.getByTestId('state')).toHaveTextContent('false');
  });

  it('syncs the model when the platform closes it (Escape)', async () => {
    const { fixture } = await render(template, {
      imports: [Dialog],
      componentProperties: { open: true },
    });
    const dialog = screen.getByRole<HTMLDialogElement>('dialog', { name: 'Export ready' });
    expect(dialog.open).toBe(true);
    dialog.close();
    await fixture.whenStable();
    expect(screen.getByTestId('state')).toHaveTextContent('false');
  });
});
