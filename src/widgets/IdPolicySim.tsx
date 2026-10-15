import { useEffect, useId, useRef, useState } from 'react';
import { ChallengeNav, GuessPanel, LockNote, PlayHead, Segmented, fnv6, useDirector, useFlow, type Challenge, type Scene, type WidgetProps } from './shared';

type Trigger = 'jira' | 'slack' | 'comment';
type IdMode = 'random' | 'ticket';
type Policy = 'FAIL' | 'USE_EXISTING' | 'TERMINATE_EXISTING';
type Tone = 'ok' | 'join' | 'bad' | 'info';
type Run = { n: number; id: string; status: 'running' | 'finished' | 'killed'; by: Trigger; joined: number; progress: number; lost?: number };
type Sim = {
  idMode: IdMode;
  policy: Policy;
  runs: Run[];
  started: number;
  seq: number;
  replies: Partial<Record<Trigger, { tone: Tone; text: string }>>;
  log: { n: number; tone: Tone; text: string }[];
  flash: { n: number; tone: Tone; run?: number; toast?: string } | null;
};

const TICKET_ID = 'nova:RH-1234';
const VM_SLOTS = 3;
const ALL: Trigger[] = ['jira', 'slack', 'comment'];
const TRIGGERS: { id: Trigger; name: string; sub: string }[] = [
  { id: 'jira', name: 'Jira poll', sub: 'looks every minute' },
  { id: 'slack', name: 'Slack /nova', sub: 'someone types /nova RH-1234' },
  { id: 'comment', name: 'Jira comment', sub: '"@nova please start"' },
];
const NAME: Record<Trigger, string> = { jira: 'Jira poll', slack: 'Slack /nova', comment: 'Jira comment' };

const CHALLENGES: Challenge[] = [
  {
    label: 'The storm',
    question: 'Each start gets a random ID. All 3 triggers fire at the same time. How many runs start?',
    options: [{ text: '1 run' }, { text: '2 runs' }, { text: '3 runs', correct: true }],
    why: 'Every start gets a new random name, so Temporal sees 3 different runs: 3 VMs and $12 for one ticket.',
  },
  {
    label: 'Ticket as ID',
    question: 'Now the ID is the ticket: nova:RH-1234. If the name is taken: FAIL. All 3 fire. What happens?',
    options: [{ text: '3 runs again' }, { text: '1 run and 2 errors', correct: true }, { text: '1 run, no errors' }],
    why: 'The first start takes the name. The other two get an error. Safe, but the person in Slack sees an error.',
  },
  {
    label: 'Join the run',
    question: 'Same ID, but the rule is USE_EXISTING. All 3 fire. What happens?',
    options: [{ text: '1 run and 2 errors' }, { text: '1 run, the other 2 join it', correct: true }, { text: '3 runs' }],
    why: 'The later starts get the open run back instead of an error, so Slack can answer with a link to it.',
  },
  {
    label: 'Kill the run',
    kind: 'break',
    question: 'The rule is TERMINATE_EXISTING. Nova is 70% done. Someone types /nova RH-1234 again. What happens?',
    options: [{ text: 'The new start joins the run' }, { text: 'The new start gets an error' }, { text: 'The 70% run is killed, work starts at 0', correct: true }],
    why: 'TERMINATE_EXISTING kills the open run to free the name, so one extra message throws away 70% of the work.',
  },
  {
    label: 'After it ends',
    question: 'The run finished. Later RH-1234 is given to Nova again and the Jira poll sees it. What happens?',
    options: [{ text: 'Error: the ID was used before' }, { text: 'It joins the finished run' }, { text: 'A new run starts with the same ID', correct: true }],
    why: 'Only an open run holds a name. When the run is closed, nova:RH-1234 is free for a new run.',
  },
];

const POLICY_HINT: Record<Policy, string> = {
  FAIL: 'The second start gets an error.',
  USE_EXISTING: 'The second start joins the open run.',
  TERMINATE_EXISTING: 'The open run is killed. A new one starts from 0.',
};

const costOf = (config: WidgetProps['config']) => (typeof config?.costPerRun === 'number' ? config.costPerRun : 4);

const pushLog = (log: Sim['log'], n: number, tone: Tone, text: string) => [{ n, tone, text }, ...log].slice(0, 3);

const fresh = (idMode: IdMode, policy: Policy, runs: Run[] = [], note?: { tone: Tone; text: string }): Sim => ({
  idMode,
  policy,
  runs,
  started: runs.length,
  seq: runs.length,
  replies: {},
  log: note ? [{ n: 0, ...note }] : [],
  flash: null,
});

