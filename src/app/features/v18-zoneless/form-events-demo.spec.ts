import { FormControl } from '@angular/forms';
import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { FormEventsDemo, describeEvent } from './form-events-demo';

describe('FormEventsDemo (control.events)', () => {
  async function setup() {
    const user = userEvent.setup();
    await render(FormEventsDemo, { providers: [provideTranslateTesting()] });
    const log = () =>
      within(screen.getByTestId('event-log'))
        .queryAllByRole('listitem')
        .map((li) => li.textContent);
    return { user, log };
  }

  it('logs value, status, pristine and touched events from one stream', async () => {
    const { user, log } = await setup();
    const vin = screen.getByRole('textbox', { name: /VIN/ });
    await user.type(vin, 'W');
    await user.tab();

    const entries = log().join('\n');
    expect(entries).toMatch(/ValueChangeEvent/);
    expect(entries).toMatch(/StatusChangeEvent INVALID/);
    expect(entries).toMatch(/PristineChangeEvent pristine=false/);
    expect(entries).toMatch(/TouchedChangeEvent touched=true/);
    expect(vin).toHaveAttribute('aria-invalid', 'true');
    expect(vin).toHaveAccessibleDescription(/Enter a valid 17-character VIN/);
  });

  it('logs submit and reset, and clears the log', async () => {
    const { user, log } = await setup();
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(log()[0]).toMatch(/FormSubmittedEvent/);
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(log().join('\n')).toMatch(/FormResetEvent/);

    await user.click(screen.getByRole('button', { name: 'Clear log' }));
    expect(log()).toEqual([]);
  });

  it('describes unknown events by constructor name', () => {
    class CustomEvent {
      readonly source = new FormControl();
    }
    expect(describeEvent(new CustomEvent() as never).type).toBe('CustomEvent');
  });
});
