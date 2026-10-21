import { render, screen } from '@testing-library/angular';
import { Card } from './card';

describe('Card', () => {
  it('renders the heading input as fallback content (v18 ng-content fallback)', async () => {
    await render(`<app-card heading="Fallback title"><p>Body</p></app-card>`, { imports: [Card] });
    expect(screen.getByRole('heading', { level: 2, name: 'Fallback title' })).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('replaces the fallback when a [card-title] is projected', async () => {
    await render(
      `<app-card heading="Ignored"><h3 card-title>Custom</h3><span card-footer>Foot</span></app-card>`,
      { imports: [Card] },
    );
    expect(screen.getByRole('heading', { level: 3, name: 'Custom' })).toBeInTheDocument();
    expect(screen.queryByText('Ignored')).not.toBeInTheDocument();
    expect(screen.getByText('Foot')).toBeInTheDocument();
  });
});
