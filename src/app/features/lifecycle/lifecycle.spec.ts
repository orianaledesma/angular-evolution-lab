import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import Lifecycle from './lifecycle';
import { HOOK_MAPPINGS } from './snippets';

describe('Lifecycle page', () => {
  it('renders the four lifecycle demos with jump targets', async () => {
    const { container } = await render(Lifecycle, {
      providers: [provideTranslateTesting(), provideRouter([])],
    });
    expect(
      screen.getByRole('heading', { level: 1, name: 'Lifecycle & change detection' }),
    ).toBeInTheDocument();
    for (const id of ['hooks-demo', 'modern-hooks-demo', 'cd-tree-demo', 'injectors-demo']) {
      expect(container.querySelector(`#${id}`)).not.toBeNull();
    }
  });

  it('maps every classic hook to a modern API with a translated note', async () => {
    await render(Lifecycle, { providers: [provideTranslateTesting(), provideRouter([])] });
    const table = screen.getByRole('table');
    expect(table.querySelectorAll('tbody tr')).toHaveLength(HOOK_MAPPINGS.length);
    expect(screen.getByRole('rowheader', { name: 'ngOnChanges' })).toBeInTheDocument();
    expect(table).not.toHaveTextContent('lifecycle.modern.rows');
  });
});
