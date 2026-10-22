import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { HooksDemo } from './hooks-demo';
import { HooksLog } from './hooks-log';

describe('HooksDemo (live lifecycle log)', () => {
  async function setup() {
    const user = userEvent.setup();
    const result = await render(HooksDemo, { providers: [provideTranslateTesting()] });
    const log = result.fixture.debugElement.injector.get(HooksLog);
    const press = async (name: string) => {
      await user.click(screen.getByRole('button', { name }));
      await result.fixture.whenStable();
    };
    /** Hooks of the newest action, in call order. */
    const latest = () => log.groups()[0]?.entries.map((e) => e.hook) ?? [];
    return { ...result, user, press, latest, log };
  }

  it('logs the full creation sequence, classic and modern, in call order', async () => {
    const { press, latest } = await setup();
    expect(screen.getByText('Mount the child to start.')).toBeInTheDocument();

    await press('Mount the child');
    expect(latest()).toEqual([
      'constructor',
      'ngOnChanges',
      'ngOnInit',
      'ngDoCheck',
      'effect()',
      'ngAfterContentInit',
      'ngAfterContentChecked',
      'ngAfterViewInit',
      'ngAfterViewChecked',
      'afterNextRender()',
      'afterRenderEffect()',
    ]);
    expect(screen.getAllByTestId('hooks-group')).toHaveLength(1);
  });

  it('runs ngOnChanges and the effects only when the input changes', async () => {
    const { press, latest } = await setup();
    await press('Mount the child');

    await press('Change the input');
    expect(latest()).toEqual([
      'ngOnChanges',
      'ngDoCheck',
      'effect()',
      'ngAfterContentChecked',
      'ngAfterViewChecked',
      'afterRenderEffect()',
    ]);
    expect(screen.getByText('W-12345E')).toBeInTheDocument();

    await press('Parent-only change');
    expect(latest()).toEqual(['ngDoCheck', 'ngAfterContentChecked', 'ngAfterViewChecked']);
  });

  it('logs a click inside the child and the destroy order', async () => {
    const { press, latest } = await setup();
    await press('Mount the child');

    await press('Click inside the child');
    expect(latest()).toEqual(['ngDoCheck', 'ngAfterContentChecked', 'ngAfterViewChecked']);

    await press('Unmount the child');
    expect(latest()).toEqual(['ngOnDestroy', 'DestroyRef.onDestroy()']);
    expect(screen.queryByTestId('hooks-child')).not.toBeInTheDocument();
  });

  it('keeps the five newest actions and can be cleared', async () => {
    const { press, log } = await setup();
    await press('Mount the child');
    for (let i = 0; i < 5; i++) {
      await press('Parent-only change');
    }
    expect(log.groups()).toHaveLength(5);

    await press('Clear');
    expect(log.groups()).toHaveLength(0);
  });
});
