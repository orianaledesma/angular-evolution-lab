import { DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { screen } from '@testing-library/angular';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { DeferIdleDemo } from './defer-idle-demo';

describe('DeferIdleDemo (@defer on idle(2000))', () => {
  it('renders the placeholder, then the recommendations', async () => {
    TestBed.configureTestingModule({
      providers: [provideTranslateTesting()],
      deferBlockBehavior: DeferBlockBehavior.Manual,
    });
    const fixture = TestBed.createComponent(DeferIdleDemo);
    await fixture.whenStable();
    expect(screen.getByTestId('idle-placeholder')).toBeInTheDocument();

    const [block] = await fixture.getDeferBlocks();
    await block!.render(DeferBlockState.Complete);
    expect(screen.getByTestId('recommendations')).toHaveTextContent('Wallbox 11 kW');
  });
});
