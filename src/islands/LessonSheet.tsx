import { useEffect, useRef, useState, type JSX } from 'react';
import CodeBlock from '../components/CodeBlock';
import Quiz from '../components/Quiz';
import Terminal from '../components/Terminal';
import TicketCard from '../components/TicketCard';
import WordList from '../components/WordList';
import LabSteps from '../components/v2/LabSteps';
import Clips from './Clips';
import Practice from './Practice';
import { clipsFor } from './clipData';
import { asset, type Island } from './data';
import { useProgress } from '../lib/progress';
import type { LessonV2, ReadCode } from '../lib/types';

type WidgetMap = Record<string, (p: { config?: Record<string, unknown> }) => JSX.Element>;
const widgetModules = import.meta.glob('../widgets/index.ts', { eager: true }) as Record<string, { WIDGETS?: WidgetMap }>;
const WIDGETS: WidgetMap = Object.values(widgetModules)[0]?.WIDGETS ?? {};

const STEPS = [
  { id: 'story', label: 'Story', hint: 'Why it matters' },
  { id: 'watch', label: 'Watch', hint: 'Video clips' },
  { id: 'understand', label: 'Understand', hint: 'How it works' },
  { id: 'practice', label: 'Practice', hint: 'Try and drill' },
  { id: 'build', label: 'Build', hint: 'Your laptop' },
  { id: 'check', label: 'Checkpoint', hint: '3 questions' },
] as const;

const asCode = (c: ReadCode) => ({ ...c, notes: c.notes ?? [] });

// Per-lesson memory of which steps you opened and which clips you watched. Only a convenience: if storage is
// blocked the lesson works the same, it just forgets.
const memory = (key: string) => ({
  read: (): number[] => {
    try {
      return JSON.parse(localStorage.getItem(key) ?? '[]') as number[];
    } catch {
      return [];
    }
  },
  write: (v: number[]) => {
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {
      // Storage blocked: keep going without it.
    }
  },
});

type Props = { lesson: LessonV2; island: Island; onClose: () => void; onComplete: (done: boolean) => void };

