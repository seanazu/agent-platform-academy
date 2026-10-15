// Prints the journey of one ticket as a story, then asks canMerge whether a person may press Merge.
//   node journey.mjs         uses approval.mjs (your Build it step)
//   node journey.mjs --fix   uses fix/approval.mjs (the Fix it step)
import { readFileSync } from 'node:fs';

const useFix = process.argv.includes('--fix');
const { canMerge } = await import(useFix ? './fix/approval.mjs' : './approval.mjs');
const { ticket, people, events } = JSON.parse(readFileSync(new URL('./events.json', import.meta.url), 'utf8'));

const tty = process.stdout.isTTY;
const dim = (text) => (tty ? `\x1b[2m${text}\x1b[0m` : text);
const bold = (text) => (tty ? `\x1b[1m${text}\x1b[0m` : text);
const label = { human: 'person', agent: 'agent', bot: 'bot' };

console.log(bold(`${ticket.key} · ${ticket.title}`));
console.log();
for (const event of events) {
  const person = people[event.who];
  console.log(`  ${event.at}  ${person.name.padEnd(10)} ${dim(label[person.kind].padEnd(8))}${event.text}`);
}

const requester = events.find((event) => event.type === 'poll')?.requester;
const opened = events.find((event) => event.type === 'pr');
const pr = { number: opened.pr, ticket: ticket.key, author: opened.who, requester };
const approvals = events.filter((event) => event.type === 'approve').map((event) => ({ by: event.who, kind: people[event.who].kind }));

console.log();
console.log(bold(`Can a person merge PR #${pr.number} now?`) + dim(useFix ? '  (asking fix/approval.mjs)' : ''));
try {
  const answer = canMerge(pr, approvals);
  if (answer.ok) {
    console.log(`  yes: ${answer.reason}`);
    console.log('  A person (never Nova, never Byte) can press Merge.');
  } else {
    console.log(`  no: ${answer.reason}`);
    console.log(dim('  … waiting for an approval…'));
  }
} catch (error) {
  console.log(`  nobody knows yet: canMerge says "${error.message}".`);
  console.log(dim('  … waiting for an approval… (writing canMerge is your Build it step)'));
}
