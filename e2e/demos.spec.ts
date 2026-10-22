import { expect, openPage, test } from './fixtures';

test('v17 @defer on viewport loads the chart only after scrolling', async ({ page }) => {
  await openPage(page, '/v17', 'Control flow & defer');
  await expect(page.getByTestId('defer-placeholder')).toBeAttached();
  const scroller = page.getByRole('region', { name: 'Deferred chart area' });
  await scroller.scrollIntoViewIfNeeded();
  await expect(page.getByTestId('defer-placeholder')).toBeAttached();
  await scroller.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await expect(
    page.getByRole('figure', { name: 'Most powerful vehicles in stock (kW)' }),
  ).toBeVisible();
});

test('v18 zoneless: a plain field changed in setTimeout is not rendered until markForCheck()', async ({
  page,
}) => {
  await openPage(page, '/v18', 'Zoneless preview');
  await page.getByRole('button', { name: /plain field \+100 km/ }).click();
  await page.waitForTimeout(100);
  await expect(page.getByTestId('plain')).toHaveText('0 km');
  await page.getByRole('button', { name: 'markForCheck()' }).click();
  await expect(page.getByTestId('plain')).toHaveText('100 km');
});

test('v22 test drive: Signal Forms maps a 422 onto the e-mail field', async ({ page }) => {
  await openPage(page, '/v22', 'OnPush by default');
  const form = page.getByRole('form', { name: 'Signal Forms' });
  await form.getByRole('textbox', { name: /Full name/ }).fill('Anna Weber');
  await form.getByRole('textbox', { name: /E-mail/ }).fill('anna@blocked.test');
  await form.getByRole('combobox', { name: /Vehicle/ }).selectOption('vw-id3');
  await form.getByLabel(/Preferred date/).fill('2099-05-01');
  await form.getByRole('checkbox', { name: /I agree/ }).check();
  await form.getByRole('button', { name: 'Book test drive' }).click();
  await expect(form.getByText('This e-mail domain is not accepted.')).toBeVisible();

  await form.getByRole('textbox', { name: /E-mail/ }).fill('anna@example.de');
  await form.getByRole('button', { name: 'Book test drive' }).click();
  await expect(form.getByTestId('signal-confirmation')).toContainText('TD-VW-ID3-20990501');
});

test('v22 CSV export loads the lazy service and generates the file', async ({
  page,
  browserName,
}) => {
  await openPage(page, '/v22', 'OnPush by default');
  const download = browserName === 'webkit' ? null : page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export stock as CSV' }).click();
  await expect(page.getByTestId('csv-preview')).toContainText('id;brand;model');
  if (download) {
    expect((await download).suggestedFilename()).toBe('vehicle-stock.csv');
  }
});

test('v17 @for renders 5,000 rows and reuses them with track unit.id', async ({ page }) => {
  await openPage(page, '/v17', 'Control flow & defer');
  await page.getByRole('button', { name: 'Generate 5000 units' }).click();
  await expect(page.getByTestId('visible')).toHaveText('5000');
  await page.getByRole('button', { name: 'Refresh data (new objects)' }).click();
  await expect(page.getByTestId('created')).toHaveText('0');
  await page.getByRole('button', { name: /track unit \(/ }).click();
  await page.getByRole('button', { name: 'Refresh data (new objects)' }).click();
  await expect(page.getByTestId('created')).toHaveText('5000');
});

test('interview: "See it live" jumps to the demo and the back link returns to the question', async ({
  page,
}) => {
  await openPage(page, '/interview', 'Interview questions');
  const question = page.getByRole('article', { name: /makes OnPush the default/ });
  await question.getByRole('link', { name: /See it live: OnPush by default/ }).click();

  await expect(page).toHaveURL(/\/v22#cd-strategy-demo$/);
  await expect(page.locator('#cd-strategy-demo')).toBeFocused();
  await expect(page.locator('#cd-strategy-demo')).toBeInViewport();

  await page.getByRole('link', { name: 'Back to the question' }).click();
  await expect(page).toHaveURL(/\/interview#q-onPush$/);
  await expect(page.locator('#q-onPush')).toBeFocused();
  await expect(page.getByRole('link', { name: 'Back to the question' })).toBeHidden();
});

test('interview practice mode hides answers until revealed', async ({ page }) => {
  await openPage(page, '/interview', 'Interview questions');
  await page.getByRole('switch', { name: 'Practice mode' }).check();
  const question = page.getByRole('article', { name: /How do signals work under the hood/ });
  await expect(question.getByText('In one sentence')).toBeHidden();
  await question.getByRole('button', { name: 'Show answer' }).click();
  await expect(question.getByText('In one sentence')).toBeVisible();
});

test('rxjs: the scenario shows what each flattening operator does', async ({ page }) => {
  await openPage(page, '/rxjs', 'RxJS in practice');
  await page.getByRole('button', { name: /Play scenario/ }).click();
  await expect(page.getByText(/time window over/)).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId('summary-switchMap')).toContainText('#3 #5');
  await expect(page.getByTestId('summary-exhaustMap')).toContainText('#2 #3 #5');
});

test('lifecycle: a signal refreshes only the view that reads it', async ({ page }) => {
  await openPage(page, '/lifecycle', 'Lifecycle & change detection');
  await page.getByRole('button', { name: 'Set a signal read only by A1' }).click();
  await expect(page.getByTestId('tree-result')).toContainText('refreshed 1 of 6: Leaf A1');
});
