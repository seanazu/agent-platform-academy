import { useId, useRef, useState, type CSSProperties } from 'react';
import { ChallengeNav, GuessPanel, LockNote, PlayHead, fnv6, useDirector, useFlow, type Challenge, type Scene, type WidgetProps } from './shared';

type Cause = 'test' | 'lint' | 'type';
type Bit = { k: 'text' | 'ts' | 'path' | 'run'; v: string };
type Build = { time: string; commit: string; job: string; cause: Cause; line: Bit[] };
type Part = 'green' | 'job' | 'error' | 'commit';
type Strip = 'ts' | 'path' | 'run';
type Recipe = Record<Part | Strip, boolean>;

const LAST_GREEN = '5e0d1aa';
const CAUSE_NAME: Record<Cause, string> = { test: 'broken ProjectsTable test', lint: 'lint error', type: 'type error' };

const testLine = (ts: string, tmp: string, run: string): Bit[] => [
  { k: 'ts', v: `2026-10-14T${ts}Z` },
  { k: 'text', v: ' FAIL ' },
  { k: 'path', v: `/tmp/vitest-${tmp}/` },
  { k: 'text', v: 'ProjectsTable.test.tsx › sorts by date ' },
  { k: 'run', v: `(run #${run})` },
];

const BUILDS: Build[] = [
  { time: '10:02', commit: 'a1f3c09', job: 'test', cause: 'test', line: testLine('10:02:11', '8f2a', '4812') },
  {
    time: '10:06',
    commit: '9bd2e41',
    job: 'check',
    cause: 'lint',
    line: [
      { k: 'ts', v: '2026-10-14T10:06:40Z' },
      { k: 'text', v: " eslint src/api/client.ts:42 'retry' is never used " },
      { k: 'run', v: '(run #4814)' },
    ],
  },
  { time: '10:09', commit: '4c88a7e', job: 'test', cause: 'test', line: testLine('10:09:27', '31c7', '4815') },
  { time: '10:14', commit: 'e07b5d2', job: 'test', cause: 'test', line: testLine('10:14:03', 'c90d', '4818') },
  {
    time: '10:19',
    commit: '7aa1f60',
    job: 'check',
    cause: 'type',
    line: [
      { k: 'ts', v: '2026-10-14T10:19:05Z' },
      { k: 'text', v: ' tsc src/hooks/useRuns.ts:17 TS2322 string is not number ' },
      { k: 'run', v: '(run #4820)' },
    ],
  },
  { time: '10:25', commit: '2f9e8d3', job: 'test', cause: 'test', line: testLine('10:25:48', '5e1b', '4823') },
  { time: '10:31', commit: 'b7710c4', job: 'test', cause: 'test', line: testLine('10:31:16', '0ab4', '4826') },
];

type Verdict = 'waiting' | 'reading' | 'mixed' | 'many' | 'goal' | 'few';
const VERDICTS: { id: Verdict; tone?: 'ok' | 'bad'; text: string }[] = [
  { id: 'waiting', text: 'Waiting for the builds to come in.' },
  { id: 'reading', text: 'Reading the builds, one by one…' },
  { id: 'mixed', tone: 'bad', text: 'Too few: one fixer got two different problems. It will likely fix only one.' },
  { id: 'many', tone: 'bad', text: 'Too many: several fixers chase the same problem and fight over it.' },
  { id: 'goal', tone: 'ok', text: 'Goal: one fixer per real problem.' },
  { id: 'few', tone: 'bad', text: 'Too few fixers for 3 problems.' },
];
const VERDICT_TONE = Object.fromEntries(VERDICTS.map((v) => [v.id, v.tone])) as Record<Verdict, 'ok' | 'bad' | undefined>;

const RAW: Recipe = { green: true, job: true, error: true, commit: false, ts: false, path: false, run: false };
const GOOD: Recipe = { ...RAW, ts: true, path: true, run: true };

const CHALLENGES: Challenge[] = [
  {
    label: 'Hash it as it is',
    question: 'We hash each build as it is: last green commit + job name + first error line. How many fixers start?',
    options: [{ text: '1 fixer' }, { text: '3 fixers' }, { text: '7 fixers', correct: true }],
    why: 'Every error line has its own time, temp folder and run number, so no two hashes match: 7 fixers for 3 problems.',
  },
  {
    label: 'Strip the time',
    question: 'Now we remove the timestamps from the error line. How many fixers?',
    options: [{ text: '3 fixers' }, { text: '5 fixers' }, { text: '7 fixers', correct: true }],
    why: 'The temp folder and the run number still change in every build, so the hashes still differ.',
  },
  {
    label: 'Strip the noise',
    question: 'Remove timestamps, temp paths and run numbers. How many fixers?',
    options: [{ text: '2 fixers' }, { text: '3 fixers', correct: true }, { text: '7 fixers' }],
    why: 'The 5 test failures now make the same line, so they share one fixer. Lint and types get one each.',
  },
  {
    label: 'Add the commit',
    kind: 'break',
    question: 'Someone adds the pushed commit to the fingerprint "to be safe". How many fixers?',
    options: [{ text: '3 fixers' }, { text: '5 fixers' }, { text: '7 fixers', correct: true }],
    why: 'Every push is a new commit, so every build gets its own hash again. The storm is back.',
  },
  {
    label: 'Job name only',
    question: 'Keep the job name but drop the error line. How many fixers?',
    options: [{ text: '1 fixer' }, { text: '2 fixers', correct: true }, { text: '3 fixers' }],
    why: 'Lint and the type error both fail in the job "check", so one fixer gets two different problems.',
  },
];