// A lesson is a short expedition on one island, in six steps. Every step is open: jump anywhere, skip anything,
// come back later. Progress shows what you have opened, and you mark the lesson done when you decide it is done.
function LessonSheet({ lesson, island, onClose, onComplete }: Props) {
  const { id } = lesson;
  const { progress, answer, passLab } = useProgress();
  const steps = memory(`apa.islands.steps.${id}`);
  const clipMemory = memory(`apa.islands.clips.${id}`);
  const [step, setStep] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(() => new Set([0, ...steps.read()]));
  const [watched, setWatched] = useState<Set<number>>(() => new Set(clipMemory.read()));
  const body = useRef<HTMLDivElement | null>(null);
  const Widget = WIDGETS[lesson.play.widget];
  const set = clipsFor(id);
  const done = progress.done[id] === true;

  useEffect(() => {
    body.current?.scrollTo({ top: 0 });
    setSeen((prev) => {
      if (prev.has(step)) return prev;
      const next = new Set(prev).add(step);
      steps.write([...next]);
      return next;
    });
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const markWatched = (i: number, on: boolean) => {
    setWatched((prev) => {
      const next = new Set(prev);
      if (on) next.add(i);
      else next.delete(i);
      clipMemory.write([...next]);
      return next;
    });
  };

  const current = STEPS[step]?.id ?? 'story';
  const pct = Math.round((seen.size / STEPS.length) * 100);

  return (
    <div className="isl-sheet" role="dialog" aria-modal="true" aria-label={lesson.title}>
      <header className="isl-sheet-top">
        <button type="button" className="isl-back" onClick={onClose}>← {island.name}</button>
        <nav className="isl-trail" aria-label="Lesson steps">
          {STEPS.map((s, i) => (
            <button key={s.id} type="button" className="isl-trail-step" data-state={i === step ? 'now' : seen.has(i) ? 'past' : 'next'} onClick={() => setStep(i)} aria-current={i === step ? 'step' : undefined}>
              <span className="isl-trail-dot">{seen.has(i) && i !== step ? '✓' : i + 1}</span>
              <span className="isl-trail-label">{s.label}<small>{s.hint}</small></span>
            </button>
          ))}
        </nav>
        <button type="button" className="isl-done-btn" aria-pressed={done} onClick={() => onComplete(!done)}>
          {done ? '✓ Lesson done' : 'Mark as done'}
        </button>
      </header>
      <div className="isl-sheet-progress" aria-hidden="true"><span style={{ width: `${pct}%` }} /></div>

      <div className="isl-sheet-body" ref={body}>
        {current === 'story' && (
          <section className="isl-arrive">
            <div className="isl-arrive-media">
              {island.video ? (
                <video src={asset(`${island.video}.mp4`)} poster={asset(`${island.art}.webp`)} autoPlay muted loop playsInline aria-hidden="true" />
              ) : (
                <img src={asset(`${island.art}.webp`)} alt="" />
              )}
              <span className="isl-arrive-tag">You are on the {island.name}</span>
            </div>
            <div className="isl-arrive-text">
              <p className="isl-meta">{lesson.minutes} min · {island.name}</p>
              <h1>{lesson.title}</h1>
              {lesson.hook.story.map((p, i) => (
                <p key={i} className="isl-story">{p}</p>
              ))}
              <p className="isl-question">{lesson.hook.question}</p>
              <div className="isl-path-preview">
                {STEPS.slice(1).map((s, i) => (
                  <button key={s.id} type="button" onClick={() => setStep(i + 1)}>
                    <b>{s.label}</b>
                    <span>{s.id === 'watch' && set ? `${set.clips.length} clips · ${Math.round(set.clips.reduce((t, c) => t + c.end - c.start, 0) / 60)} min` : s.hint}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {current === 'watch' && (
          <section className="isl-step">
            <h2 className="isl-step-title">Watch the parts that matter</h2>
            <p className="isl-step-lead">Short clips from people who explain this well. Each one starts and stops on the minutes that matter for this lesson, so you never sit through a whole talk.</p>
            {set && set.clips.length > 0 ? <Clips clips={set.clips} watched={watched} onWatched={markWatched} /> : <p className="isl-empty">Clips for this lesson are being picked.</p>}
          </section>
        )}

        {current === 'understand' && (
          <section className="isl-step isl-read">
            <h2 className="isl-step-title">How it works</h2>
            {lesson.read.map((s) => (
              <section key={s.h} className="isl-read-section">
                <h3>{s.h}</h3>
                {s.p.map((p, i) => <p key={i}>{p}</p>)}
                {s.code && <CodeBlock code={asCode(s.code)} />}
                {s.see && <Terminal text={s.see} />}
                {s.deeper && (
                  <details className="isl-deeper">
                    <summary>{s.deeper.h}</summary>
                    {s.deeper.p.map((p, i) => <p key={i}>{p}</p>)}
                  </details>
                )}
              </section>
            ))}
            <div className="isl-read-grid">
              {lesson.words.length > 0 && (
                <section className="isl-read-card">
                  <h3>Words</h3>
                  <WordList words={lesson.words} />
                </section>
              )}
              <section className="isl-read-card">
                <h3>In our platform</h3>
                {lesson.platform.p.map((p, i) => <p key={i}>{p}</p>)}
                {lesson.platform.tickets.map((t) => <TicketCard key={t.key} ticket={t} />)}
              </section>
            </div>
          </section>
        )}

        {current === 'practice' && (
          <section className="isl-step">
            <h2 className="isl-step-title">Practice</h2>
            <p className="isl-step-lead">First play with the real behaviour, then a few quick drills. Get things wrong here on purpose: that is what this step is for.</p>
            <h3 className="isl-sub">Try it: {lesson.play.intro}</h3>
            {Widget ? <Widget config={lesson.play.config} /> : <p className="isl-empty">This simulator is being built.</p>}
            {set && set.practice.length > 0 && (
              <>
                <h3 className="isl-sub">Quick drills</h3>
                <Practice drills={set.practice} />
              </>
            )}
          </section>
        )}

        {current === 'build' && (
          <section className="isl-step">
            <h2 className="isl-step-title">Build it on your laptop</h2>
            <p className="isl-step-lead">Everything runs on your machine. A check tells you exactly what is wrong, and hints come one at a time.</p>
            <LabSteps lab={lesson.lab} passed={progress.labs[id] === true} guess={progress.quiz[`${id}:lab`]?.[0]} onGuess={(o) => answer(`${id}:lab`, 0, o)} onPass={() => passLab(id)} />
          </section>
        )}

        {current === 'check' && (
          <section className="isl-step">
            <h2 className="isl-step-title">Checkpoint</h2>
            <p className="isl-step-lead">Three questions about the one idea of this lesson. Answer them in any order, as often as you like.</p>
            <Quiz questions={lesson.check} answers={progress.quiz[id] ?? {}} onAnswer={(q, o) => answer(id, q, o)} />
            <div className="isl-remember">
              <p className="isl-remember-label">Remember</p>
              <p>{lesson.remember}</p>
            </div>
            <details className="isl-deeper">
              <summary>Come back to these in a few days</summary>
              <ul>
                {lesson.review.map((r) => (
                  <li key={r.q}><b>{r.q}</b> {r.a}</li>
                ))}
              </ul>
            </details>
          </section>
        )}
      </div>

      <footer className="isl-sheet-foot">
        <button type="button" className="isl-btn" onClick={() => (step ? setStep(step - 1) : onClose())}>{step ? `← ${STEPS[step - 1]?.label}` : `← ${island.name}`}</button>
        <span className="isl-foot-step">{seen.size} of {STEPS.length} steps opened</span>
        {step < STEPS.length - 1 ? (
          <button type="button" className="isl-btn isl-btn-primary" onClick={() => setStep(step + 1)}>{STEPS[step + 1]?.label} →</button>
        ) : (
          <button type="button" className="isl-btn isl-btn-primary" onClick={() => { if (!done) onComplete(true); onClose(); }}>{done ? 'Back to the island' : 'Mark as done and go back'}</button>
        )}
      </footer>
    </div>
  );
}

export default LessonSheet;
