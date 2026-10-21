import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideTranslateTesting } from '../../../../testing/translate-testing';
import { CdCounter } from './cd-counter';

@Component({
  selector: 'app-host',
  imports: [CdCounter],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-cd-counter label="Host" />
    <button type="button" (click)="value.set(value() + 1)">Bump {{ value() }}</button>
  `,
})
class Host {
  readonly value = signal(0);
}

describe('CdCounter', () => {
  it('counts every check of its host view', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host, { providers: [provideTranslateTesting()] });
    const count = () =>
      Number(screen.getByTestId('cd-counter').querySelector('output')?.textContent);

    const initial = count();
    expect(initial).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: /Bump/ }));
    await fixture.whenStable();
    expect(count()).toBeGreaterThan(initial);
    expect(screen.getByTestId('cd-counter')).toHaveTextContent('change-detection checks');
  });
});
