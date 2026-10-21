// Renders the requirements map (same data as /requirements) as Markdown into README.md.
// `--check` fails when README.md is out of date (used in CI).
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { format, resolveConfig } from 'prettier';

const root = join(import.meta.dirname, '..');
const rows = JSON.parse(
  readFileSync(join(root, 'src/app/features/requirements/requirements.json'), 'utf8'),
);
const en = JSON.parse(readFileSync(join(root, 'public/i18n/en.json'), 'utf8'));
const t = (key) => key.split('.').reduce((node, part) => node?.[part], en) ?? key;
const START = '<!-- requirements:start -->';
const END = '<!-- requirements:end -->';

const table = [
  '| Requirement | Demo | Tests |',
  '| --- | --- | --- |',
  ...rows.map((r) => {
    const req = `**${t(`requirements.items.${r.id}.title`)}** — ${t(`requirements.items.${r.id}.detail`)}`;
    const demos = r.demos.map((d) => `${t(d.label)} (\`${d.path}\`)`).join('<br>');
    const tests = r.tests.map((p) => `[\`${p.split('/').pop()}\`](${p})`).join('<br>');
    return `| ${req} | ${demos} | ${tests} |`;
  }),
].join('\n');

const readmePath = join(root, 'README.md');
const readme = readFileSync(readmePath, 'utf8');
const start = readme.indexOf(START);
const end = readme.indexOf(END);
if (start < 0 || end < 0) {
  console.error(`✖ README.md is missing the ${START} / ${END} markers.`);
  process.exit(1);
}
const raw = `${readme.slice(0, start + START.length)}\n${table}\n${readme.slice(end)}`;
// Format exactly like `prettier --write` so the check is stable.
const next = await format(raw, { ...(await resolveConfig(readmePath)), filepath: readmePath });

if (process.argv.includes('--check')) {
  if (next !== readme) {
    console.error(
      '✖ README requirements table is out of date — run `npm run readme:requirements`.',
    );
    process.exit(1);
  }
  console.log('✔ README requirements table matches requirements.json');
} else {
  writeFileSync(readmePath, next);
  console.log('✔ README requirements table updated');
}
