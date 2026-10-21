import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { V18_ROUTES } from './v18.routes';

describe('v18 routes (functional redirectTo)', () => {
  it('redirects a legacy link and binds the model into the page', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideTranslateTesting(),
        provideRouter([{ path: 'v18', children: V18_ROUTES }], withComponentInputBinding()),
      ],
    });
    const harness = await RouterTestingHarness.create('/v18');
    expect(screen.getByRole('heading', { level: 1, name: 'Zoneless preview' })).toBeInTheDocument();
    expect(screen.getByText('Click a legacy link to see the redirect.')).toBeInTheDocument();

    await userEvent.setup().click(screen.getByRole('link', { name: '/v18/legacy/golf-7' }));
    await harness.fixture.whenStable();
    expect(screen.getByTestId('redirect-result')).toHaveTextContent(
      'Redirected from legacy link "golf-7"',
    );
  });
});
