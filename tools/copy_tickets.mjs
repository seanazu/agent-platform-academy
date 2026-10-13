// Copies the plan's ticket files (g0.json … g8.json) into public/tickets/ so the Ticket map can fetch them.
// Runs before dev and build. When the source folder is missing (another machine), the copies already in
// public/tickets/ are kept and a note is printed.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scrub } from './scrub.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = process.env.TICKETS_DIR ?? join(homedir(), 'Desktop', 'agentic-plan-app', 'tickets');
const target = join(root, 'public', 'tickets');
mkdirSync(target, { recursive: true });

if (!existsSync(source)) {
  const kept = readdirSync(target).filter((f) => /^g\d+\.json$/.test(f));
  console.log(`copy_tickets: ${source} not found; keeping ${kept.length} existing file(s) in public/tickets/`);
  process.exit(0);
}

const files = readdirSync(source).filter((f) => /^g\d+\.json$/.test(f)).sort();
let count = 0;
for (const f of files) {
  const data = JSON.parse(readFileSync(join(source, f), 'utf8'));
  if (!Array.isArray(data)) continue;
  writeFileSync(join(target, f), scrub(readFileSync(join(source, f), 'utf8'))); // placeholders for internal ids before publishing
  count += data.length;
}
writeFileSync(join(target, 'index.json'), JSON.stringify({ files, count }, null, 1) + '\n');
console.log(`copy_tickets: copied ${files.length} file(s), ${count} tickets, to public/tickets/`);
