import { render, screen } from '@testing-library/angular';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { FallbackDemo } from './fallback-demo';

describe('FallbackDemo (ng-content fallback)', () => {
  it('renders fallback content only where nothing is projected', async () => {
    await render(FallbackDemo, { providers: [provideTranslateTesting()] });
    expect(
      screen.getByRole('heading', { level: 2, name: 'Title from fallback content' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Projected title/ })).toBeInTheDocument();
    expect(screen.queryByText('ignored')).not.toBeInTheDocument();
  });
});
