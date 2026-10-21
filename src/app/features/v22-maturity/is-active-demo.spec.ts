import { Component } from '@angular/core';
import { render, screen, within } from '@testing-library/angular';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { IsActiveDemo } from './is-active-demo';

@Component({ selector: 'app-blank', template: '' })
class Blank {}

describe('IsActiveDemo', () => {
  it('reflects router state through isActive() signals', async () => {
    const { navigate, fixture } = await render(IsActiveDemo, {
      providers: [provideTranslateTesting()],
      routes: [{ path: '**', component: Blank }],
    });
    await navigate('/v22');
    fixture.detectChanges();
    const row = (path: string) => screen.getByRole('row', { name: new RegExp(`^${path} `) });
    expect(within(row('/v22')).getByText('true')).toBeInTheDocument();
    expect(within(row('/v21')).getByText('false')).toBeInTheDocument();

    await navigate('/v21/bay-a');
    fixture.detectChanges();
    expect(within(row('/v21')).getByText('true')).toBeInTheDocument();
  });
});
