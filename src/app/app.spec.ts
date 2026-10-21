import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  it('renders the main heading', async () => {
    await render(App, { providers: [provideRouter([])] });
    expect(
      screen.getByRole('heading', { level: 1, name: 'Angular Evolution Lab' }),
    ).toBeInTheDocument();
  });
});
