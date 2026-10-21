import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { TabPanelDef, Tabs } from './tabs';

const template = `
  <app-tabs ariaLabel="Forms" [(selected)]="selected">
    <ng-template appTabPanel="reactive" label="Reactive"><p>Reactive panel</p></ng-template>
    <ng-template appTabPanel="signal" label="Signal"><p>Signal panel</p></ng-template>
  </app-tabs>
  <output data-testid="selected">{{ selected }}</output>
`;

describe('Tabs (Angular Aria)', () => {
  it('selects the first tab by default and exposes tab semantics', async () => {
    await render(template, {
      imports: [Tabs, TabPanelDef],
      componentProperties: { selected: undefined },
    });
    expect(screen.getByRole('tablist', { name: 'Forms' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Reactive' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Reactive panel')).toBeVisible();
  });

  it('switches panels with the keyboard and syncs the model', async () => {
    const user = userEvent.setup();
    await render(template, {
      imports: [Tabs, TabPanelDef],
      componentProperties: { selected: undefined },
    });
    await user.click(screen.getByRole('tab', { name: 'Reactive' }));
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Signal' })).toHaveAttribute('aria-selected', 'true');
    expect(await screen.findByText('Signal panel')).toBeInTheDocument();
    expect(screen.getByTestId('selected')).toHaveTextContent('signal');
  });

  it('honours an initial selection', async () => {
    await render(template, {
      imports: [Tabs, TabPanelDef],
      componentProperties: { selected: 'signal' },
    });
    expect(screen.getByRole('tab', { name: 'Signal' })).toHaveAttribute('aria-selected', 'true');
  });
});