const SETUPS: (() => Sim)[] = [
  () => fresh('random', 'FAIL'),
  () => fresh('ticket', 'FAIL'),
  () => fresh('ticket', 'USE_EXISTING'),
  () =>
    fresh('ticket', 'TERMINATE_EXISTING', [{ n: 1, id: TICKET_ID, status: 'running', by: 'jira', joined: 0, progress: 70 }], {
      tone: 'info',
      text: 'Nova has worked on RH-1234 for 20 minutes. It is 70% done.',
    }),
  () =>
    fresh('ticket', 'FAIL', [{ n: 1, id: TICKET_ID, status: 'finished', by: 'jira', joined: 0, progress: 100 }], {
      tone: 'ok',
      text: 'Run nova:RH-1234 finished and opened a draft PR. Later, RH-1234 is given to Nova again.',
    }),
  () => fresh('random', 'FAIL'),
];

const fire = (s: Sim, t: Trigger, cost: number): Sim => {
  const seq = s.seq + 1;
  const id = s.idMode === 'random' ? `run-${fnv6(`nova-${seq}`)}` : TICKET_ID;
  const open = s.runs.find((r) => r.id === id && r.status === 'running');
  const who = NAME[t];
  const run: Run = { n: seq, id, status: 'running', by: t, joined: 0, progress: 0 };
  if (!open) {
    return {
      ...s,
      seq,
      started: s.started + 1,
      runs: [...s.runs, run],
      replies: { ...s.replies, [t]: { tone: 'ok', text: 'started a run' } },
      log: pushLog(s.log, seq, 'info', `${who} started a new run: ${id}. One more VM, +$${cost}.`),
      flash: { n: seq, tone: 'ok', run: seq },
    };
  }
  if (s.policy === 'FAIL') {
    return {
      ...s,
      seq,
      replies: { ...s.replies, [t]: { tone: 'bad', text: 'got an error' } },
      log: pushLog(s.log, seq, 'bad', `${who} got an error: a run named ${id} is already open.`),
      flash: { n: seq, tone: 'bad', toast: 'Error: already started' },
    };
  }
  if (s.policy === 'USE_EXISTING') {
    return {
      ...s,
      seq,
      runs: s.runs.map((r) => (r === open ? { ...r, joined: r.joined + 1 } : r)),
      replies: { ...s.replies, [t]: { tone: 'join', text: 'joined the open run' } },
      log: pushLog(s.log, seq, 'ok', `${who} joined the open run ${id}. No new VM, no extra cost.`),
      flash: { n: seq, tone: 'join', run: open.n },
    };
  }
  return {
    ...s,
    seq,
    started: s.started + 1,
    runs: [...s.runs.map((r) => (r === open ? { ...r, status: 'killed' as const, lost: r.progress } : r)), run],
    replies: { ...s.replies, [t]: { tone: 'bad', text: 'killed the open run' } },
    log: pushLog(s.log, seq, 'bad', `${who} killed the open run at ${open.progress}%. That work is lost. New run, +$${cost}.`),
    flash: { n: seq, tone: 'bad', run: seq, toast: 'Old run killed' },
  };
};

const finish = (s: Sim): Sim => {
  const open = s.runs.find((r) => r.status === 'running');
  if (!open) return s;
  const seq = s.seq + 1;
  return {
    ...s,
    seq,
    runs: s.runs.map((r) => (r === open ? { ...r, status: 'finished', progress: 100 } : r)),
    log: pushLog(s.log, seq, 'ok', `Run ${open.id} finished. Its name is free again.`),
    flash: { n: seq, tone: 'ok', run: open.n },
  };
};

const tick = (s: Sim): Sim =>
  s.runs.some((r) => r.status === 'running' && r.progress < 95)
    ? { ...s, runs: s.runs.map((r) => (r.status === 'running' && r.progress < 95 ? { ...r, progress: r.progress + 1 } : r)) }
    : s;

const STATUS_TEXT: Record<Run['status'], string> = { running: 'running', finished: 'finished', killed: 'killed' };

