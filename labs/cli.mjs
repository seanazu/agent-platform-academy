// The lab tool behind ./academy. Plain ESM, Node 22+, no dependencies. See labs/README.md.
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import net from 'node:net';
import { homedir, tmpdir } from 'node:os';
import { dirname, join, relative, sep } from 'node:path';
import readline from 'node:readline';
import { fileURLToPath, pathToFileURL } from 'node:url';

const LABS = dirname(fileURLToPath(import.meta.url));
const REPO = dirname(LABS);
const HOME = join(homedir(), 'academy-labs');
const tty = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code) => (text) => (tty ? `\x1b[${code}m${text}\x1b[0m` : String(text));
const c = { bold: paint(1), dim: paint(2), red: paint(31), green: paint(32), yellow: paint(33), cyan: paint(36) };
const say = (text = '') => console.log(text);
const pretty = (path) => (path.startsWith(homedir()) ? `~${path.slice(homedir().length)}` : path);

// An expected problem: print the message, no stack trace.
class Stop extends Error {}

const labIds = () => readdirSync(LABS).filter((name) => existsSync(join(LABS, name, 'check.mjs'))).sort();
const lessonOf = (id) => JSON.parse(readFileSync(join(LABS, id, 'lesson-lab.json'), 'utf8'));
const passCode = (id) => `APA-${id}-${createHash('sha256').update(`apa:${id}`).digest('hex').slice(0, 6)}`;
const workspace = (id) => join(HOME, id);
const MAX_SHOWN = 5;

const wrap = (text, indent = '', width = 78) => {
  const lines = [];
  for (const paragraph of String(text).split('\n')) {
    let line = '';
    for (const word of paragraph.split(' ')) {
      if (line && indent.length + line.length + word.length + 1 > width) {
        lines.push(indent + line);
        line = word;
      } else {
        line = line ? `${line} ${word}` : word;
      }
    }
    lines.push(indent + line);
  }
  return lines.join('\n');
};

// Markdown-ish text: paragraphs are joined and wrapped, indented code lines stay exactly as they are.
const wrapText = (text) =>
  text
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block.split('\n');
      if (lines.every((line) => line.startsWith('    '))) return c.cyan(lines.join('\n'));
      return wrap(lines.join(' ').replace(/\s+/g, ' ').trim());
    })
    .join('\n\n');

const listFiles = (dir, base = dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? listFiles(path, base) : [relative(base, path)];
  });

const pickId = (arg) => {
  const ids = labIds();
  if (arg) {
    if (ids.includes(arg)) return arg;
    throw new Stop(`There is no lab called "${arg}". The labs are: ${ids.join(', ')}.`);
  }
  const here = relative(HOME, process.cwd());
  const fromCwd = here && !here.startsWith('..') ? here.split(sep)[0] : '';
  if (ids.includes(fromCwd)) return fromCwd;
  const current = existsSync(join(HOME, '.current')) ? readFileSync(join(HOME, '.current'), 'utf8').trim() : '';
  if (ids.includes(current)) return current;
  throw new Stop(`Which lab? Start one first, for example: ./academy lab ${ids[0]}`);
};

const needWorkspace = (id) => {
  if (!existsSync(workspace(id))) throw new Stop(`You have not started ${id} yet, so there is nothing to look at. Start it with: ./academy lab ${id}`);
  return workspace(id);
};

const npmInstall = (dir, quiet = false) => {
  if (!existsSync(join(dir, 'package.json'))) return;
  if (!quiet) say(c.dim('Installing packages with npm (the first time takes about a minute)…'));
  const result = spawnSync('npm', ['install', '--no-audit', '--no-fund', '--loglevel=error'], { cwd: dir, stdio: quiet ? 'pipe' : 'inherit' });
  if (result.status !== 0) throw new Stop(`npm install failed in ${pretty(dir)}. Check your internet connection and run it again: cd ${pretty(dir)} && npm install`);
};

// ---------- ./academy lab <id> [--fresh]

