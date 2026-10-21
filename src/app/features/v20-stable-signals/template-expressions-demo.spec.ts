import { fireEvent, render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { TemplateExpressionsDemo } from './template-expressions-demo';

describe('TemplateExpressionsDemo (template literal, **, in, void)', () => {
  it('evaluates the new expressions directly in the template', async () => {
    const user = userEvent.setup();
    await render(TemplateExpressionsDemo, { providers: [provideTranslateTesting()] });

    expect(screen.getByTestId('literal')).toHaveTextContent('Volkswagen ID.7 Tourer');
    // 54995 × 0.85³ = 33773.7
    expect(screen.getByTestId('residual')).toHaveTextContent('€33,774');
    expect(screen.getByTestId('in')).toHaveTextContent('true');

    fireEvent.input(screen.getByRole('slider', { name: /Years of ownership/ }), {
      target: { value: '0' },
    });
    expect(screen.getByTestId('residual')).toHaveTextContent('€54,995');

    await user.click(screen.getByRole('checkbox', { name: 'Heat pump' }));
    expect(screen.getByTestId('in')).toHaveTextContent('false');
    await user.click(screen.getByRole('checkbox', { name: 'Tow bar' }));
    expect(screen.getByRole('checkbox', { name: 'Tow bar' })).toBeChecked();

    await user.click(screen.getByRole('button', { name: /void save\(\)/ }));
    expect(screen.getByTestId('saves')).toHaveTextContent('1');
  });
});
