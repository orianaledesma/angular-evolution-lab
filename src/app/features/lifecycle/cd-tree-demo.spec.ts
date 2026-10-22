import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { CdTreeDemo } from './cd-tree-demo';
import { FLASH_CLASS, TreeProbe } from './tree-probe';

describe('CdTreeDemo (which views refresh)', () => {
  async function setup() {
    const user = userEvent.setup();
    const result = await render(CdTreeDemo, { providers: [provideTranslateTesting()] });
    const probe = result.fixture.debugElement.injector.get(TreeProbe);
    const act = async (button: HTMLElement) => {
      await user.click(button);
      await result.fixture.whenStable();
      return probe.result()?.checked;
    };
    return { ...result, act, probe };
  }

  it('refreshes only the view that reads a signal', async () => {
    const { act } = await setup();
    const checked = await act(screen.getByRole('button', { name: 'Set a signal read only by A1' }));
    expect(checked).toEqual(['leafA1']);
    expect(within(screen.getByTestId('node-leafA1')).getByText('signal: 1')).toBeInTheDocument();
    expect(screen.getByTestId('node-leafA1')).toHaveClass(FLASH_CLASS);
    expect(screen.getByTestId('node-root')).not.toHaveClass(FLASH_CLASS);
    expect(screen.getByTestId('tree-result')).toHaveTextContent('refreshed 1 of 6: Leaf A1');
  });

  it('skips OnPush subtrees whose inputs did not change', async () => {
    const { act } = await setup();
    const checked = await act(screen.getByRole('button', { name: 'Change the input of B1' }));
    expect(checked).toEqual(['root', 'branchB', 'leafB1']);
    expect(
      within(screen.getByTestId('node-leafB1')).getByText('input: W-12345E'),
    ).toBeInTheDocument();
  });

  it('refreshes the event path and Eager siblings, but not OnPush leaves', async () => {
    const { act } = await setup();
    const checked = await act(screen.getByRole('button', { name: 'Click inside A2' }));
    expect(checked).toEqual(['root', 'branchA', 'leafA2', 'branchB']);
  });

  it('does not refresh anything for a plain field until a real notification arrives', async () => {
    const { act } = await setup();
    const leaf = screen.getByTestId('node-leafA1');

    expect(
      await act(screen.getByRole('button', { name: 'Mutate a plain field (no signal)' })),
    ).toEqual([]);
    expect(within(leaf).getByText('plain field: 0')).toBeInTheDocument();
    expect(screen.getByTestId('tree-result')).toHaveTextContent('nothing was refreshed.');

    await act(screen.getByRole('button', { name: 'Set a signal read only by A1' }));
    expect(within(leaf).getByText('plain field: 1')).toBeInTheDocument();
  });
});