const startLab = (id, fresh) => {
  const ws = workspace(id);
  const lab = join(LABS, id);
  mkdirSync(HOME, { recursive: true });
  if (existsSync(ws) && !fresh) {
    say(`Your workspace ${pretty(ws)} already exists, so I kept it and your work is safe.`);
    say(c.dim(`To throw it away and start over: ./academy lab ${id} --fresh`));
  } else {
    rmSync(ws, { recursive: true, force: true });
    cpSync(join(lab, 'start'), ws, { recursive: true });
    if (existsSync(join(lab, 'fix'))) cpSync(join(lab, 'fix'), join(ws, 'fix'), { recursive: true });
    cpSync(join(lab, 'README.md'), join(ws, 'README.md'));
    symlinkSync(join(REPO, 'academy'), join(ws, 'academy'));
    say(`${fresh ? 'Started fresh' : 'Created'}: ${pretty(ws)}`);
  }
  if (!existsSync(join(ws, 'node_modules'))) npmInstall(ws);
  writeFileSync(join(HOME, '.current'), id);

  const lesson = lessonOf(id);
  say();
  say(`${c.bold(`Lab ${id}: ${lesson.title}`)}  ${c.dim(`about ${lesson.minutes} minutes`)}`);
  say(wrap(lesson.goal));
  say();
  const firstSentence = (text) => text.match(/^.+?[.!?](?=\s+[A-Z]|$)/)?.[0] ?? text;
  const steps = [
    ['Guess', 'Answer the question on the lesson page before you read any code.'],
    ['Follow along', `Run the commands in ${pretty(join(ws, 'README.md'))} (the same ones are on the lesson page) and compare what you see.`],
    ['Build it', `${firstSentence(lesson.build)} The whole task is in README.md. Check it with: ./academy check`],
    ['Fix it', `${firstSentence(lesson.fix)} The story is in fix/README.md. Check it with: ./academy check --fix`],
    ['Explain it', 'Answer three short questions in your own words: ./academy explain'],
  ];
  steps.forEach(([name, text], i) => {
    say(`${c.cyan(`${i + 1} ${name}`)}`);
    say(wrap(text, '  '));
  });
  say();
  say(c.dim('While you work: ./academy check   ./academy hint   ./academy diff   ./academy check --fix'));
  say(c.dim('Every command works from the course folder and from your lab folder.'));
  say();
  const next = lesson.follow.find((step) => !step.do.includes('./academy lab'));
  say(`${c.bold('Next:')} ${next.do.split('\n')[0]}`);
};

// ---------- ./academy check [--fix] [id]

const loadChecks = async (id) => import(pathToFileURL(join(LABS, id, 'check.mjs')).href);

const loadLearnerFile = (dir) => async (file) => {
  const path = join(dir, file);
  if (!existsSync(path)) throw new Error(`${file} is missing in ${pretty(dir)}. Get a fresh copy with ./academy lab <id> --fresh`);
  try {
    return await import(`${pathToFileURL(path).href}?v=${Date.now()}`);
  } catch (error) {
    // A syntax error from import() has no line number, so ask node --check for it.
    const checked = error instanceof SyntaxError ? spawnSync(process.execPath, ['--check', path], { encoding: 'utf8' }).stderr : '';
    const line = checked.match(/:(\d+)\n/)?.[1];
    throw new Error(`${file} could not be loaded${line ? ` (line ${line})` : ''}: ${error.message.split('\n')[0]}`);
  }
};

