import AxeBuilder from '@axe-core/playwright';
import { expect, openPage, settleAnimations, test } from './fixtures';
import { ROUTES } from './routes';

const WCAG_21_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`axe · WCAG 2.1 AA · ${scheme}`, () => {
    test.use({ colorScheme: scheme, reducedMotion: 'reduce' });

    for (const route of ROUTES) {
      test(`${route.path} has no violations`, async ({ page }) => {
        await openPage(page, route.path, route.heading);
        await settleAnimations(page);
        const results = await new AxeBuilder({ page }).withTags(WCAG_21_AA).analyze();
        const summary = results.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => n.target.join(' ')).slice(0, 5),
        }));
        expect(summary).toEqual([]);
      });
    }
  });
}

test('open menus and dialogs stay accessible', async ({ page }) => {
  await openPage(page, '/v21', 'Signal Forms & Aria');
  await page.getByRole('button', { name: 'Export offer' }).click();
  await expect(page.getByRole('menuitem', { name: 'PDF offer' })).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(WCAG_21_AA).analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
});
