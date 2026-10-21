import { TestBed } from '@angular/core/testing';
import { provideRouter, withAutoCleanupInjectors } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { V21_ROUTES } from './v21.routes';

describe('CleanupDemo (withAutoCleanupInjectors)', () => {
  async function setup() {
    TestBed.configureTestingModule({
      providers: [
        provideTranslateTesting(),
        provideRouter([{ path: 'v21', children: V21_ROUTES }], withAutoCleanupInjectors()),
      ],
    });
    const harness = await RouterTestingHarness.create('/v21');
    const log = () =>
      within(screen.getByTestId('injector-log'))
        .getAllByRole('listitem')
        .map((li) => li.textContent.replace(/\s+/g, ' ').trim());
    const go = async (name: string) => {
      await userEvent.setup().click(screen.getByRole('link', { name }));
      await harness.fixture.whenStable();
    };
    return { harness, log, go };
  }

  it('destroys a route injector when leaving its route', async () => {
    const { log, go } = await setup();
    expect(log()).toEqual(['No route injector created yet — open a bay.']);

    await go('Bay A');
    expect(screen.getByTestId('bay')).toHaveTextContent('Bay A — BayTelemetry #1 is running.');
    expect(log()).toEqual(['#1 · bay A · alive']);

    await go('Bay B');
    expect(log()).toEqual(['#1 · bay A · destroyed', '#2 · bay B · alive']);

    await go('Leave the garage');
    expect(log()).toEqual(['#1 · bay A · destroyed', '#2 · bay B · destroyed']);
    expect(screen.queryByTestId('bay')).not.toBeInTheDocument();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Clear destroyed' }));
    expect(log()).toEqual(['No route injector created yet — open a bay.']);
  });
});