const runChecks = async (id, dir, mode) => {
  const checks = await loadChecks(id);
  const ctx = { dir, mode, lab: join(LABS, id), load: loadLearnerFile(dir), pretty };
  const results = { passed: 0, failed: 0, waiting: 0 };
  const pass = (text) => {
    results.passed += 1;
    say(`${c.green('✔')} ${text}`);
  };
  // Show the first few problems in full; a long red list helps nobody.
  const fail = (text) => {
    results.failed += 1;
    if (results.failed <= MAX_SHOWN) say(`${c.red('✘')} ${text}`);
  };
  try {
    try {
      await checks.prepare?.(ctx);
    } catch (error) {
      fail(error.message);
      return results;
    }
    for (const [index, check] of checks.checks.entries()) {
      let problem;
      try {
        problem = await check.run(ctx);
      } catch (error) {
        problem = { what: `${check.pass}: could not check this`, why: `it threw "${error.message.split('\n')[0]}"` };
      }
      if (!problem) {
        pass(check.pass);
        continue;
      }
      fail(`${problem.what}: ${problem.why}`);
      if (check.gate) {
        results.waiting = checks.checks.length - index - 1;
        if (results.waiting) say(c.dim(`  · ${results.waiting} more check${results.waiting > 1 ? 's' : ''} wait until this one passes`));
        break;
      }
    }
  } finally {
    await checks.cleanup?.(ctx);
  }
  const hidden = results.failed - MAX_SHOWN;
  if (hidden > 0) say(c.dim(`  · ${hidden} more check${hidden > 1 ? 's' : ''} fail too. Fix the ones above first; they often fix the rest.`));
  return results;
};

const check = async (id, fix) => {
  const dir = fix ? join(needWorkspace(id), 'fix') : needWorkspace(id);
  const lesson = lessonOf(id);
  say(c.dim(`Checking ${fix ? 'the Fix it step' : 'your build'} for ${id} (${lesson.title}) in ${pretty(dir)}`));
  say();
  const { failed, waiting } = await runChecks(id, dir, fix ? 'fix' : 'build');
  say();
  if (failed || waiting) {
    say(`${c.yellow('→')} stuck? ./academy hint${fix ? ' --fix' : ''}`);
    return false;
  }
  const checks = await loadChecks(id);
  if (fix) {
    say(c.green(c.bold('Fixed! ')) + (checks.fixed ?? 'The broken code works again.'));
    return true;
  }
  say(c.green(c.bold('All checks pass. ')) + (checks.celebrate ?? 'Nice work.'));
  say();
  say(`Your pass code: ${c.bold(passCode(id))}`);
  say(c.dim('Paste this code into the lesson page to mark the lab done.'));
  if (existsSync(join(LABS, id, 'fix'))) say(c.dim('Next: the Fix it step. ./academy check --fix'));
  return true;
};

// ---------- ./academy hint [--fix] [id]

const readHints = (id) => {
  const sections = { build: [], fix: [] };
  let current = 'build';
  let block = [];
  const flush = () => {
    const text = block.join('\n').trim();
    if (text) sections[current].push(text);
    block = [];
  };
  for (const line of readFileSync(join(LABS, id, 'hints.md'), 'utf8').split('\n')) {
    if (/^#\s*build it/i.test(line)) (flush(), (current = 'build'));
    else if (/^#\s*fix it/i.test(line)) (flush(), (current = 'fix'));
    else if (/^---\s*$/.test(line)) flush();
    else block.push(line);
  }
  flush();
  return sections;
};

const hint = (id, fix) => {
  const ws = needWorkspace(id);
  const hints = readHints(id)[fix ? 'fix' : 'build'];
  const counter = join(ws, fix ? '.hints-fix' : '.hints');
  const seen = existsSync(counter) ? Number(readFileSync(counter, 'utf8')) || 0 : 0;
  if (seen >= hints.length) {
    say(`You have seen all ${hints.length} hints. Now compare your file with the answer: ./academy diff${fix ? ' --fix' : ''}`);
    return;
  }
  say(c.cyan(c.bold(`Hint ${seen + 1} of ${hints.length}`)));
  say(wrapText(hints[seen]));
  writeFileSync(counter, String(seen + 1));
  say();
  say(c.dim(seen + 1 < hints.length ? `Still stuck? Run ./academy hint${fix ? ' --fix' : ''} again for a bigger hint.` : `That was the last hint. If you are still stuck, ./academy diff${fix ? ' --fix' : ''} shows the answer.`));
};

// ---------- ./academy diff [--fix] [id]

const simpleDiff = (mine, answer) => {
  const a = mine.split('\n');
  const b = answer.split('\n');
  const lcs = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
  }
  const out = [];
  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) (out.push(`  ${a[i]}`), (i += 1), (j += 1));
    else if (j < b.length && (i === a.length || lcs[i][j + 1] >= lcs[i + 1][j])) (out.push(c.green(`+ ${b[j]}`)), (j += 1));
    else (out.push(c.red(`- ${a[i]}`)), (i += 1));
  }
  return out.join('\n');
};

