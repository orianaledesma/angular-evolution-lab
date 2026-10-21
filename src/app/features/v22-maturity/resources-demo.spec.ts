import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { MOCK_BACKEND_CONFIG } from '@core/http/mock-backend.interceptor';
import { provideAppHttp } from '@core/http/provide-http';
import { provideStaticBackend } from '../../../testing/static-backend';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { ResourcesDemo } from './resources-demo';

describe('ResourcesDemo (debounced + httpResource + chain)', () => {
  async function setup() {
    const user = userEvent.setup();
    await render(ResourcesDemo, {
      providers: [
        provideTranslateTesting(),
        provideAppHttp(),
        provideStaticBackend(),
        { provide: MOCK_BACKEND_CONFIG, useValue: { latencyMs: 0, enabled: true } },
      ],
    });
    return { user, box: screen.getByRole('searchbox', { name: 'Search brand or model' }) };
  }

  it('stays idle until there is a debounced term', async () => {
    await setup();
    expect(screen.getByTestId('results-status')).toHaveTextContent('idle');
    expect(screen.getByTestId('top-status')).toHaveTextContent('idle');
    expect(screen.getByText(/stays idle until the first resource resolves/)).toBeInTheDocument();
  });

  it('debounces, loads matches and the chained top match', async () => {
    const { user, box } = await setup();
    await user.type(box, 'audi');
    expect(screen.getByTestId('term-status')).toHaveTextContent('loading');

    expect(await screen.findByText('Audi Q4 e-tron')).toBeInTheDocument();
    expect(screen.getByText('Audi A4 Avant 40 TDI')).toBeInTheDocument();
    expect(await screen.findByTestId('top-match')).toHaveTextContent('Audi Q4 e-tron');
    expect(screen.getByTestId('top-status')).toHaveTextContent('resolved');
  });

  it('shows the empty state when nothing matches', async () => {
    const { user, box } = await setup();
    await user.type(box, 'trabant');
    expect(await screen.findByText('Nothing to show.')).toBeInTheDocument();
    expect(screen.getByTestId('top-status')).toHaveTextContent('idle');
  });
});
