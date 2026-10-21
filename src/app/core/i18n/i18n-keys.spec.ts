import de from '../../../../public/i18n/de.json';
import en from '../../../../public/i18n/en.json';
import es from '../../../../public/i18n/es.json';

function flatKeys(tree: object, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([key, value]) =>
    typeof value === 'object' && value !== null
      ? flatKeys(value as object, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

function placeholders(tree: object): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  const walk = (node: object, prefix: string) => {
    for (const [key, value] of Object.entries(node)) {
      if (typeof value === 'string') {
        out[`${prefix}${key}`] = [...value.matchAll(/\{\{\s*(\w+)\s*\}\}/g)]
          .map((m) => m[1]!)
          .sort();
      } else {
        walk(value as object, `${prefix}${key}.`);
      }
    }
  };
  walk(tree, '');
  return out;
}

describe('i18n files', () => {
  const reference = flatKeys(en).sort();

  it.each([
    ['es', es],
    ['de', de],
  ])('%s has exactly the same keys as en', (_lang, tree) => {
    expect(flatKeys(tree).sort()).toEqual(reference);
  });

  it.each([
    ['es', es],
    ['de', de],
  ])('%s keeps the same interpolation placeholders as en', (_lang, tree) => {
    expect(placeholders(tree)).toEqual(placeholders(en));
  });

  it('has no empty translations', () => {
    for (const tree of [en, es, de]) {
      expect(Object.values(placeholders(tree))).toBeDefined();
      const empty = flatKeys(tree).filter((key) => {
        const value = key
          .split('.')
          .reduce<unknown>((node, k) => (node as Record<string, unknown>)[k], tree);
        return typeof value !== 'string' || value.trim() === '';
      });
      expect(empty).toEqual([]);
    }
  });
});
