import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import Home from './home';
import { TIMELINE } from './timeline';

describe('Home', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('presents the lab and links every version', async () => {
    await render(Home, { providers: [provideTranslateTesting()], routes: [] });
    expect(
      screen.getByRole('heading', { level: 1, name: 'Angular Evolution Lab' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Start with v16 →' })).toHaveAttribute('href', '/v16');
    for (const m of TIMELINE) {
      expect(
        screen.getByRole('link', { name: new RegExp(`^v${String(m.version)} `) }),
      ).toHaveAttribute('href', m.path);
    }
  });

  it('switches language from the i18n card and updates <html lang>', async () => {
    const user = userEvent.setup();
    await render(Home, { providers: [provideTranslateTesting()], routes: [] });
    await user.click(screen.getByRole('button', { name: 'DE' }));
    TestBed.tick();
    expect(await screen.findByRole('link', { name: 'Mit v16 beginnen →' })).toBeInTheDocument();
    expect(TestBed.inject(DOCUMENT).documentElement.lang).toBe('de');
    expect(screen.getByRole('button', { name: 'DE' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('<html lang="de">')).toBeInTheDocument();
  });

  it('ignores unknown languages', async () => {
    const { fixture } = await render(Home, { providers: [provideTranslateTesting()], routes: [] });
    (fixture.componentInstance as unknown as { switchTo(l: string): void }).switchTo('fr');
    expect(TestBed.inject(DOCUMENT).documentElement.lang).not.toBe('fr');
  });
});
