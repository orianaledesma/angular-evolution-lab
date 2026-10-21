import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { LoadingService } from '../http/loading.service';
import { Shell } from './shell';

@Component({ selector: 'app-dummy', template: '<h1>Dummy page</h1>' })
class DummyPage {}

describe('Shell', () => {
  async function setup() {
    const result = await render(Shell, {
      providers: [provideTranslateTesting()],
      routes: [{ path: '**', component: DummyPage }],
    });
    await result.navigate('/');
    return result;
  }

  it('renders landmarks and the routed page', async () => {
    await setup();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Dummy page' })).toBeInTheDocument();
  });

  it('moves focus to <main> with the skip link', async () => {
    const user = userEvent.setup();
    await setup();
    await user.tab();
    const skip = screen.getByRole('link', { name: 'Skip to main content' });
    expect(skip).toHaveFocus();
    expect(skip).toHaveAttribute('href', '/#main-content');
    await user.keyboard('{Enter}');
    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('toggles the mobile navigation with aria-expanded', async () => {
    const user = userEvent.setup();
    await setup();
    const toggle = screen.getByRole('button', { name: 'Toggle navigation' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await user.click(screen.getByRole('link', { name: /Signals arrive/ }));
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows a global loading status while requests are in flight', async () => {
    const { fixture } = await setup();
    const loading = fixture.debugElement.injector.get(LoadingService);
    loading.start();
    expect(await screen.findByRole('status')).toHaveTextContent('Loading…');
    loading.stop();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
