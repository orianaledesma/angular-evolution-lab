import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';
import { VehicleApi } from '@core/api/vehicle-api';
import type { Vehicle } from '@core/models/vehicle';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { SEARCH_DEBOUNCE_MS, SearchDemo } from './search-demo';

const ID3: Vehicle = {
  id: 'vw-id3',
  brand: 'Volkswagen',
  model: 'ID.3',
  year: 2024,
  fuel: 'electric',
  powerKw: 150,
  priceEur: 39995,
};

describe('SearchDemo (toSignal + debounce + switchMap)', () => {
  beforeEach(() => {
    jest.useFakeTimers({ advanceTimers: true });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  async function setup(search: jest.Mock) {
    const user = userEvent.setup({
      advanceTimers: (ms) => {
        jest.advanceTimersByTime(ms);
      },
    });
    const result = await render(SearchDemo, {
      providers: [provideTranslateTesting(), { provide: VehicleApi, useValue: { search } }],
    });
    const settle = async () => {
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
      await result.fixture.whenStable();
    };
    return { user, settle, ...result };
  }

  it('waits for the debounce and sends a single request', async () => {
    const search = jest.fn().mockReturnValue(of([ID3]));
    const { user, settle } = await setup(search);

    await user.type(screen.getByRole('searchbox', { name: 'Search brand or model' }), 'id.3');
    expect(search).not.toHaveBeenCalled();

    await settle();
    expect(search).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenCalledWith({ q: 'id.3' });
    expect(screen.getByText('1 vehicles found')).toBeInTheDocument();
    expect(screen.getByText('Volkswagen ID.3')).toBeInTheDocument();
    expect(screen.getByText('1 requests sent')).toBeInTheDocument();
  });

  it('cancels the in-flight request when the query changes (switchMap)', async () => {
    const slow = new Subject<Vehicle[]>();
    const search = jest.fn().mockReturnValueOnce(slow).mockReturnValueOnce(of([]));
    const { user, settle } = await setup(search);
    const box = screen.getByRole('searchbox', { name: 'Search brand or model' });

    await user.type(box, 'bmw');
    await settle();
    expect(screen.getByText('Loading…')).toBeInTheDocument();

    await user.type(box, ' i4');
    await settle();
    expect(screen.getByText('1 cancelled by switchMap')).toBeInTheDocument();
    expect(slow.observed).toBe(false);
    expect(screen.getByText('Nothing to show.')).toBeInTheDocument();
  });

  it('shows Problem Details on failure and returns to idle when cleared', async () => {
    const search = jest.fn().mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 503,
            error: { type: 'x', title: 'Service unavailable', status: 503 },
          }),
      ),
    );
    const { user, settle } = await setup(search);
    const box = screen.getByRole('searchbox', { name: 'Search brand or model' });

    await user.type(box, 'audi');
    await settle();
    expect(screen.getByText('Service unavailable')).toBeInTheDocument();

    await user.clear(box);
    await settle();
    expect(screen.getByText(/Start typing/)).toBeInTheDocument();
  });
});
