import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { MOCK_BACKEND_CONFIG } from '@core/http/mock-backend.interceptor';
import { provideAppHttp } from '@core/http/provide-http';
import { provideStaticBackend } from '../../../testing/static-backend';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { HttpResourceDemo } from './http-resource-demo';

describe('HttpResourceDemo (httpResource through the interceptor chain)', () => {
  async function setup(latencyMs = 0) {
    const user = userEvent.setup();
    const result = await render(HttpResourceDemo, {
      providers: [
        provideTranslateTesting(),
        provideAppHttp(),
        provideStaticBackend(),
        { provide: MOCK_BACKEND_CONFIG, useValue: { latencyMs, enabled: true } },
      ],
    });
    return { user, ...result };
  }

  it('resolves the list with status and statusCode', async () => {
    await setup();
    expect(await screen.findByText('Porsche Taycan')).toBeInTheDocument();
    expect(screen.getByTestId('http-status')).toHaveTextContent('resolved');
    expect(screen.getByText('statusCode() = 200')).toBeInTheDocument();
  });

  it('shows the loading skeleton while a request is in flight', async () => {
    await setup(25);
    expect(await screen.findByText('status() = loading')).toBeInTheDocument();
    expect(screen.queryByText('Porsche Taycan')).not.toBeInTheDocument();
    expect(await screen.findByText('Porsche Taycan')).toBeInTheDocument();
  });

  it('renders the empty state', async () => {
    const { user } = await setup();
    await screen.findByText('Porsche Taycan');
    await user.click(screen.getByRole('button', { name: 'Empty' }));
    expect(await screen.findByText('No vehicles in stock right now.')).toBeInTheDocument();
  });

  it('renders Problem Details for a 503 and recovers with reload()', async () => {
    const { user } = await setup();
    await screen.findByText('Porsche Taycan');
    await user.click(screen.getByRole('button', { name: 'Error 503' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('503 · Service unavailable');

    await user.click(screen.getByRole('button', { name: 'Normal' }));
    await user.click(screen.getByRole('button', { name: 'reload()' }));
    expect(await screen.findByText('Audi Q4 e-tron')).toBeInTheDocument();
  });
});
