import { fireEvent, render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { PriceTag } from './price-tag';
import { RequiredInputDemo } from './required-input-demo';

describe('PriceTag (required inputs + transform)', () => {
  it('coerces string attributes to numbers and a bare attribute to true', async () => {
    await render(`<app-price-tag amount="40000" powerKw="100" discounted />`, {
      imports: [PriceTag],
      providers: [provideTranslateTesting()],
    });
    expect(screen.getByText('€36,000')).toBeInTheDocument();
    expect(screen.getByText('€40,000').tagName).toBe('S');
    expect(screen.getByText(/100 kW · 136 hp/)).toBeInTheDocument();
  });

  it('shows the plain price without discount', async () => {
    await render(`<app-price-tag amount="40000" powerKw="100" />`, {
      imports: [PriceTag],
      providers: [provideTranslateTesting()],
    });
    expect(screen.getByText('€40,000')).toBeInTheDocument();
    expect(screen.queryByText(/−10/)).not.toBeInTheDocument();
  });
});

describe('RequiredInputDemo', () => {
  it('updates the tag from string control values', async () => {
    const user = userEvent.setup();
    await render(RequiredInputDemo, { providers: [provideTranslateTesting()] });

    fireEvent.input(screen.getByRole('slider', { name: /Power/ }), { target: { value: '300' } });
    await user.click(screen.getByRole('checkbox', { name: 'Apply 10 % discount' }));

    expect(screen.getByText(/300 kW · 408 hp/)).toBeInTheDocument();
    expect(screen.getByText('€53,910')).toBeInTheDocument();
  });
});
