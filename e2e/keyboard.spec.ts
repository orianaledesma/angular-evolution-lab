import { expect, openPage, test } from './fixtures';

test.describe('keyboard-only navigation', () => {
  test.skip(({ isMobile }) => isMobile, 'Desktop layout: the sidenav is always visible');

  test('skip link, sidenav, Aria tabs and a form — without a mouse', async ({
    page,
    browserName,
  }) => {
    // WebKit on macOS only tabs through links with Option+Tab (system "Keyboard navigation" setting).
    const tab = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';
    const backTab = browserName === 'webkit' ? 'Alt+Shift+Tab' : 'Shift+Tab';
    await openPage(page, '/', 'Angular Evolution Lab');

    // 1. First Tab lands on the skip link, Enter moves focus into <main>.
    await page.keyboard.press(tab);
    const skip = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skip).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('main')).toBeFocused();

    // 2. Reach the v21 entry of the sidenav with Shift+Tab / Tab only.
    const target = page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: /Signal Forms & Aria/ });
    for (
      let i = 0;
      i < 30 && !(await target.evaluate((el) => el === document.activeElement));
      i++
    ) {
      await page.keyboard.press(backTab);
    }
    await expect(target).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/v21$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Signal Forms & Aria' }),
    ).toBeVisible();
    await expect(target).toHaveAttribute('aria-current', 'page');

    // 3. Angular Aria tabs: arrow keys move the selection.
    const overview = page.getByRole('tab', { name: 'Overview' });
    await overview.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Specs' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText('559 km')).toBeVisible();

    // 4. Fill and submit the Signal Forms contact form with the keyboard.
    await page.getByRole('textbox', { name: /Full name/ }).focus();
    await page.keyboard.type('Lena Huber');
    await page.keyboard.press('Tab');
    await page.keyboard.type('lena@example.at');
    await page.keyboard.press('Tab');
    await page.keyboard.type('1010');
    await page.keyboard.press('Enter');
    await expect(page.getByText('Thanks, Lena Huber')).toBeVisible();
  });

  test('the language menu works with Enter, arrows and Escape', async ({ page }) => {
    await openPage(page, '/', 'Angular Evolution Lab');
    const trigger = page.getByRole('button', { name: /Change language/ });
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menuitem', { name: 'English' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menuitem', { name: 'English' })).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});
