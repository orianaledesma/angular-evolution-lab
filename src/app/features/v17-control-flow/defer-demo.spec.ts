import { DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { screen } from '@testing-library/angular';
import { of } from 'rxjs';
import { VehicleApi } from '@core/api/vehicle-api';
import vehicles from '../../../../public/mock-api/vehicles.json';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { DeferDemo } from './defer-demo';

describe('DeferDemo (@defer on viewport)', () => {
  it('goes placeholder → loading → chart', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideTranslateTesting(),
        { provide: VehicleApi, useValue: { search: () => of(vehicles) } },
      ],
      deferBlockBehavior: DeferBlockBehavior.Manual,
    });
    const fixture = TestBed.createComponent(DeferDemo);
    await fixture.whenStable();
    expect(screen.getByTestId('defer-placeholder')).toBeInTheDocument();

    const [block] = await fixture.getDeferBlocks();
    await block!.render(DeferBlockState.Loading);
    expect(screen.getByTestId('defer-loading')).toBeInTheDocument();

    await block!.render(DeferBlockState.Complete);
    expect(
      screen.getByRole('figure', { name: 'Most powerful vehicles in stock (kW)' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Volkswagen Touareg R eHybrid');
    expect(screen.getAllByRole('listitem')).toHaveLength(8);

    await block!.render(DeferBlockState.Error);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
