import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { ForDemo } from './for-demo';
import { generateStock, shuffle } from './stock';

describe('ForDemo (@for track + @empty)', () => {
  async function setup() {
    const user = userEvent.setup();
    const result = await render(ForDemo, {
      providers: [provideTranslateTesting()],
      inputs: { rows: 40 },
    });
    await user.click(screen.getByRole('button', { name: 'Generate 40 units' }));
    await result.fixture.whenStable();
    return { user, ...result };
  }

  const created = () => Number(screen.getByTestId('created').textContent);

  it('starts empty, with the actions disabled', async () => {
    await render(ForDemo, { providers: [provideTranslateTesting()], inputs: { rows: 40 } });
    expect(screen.getByText(/No stock loaded yet/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Shuffle' })).toBeDisabled();
  });

  it('renders the stock on demand', async () => {
    await setup();
    expect(screen.getByTestId('visible')).toHaveTextContent('40');
    expect(
      screen.getByRole('region', { name: 'Vehicle stock' }).querySelectorAll('tbody tr'),
    ).toHaveLength(40);
  });

  it('reuses rows with track unit.id but rebuilds them with identity tracking', async () => {
    const { user, fixture } = await setup();
    await user.click(screen.getByRole('button', { name: 'Refresh data (new objects)' }));
    await fixture.whenStable();
    expect(created()).toBe(0);

    await user.click(screen.getByRole('button', { name: /track unit \(/ }));
    await fixture.whenStable();
    await user.click(screen.getByRole('button', { name: 'Refresh data (new objects)' }));
    await fixture.whenStable();
    expect(created()).toBe(40);
    expect(screen.getByRole('button', { name: /track unit \(/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('shows @empty when the filter matches nothing, and shuffles', async () => {
    const { user, fixture } = await setup();
    await user.type(screen.getByRole('searchbox'), 'zzz-nothing');
    expect(screen.getByText(/No vehicles match this filter/)).toBeInTheDocument();
    await user.clear(screen.getByRole('searchbox'));

    const firstBefore = screen.getAllByRole('row')[1]?.textContent;
    await user.click(screen.getByRole('button', { name: 'Shuffle' }));
    await fixture.whenStable();
    expect(screen.getAllByRole('row')[1]?.textContent).not.toBe(firstBefore);
    expect(screen.getByText(/ms$/)).toBeInTheDocument();
  });

  it('shows @empty in identity mode too', async () => {
    const { user } = await setup();
    await user.click(screen.getByRole('button', { name: /track unit \(/ }));
    await user.type(screen.getByRole('searchbox'), 'zzz-nothing');
    expect(screen.getByText(/No vehicles match this filter/)).toBeInTheDocument();
  });
});

describe('stock helpers', () => {
  it('are deterministic', () => {
    expect(generateStock(3)).toEqual(generateStock(3));
    expect(shuffle([1, 2, 3, 4], 7)).toEqual(shuffle([1, 2, 3, 4], 7));
    expect(shuffle([1, 2, 3, 4], 7).sort()).toEqual([1, 2, 3, 4]);
  });
});