const SETUPS: Recipe[] = [RAW, { ...RAW, ts: true }, GOOD, { ...GOOD, commit: true }, { ...GOOD, error: false }, GOOD];

const PARTS: { key: Part; label: string; title: string }[] = [
  { key: 'green', label: `last green commit ${LAST_GREEN}`, title: 'The newest commit where main passed. The same for every build in this red streak.' },
  { key: 'job', label: 'failing job names', title: 'The CI job that failed, like "test" or "check".' },
  { key: 'error', label: 'first error line', title: 'The first line of the error the job printed.' },
  { key: 'commit', label: 'pushed commit', title: 'The commit that was pushed and started this build.' },
];
const STRIPS: { key: Strip; label: string; title: string }[] = [
  { key: 'ts', label: 'strip timestamps', title: 'Remove 2026-10-14T10:02:11Z and the like.' },
  { key: 'path', label: 'strip temp paths', title: 'Remove /tmp/vitest-8f2a/ and the like.' },
  { key: 'run', label: 'strip run numbers', title: 'Remove (run #4812) and the like.' },
];

const cleanLine = (b: Build, r: Recipe) =>
  b.line.map((bit) => (bit.k !== 'text' && r[bit.k] ? `<${bit.k}>` : bit.v)).join('');

const fingerprint = (b: Build, r: Recipe) =>
  fnv6(
    [r.green ? LAST_GREEN : '', r.job ? b.job : '', r.error ? cleanLine(b, r) : '', r.commit ? b.commit : ''].join('|'),
  );

type Group = { hash: string; color: number; builds: number[]; causes: Cause[] };

const groupsOf = (r: Recipe, upTo: number): Group[] => {
  const out: Group[] = [];
  BUILDS.slice(0, upTo).forEach((b, i) => {
    const hash = fingerprint(b, r);
    const g = out.find((x) => x.hash === hash);
    if (g) {
      g.builds.push(i);
      if (!g.causes.includes(b.cause)) g.causes.push(b.cause);
    } else out.push({ hash, color: out.length, builds: [i], causes: [b.cause] });
  });
  return out;
};

