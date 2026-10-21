// Fails if legacy Angular patterns appear in application code.
// snippets.ts files are excluded on purpose: they hold the "before" code shown in the demos as text.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = join(import.meta.dirname, '..', 'src');
const PATTERNS = {
  NgModule: /@NgModule\s*\(/,
  '*ngIf': /\*ngIf\b/,
  '*ngFor': /\*ngFor\b/,
  'constructor injection':
    /constructor\s*\(\s*(?:private|protected|public|readonly|@Inject|\w+\s*:)/,
};

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const files = walk(root).filter((f) => /\.(ts|html)$/.test(f));
const code = files.filter((f) => !f.endsWith('snippets.ts'));
const snippets = files.filter((f) => f.endsWith('snippets.ts'));
let failures = 0;

for (const [label, regex] of Object.entries(PATTERNS)) {
  const hits = code.filter((f) => regex.test(readFileSync(f, 'utf8')));
  const inSnippets = snippets.filter((f) => regex.test(readFileSync(f, 'utf8'))).length;
  failures += hits.length;
  console.log(
    `${hits.length === 0 ? '✔' : '✖'} ${label}: ${String(hits.length)} in code (${String(inSnippets)} snippet files show it as "before" text)`,
  );
  hits.forEach((f) => console.log(`    ${relative(root, f)}`));
}
process.exit(failures ? 1 : 0);
