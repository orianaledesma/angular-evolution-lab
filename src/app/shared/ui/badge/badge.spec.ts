import { render, screen } from '@testing-library/angular';
import { Badge } from './badge';

describe('Badge', () => {
  it('reflects the tone as a class', async () => {
    await render(`<app-badge tone="success">Stable</app-badge>`, { imports: [Badge] });
    expect(screen.getByText('Stable')).toHaveClass('badge', 'badge--success');
  });

  it('defaults to neutral', async () => {
    await render(`<app-badge>Info</app-badge>`, { imports: [Badge] });
    expect(screen.getByText('Info')).toHaveClass('badge--neutral');
  });
});
