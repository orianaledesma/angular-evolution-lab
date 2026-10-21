import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { MOCK_BACKEND_CONFIG } from '@core/http/mock-backend.interceptor';
import { provideAppHttp } from '@core/http/provide-http';
import { provideStaticBackend } from '../../../../testing/static-backend';
import { provideTranslateTesting } from '../../../../testing/translate-testing';
import { TestDriveDemo } from '../test-drive-demo';
import { earliestDate, serverFieldError } from './test-drive-options';

describe('TestDriveDemo (Reactive Forms vs Signal Forms)', () => {
  async function setup() {
    const user = userEvent.setup();
    await render(TestDriveDemo, {
      providers: [
        provideTranslateTesting(),
        provideAppHttp(),
        provideStaticBackend(),
        { provide: MOCK_BACKEND_CONFIG, useValue: { latencyMs: 0, enabled: true } },
      ],
    });
    return { user };
  }

  const variants = [
    ['Reactive Forms', 'reactive-confirmation'],
    ['Signal Forms', 'signal-confirmation'],
  ] as const;

  async function fill(
    user: ReturnType<typeof userEvent.setup>,
    form: HTMLElement,
    emailAddress: string,
  ) {
    const q = within(form);
    await user.type(q.getByRole('textbox', { name: /Full name/ }), 'Anna Weber');
    await user.type(q.getByRole('textbox', { name: /E-mail/ }), emailAddress);
    await user.selectOptions(q.getByRole('combobox', { name: /Vehicle/ }), 'bmw-i4');
    await user.type(q.getByLabelText(/Preferred date/), '2099-03-14');
    await user.click(q.getByRole('checkbox', { name: /I agree/ }));
  }

  it.each(variants)('%s: blocks an empty submit with field errors', async (title) => {
    const { user } = await setup();
    const form = screen.getByRole('form', { name: title });
    await user.click(within(form).getByRole('button', { name: 'Book test drive' }));
    expect(within(form).getAllByText('This field is required.')).toHaveLength(4);
    expect(within(form).getByText('Please give your consent.')).toBeInTheDocument();
    expect(within(form).getByRole('textbox', { name: /Full name/ })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it.each(variants)('%s: books and shows the reference', async (title, testId) => {
    const { user } = await setup();
    const form = screen.getByRole('form', { name: title });
    await fill(user, form, 'anna@example.de');
    await user.click(within(form).getByRole('button', { name: 'Book test drive' }));
    expect(await within(form).findByTestId(testId)).toHaveTextContent(
      'Booked! Reference TD-BMW-I4-20990314',
    );
    expect(within(form).getByRole('textbox', { name: /Full name/ })).toHaveValue('');
  });

  it.each(variants)('%s: maps a 422 Problem Details onto the e-mail field', async (title) => {
    const { user } = await setup();
    const form = screen.getByRole('form', { name: title });
    await fill(user, form, 'anna@blocked.test');
    await user.click(within(form).getByRole('button', { name: 'Book test drive' }));
    const emailBox = within(form).getByRole('textbox', { name: /E-mail/ });
    expect(
      await within(form).findByText('This e-mail domain is not accepted.'),
    ).toBeInTheDocument();
    expect(emailBox).toHaveAttribute('aria-invalid', 'true');
  });

  it.each(variants)('%s: rejects an invalid e-mail and a past date', async (title) => {
    const { user } = await setup();
    const form = screen.getByRole('form', { name: title });
    const q = within(form);
    await user.type(q.getByRole('textbox', { name: /E-mail/ }), 'nope');
    await user.type(q.getByLabelText(/Preferred date/), '2000-01-01');
    await user.click(q.getByRole('button', { name: 'Book test drive' }));
    expect(q.getByText('Enter a valid e-mail address.')).toBeInTheDocument();
    if (title === 'Signal Forms') {
      expect(q.getByText('Choose a date from tomorrow on.')).toBeInTheDocument();
    }
  });
});

describe('test-drive helpers', () => {
  it('computes tomorrow as yyyy-mm-dd', () => {
    expect(earliestDate(new Date(2026, 11, 31))).toBe('2027-01-01');
  });

  it('extracts a field error or falls back to the problem title', () => {
    const problem = {
      type: 't',
      title: 'Validation failed',
      status: 422,
      errors: { email: ['bad'] },
    };
    expect(serverFieldError({ error: problem }, 'email')).toBe('bad');
    expect(serverFieldError({ error: problem }, 'name')).toBe('Validation failed');
    expect(serverFieldError({ error: 'x' }, 'email')).toBeNull();
    expect(serverFieldError(null, 'email')).toBeNull();
  });
});
