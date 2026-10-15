// Checks for lab g5-2. The same checks run on fingerprint.mjs (build) and on fix/fingerprint.mjs (fix).
// Most checks change ONE thing in a real red build and ask: did the fingerprint change? So a failure
// names exactly the part your fingerprint should keep or drop.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const expect = {
  start: '7 red builds made 7 fixer runs',
  fix: 'differ only in the pushed commit',
};
export const celebrate = 'Main can go red as often as it likes: every build with the same problem now joins one fixer.';
export const fixed = 'The storm is over: ten pushes on a red main make one fixer again, not ten.';

const ISO = /2026-10-14T(\d\d):(\d\d):(\d\d)\.(\d+)Z/g;
const clone = (value) => structuredClone(value);
const withLog = (build, change) => ({ ...clone(build), jobs: build.jobs.map((job) => ({ ...job, log: change(job.log) })) });
const firstStamp = (log) => log.match(/2026-10-14T[\d:.]+Z/)[0];

export const prepare = async (ctx) => {
  const mod = await ctx.load('fingerprint.mjs');
  if (typeof mod.fingerprint !== 'function') throw new Error('fingerprint.mjs does not export fingerprint: keep the line "export const fingerprint = (failure) => {"');
  ctx.mod = mod;
  const folder = join(ctx.lab, 'start', 'fixtures');
  ctx.builds = readdirSync(folder).filter((file) => file.endsWith('.json')).sort().map((file) => JSON.parse(readFileSync(join(folder, file), 'utf8')));
  ctx.base = ctx.builds.find((build) => build.runId === 18823011);
  ctx.fp = (build) => mod.fingerprint(clone(build));
};

// The fingerprint must NOT change when only this part changes.
const same = (pass, makeVariant, what, why) => ({
  pass,
  run: (ctx) => {
    const variant = makeVariant(ctx.base);
    if (ctx.fp(ctx.base) !== ctx.fp(variant)) return { what, why: typeof why === 'function' ? why(ctx.base, variant) : why };
  },
});

// The fingerprint MUST change when this part changes.
const different = (pass, makeVariant, what, why) => ({
  pass,
  run: (ctx) => {
    if (ctx.fp(ctx.base) === ctx.fp(makeVariant(ctx.base))) return { what, why };
  },
});

const sameTest = 'two builds with the same broken test got different fingerprints';