function FingerprintSim({ config }: WidgetProps) {
  const titleId = useId();
  const cost = typeof config?.costPerFixer === 'number' ? config.costPerFixer : 3;
  const [recipe, setRecipe] = useState<Recipe>(GOOD);
  const [done, setDone] = useState(BUILDS.length);
  const stageRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const director = useDirector(layerRef);

  const scene: Scene = async (ctx) => {
    for (let i = 1; i <= BUILDS.length; i++) {
      await ctx.wait(i === 1 ? 250 : 120);
      if (!ctx.live()) return;
      setDone(i);
      await ctx.wait(30);
      const card = stageRef.current?.querySelector(`[data-build="${i - 1}"] .w-hash`);
      const hash = card?.textContent ?? '';
      await ctx.fly([card, stageRef.current?.querySelector(`[data-fp="${hash}"]`)], 'accent', 300);
    }
  };

  const flow = useFlow({
    challenges: CHALLENGES,
    start: config?.start,
    director,
    setup: (i) => {
      setRecipe(SETUPS[i] ?? GOOD);
      setDone(i < CHALLENGES.length ? 0 : BUILDS.length);
    },
    scene: () => scene,
  });

  const { locked } = flow;
  const groups = groupsOf(recipe, done);
  const colorOf = new Map(groups.map((g) => [g.hash, g.color]));
  const finished = done === BUILDS.length;
  const n = groups.length;
  const mixed = groups.some((g) => g.causes.length > 1);
  const verdict: Verdict = !finished ? (done === 0 ? 'waiting' : 'reading') : mixed ? 'mixed' : n > 3 ? 'many' : n === 3 ? 'goal' : 'few';
  const toggle = (key: Part | Strip) => !locked && setRecipe((r) => ({ ...r, [key]: !r[key] }));

  return (
    <section className="w-play w-fp" data-stable="play" aria-labelledby={titleId}>
      <PlayHead
        id={titleId}
        title="One red main, one fixer"
        total={CHALLENGES.length}
        flow={flow}
        story={
          <>
            Main went red at 10:02. In 30 minutes, 7 builds fail: 5 because of the same broken test, 1 lint error and 1
            type error. Every red build wakes the CI fixer agent. We want <b>one fixer per real problem</b>.
          </>
        }
        terms={[
          { word: 'fingerprint', means: 'a short code made from a failure; same code = same fixer' },
          { word: 'hash', means: 'turns any text into a short code; one changed letter gives a new code' },
          { word: 'strip', means: 'remove the parts that change every build' },
        ]}
      />
      <ChallengeNav challenges={CHALLENGES} flow={flow} />
      <GuessPanel
        challenges={CHALLENGES}
        flow={flow}
        free={
          <ul className="w-tips">
            <li>Turn off <b>first error line</b> and <b>failing job names</b>. One fixer for everything?</li>
            <li>Keep the error line but turn off <b>strip temp paths</b>. Which cards split?</li>
            <li>Find another recipe that still gives 3 fixers.</li>
          </ul>
        }
      />

      <div className="w-controls w-fp-recipe" data-locked={locked || undefined}>
        <LockNote locked={locked} />
        <div className="w-field">
          <span className="w-label">Put in the fingerprint</span>
          <div className="w-toggles">
            {PARTS.map((p) => (
              <button key={p.key} type="button" className="w-toggle" title={p.title} aria-pressed={recipe[p.key]} aria-disabled={locked || undefined} onClick={() => toggle(p.key)}>
                <span className="w-box" aria-hidden="true" />
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="w-field">
          <span className="w-label">Clean the error line</span>
          <div className="w-toggles">
            {STRIPS.map((p) => (
              <button key={p.key} type="button" className="w-toggle" title={p.title} aria-pressed={recipe[p.key]} aria-disabled={locked || undefined} onClick={() => toggle(p.key)}>
                <span className="w-box" aria-hidden="true" />
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-stage w-fp-stage" ref={stageRef}>
        <div className="w-fp-builds">
          <div className="w-fp-head">
            <span className="w-label">7 red builds</span>
            <span className="w-fp-legend">
              <s>crossed out</s> = not hashed
            </span>
          </div>
          <ol className="w-fp-list">
            {BUILDS.map((b, i) => {
              const seen = i < done;
              const hash = fingerprint(b, recipe);
              return (
                <li key={b.commit} className="w-build" data-build={i} data-seen={seen || undefined} style={{ '--w-g': `var(--w-c${seen ? colorOf.get(hash) ?? 0 : 0})` } as CSSProperties}>
                  <span className="w-build-meta">
                    <b>{b.time}</b>
                    <span className="w-build-commit" data-off={!recipe.commit || undefined} title="pushed commit">{b.commit}</span>
                    <span className="w-build-job" data-off={!recipe.job || undefined} title="failing job">job {b.job}</span>
                  </span>
                  <code className="w-build-line" data-off={!recipe.error || undefined}>
                    {b.line.map((bit, bi) =>
                      bit.k !== 'text' && recipe[bit.k] ? (
                        <s key={bi} data-k={bit.k}>{bit.v}</s>
                      ) : (
                        <span key={bi} data-k={bit.k}>{bit.v}</span>
                      ),
                    )}
                  </code>
                  <span className="w-hash" data-seen={seen || undefined} aria-label={seen ? `fingerprint ${hash}` : 'not read yet'}>
                    {seen ? hash : '······'}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="w-fp-fixers">
          <div className="w-fp-head">
            <span className="w-label">Fixer runs</span>
            <span className="w-fp-legend">${cost} each</span>
          </div>
          <ol className="w-fp-flist">
            {Array.from({ length: BUILDS.length }, (_, slot) => {
              const g = groups[slot];
              if (!g) return <li key={`e${slot}`} className="w-fixer w-fixer-empty" aria-hidden="true" />;
              const dup = g.causes.length === 1 && groups.slice(0, slot).some((x) => x.causes.includes(g.causes[0] ?? 'test'));
              return (
                <li key={g.hash} className="w-fixer" data-fp={g.hash} style={{ '--w-g': `var(--w-c${g.color})` } as CSSProperties}>
                  <span className="w-fixer-dot" aria-hidden="true" />
                  <code className="w-fixer-id">cifix:fcp:{g.hash}</code>
                  <span className="w-fixer-n">
                    {g.builds.length === 1 ? '1 build' : `${g.builds.length} builds joined`}
                  </span>
                  <span className="w-fixer-what" data-tone={g.causes.length > 1 ? 'bad' : dup ? 'warn' : 'ok'}>
                    {g.causes.length > 1
                      ? `two problems: ${g.causes.map((c) => CAUSE_NAME[c]).join(' + ')}`
                      : `${CAUSE_NAME[g.causes[0] ?? 'test']}${dup ? ' (again)' : ''}`}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="w-layer" ref={layerRef} aria-hidden="true" />
      </div>

      <div className="w-fp-sum" data-tone={VERDICT_TONE[verdict]} aria-live="polite">
        <span className="w-fp-count">
          <b>7</b> red builds → <b>{finished ? n : '?'}</b> {n === 1 && finished ? 'fixer' : 'fixers'}
        </span>
        <span className="w-fp-cost">{finished ? `${n} × $${cost} = $${n * cost}` : `$${cost} per fixer`}</span>
        <div className="w-stack w-fp-verdict">
          {VERDICTS.map((v) => (
            <span key={v.id} className="w-stack-item" data-on={verdict === v.id || undefined} aria-hidden={verdict !== v.id || undefined}>{v.text}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FingerprintSim;