const diff = (id, fix) => {
  const dir = fix ? join(needWorkspace(id), 'fix') : needWorkspace(id);
  const solution = join(LABS, id, 'solution');
  const files = listFiles(solution).filter((file) => !fix || existsSync(join(LABS, id, 'fix', file)));
  const hasGit = spawnSync('git', ['--version'], { stdio: 'ignore' }).status === 0;
  say(c.dim('Lines with - are yours, lines with + are the answer.'));
  for (const file of files) {
    const mine = join(dir, file);
    const answer = join(solution, file);
    say();
    if (!existsSync(mine)) {
      say(`${c.red('✘')} ${file} is missing in ${pretty(dir)}`);
      continue;
    }
    if (readFileSync(mine, 'utf8') === readFileSync(answer, 'utf8')) {
      say(`${c.green('✔')} ${file} is the same as the answer`);
      continue;
    }
    say(c.bold(`${file}: yours → the answer`));
    if (hasGit) {
      const result = spawnSync('git', ['diff', '--no-index', tty ? '--color=always' : '--no-color', '--', mine, answer], { encoding: 'utf8' });
      say(result.stdout.split('\n').slice(4).join('\n').trimEnd());
    } else {
      say(simpleDiff(readFileSync(mine, 'utf8'), readFileSync(answer, 'utf8')));
    }
  }
  say();
  say(c.dim('Your answer does not have to look the same. If ./academy check passes, it is right.'));
};

// ---------- ./academy explain [id]

const explain = async (id) => {
  const lesson = lessonOf(id);
  const questions = readFileSync(join(LABS, id, 'explain.md'), 'utf8')
    .split('\n')
    .filter((line) => /^\d+\.\s/.test(line))
    .map((line) => line.replace(/^\d+\.\s+/, ''));
  say(c.bold(`Explain it: ${lesson.title}`));
  say(c.dim('Answer in your own words, in one or two sentences, then press Enter. Short is fine; nobody grades this.'));
  const rl = readline.createInterface({ input: process.stdin, terminal: false });
  const lines = rl[Symbol.asyncIterator]();
  const answers = [];
  for (const [index, question] of questions.entries()) {
    say();
    say(c.cyan(wrap(`${index + 1}. ${question}`)));
    process.stdout.write('> ');
    const { value, done } = await lines.next();
    if (!process.stdin.isTTY) say(value ?? '');
    answers.push(done ? '' : value.trim());
  }
  rl.close();
  const notes = join(HOME, 'notes');
  mkdirSync(notes, { recursive: true });
  const file = join(notes, `${id}.md`);
  const qa = questions.map((question, i) => `${i + 1}. ${question}\n   My answer: ${answers[i] || '(no answer yet)'}`).join('\n\n');
  writeFileSync(file, `# ${lesson.title}: my answers\n\n${new Date().toISOString().slice(0, 10)}\n\n${qa}\n`);
  say();
  say(c.dim(`Saved to ${pretty(file)}`));
  say();
  say(c.bold('Copy this into Claude:'));
  say('-'.repeat(60));
  say(`Check my understanding of the lesson "${lesson.title}" from the Agent Platform Academy. I just finished its lab. Here are my answers to three questions. Tell me what I got right, what I missed, and anything I got wrong, in plain and simple English.\n\n${qa}`);
  say('-'.repeat(60));
};

// ---------- ./academy solve <id> and ./academy selftest

