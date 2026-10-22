// Regenerates the README screenshots from the production build: `npm run build && node scripts/screenshots.mjs`.
import { chromium, devices } from '@playwright/test';
import { spawn } from 'node:child_process';
import { join } from 'node:path';

const out = join(import.meta.dirname, '..', 'docs', 'screenshots');
const server = spawn('node', [join(import.meta.dirname, 'serve-dist.mjs')], {
  env: { ...process.env, PORT: '4320' },
});
await new Promise((r) => setTimeout(r, 800));
const base = 'http://localhost:4320';
const browser = await chromium.launch();

async function shot(name, path, options = {}, prepare = async () => {}) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
    ...options,
  });
  const page = await context.newPage();
  await page.goto(base + path);
  await page.waitForLoadState('networkidle');
  await prepare(page);
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(out, `${name}.png`) });
  await context.close();
  console.log(`✔ ${name}.png`);
}

await shot('home', '/');
await shot('v22-onpush-dark', '/v22', { colorScheme: 'dark' }, async (page) => {
  for (let i = 0; i < 3; i++)
    await page.getByRole('button', { name: 'Change parent-only state' }).click();
  await page.getByRole('heading', { name: 'OnPush by default vs Eager' }).scrollIntoViewIfNeeded();
});
await shot('v21-signal-forms', '/v21', {}, async (page) => {
  await page.getByRole('textbox', { name: /Full name/ }).fill('Lena Huber');
  await page.getByRole('textbox', { name: /E-mail/ }).fill('lena@');
  await page.getByRole('textbox', { name: /Postcode/ }).click();
});
await shot('lifecycle-tree', '/lifecycle#cd-tree-demo', {}, async (page) => {
  await page.getByRole('button', { name: 'Click inside A2' }).click();
  await page.getByRole('heading', { name: 'Change detection tree' }).scrollIntoViewIfNeeded();
});
await shot('rxjs-flattening', '/rxjs', {}, async (page) => {
  await page.getByRole('button', { name: /Play scenario/ }).click();
  await page.getByText(/time window over/).waitFor({ timeout: 10_000 });
  await page.getByRole('heading', { name: /switchMap vs mergeMap/ }).scrollIntoViewIfNeeded();
});
await shot('interview', '/interview', { colorScheme: 'dark' }, async (page) => {
  await page.getByRole('switch', { name: 'Practice mode' }).check();
  const question = page.getByRole('article', { name: /switchMap a bad choice/ });
  await question.getByRole('button', { name: 'Show answer' }).click();
  await question.scrollIntoViewIfNeeded();
});
await shot('mobile-de', '/v19', { ...devices['Pixel 7'], locale: 'de-DE' });

await browser.close();
server.kill();
