import { HttpErrorResponse } from '@angular/common/http';
import { RouterTestingHarness } from '@angular/router/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { screen } from '@testing-library/angular';
import { of, throwError } from 'rxjs';
import { VehicleApi } from '@core/api/vehicle-api';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import V16Signals from './v16-signals';

describe('V16 page + InputBindingDemo (withComponentInputBinding)', () => {
  async function setup() {
    const byId = jest.fn((id: string) =>
      id === 'nope'
        ? throwError(
            () =>
              new HttpErrorResponse({
                status: 404,
                error: { type: 'x', title: 'Not found', status: 404 },
              }),
          )
        : of({
            id,
            brand: 'BMW',
            model: 'i4 eDrive40',
            year: 2024,
            fuel: 'electric',
            powerKw: 250,
            priceEur: 59900,
          }),
    );
    TestBed.configureTestingModule({
      providers: [
        provideTranslateTesting(),
        provideRouter([{ path: 'v16', component: V16Signals }], withComponentInputBinding()),
        { provide: VehicleApi, useValue: { byId, search: jest.fn(() => of([])) } },
      ],
    });
    const harness = await RouterTestingHarness.create();
    return { harness, byId };
  }

  it('binds ?vehicle= into the page input and loads that vehicle', async () => {
    const { harness, byId } = await setup();
    await harness.navigateByUrl('/v16?vehicle=bmw-i4');
    await harness.fixture.whenStable();

    expect(screen.getByRole('heading', { level: 1, name: 'Signals arrive' })).toBeInTheDocument();
    expect(screen.getByTestId('bound-id')).toHaveTextContent('bmw-i4');
    expect(byId).toHaveBeenCalledWith('bmw-i4');
    expect(screen.getByText('BMW i4 eDrive40')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '?vehicle=bmw-i4' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  it('renders the Problem Details of a missing vehicle and idles without a param', async () => {
    const { harness } = await setup();
    await harness.navigateByUrl('/v16?vehicle=nope');
    await harness.fixture.whenStable();
    expect(screen.getByText('404 · Not found')).toBeInTheDocument();

    await harness.navigateByUrl('/v16');
    await harness.fixture.whenStable();
    expect(screen.getByTestId('bound-id')).toHaveTextContent('undefined');
    expect(screen.getByText(/Pick a vehicle above/)).toBeInTheDocument();
  });
});