const portOpen = (address) =>
  new Promise((resolve) => {
    const [host, port] = address.split(':');
    const socket = net.connect({ host, port: Number(port) });
    socket.setTimeout(1000);
    socket.once('connect', () => (socket.destroy(), resolve(true)));
    socket.once('error', () => resolve(false));
    socket.once('timeout', () => (socket.destroy(), resolve(false)));
  });

// Labs that need Temporal get the server at TEMPORAL_ADDRESS (default localhost:7233).
// When nothing listens there and the temporal CLI exists, start a throwaway dev server and stop it afterwards.
const ensureTemporal = async () => {
  const address = process.env.TEMPORAL_ADDRESS ?? 'localhost:7233';
  if (await portOpen(address)) return { stop: () => {} };
  if (spawnSync('temporal', ['--version'], { stdio: 'ignore' }).status !== 0) throw new Stop('This lab needs Temporal, but nothing listens on localhost:7233 and the temporal CLI is not installed.');
  say(c.dim('Starting a throwaway Temporal dev server for the self-test…'));
  const port = address.split(':')[1];
  const server = spawn('temporal', ['server', 'start-dev', '--headless', '--port', port, '--log-level', 'error'], { stdio: 'ignore' });
  for (let i = 0; i < 60 && !(await portOpen(address)); i += 1) await new Promise((r) => setTimeout(r, 500));
  await new Promise((r) => setTimeout(r, 1500));
  return { stop: () => server.kill('SIGTERM') };
};

const runChecksInChild = (id, dir, mode) => {
  const result = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '__check', id, mode, dir], { encoding: 'utf8', env: { ...process.env, NO_COLOR: '1' } });
  return { ok: result.status === 0, out: `${result.stdout}${result.stderr}` };
};

const tempWorkspace = (id) => {
  const root = mkdtempSync(join(tmpdir(), `academy-${id}-`));
  const ws = join(root, id);
  cpSync(join(LABS, id, 'start'), ws, { recursive: true });
  if (existsSync(join(LABS, id, 'fix'))) cpSync(join(LABS, id, 'fix'), join(ws, 'fix'), { recursive: true });
  npmInstall(ws, true);
  return { root, ws };
};

const overlaySolution = (id, dir, onlyExisting = false) => {
  const solution = join(LABS, id, 'solution');
  for (const file of listFiles(solution)) {
    if (onlyExisting && !existsSync(join(dir, file))) continue;
    cpSync(join(solution, file), join(dir, file));
  }
};

const solve = async (id) => {
  const checks = await loadChecks(id);
  const temporal = checks.needs?.includes('temporal') ? await ensureTemporal() : { stop: () => {} };
  const { root, ws } = tempWorkspace(id);
  try {
    overlaySolution(id, ws);
    say(c.dim(`Solution for ${id} in a temporary workspace:`));
    const { failed, waiting } = await runChecks(id, ws, 'build');
    return !failed && !waiting;
  } finally {
    rmSync(root, { recursive: true, force: true });
    temporal.stop();
  }
};

