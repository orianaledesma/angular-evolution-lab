import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { LanguageSwitcher } from './language-switcher';

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('opens an Aria menu and switches the document language', async () => {
    const user = userEvent.setup();
    await render(LanguageSwitcher, { providers: [provideTranslateTesting()] });

    const trigger = screen.getByRole('button', { name: 'EN Change language (current: English)' });
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    const items = screen.getAllByRole('menuitem');
    expect(items.map((i) => i.getAttribute('lang'))).toEqual(['en', 'es', 'de']);

    await user.click(screen.getByRole('menuitem', { name: 'Deutsch' }));
    TestBed.tick();
    expect(TestBed.inject(DOCUMENT).documentElement.lang).toBe('de');
    expect(
      await screen.findByRole('button', { name: 'DE Sprache ändern (aktuell: Deutsch)' }),
    ).toBeInTheDocument();
  });
});
