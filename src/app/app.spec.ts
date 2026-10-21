import { render, screen } from '@testing-library/angular';
import { provideTranslateTesting } from '../testing/translate-testing';
import { App } from './app';

describe('App', () => {
  it('renders the application shell', async () => {
    await render(App, { providers: [provideTranslateTesting()], routes: [] });
    expect(screen.getByRole('link', { name: 'Angular Evolution Lab' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
