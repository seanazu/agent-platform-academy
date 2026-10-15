import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';

export type WidgetProps = { config?: Record<string, unknown> };

export type Option = { text: string; correct?: boolean };
export type Challenge = { label: string; kind?: 'break'; question: string; options: Option[]; why: string };
export type Phase = 'guess' | 'running' | 'reveal' | 'free';

export type Ctx = {
  wait: (ms: number) => Promise<void>;
  fly: (path: (Element | null | undefined)[], tone?: 'accent' | 'bad' | 'ok', hop?: number) => Promise<void>;
  live: () => boolean;
};
export type Scene = (ctx: Ctx) => Promise<void>;

// FNV-1a, 32 bit, as 6 hex characters: small, fast and the same on every machine.
export const fnv6 = (text: string): string => {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 6);
};

export const useReducedMotion = (): boolean => {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.(query).matches);
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return;
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
};

type Play = { fast: boolean; finishers: Set<() => void> };

// Runs a little animated scene: waits and tokens that fly between elements. skip() jumps every running
// scene to its end state; stop() abandons them (a reset or another challenge). With reduced motion every
// scene is instant.
export const useDirector = (layerRef: RefObject<HTMLElement | null>) => {
  const reduced = useReducedMotion();
  const gen = useRef(0);
  const active = useRef(new Set<Play>());
  const [busy, setBusy] = useState(0);

  const flush = (p: Play) => {
    p.fast = true;
    for (const f of [...p.finishers]) f();
  };

  const play = useCallback(
    async (scene: Scene): Promise<boolean> => {
      const my = gen.current;
      const p: Play = { fast: reduced, finishers: new Set() };
      const live = () => gen.current === my;
      active.current.add(p);
      setBusy((b) => b + 1);
      const wait = (ms: number) =>
        new Promise<void>((resolve) => {
          if (p.fast || !live() || ms <= 0) return resolve();
          let t = 0;
          const done = () => {
            window.clearTimeout(t);
            p.finishers.delete(done);
            resolve();
          };
          t = window.setTimeout(done, ms);
          p.finishers.add(done);
        });
      const fly: Ctx['fly'] = (path, tone = 'accent', hop = 430) =>
        new Promise<void>((resolve) => {
          const layer = layerRef.current;
          const els = path.filter((el): el is Element => !!el);
          if (p.fast || !live() || !layer || els.length < 2 || typeof layer.animate !== 'function') return resolve();
          const base = layer.getBoundingClientRect();
          const frames = els.map((el) => {
            const r = el.getBoundingClientRect();
            const x = r.left + r.width / 2 - base.left;
            const y = r.top + r.height / 2 - base.top;
            return { transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`, easing: 'cubic-bezier(.45,0,.3,1)' };
          });
          const dot = document.createElement('span');
          dot.className = 'w-token';
          dot.dataset.tone = tone;
          layer.appendChild(dot);
          const anim = dot.animate(frames, { duration: hop * (els.length - 1), fill: 'forwards' });
          const cancel = () => anim.cancel();
          const done = () => {
            p.finishers.delete(cancel);
            dot.remove();
            resolve();
          };
          anim.onfinish = done;
          anim.oncancel = done;
          p.finishers.add(cancel);
        });
      try {
        await scene({ wait, fly, live });
      } finally {
        active.current.delete(p);
        if (live()) setBusy((b) => Math.max(0, b - 1));
      }
      return live();
    },
    [layerRef, reduced],
  );

  const skip = useCallback(() => {
    for (const p of active.current) flush(p);
  }, []);

  const stop = useCallback(() => {
    gen.current += 1;
    for (const p of active.current) flush(p);
    active.current.clear();
    setBusy(0);
  }, []);

  useEffect(() => stop, [stop]);

  return { play, skip, stop, busy: busy > 0 };
};

type FlowArgs = {
  challenges: Challenge[];
  start: unknown;
  director: ReturnType<typeof useDirector>;
  setup: (index: number) => void;
  scene: (index: number) => Scene;
};

// guess → watch → reveal → free play, for every challenge. index === challenges.length is free play.
export const useFlow = ({ challenges, start, director, setup, scene }: FlowArgs) => {
  const count = challenges.length;
  const first = start === 'free' ? count : typeof start === 'number' ? Math.min(Math.max(Math.round(start) - 1, 0), count) : 0;
  const [index, setIndex] = useState(first);
  const [phase, setPhase] = useState<Phase>(first === count ? 'free' : 'guess');
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState<Record<number, boolean>>({});
  const setupRef = useRef(setup);
  setupRef.current = setup;

  useEffect(() => {
    setupRef.current(first);
  }, [first]);

  const go = (i: number) => {
    director.stop();
    setIndex(i);
    setChosen(null);
    setPhase(i === count ? 'free' : 'guess');
    setup(i);
  };

  const choose = async (option: number) => {
    if (phase !== 'guess') return;
    const c = challenges[index];
    if (!c) return;
    setChosen(option);
    setPhase('running');
    const finished = await director.play(scene(index));
    if (!finished) return;
    setScore((s) => ({ ...s, [index]: !!c.options[option]?.correct }));
    setPhase('reveal');
  };

  const reset = () => {
    if (phase === 'guess' || phase === 'running') return;
    director.stop();
    setup(index);
  };

  return {
    index,
    phase,
    chosen,
    score,
    locked: phase === 'guess' || phase === 'running',
    go,
    choose,
    reset,
    skip: director.skip,
    next: () => go(Math.min(index + 1, count)),
  };
};

type Flow = ReturnType<typeof useFlow>;

type HeadProps = { id: string; title: string; story: ReactNode; terms: { word: string; means: string }[]; flow: Flow; total: number };

export function PlayHead({ id, title, story, terms, flow, total }: HeadProps) {
  const tried = Object.keys(flow.score).length;
  const right = Object.values(flow.score).filter(Boolean).length;
  return (
    <header className="w-head">
      <div className="w-head-top">
        <span className="w-eyebrow">Play · guess first</span>
        <span className="w-score" title={`${total} bets in this game`}>
          Right <b>{right}</b>/{tried}
        </span>
      </div>
      <h3 id={id} className="w-title">{title}</h3>
      <p className="w-story">{story}</p>
      <dl className="w-terms">
        {terms.map((t) => (
          <div key={t.word} className="w-term">
            <dt>{t.word}</dt>
            <dd>{t.means}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}

export function ChallengeNav({ challenges, flow }: { challenges: Challenge[]; flow: Flow }) {
  return (
    <nav className="w-nav" aria-label="Challenges">
      {challenges.map((c, i) => (
        <button
          key={i}
          type="button"
          className="w-step"
          title={c.label}
          aria-label={`Challenge ${i + 1}: ${c.label}`}
          aria-current={flow.index === i ? 'step' : undefined}
          data-kind={c.kind}
          data-result={flow.score[i] === undefined ? undefined : flow.score[i] ? 'right' : 'wrong'}
          onClick={() => flow.go(i)}
        >
          <span className="w-step-n">{i + 1}</span>
          <span className="w-step-label">{c.label}</span>
        </button>
      ))}
      <button
        type="button"
        className="w-step w-step-free"
        aria-current={flow.index === challenges.length ? 'step' : undefined}
        onClick={() => flow.go(challenges.length)}
      >
        Free play
      </button>
    </nav>
  );
}

type GuessProps = { challenges: Challenge[]; flow: Flow; free: ReactNode };

// Every challenge and every state lives in one grid cell, so the panel is always as tall as its tallest state.
export function GuessPanel({ challenges, flow, free }: GuessProps) {
  const current = challenges[flow.index];
  const answer = current?.options.find((o) => o.correct);
  const gotIt = flow.chosen !== null && !!current?.options[flow.chosen]?.correct;
  const live =
    flow.phase === 'running'
      ? 'Running. Watch what happens.'
      : flow.phase === 'reveal' && current
        ? `${gotIt ? 'You got it.' : `Not quite. The answer is: ${answer?.text ?? ''}.`} ${current.why}`
        : '';
  return (
    <div className="w-guess" data-phase={flow.phase}>
      <p className="sr-only" aria-live="polite">{live}</p>
      <div className="w-stack">
        {challenges.map((c, ci) => {
          const on = ci === flow.index;
          const phase: Phase = on ? flow.phase : 'guess';
          const right = c.options.find((o) => o.correct);
          return (
            <div key={ci} className="w-stack-item" data-on={on || undefined} aria-hidden={!on || undefined} inert={!on || undefined}>
              <div className="w-guess-body">
                <p className="w-q">
                  <span className="w-q-n" data-kind={c.kind}>{c.kind === 'break' ? 'Break it' : `Bet ${ci + 1}`}</span>
                  <span>{c.question}</span>
                </p>
                <div className="w-options" role="group" aria-label="Your guess">
                  {c.options.map((o, oi) => (
                    <button
                      key={oi}
                      type="button"
                      className="w-option"
                      aria-pressed={on && flow.chosen === oi}
                      aria-disabled={phase !== 'guess' || undefined}
                      data-mark={phase === 'reveal' ? (o.correct ? 'right' : on && flow.chosen === oi ? 'wrong' : undefined) : undefined}
                      onClick={() => flow.choose(oi)}
                    >
                      <span className="w-option-key" aria-hidden="true">{String.fromCharCode(65 + oi)}</span>
                      <span>{o.text}</span>
                    </button>
                  ))}
                </div>
                <div className="w-stack w-verdict">
                  <div className="w-stack-item" data-on={phase === 'guess' || undefined}>
                    <p className="w-hint">Pick your bet. Then we run it and you see.</p>
                  </div>
                  <div className="w-stack-item" data-on={phase === 'running' || undefined}>
                    <div className="w-verdict-row">
                      <p className="w-hint"><span className="w-pulse" aria-hidden="true" />Running… watch the picture below.</p>
                      <button type="button" className="btn w-btn-sm" tabIndex={phase === 'running' ? 0 : -1} onClick={flow.skip}>Skip to the end</button>
                    </div>
                  </div>
                  {[true, false].map((good) => (
                    <div key={String(good)} className="w-stack-item" data-on={(phase === 'reveal' && gotIt === good) || undefined}>
                      <div className="w-verdict-row">
                        <p className="w-why" data-good={good || undefined}>
                          <b>{good ? 'You got it.' : `Not quite: ${right?.text ?? ''}.`}</b> {c.why}
                        </p>
                        <button
                          type="button"
                          className="btn btn-primary w-btn-sm"
                          tabIndex={phase === 'reveal' && gotIt === good ? 0 : -1}
                          onClick={flow.next}
                        >
                          {ci + 1 < challenges.length ? 'Next bet' : 'Free play'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
        <div className="w-stack-item" data-on={flow.index === challenges.length || undefined} aria-hidden={flow.index !== challenges.length || undefined} inert={flow.index !== challenges.length || undefined}>
          <div className="w-guess-body w-free">
            <p className="w-q">
              <span className="w-q-n" data-kind="free">Free play</span>
              <span>Everything is unlocked. Change one thing at a time and watch.</span>
            </p>
            {free}
          </div>
        </div>
      </div>
    </div>
  );
}

// A row of choices that act like radio buttons.
type SegProps<T extends string> = {
  label: string;
  hints?: Record<T, string>;
  value: T;
  options: { value: T; label: ReactNode; title?: string }[];
  onChange: (v: T) => void;
  locked: boolean;
};

export function Segmented<T extends string>({ label, hints, value, options, onChange, locked }: SegProps<T>) {
  return (
    <div className="w-field">
      <span className="w-label">{label}</span>
      <div className="w-seg" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            aria-disabled={locked || undefined}
            className="w-seg-btn"
            title={o.title}
            onClick={() => !locked && onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
      {hints && (
        <div className="w-stack w-field-hint">
          {options.map((o) => (
            <span key={o.value} className="w-stack-item" data-on={value === o.value || undefined}>{hints[o.value]}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function LockNote({ locked }: { locked: boolean }) {
  return (
    <div className="w-stack w-lock">
      <p className="w-stack-item w-lock-text" data-on={locked || undefined}>Bet first. The controls unlock after the run.</p>
      <p className="w-stack-item w-lock-text" data-on={!locked || undefined} data-open>Your turn: change anything and try again.</p>
    </div>
  );
}
