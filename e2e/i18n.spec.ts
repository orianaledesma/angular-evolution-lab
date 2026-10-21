import { expect, openPage, test } from './fixtures';

test('switches the whole UI to German and remembers it', async ({ page, isMobile }) => {
  await openPage(page, '/v22', 'OnPush by default');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  await page.getByRole('button', { name: /Change language/ }).click();
  await page.getByRole('menuitem', { name: 'Deutsch' }).click();

  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await expect(page.getByRole('heading', { level: 1, name: 'OnPush als Standard' })).toBeVisible();
  await expect(page).toHaveTitle('OnPush als Standard · Angular Evolution Lab');
  if (!isMobile) {
    await expect(page.getByRole('navigation', { name: 'Hauptnavigation' })).toBeVisible();
  }
  await expect(page.getByRole('link', { name: 'Zum Hauptinhalt springen' })).toBeAttached();

  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'OnPush als Standard' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
});

test('picks the browser language on first visit', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'es-ES' });
  const page = await context.newPage();
  await page.goto('/');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Angular Evolution Lab' }),
  ).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.getByRole('link', { name: 'Empezar por la v16 →' })).toBeVisible();
  await context.close();
});
