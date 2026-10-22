import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { SubjectsDemo } from './subjects-demo';

describe('SubjectsDemo (cold, hot, late subscribers)', () => {
  async function setup() {
    const user = userEvent.setup();
    const result = await render(SubjectsDemo, { providers: [provideTranslateTesting()] });
    const values = (name: string) =>
      screen.getByTestId(`subscriber-${name}`).querySelector('dd')?.textContent.trim();
    const press = (name: string | RegExp) => user.click(screen.getByRole('button', { name }));
    const pick = (label: string) => user.click(screen.getByRole('radio', { name: label }));
    return { ...result, values, press, pick };
  }

  it('cold: runs the producer once per subscriber', async () => {
    const { press, values } = await setup();
    await press('Subscribe A');
    await press('Subscribe B');
    expect(values('A')).toBe('response #1');
    expect(values('B')).toBe('response #2');
    expect(screen.getByTestId('executions')).toHaveTextContent('2');
    expect(screen.queryByRole('button', { name: 'Emit next value' })).not.toBeInTheDocument();
  });

  it('shareReplay: one execution, cached for late subscribers', async () => {
    const { press, values, pick } = await setup();
    await pick('shareReplay(1)');
    await press('Subscribe A');
    await press('Subscribe C');
    expect(values('A')).toBe('response #1');
    expect(values('C')).toBe('response #1');
    expect(screen.getByTestId('executions')).toHaveTextContent('1');
  });

  it('Subject: late subscribers miss earlier values', async () => {
    const { press, values, pick } = await setup();
    await pick('Subject');
    await press('Subscribe A');
    await press('Emit next value');
    await press('Subscribe B');
    await press('Emit next value');
    expect(values('A')).toBe('v1, v2');
    expect(values('B')).toBe('v2');
    expect(values('C')).toBe('—');
    expect(screen.getByRole('button', { name: 'Subscribe A' })).toBeDisabled();
  });

  it('BehaviorSubject and ReplaySubject replay to late subscribers', async () => {
    const { press, values, pick } = await setup();
    await pick('BehaviorSubject');
    await press('Emit next value');
    await press('Subscribe A');
    expect(values('A')).toBe('v1');

    await pick('ReplaySubject(2)');
    expect(values('A')).toBe('—');
    for (let i = 0; i < 3; i++) {
      await press('Emit next value');
    }
    await press('Subscribe B');
    expect(values('B')).toBe('v2, v3');
  });

  it('a fresh BehaviorSubject starts with its initial value', async () => {
    const { press, values, pick } = await setup();
    await pick('BehaviorSubject');
    await press('Subscribe A');
    expect(values('A')).toBe('v0 (initial)');
  });
});
