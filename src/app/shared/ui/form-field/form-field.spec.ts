import { render, screen } from '@testing-library/angular';
import { FormField, describedBy } from './form-field';

describe('FormField', () => {
  it('associates label, hint and error with the control', async () => {
    await render(
      `<app-form-field label="E-mail" fieldId="email" hint="We never share it" error="Required" [required]="true">
        <input id="email" aria-describedby="email-hint email-error" />
      </app-form-field>`,
      { imports: [FormField] },
    );
    const input = screen.getByRole('textbox', { name: /E-mail/ });
    expect(input).toHaveAccessibleDescription('We never share it Required');
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders no hint or error when absent', async () => {
    await render(`<app-form-field label="Name" fieldId="n"><input id="n" /></app-form-field>`, {
      imports: [FormField],
    });
    expect(screen.getByRole('textbox', { name: 'Name' })).not.toHaveAccessibleDescription();
  });
});

describe('describedBy', () => {
  it('joins only the ids that exist', () => {
    expect(describedBy('f', true, true)).toBe('f-hint f-error');
    expect(describedBy('f', false, true)).toBe('f-error');
    expect(describedBy('f', false, false)).toBeNull();
  });
});
