import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { DealerContactForm } from './dealer-contact-form';

describe('DealerContactForm (Signal Forms)', () => {
  async function setup() {
    const user = userEvent.setup();
    await render(DealerContactForm, { providers: [provideTranslateTesting()] });
    return { user };
  }

  it('binds inputs to the model signal through [formField]', async () => {
    const { user } = await setup();
    await user.type(screen.getByRole('textbox', { name: /Full name/ }), 'Lena Huber');
    expect(screen.getByTestId('model-json')).toHaveTextContent('"name": "Lena Huber"');
    expect(screen.getByTestId('form-valid')).toHaveTextContent('false');
  });

  it('shows field errors once touched, with aria wiring', async () => {
    const { user } = await setup();
    const emailBox = screen.getByRole('textbox', { name: /E-mail/ });
    await user.type(emailBox, 'not-an-email');
    await user.tab();
    expect(screen.getByText('Enter a valid e-mail address.')).toBeInTheDocument();
    expect(emailBox).toHaveAttribute('aria-invalid', 'true');
    expect(emailBox).toHaveAccessibleDescription('Enter a valid e-mail address.');
    expect(screen.getByTestId('email-errors')).toHaveTextContent('email');

    const postcode = screen.getByRole('textbox', { name: /Postcode/ });
    await user.type(postcode, '12');
    await user.tab();
    expect(screen.getByText('Use 4 or 5 digits.')).toBeInTheDocument();
  });

  it('marks everything touched on an invalid submit, then sends a valid one', async () => {
    const { user } = await setup();
    await user.click(screen.getByRole('button', { name: 'Send request' }));
    expect(screen.getAllByText('This field is required.')).toHaveLength(3);

    await user.type(screen.getByRole('textbox', { name: /Full name/ }), 'Lena');
    await user.type(screen.getByRole('textbox', { name: /E-mail/ }), 'lena@example.at');
    await user.type(screen.getByRole('textbox', { name: /Postcode/ }), '1010');
    await user.type(screen.getByRole('textbox', { name: /Message/ }), 'ID.7 please');
    expect(screen.getByText('11 / 280 characters')).toBeInTheDocument();
    expect(screen.getByTestId('form-valid')).toHaveTextContent('true');

    await user.click(screen.getByRole('button', { name: 'Send request' }));
    expect(screen.getByTestId('sent')).toHaveTextContent('Thanks, Lena');
    expect(screen.getByRole('textbox', { name: /Full name/ })).toHaveValue('');
    expect(screen.queryByText('This field is required.')).not.toBeInTheDocument();
  });
});
