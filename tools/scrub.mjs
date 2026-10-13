// Replaces internal identifiers with placeholders before anything is published publicly.
// Used on lesson files (node tools/scrub.mjs) and by copy_tickets.mjs on the ticket copies.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPLACEMENTS = [
  [/913123821419/g, '123456789012'], // AWS account id -> the example id from AWS's docs
  [/rhinohealth\.com/g, 'example.com'], // internal hosts and emails
];
export const scrub = (text) => REPLACEMENTS.reduce((t, [re, to]) => t.replace(re, to), text);

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  let changed = 0;
  for (const dir of ['content/lessons', 'src/sample']) {
    for (const f of readdirSync(join(root, dir)).filter((n) => n.endsWith('.json'))) {
      const p = join(root, dir, f);
      const before = readFileSync(p, 'utf8');
      const after = scrub(before);
      if (after !== before) { writeFileSync(p, after); changed++; }
    }
  }
  console.log(`scrub: ${changed} file(s) changed`);
}
