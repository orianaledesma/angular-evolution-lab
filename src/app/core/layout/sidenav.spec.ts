import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { Sidenav } from './sidenav';

@Component({ selector: 'app-blank', template: '' })
class Blank {}

describe('Sidenav', () => {
  it('marks only the active route with aria-current via isActive()', async () => {
    const { navigate, fixture } = await render(Sidenav, {
      providers: [provideTranslateTesting()],
      routes: [{ path: '**', component: Blank }],
    });
    await navigate('/v19');
    fixture.detectChanges();

    const current = screen
      .getAllByRole('link')
      .filter((l) => l.getAttribute('aria-current') === 'page');
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent('linkedSignal & resource');

    await navigate('/');
    fixture.detectChanges();
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /linkedSignal/ })).not.toHaveAttribute('aria-current');
  });
});