function IdPolicySim({ config }: WidgetProps) {
  const titleId = useId();
  const cost = costOf(config);
  const [sim, setSim] = useState<Sim>(() => fresh('random', 'FAIL'));
  const simRef = useRef(sim);
  const stageRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const temporalRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Partial<Record<Trigger, HTMLDivElement | null>>>({});
  const director = useDirector(layerRef);

  const commit = (fn: (s: Sim) => Sim) => {
    simRef.current = fn(simRef.current);
    setSim(simRef.current);
  };

  const fireScene =
    (list: Trigger[], before?: string): Scene =>
    async (ctx) => {
      if (before) commit((s) => ({ ...s, log: pushLog(s.log, s.seq, 'info', before) }));
      for (const t of list) {
        await ctx.fly([triggerRefs.current[t], temporalRef.current]);
        if (!ctx.live()) return;
        commit((s) => fire(s, t, cost));
        const target = simRef.current.flash?.run;
        await ctx.wait(40);
        if (target !== undefined && ctx.live()) {
          await ctx.fly([temporalRef.current, stageRef.current?.querySelector(`[data-run="${target}"]`)], 'accent', 380);
        }
        await ctx.wait(160);
        if (!ctx.live()) return;
      }
    };

  const flow = useFlow({
    challenges: CHALLENGES,
    start: config?.start,
    director,
    setup: (i) => commit(() => (SETUPS[i] ?? SETUPS[SETUPS.length - 1]!)()),
    scene: (i) => (i === 3 ? fireScene(['slack']) : i === 4 ? fireScene(['jira']) : fireScene(ALL)),
  });

  const ticking = flow.phase === 'reveal' || flow.phase === 'free';
  useEffect(() => {
    if (!ticking) return;
    const t = window.setInterval(() => commit(tick), 260);
    return () => window.clearInterval(t);
  }, [ticking]); // eslint-disable-line react-hooks/exhaustive-deps

  const { locked } = flow;
  const shown = sim.runs.slice(-4);
  const openRuns = sim.runs.filter((r) => r.status === 'running').length;
  const over = Math.max(0, openRuns - VM_SLOTS);
  const trigger = (list: Trigger[]) => !locked && director.play(fireScene(list));
  const setMode = (idMode: IdMode) => commit((s) => ({ ...s, idMode }));
  const setPolicy = (policy: Policy) => commit((s) => ({ ...s, policy }));

  return (
    <section className="w-play w-ip" data-stable="play" aria-labelledby={titleId}>
      <PlayHead
        id={titleId}
        title="One ticket, one run"
        total={CHALLENGES.length}
        flow={flow}
        story={
          <>
            Ticket <b>RH-1234</b> is given to Nova, our coding agent. Three things can try to start the work. Every new
            run takes a VM and costs <b>${cost}</b>. We want one run per ticket.
          </>
        }
        terms={[
          { word: 'Temporal', means: 'the service that starts runs and remembers them' },
          { word: 'workflow ID', means: 'the name of a run; only one open run can have a name' },
          { word: 'VM', means: 'a fresh computer for one run' },
        ]}
      />
      <ChallengeNav challenges={CHALLENGES} flow={flow} />
      <GuessPanel
        challenges={CHALLENGES}
        flow={flow}
        free={
          <ul className="w-tips">
            <li>Random ID, press <b>Fire all 3</b> twice. Watch the VMs and the money.</li>
            <li>Ticket ID with <b>USE_EXISTING</b>: press every trigger. Still one run?</li>
            <li>Press <b>Finish the run</b>, then fire again. The name is free.</li>
          </ul>
        }
      />

      <div className="w-stage w-ip-stage" ref={stageRef}>
        <div className="w-ip-triggers" role="list" aria-label="Triggers">
          {TRIGGERS.map((t) => {
            const reply = sim.replies[t.id];
            return (
              <div key={t.id} role="listitem" className="w-ip-trigger" ref={(el) => { triggerRefs.current[t.id] = el; }}>
                <span className="w-ip-trigger-name">{t.name}</span>
                <span className="w-ip-trigger-sub">{t.sub}</span>
                <span className="w-ip-reply" data-tone={reply?.tone}>{reply ? reply.text : 'quiet'}</span>
              </div>
            );
          })}
        </div>

        <div className="w-ip-temporal" ref={temporalRef} data-tone={sim.flash?.tone}>
          {sim.flash && <span key={sim.flash.n} className="w-flash" data-tone={sim.flash.tone} aria-hidden="true" />}
          <span className="w-label">Temporal</span>
          <span className="w-ip-rule">
            <span className="w-ip-rule-k">name</span>
            <code>{sim.idMode === 'ticket' ? TICKET_ID : 'run-<random>'}</code>
          </span>
          <span className="w-ip-rule">
            <span className="w-ip-rule-k">if open</span>
            <code>{sim.policy}</code>
          </span>
          {sim.flash?.toast && (
            <span key={`t${sim.flash.n}`} className="w-toast" role="status">{sim.flash.toast}</span>
          )}
        </div>

        <div className="w-ip-runs">
          <div className="w-ip-runs-head">
            <span className="w-label">Runs</span>
            <span className="w-ip-count">
              {sim.runs.length} total{sim.runs.length > 4 ? ' · newest 4' : ''}
            </span>
          </div>
          <div className="w-ip-grid">
            {[0, 1, 2, 3].map((slot) => {
              const r = shown[slot];
              if (!r) return <div key={`e${slot}`} className="w-run w-run-empty" aria-hidden="true">no run</div>;
              return (
                <article key={r.n} className="w-run" data-run={r.n} data-status={r.status} aria-label={`Run ${r.id}, ${r.status}`}>
                  {sim.flash?.run === r.n && <span key={sim.flash.n} className="w-ring" data-tone={sim.flash.tone} aria-hidden="true" />}
                  <div className="w-run-top">
                    <code className="w-run-id">{r.id}</code>
                    <span className="w-run-status" data-status={r.status}>{STATUS_TEXT[r.status]}</span>
                  </div>
                  <div className="w-bar" data-status={r.status} aria-hidden="true">
                    <span style={{ width: `${r.status === 'killed' ? (r.lost ?? 0) : r.progress}%` }} />
                  </div>
                  <span className="w-run-meta">
                    {r.status === 'killed'
                      ? `${r.lost ?? 0}% of the work lost`
                      : `${r.progress}% done · by ${NAME[r.by]}`}
                  </span>
                  <span className="w-run-join" data-on={r.joined > 0 || undefined}>
                    {r.joined > 0 ? `+${r.joined} joined this run` : 'nobody joined'}
                  </span>
                </article>
              );
            })}
          </div>
        </div>
        <div className="w-layer" ref={layerRef} aria-hidden="true" />
      </div>

      <div className="w-ip-meters">
        <div className="w-meter" data-tone={over > 0 ? 'bad' : openRuns > 1 ? 'warn' : undefined}>
          <span className="w-label">VMs in use</span>
          <span className="w-slots" aria-hidden="true">
            {Array.from({ length: VM_SLOTS }, (_, i) => (
              <span key={i} className="w-slot" data-on={i < openRuns || undefined} />
            ))}
          </span>
          <span className="w-meter-value">
            {openRuns} of {VM_SLOTS}
            {over > 0 ? ` · ${over} waiting` : ''}
          </span>
        </div>
        <div className="w-meter" data-tone={sim.started > 2 ? 'bad' : undefined}>
          <span className="w-label">Spent</span>
          <span className="w-meter-big">${sim.started * cost}</span>
          <span className="w-meter-value">${cost} per run</span>
        </div>
      </div>

      <ol className="w-log" aria-live="polite" aria-label="What happened">
        {[0, 1, 2].map((i) => {
          const line = sim.log[i];
          return (
            <li key={line ? `${line.n}-${i}` : `empty${i}`} className="w-log-line" data-tone={line?.tone} data-new={(i === 0 && !!line) || undefined}>
              {line?.text ?? ''}
            </li>
          );
        })}
      </ol>

      <div className="w-controls" data-locked={locked || undefined}>
        <LockNote locked={locked} />
        <div className="w-field">
          <span className="w-label">Start the work from</span>
          <div className="w-btns">
            {TRIGGERS.map((t) => (
              <button key={t.id} type="button" className="btn w-btn-sm" aria-disabled={locked || undefined} onClick={() => trigger([t.id])}>
                {t.name}
              </button>
            ))}
            <button type="button" className="btn btn-primary w-btn-sm" aria-disabled={locked || undefined} onClick={() => trigger(ALL)}>
              Fire all 3
            </button>
          </div>
        </div>
        <Segmented<IdMode>
          label="Workflow ID (the run's name)"
          value={sim.idMode}
          locked={locked}
          onChange={setMode}
          options={[
            { value: 'random', label: <>random <code>run-7f3a…</code></> },
            { value: 'ticket', label: <>the ticket <code>{TICKET_ID}</code></> },
          ]}
        />
        <Segmented<Policy>
          label="If a run with this name is open"
          value={sim.policy}
          locked={locked}
          onChange={setPolicy}
          hints={POLICY_HINT}
          options={[
            { value: 'FAIL', label: <code>FAIL</code> },
            { value: 'USE_EXISTING', label: <code>USE_EXISTING</code> },
            { value: 'TERMINATE_EXISTING', label: <code>TERMINATE_EXISTING</code> },
          ]}
        />
        <div className="w-btns">
          <button
            type="button"
            className="btn w-btn-sm"
            aria-disabled={locked || openRuns === 0 || undefined}
            onClick={() => !locked && commit(finish)}
          >
            Finish the run
          </button>
          <button type="button" className="btn w-btn-sm" aria-disabled={locked || undefined} onClick={flow.reset}>
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}

export default IdPolicySim;
