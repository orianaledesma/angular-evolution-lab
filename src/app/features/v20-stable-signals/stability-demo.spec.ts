import { render, screen, within } from '@testing-library/angular';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { API_STABILITY, phaseAt } from './api-stability';
import { StabilityDemo } from './stability-demo';

describe('StabilityDemo', () => {
  it('renders one row per API with an accessible phase per version', async () => {
    await render(StabilityDemo, { providers: [provideTranslateTesting()] });
    const table = screen.getByRole('table', { name: 'API stability per Angular version' });
    expect(within(table).getAllByRole('row')).toHaveLength(API_STABILITY.length + 1);

    const effectRow = within(table).getByRole('row', { name: /effect\(\)/ });
    const cells = within(effectRow).getAllByRole('cell');
    expect(cells[0]).toHaveTextContent('developer preview');
    expect(cells[4]).toHaveTextContent('stable');
  });
});

describe('phaseAt', () => {
  it('maps a version to none / preview / stable', () => {
    const debounced = { api: 'debounced()', introduced: 22, stable: null };
    expect(phaseAt(debounced, 21)).toBe('none');
    expect(phaseAt(debounced, 22)).toBe('preview');
    expect(phaseAt({ api: 'x', introduced: 16, stable: 20 }, 20)).toBe('stable');
  });
});