export const checks = [
  {
    pass: 'fingerprint gives back a short hex string, and the same one every time',
    gate: true,
    run: (ctx) => {
      let a;
      try {
        a = ctx.fp(ctx.base);
      } catch (error) {
        return { what: 'fingerprint crashed', why: `it threw "${error.message}"` };
      }
      if (typeof a !== 'string' || !/^[0-9a-f]{8,64}$/.test(a)) return { what: `fingerprint gave back ${JSON.stringify(a)}`, why: 'it must give back hex characters, like the 12 from createHash("sha256")...digest("hex").slice(0, 12)' };
      if (ctx.fp(ctx.base) !== a) return { what: 'the same build got two different fingerprints', why: 'fingerprint must not use random numbers or the clock' };
    },
  },
  {
    pass: 'firstError finds the first error line of a log',
    run: (ctx) => {
      if (typeof ctx.mod.firstError !== 'function') return { what: 'fingerprint.mjs does not export firstError', why: 'keep the line "export const firstError = (log) => ..."' };
      const [unit, lint, types] = [ctx.base, ...ctx.builds.filter((b) => b.jobs[0].name !== 'unit-tests')].map((build) => build.jobs[0].log);
      let found;
      try {
        found = [unit, lint, types].map((log) => String(ctx.mod.firstError(log)));
      } catch (error) {
        if (/TODO/.test(error.message)) return { what: 'firstError is not written yet', why: 'fingerprint.mjs still throws the TODO error there' };
        return { what: 'firstError crashed', why: `it threw "${error.message}"` };
      }
      if (!found[0].includes('FAIL') || !found[0].includes('ProjectsTable.test.tsx')) return { what: `in the unit-tests log, firstError found "${found[0].slice(0, 70)}"`, why: 'it should find the line with FAIL and ProjectsTable.test.tsx, the first line that says error or fail' };
      if (!found[1].includes("'useProjects' is defined but never used")) return { what: `in the lint error's log, firstError found "${found[1].slice(0, 70)}"`, why: "it should find the line with \"error  'useProjects' is defined but never used\"" };
      if (!found[2].includes('TS2339')) return { what: `in the type error's log, firstError found "${found[2].slice(0, 70)}"`, why: 'it should find the line with "error TS2339"' };
    },
  },
  {
    pass: '7 red builds made 3 fixer runs: the 5 ProjectsTable builds share one',
    run: (ctx) => {
      const ids = ctx.builds.map((build) => ctx.fp(build));
      const runs = new Set(ids).size;
      const unit = new Set(ids.filter((_, i) => ctx.builds[i].jobs[0].name === 'unit-tests'));
      const others = ids.filter((_, i) => ctx.builds[i].jobs[0].name !== 'unit-tests');
      const mixed = others.some((id) => unit.has(id)) || others[0] === others[1];
      if (mixed) return { what: `7 red builds made ${runs} fixer run${runs > 1 ? 's' : ''}`, why: 'builds with different problems (a broken test, a lint error, a type error) got the same fingerprint. The lint error and the type error both fail in the job called check, so the job name alone is not enough: include the first error line of every job too' };
      if (unit.size > 1) return { what: `7 red builds made ${runs} fixer runs`, why: `the 5 builds with the same broken test got ${unit.size} different fingerprints, so ${unit.size} fixers would fix the same test. The other checks say which part changes between them.` };
    },
  },
  same('a new push on a red main joins the same fixer', (b) => ({ ...clone(b), pushedSha: '1111111111222222222233333333334444444444' }), 'two builds that differ only in the pushed commit got different fingerprints', 'the pushed commit changes on every push, so every push starts a new fixer: a storm of fixers. Leave pushedSha out of the hash.'),
  same('a different run id joins the same fixer', (b) => ({ ...clone(b), runId: 19990001 }), 'two builds that differ only in the run id got different fingerprints', 'every build has a new run id, so leave runId out of the hash'),
  same('a different start time joins the same fixer', (b) => ({ ...clone(b), startedAt: '2026-10-15T07:12:01Z' }), 'two builds that differ only in startedAt got different fingerprints', 'every build starts at a new time, so leave startedAt out of the hash'),
  same(
    'new timestamps in the log join the same fixer',
    (b) => withLog(b, (log) => log.replace(ISO, (_, h, m, s, f) => `2026-10-15T07:${m}:${s}.${[...f].reverse().join('')}Z`)),
    sameTest,
    (b, v) => `they differ only in the timestamps, like '${firstStamp(b.jobs[0].log)}' and '${v.jobs[0].log.match(/2026-10-15T[\d:.]+Z/)[0]}'. Strip timestamps before hashing.`,
  ),
  same(
    'a timestamp in another format joins the same fixer',
    (b) => withLog(b, (log) => log.replace(ISO, (_, h, m, s) => `2026-10-15 07:${m}:${s}`)),
    sameTest,
    (b) => `they differ only in the timestamp format, like '${firstStamp(b.jobs[0].log)}' and '2026-10-15 07:12:45' (a space, no Z, no fraction). Strip both kinds before hashing.`,
  ),
  same('a different temp folder joins the same fixer', (b) => withLog(b, (log) => log.replaceAll('/tmp/ci-8sK2pq', '/tmp/ci-0a1b2c')), sameTest, "they differ only in the temp folder, '/tmp/ci-8sK2pq' and '/tmp/ci-0a1b2c'. Every run gets a new one, so strip /tmp/... before hashing."),
  same('a slower test (a new duration) joins the same fixer', (b) => withLog(b, (log) => log.replace(' 48ms', ' 212ms')), sameTest, "they differ only in how long the test took, '48ms' and '212ms'. Strip durations before hashing."),
  same(
    'changes after the first error do not matter',
    (b) => withLog(b, (log) => log.replace('1840 passed (1841)', '1902 passed (1903)').replace('68.41s', '75.90s').replace('test.tsx:42:7', 'test.tsx:44:7')),
    'two builds whose logs differ only after the first error got different fingerprints',
    'hash only the first error line of each job, because the rest of the log (counts, durations, stack lines) changes all the time',
  ),
  {
    pass: 'the same jobs in another order join the same fixer',
    run: (ctx) => {
      const e2e = { name: 'e2e-tests', log: '2026-10-14T10:09:01.0000001Z Error: page.goto: net::ERR_CONNECTION_REFUSED' };
      const two = { ...clone(ctx.base), jobs: [...clone(ctx.base.jobs), e2e] };
      const flipped = { ...clone(two), jobs: [...clone(two.jobs)].reverse() };
      if (ctx.fp(two) !== ctx.fp(flipped)) return { what: 'the same two failing jobs in a different order got different fingerprints', why: 'GitHub can list jobs in any order, so sort the job lines before hashing' };
    },
  },
  different(
    'a different broken test gets its own fixer',
    (b) => withLog(b, (log) => log.replace('shows a "No projects yet" card when there are no projects', 'sorts projects by name')),
    'a different broken test got the same fingerprint as the ProjectsTable one',
    'normalise removes too much, so keep the words of the error line and strip only what changes on every run',
  ),
  different('a red main after another green commit gets its own fixer', (b) => ({ ...clone(b), lastGreenSha: '0000000aaaaaaabbbbbbbcccccccddddddd123456' }), 'two builds after different green commits got the same fingerprint', 'a new green commit means a new problem, so put lastGreenSha in the hash'),
  different('a different failing job gets its own fixer', (b) => ({ ...clone(b), jobs: b.jobs.map((job) => ({ ...job, name: 'unit-tests-legacy' })) }), 'two builds with different failing jobs got the same fingerprint', 'put each failing job name in the hash'),
  {
    pass: '3 more red builds you have not seen join the ProjectsTable fixer',
    run: (ctx) => {
      const hidden = [
        withLog({ ...ctx.base, runId: 18827001, pushedSha: '5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e', startedAt: '2026-10-15T08:40:00Z' }, (log) => log.replace(ISO, (_, h, m, s) => `2026-10-15T08:${m}:${s}Z`).replace(' 48ms', ' 61ms')),
        withLog({ ...ctx.base, runId: 18827044, pushedSha: '6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f', startedAt: '2026-10-15T09:02:00Z' }, (log) => log.replaceAll('/tmp/ci-8sK2pq', '/tmp/ci-Zz91aB').replace(' 48ms', ' 2.4s')),
        { ...clone(ctx.base), runId: 18827102, pushedSha: '7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a', startedAt: '2026-10-15T09:30:00Z' },
      ];
      const target = ctx.fp(ctx.base);
      const strays = hidden.filter((build) => ctx.fp(build) !== target).length;
      if (strays) return { what: `${strays} of 3 hidden red builds with the same broken test started their own fixer`, why: 'fix the checks above first; they name the part that still changes' };
    },
  },
];

