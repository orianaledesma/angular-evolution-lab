// Verifies zone.js is neither installed as a dependency nor present in the production bundle.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const rootDir = join(import.meta.dirname, '..');
const dist = join(rootDir, 'dist', 'angular-evolution-lab', 'browser');
const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
const declared = { ...pkg.dependencies, ...pkg.devDependencies }['zone.js'];

if (!existsSync(dist)) {
  console.error('✖ No production build found — run `npm run build` first.');
  process.exit(1);
}
const bundles = readdirSync(dist).filter((f) => f.endsWith('.js'));
// Runtime markers only: the demos mention "zone.js" as text in their code snippets.
const markers = ['__zone_symbol__', 'Zone.__symbol__', 'ZoneAwarePromise'];
const hits = bundles.filter((f) => {
  const source = readFileSync(join(dist, f), 'utf8');
  return markers.some((m) => source.includes(m));
});

console.log(
  `${declared ? '✖' : '✔'} package.json: zone.js ${declared ? `declared (${declared})` : 'not declared'}`,
);
console.log(
  `${hits.length ? '✖' : '✔'} bundle: ${String(bundles.length)} JS files scanned, zone.js markers found in ${String(hits.length)}`,
);
hits.forEach((f) => console.log(`    ${f}`));
process.exit(declared || hits.length ? 1 : 0);
