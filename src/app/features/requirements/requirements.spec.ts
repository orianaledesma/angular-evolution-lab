import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen, within } from '@testing-library/angular';
import en from '../../../../public/i18n/en.json';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import Requirements from './requirements';
import { REQUIREMENTS, testName } from './requirements-data';

const ROOT = join(__dirname, '../../../..');

function lookup(key: string): unknown {
  return key
    .split('.')
    .reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], en);
}

describe('Requirements page', () => {
  it('renders one row per requirement with demo links and test names', async () => {
    await render(Requirements, { providers: [provideTranslateTesting()], routes: [] });
    const table = screen.getByRole('table', { name: 'Requirement, demo and test mapping' });
    const rows = within(table).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(REQUIREMENTS.length);

    const forms = within(table)
      .getByRole('rowheader', { name: /Complex forms and validation/ })
      .closest('tr')!;
    expect(
      within(forms).getByRole('link', { name: 'Signal Forms — contact a dealer' }),
    ).toHaveAttribute('href', '/v21');
    expect(within(forms).getByText('test-drive.spec.ts')).toBeInTheDocument();
  });
});

describe('Requirements data integrity', () => {
  it.each(REQUIREMENTS.flatMap((r) => r.tests.map((t) => [r.id, t])))(
    '%s → %s exists',
    (_id, test) => {
      expect(existsSync(join(ROOT, test))).toBe(true);
    },
  );

  it('every requirement and demo label is translated', () => {
    for (const r of REQUIREMENTS) {
      expect(typeof lookup(`requirements.items.${r.id}.title`)).toBe('string');
      expect(typeof lookup(`requirements.items.${r.id}.detail`)).toBe('string');
      for (const d of r.demos) {
        expect([d.label, typeof lookup(d.label)]).toEqual([d.label, 'string']);
      }
    }
  });

  it('extracts file names', () => {
    expect(testName('src/a/b.spec.ts')).toBe('b.spec.ts');
    expect(testName('')).toBe('');
  });
});
