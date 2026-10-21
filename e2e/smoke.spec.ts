import { expect, openPage, test } from './fixtures';
import { ROUTES } from './routes';

for (const route of ROUTES) {
  test(`${route.path} renders without errors`, async ({ page }) => {
    await openPage(page, route.path, route.heading);
    await expect(page.getByRole('main')).toBeVisible();
  });
}

test('runs without zone.js', async ({ page }) => {
  await openPage(page, '/', 'Angular Evolution Lab');
  expect(await page.evaluate(() => 'Zone' in window)).toBe(false);
});

test('unknown URLs show the not-found page', async ({ page }) => {
  await openPage(page, '/does-not-exist', 'Page not found');
  await page.getByRole('link', { name: 'Back to overview' }).click();
  await expect(page).toHaveURL(/\/$/);
});

test('mobile: the navigation drawer opens and closes', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile only');
  await openPage(page, '/', 'Angular Evolution Lab');
  const toggle = page.getByRole('button', { name: 'Toggle navigation' });
  const nav = page.getByRole('navigation', { name: 'Main navigation' });
  await expect(nav).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await nav.getByRole('link', { name: /OnPush by default/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'OnPush by default' })).toBeVisible();
  await expect(nav).toBeHidden();
});
