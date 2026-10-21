import { fireEvent, render, screen } from '@testing-library/angular';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { LetDemo } from './let-demo';

describe('LetDemo (@let)', () => {
  it('recomputes the template variables when inputs change', async () => {
    await render(LetDemo, { providers: [provideTranslateTesting()] });
    // (48900 − 5000) × (1 + 0.039 × 3) / 36 = 1362.12
    expect(screen.getByTestId('rate')).toHaveTextContent('€1,362');

    fireEvent.change(screen.getByRole('combobox', { name: 'Term (months)' }), {
      target: { value: '48' },
    });
    fireEvent.input(screen.getByRole('slider', { name: /Deposit/ }), { target: { value: '0' } });
    fireEvent.input(screen.getByRole('slider', { name: /Vehicle price/ }), {
      target: { value: '60000' },
    });
    // 60000 × (1 + 0.039 × 4) / 48 = 1445
    expect(screen.getByTestId('rate')).toHaveTextContent('€1,445');
  });
});
