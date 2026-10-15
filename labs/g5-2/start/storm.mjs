// Runs every red build in fixtures/ through fingerprint() and shows how many fixer runs would start.
//   node storm.mjs         uses fingerprint.mjs (your Build it step)
//   node storm.mjs --fix   uses fix/fingerprint.mjs (the Fix it step)
import { readdirSync, readFileSync } from 'node:fs';

const useFix = process.argv.includes('--fix');
const { fingerprint, firstError } = await import(useFix ? './fix/fingerprint.mjs' : './fingerprint.mjs');
const folder = new URL('./fixtures/', import.meta.url);
const builds = readdirSync(folder).filter((file) => file.endsWith('.json')).sort().map((file) => JSON.parse(readFileSync(new URL(file, folder), 'utf8')));

const tty = process.stdout.isTTY;
const paint = (code) => (text) => (tty ? `\x1b[${code}m${text}\x1b[0m` : text);
const [bold, dim, red, green] = [paint(1), paint(2), paint(31), paint(32)];
const shortError = (job) => {
  try {
    const line = firstError(job.log).replace(/^\d{4}-\d\d-\d\d[T ][\d:.]+Z?\s+/, '').replace(/\/tmp\/\S+?\/fcp\/frontend\//, '');
    return line.length > 64 ? `${line.slice(0, 63)}…` : line;
  } catch {
    return dim('(firstError is not written yet)');
  }
};

const groups = new Map();
for (const build of builds) {
  const id = `cifix:${build.repo}:${fingerprint(build)}`;
  groups.set(id, [...(groups.get(id) ?? []), build]);
}

// The fixtures hold 3 problems: one broken test, one lint error, one type error.
const verdict = groups.size === builds.length ? red('a storm of fixers') : groups.size === 3 ? green('one fixer per problem') : paint(33)('is every fixer one problem? look at the error lines');
console.log(bold(`${builds.length} red builds on main → ${groups.size} fixer runs`) + `  ${verdict}`);
console.log();
for (const [id, members] of groups) {
  const bar = red('■'.repeat(members.length)).padEnd(tty ? 14 : 5);
  console.log(`  ${id}  ${bar}  ${members.length} build${members.length > 1 ? 's' : ' '}  ${dim(`runs ${members.map((build) => build.runId).join(', ')}`)}`);
  const errors = new Set(members.flatMap((build) => build.jobs.map((job) => `${job.name}: ${shortError(job).replace(/ [\d.]+m?s$/, '')}`)));
  for (const error of errors) console.log(dim(`      ${error}`));
}
