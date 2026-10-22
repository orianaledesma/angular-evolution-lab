import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideRouter } from '@angular/router';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { InjectorsDemo } from './injectors-demo';

describe('InjectorsDemo (service lifetimes)', () => {
  async function setup() {
    const user = userEvent.setup();
    const result = await render(InjectorsDemo, {
      providers: [provideTranslateTesting(), provideRouter([])],
    });
    return { ...result, user };
  }

  it('creates one TripMeter per panel, shared with its child, destroyed with the panel', async () => {
    const { user, fixture } = await setup();
    const log = screen.getByTestId('scope-log');
    expect(within(log).getByText('TripMeter #1 created')).toBeInTheDocument();

    const panelA = screen.getByTestId('panel-Panel A');
    await user.click(within(panelA).getByRole('button', { name: '+10 km' }));
    expect(panelA).toHaveTextContent(/TripMeter #1 · 10 km/);
    expect(panelA).toHaveTextContent(/Child component → TripMeter #1/);

    await user.click(screen.getByRole('button', { name: 'Add Panel B' }));
    await fixture.whenStable();
    expect(within(log).getByText('TripMeter #2 created')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove Panel A' }));
    await fixture.whenStable();
    expect(screen.queryByTestId('panel-Panel A')).not.toBeInTheDocument();
    expect(
      within(log).getByText('TripMeter #1 destroyed (DestroyRef.onDestroy)'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add Panel A' }));
    await fixture.whenStable();
    expect(within(log).getByText('TripMeter #3 created')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(within(log).getByText('—')).toBeInTheDocument();
  });

  it('shares the root FleetClock everywhere', async () => {
    const { user } = await setup();
    await user.click(screen.getByRole('button', { name: 'Add Panel B' }));
    const id = /FleetClock #(\d+)/.exec(screen.getByText(/^FleetClock #\d+$/).textContent)?.[1];
    expect(id).toBeDefined();
    for (const panel of [
      screen.getByTestId('panel-Panel A'),
      screen.getByTestId('panel-Panel B'),
    ]) {
      expect(panel).toHaveTextContent(`FleetClock #${id ?? ''}`);
    }
  });

  it('shows NG0203 for inject() outside an injection context, and the fix', async () => {
    const { user } = await setup();
    await user.click(screen.getByRole('button', { name: 'inject() in a click handler' }));
    expect(screen.getByTestId('inject-result')).toHaveTextContent('NG0203');

    await user.click(screen.getByRole('button', { name: 'runInInjectionContext()' }));
    expect(screen.getByTestId('inject-result')).toHaveTextContent(/✓ FleetClock #\d+/);
  });

  it('links to the route-scoped injector demo with a way back', async () => {
    await setup();
    expect(screen.getByRole('link', { name: 'See it in the v21 demo' })).toHaveAttribute(
      'href',
      '/v21#cleanup-demo',
    );
  });
});
