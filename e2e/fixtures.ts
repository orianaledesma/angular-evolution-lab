import { type Page, test as base, expect } from '@playwright/test';

/** Fails a test on any uncaught page error or console error. */
export const test = base.extend<{ errors: string[] }>({
  errors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => {
        if (m.type() === 'error') {
          errors.push(m.text());
        }
      });
      await use(errors);
      expect(errors, 'console / page errors').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

export async function openPage(page: Page, path: string, heading: string): Promise<void> {
  await page.goto(path);
  await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
  // Let lazy chunks, mock latency and @defer (on idle) settle.
  await page.waitForLoadState('networkidle');
}

/**
 * Waits for running CSS transitions and animations (e.g. a button's background fading in), so a
 * contrast check never samples a colour halfway through. Infinite animations are ignored.
 */
export async function settleAnimations(page: Page): Promise<void> {
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => undefined)),
    ),
  );
}
