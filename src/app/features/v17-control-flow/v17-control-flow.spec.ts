import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';
import { VehicleApi } from '@core/api/vehicle-api';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { STOCK_SIZE } from './for-demo';
import V17ControlFlow from './v17-control-flow';

describe('V17 page + ViewTransitionsDemo', () => {
  it('switches the showroom layout through a router navigation', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideTranslateTesting(),
        provideRouter([{ path: 'v17', component: V17ControlFlow }], withComponentInputBinding()),
        { provide: VehicleApi, useValue: { search: () => of([]) } },
        { provide: STOCK_SIZE, useValue: 20 },
      ],
    });
    const harness = await RouterTestingHarness.create('/v17');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Control flow & defer' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('showroom')).not.toHaveClass('list');

    await userEvent.setup().click(screen.getByRole('link', { name: 'List' }));
    await harness.fixture.whenStable();
    expect(screen.getByTestId('showroom')).toHaveClass('list');
    expect(screen.getByRole('link', { name: 'List' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByText('Porsche Taycan').parentElement).toHaveStyle({
      viewTransitionName: 'vt-taycan',
    });
  });
});