const selftest = async () => {
  const ids = labIds();
  const needsTemporal = (await Promise.all(ids.map(loadChecks))).some((checks) => checks.needs?.includes('temporal'));
  const temporal = needsTemporal ? await ensureTemporal() : { stop: () => {} };
  let good = 0;
  let total = 0;
  try {
    for (const id of ids) {
      const checks = await loadChecks(id);
      say(c.bold(`${id}  ${lessonOf(id).title}`));
      const { root, ws } = tempWorkspace(id);
      const expectFailure = (label, mode, dir, text) => {
        const { ok, out } = runChecksInChild(id, dir, mode);
        const line = out.split('\n').find((l) => l.startsWith('✘') && l.includes(text));
        return report(!ok && line, `${label} fails as intended`, ok ? 'it passed' : `no ✘ line contains "${text}"\n${out}`, line);
      };
      const expectPass = (label, mode, dir) => {
        const { ok, out } = runChecksInChild(id, dir, mode);
        const count = out.split('\n').filter((l) => l.startsWith('✔')).length;
        return report(ok, `${label} passes all ${count} checks`, `it failed\n${out}`);
      };
      const report = (ok, label, why, detail) => {
        total += 1;
        if (ok) good += 1;
        say(ok ? `  ${c.green('✔')} ${label}${detail ? c.dim(`\n      ${detail}`) : ''}` : `  ${c.red('✘')} ${label}: ${why}`);
      };
      try {
        const hasFix = existsSync(join(ws, 'fix'));
        expectFailure('untouched start/', 'build', ws, checks.expect.start);
        if (hasFix) expectFailure('untouched fix/', 'fix', join(ws, 'fix'), checks.expect.fix);
        overlaySolution(id, ws);
        expectPass('start/ + solution/', 'build', ws);
        if (hasFix) {
          overlaySolution(id, join(ws, 'fix'), true);
          expectPass('fix/ + solution/', 'fix', join(ws, 'fix'));
        }
        const hints = readHints(id);
        report(hints.build.length >= 3 && (!hasFix || hints.fix.length >= 1), 'hints.md has build and fix hints', `found ${hints.build.length} build and ${hints.fix.length} fix hints`);
        const lesson = lessonOf(id);
        const shapeOk = lesson.id === id && lesson.guess?.options?.filter((o) => o.correct).length === 1 && lesson.follow?.length && lesson.explain?.length === 3;
        report(shapeOk, 'lesson-lab.json has the right shape', 'check id, guess (one correct option), follow and 3 explain questions');
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
      say();
    }
  } finally {
    temporal.stop();
  }
  say(good === total ? c.green(c.bold(`selftest passed: ${ids.length} labs, ${good} of ${total} checks`)) : c.red(c.bold(`selftest failed: ${total - good} of ${total} checks failed`)));
  return good === total;
};

// ---------- main

const usage = () => {
  say(c.bold('Agent Platform Academy labs'));
  say();
  say('  ./academy lab <id>          start a lab (add --fresh to start over)');
  say('  ./academy check             check your build; --fix checks the Fix it step');
  say('  ./academy hint              show the next hint (add --fix for the Fix it step)');
  say('  ./academy diff              compare your file with the answer');
  say('  ./academy explain           answer three questions and get a prompt for Claude');
  say();
  say(`Labs: ${labIds().join(', ')}`);
};

const main = async () => {
  const [command, ...rest] = process.argv.slice(2);
  const flags = new Set(rest.filter((arg) => arg.startsWith('--')));
  const [arg] = rest.filter((a) => !a.startsWith('--'));
  const fix = flags.has('--fix');
  switch (command) {
    case 'lab':
      if (!arg) throw new Stop(`Which lab? For example: ./academy lab ${labIds()[0]}. The labs are: ${labIds().join(', ')}.`);
      return startLab(pickId(arg), flags.has('--fresh')), true;
    case 'check':
      return check(pickId(arg), fix);
    case 'hint':
      return hint(pickId(arg), fix), true;
    case 'diff':
      return diff(pickId(arg), fix), true;
    case 'explain':
      return explain(pickId(arg)).then(() => true);
    case 'solve':
      if (!arg) throw new Stop('Which lab? ./academy solve <id>');
      return solve(pickId(arg));
    case 'selftest':
      return selftest();
    case '__check': {
      const [, mode, dir] = rest;
      const { failed, waiting } = await runChecks(pickId(arg), dir, mode);
      return !failed && !waiting;
    }
    default:
      return usage(), !command || command === 'help' || command === '--help';
  }
};

// Set the exit code and let stdout drain (an early process.exit can cut piped output on macOS).
// The unref'd timer only fires when something, like a forgotten connection, keeps Node alive.
const finish = (code) => {
  process.exitCode = code;
  setTimeout(() => process.exit(code), 3000).unref();
};

main().then(
  (ok) => finish(ok ? 0 : 1),
  (error) => {
    if (!(error instanceof Stop)) throw error;
    say(error.message);
    finish(1);
  },
);
