import { render, screen } from '@testing-library/angular';
import { Button } from './button';

describe('Button', () => {
  it('keeps native button semantics and applies variant classes', async () => {
    await render(`<button app-button variant="danger" size="sm" type="button">Delete</button>`, {
      imports: [Button],
    });
    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button).toHaveClass('btn', 'btn--danger', 'btn--sm');
    expect(button).not.toHaveClass('btn--primary');
  });

  it('defaults to primary and works on links', async () => {
    await render(`<a app-button href="/x">Go</a>`, { imports: [Button] });
    expect(screen.getByRole('link', { name: 'Go' })).toHaveClass('btn--primary');
  });
});
