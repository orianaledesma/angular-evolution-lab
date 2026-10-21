import { HttpErrorResponse } from '@angular/common/http';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of, throwError } from 'rxjs';
import { VehicleApi, type VehicleQuery } from '@core/api/vehicle-api';
import type { Dealer } from '@core/models/vehicle';
import countries from '../../../../public/mock-api/countries.json';
import dealers from '../../../../public/mock-api/dealers.json';
import vehicles from '../../../../public/mock-api/vehicles.json';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { DEALER_FETCHER } from './dealer-source';
import V19LinkedResource from './v19-linked-resource';

describe('V19 page (linkedSignal · resource · rxResource)', () => {
  async function setup() {
    const fetcher = jest.fn((cityId: string, signal: AbortSignal) =>
      signal.aborted
        ? Promise.reject(new Error('aborted'))
        : Promise.resolve((dealers as Dealer[]).filter((d) => d.cityId === cityId)),
    );
    const search = jest.fn((query: VehicleQuery) =>
      query.simulate === 'error'
        ? throwError(() => new HttpErrorResponse({ status: 503 }))
        : of(vehicles.filter((v) => v.fuel === query.fuel)),
    );
    const user = userEvent.setup();
    const result = await render(V19LinkedResource, {
      providers: [
        provideTranslateTesting(),
        { provide: VehicleApi, useValue: { countries: () => of(countries), search } },
        { provide: DEALER_FETCHER, useValue: fetcher },
      ],
    });
    await result.fixture.whenStable();
    return { user, fetcher, search, ...result };
  }

  it('linkedSignal: derives the city, stays writable and resets on country change', async () => {
    const { user } = await setup();
    expect(screen.getByTestId('city')).toHaveTextContent('München');

    await user.click(screen.getByRole('option', { name: 'Hamburg' }));
    expect(screen.getByTestId('city')).toHaveTextContent('Hamburg');

    await user.click(screen.getByRole('button', { name: 'AT · Österreich' }));
    expect(screen.getByTestId('country')).toHaveTextContent('AT');
    expect(screen.getByTestId('city')).toHaveTextContent('Wien');
    expect(screen.getByRole('option', { name: 'Wien' })).toHaveAttribute('aria-selected', 'true');
  });

  it('resource: loads dealers for the linked city and reloads on demand', async () => {
    const { user, fetcher } = await setup();
    expect(await screen.findByText('2 dealers in München')).toBeInTheDocument();
    expect(screen.getByText('Autohaus München')).toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: 'Berlin' }));
    expect(await screen.findByText('Mobility Center Berlin')).toBeInTheDocument();
    expect(fetcher).toHaveBeenLastCalledWith('ber', expect.any(AbortSignal));

    await user.click(screen.getAllByRole('button', { name: 'reload()' })[0]!);
    await waitFor(() => {
      expect(screen.getByTestId('resource-status')).toHaveTextContent('status() = resolved');
    });
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it('resource: surfaces loader errors', async () => {
    const { fetcher, user } = await setup();
    fetcher.mockRejectedValueOnce(new Error('boom'));
    await user.click(screen.getByRole('option', { name: 'Stuttgart' }));
    expect(await screen.findByText('Something went wrong: boom')).toBeInTheDocument();
  });

  it('rxResource: streams vehicles per fuel type and reports errors', async () => {
    const { user, search } = await setup();
    expect(await screen.findByText('Volkswagen ID.3')).toBeInTheDocument();
    expect(screen.getByTestId('rx-status')).toHaveTextContent('resolved');

    await user.click(screen.getByRole('button', { name: 'Diesel' }));
    expect(await screen.findByText('BMW 320d Touring')).toBeInTheDocument();
    expect(search).toHaveBeenLastCalledWith({ fuel: 'diesel', simulate: '' });

    await user.click(screen.getByRole('checkbox', { name: 'Simulate a 503' }));
    expect(await screen.findByText(/returned 503/)).toBeInTheDocument();
    expect(screen.getByTestId('rx-status')).toHaveTextContent('error');
  });
});
