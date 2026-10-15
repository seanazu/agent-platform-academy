import { useEffect, useRef, useState, type JSX } from 'react';
import CodeBlock from '../components/CodeBlock';
import Quiz from '../components/Quiz';
import Terminal from '../components/Terminal';
import TicketCard from '../components/TicketCard';
import VideoCard from '../components/VideoCard';
import WordList from '../components/WordList';
import LabSteps from '../components/v2/LabSteps';
import Narrated from '../components/v2/Narrated';
import { asset, type Island } from './data';
import { speak, stopSpeaking } from './speech';
import { useProgress } from '../lib/progress';
import type { LessonV2, ReadCode } from '../lib/types';

type WidgetMap = Record<string, (p: { config?: Record<string, unknown> }) => JSX.Element>;
const widgetModules = import.meta.glob('../widgets/index.ts', { eager: true }) as Record<string, { WIDGETS?: WidgetMap }>;
const WIDGETS: WidgetMap = Object.values(widgetModules)[0]?.WIDGETS ?? {};

const STEPS = [
  { id: 'arrive', label: 'Arrive', hint: 'The story' },
  { id: 'watch', label: 'Watch', hint: 'Narrated' },
  { id: 'play', label: 'Play', hint: 'Break it' },
  { id: 'build', label: 'Build', hint: 'On your laptop' },
  { id: 'check', label: 'Checkpoint', hint: '3 questions' },
] as const;

const asCode = (c: ReadCode) => ({ ...c, notes: c.notes ?? [] });

type Props = { lesson: LessonV2; island: Island; onClose: () => void; onFinish: () => void };

// A lesson is a short expedition on one island: arrive with the story, watch, play with the system, build it on
// your laptop, then pass the checkpoint. One step on screen at a time; the notes are a drawer, not a wall of text.
function LessonSheet({ lesson, island, onClose, onFinish }: Props) {
  const { id } = lesson;
  const { progress, answer, passLab } = useProgress();
  const [step, setStep] = useState(0);
  const [notes, setNotes] = useState(false);
  const [listening, setListening] = useState(false);
  const body = useRef<HTMLDivElement | null>(null);
  const Widget = WIDGETS[lesson.play.widget];
  const answers = progress.quiz[id] ?? {};
  const allAnswered = lesson.check.every((_, i) => answers[i] !== undefined);

  useEffect(() => {
    body.current?.scrollTo({ top: 0 });
    stopSpeaking();
    setListening(false);
  }, [step]);
  useEffect(() => () => stopSpeaking(), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') (notes ? setNotes(false) : onClose());
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [notes, onClose]);

  const listen = async () => {
    if (listening) {
      stopSpeaking();
      setListening(false);
      return;
    }
    setListening(true);
    await speak([...lesson.hook.story, lesson.hook.question].join(' '));
    setListening(false);
  };

  const current = STEPS[step]?.id ?? 'arrive';

  return (
    <div className="isl-sheet" role="dialog" aria-modal="true" aria-label={lesson.title}>
      <header className="isl-sheet-top">
        <button type="button" className="isl-back" onClick={onClose}>← {island.name}</button>
        <nav className="isl-trail" aria-label="Lesson steps">
          {STEPS.map((s, i) => (
            <button key={s.id} type="button" className="isl-trail-step" data-state={i < step ? 'past' : i === step ? 'now' : 'next'} onClick={() => setStep(i)} aria-current={i === step ? 'step' : undefined}>
              <span className="isl-trail-dot">{i < step ? '✓' : i + 1}</span>
              <span className="isl-trail-label">{s.label}<small>{s.hint}</small></span>
            </button>
          ))}
        </nav>
        <button type="button" className="isl-notes-btn" onClick={() => setNotes(true)}>Notes</button>
      </header>

      <div className="isl-sheet-body" ref={body}>
        {current === 'arrive' && (
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
              <div className="isl-actions">
                <button type="button" className="isl-btn isl-btn-primary" onClick={() => setStep(1)}>▶ Start watching</button>
                <button type="button" className="isl-btn" onClick={() => void listen()} aria-pressed={listening}>{listening ? '■ Stop' : '♪ Listen to the story'}</button>
              </div>
            </div>
          </section>
        )}

        {current === 'watch' && (
          <section className="isl-step">
            <h2 className="isl-step-title">Watch it happen</h2>
            <p className="isl-step-lead">Press play. A voice walks you through it while the drawing moves. Click any line in the transcript to jump there.</p>
            <Narrated lessonId={id} watch={lesson.watch} checkAnswers={progress.quiz[`${id}:watch`] ?? {}} onCheck={(c, o) => answer(`${id}:watch`, c, o)} />
          </section>
        )}

        {current === 'play' && (
          <section className="isl-step">
            <h2 className="isl-step-title">Now break it yourself</h2>
            <p className="isl-step-lead">{lesson.play.intro}</p>
            <ul className="isl-tasks">
              {lesson.play.tasks.map((t) => (
                <li key={t.text} data-kind={t.kind}><span>{t.kind === 'guess' ? 'Guess' : t.kind === 'break' ? 'Break it' : 'Explore'}</span>{t.text}</li>
              ))}
            </ul>
            {Widget ? <Widget config={lesson.play.config} /> : <p className="isl-empty">This simulator is being built.</p>}
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
            <p className="isl-step-lead">Three questions about the one idea of this lesson. Pass them to light up this part of the island.</p>
            <Quiz questions={lesson.check} answers={answers} onAnswer={(q, o) => answer(id, q, o)} />
            <div className="isl-remember">
              <p className="isl-remember-label">Remember</p>
              <p>{lesson.remember}</p>
            </div>
          </section>
        )}
      </div>

      <footer className="isl-sheet-foot">
        <button type="button" className="isl-btn" onClick={() => (step ? setStep(step - 1) : onClose())}>{step ? '← Back' : '← Island'}</button>
        <span className="isl-foot-step">Step {step + 1} of {STEPS.length}</span>
        {step < STEPS.length - 1 ? (
          <button type="button" className="isl-btn isl-btn-primary" onClick={() => setStep(step + 1)}>Continue: {STEPS[step + 1]?.label} →</button>
        ) : (
          <button type="button" className="isl-btn isl-btn-primary" disabled={!allAnswered} onClick={onFinish}>{allAnswered ? 'Finish and return to the map' : 'Answer all three to finish'}</button>
        )}
      </footer>

      <div className="isl-drawer" data-open={notes || undefined} aria-hidden={!notes}>
        <button type="button" className="isl-drawer-scrim" onClick={() => setNotes(false)} tabIndex={-1} aria-label="Close notes" />
        <aside className="isl-drawer-panel" aria-label="Lesson notes">
          <header>
            <h2>Notes</h2>
            <button type="button" className="isl-panel-close" onClick={() => setNotes(false)} aria-label="Close notes">×</button>
          </header>
          <div className="isl-drawer-body">
            {lesson.read.map((s) => (
              <section key={s.h} className="isl-note">
                <h3>{s.h}</h3>
                {s.p.map((p, i) => <p key={i}>{p}</p>)}
                {s.code && <CodeBlock code={asCode(s.code)} />}
                {s.see && <Terminal text={s.see} />}
                {s.deeper && (
                  <details>
                    <summary>{s.deeper.h}</summary>
                    {s.deeper.p.map((p, i) => <p key={i}>{p}</p>)}
                  </details>
                )}
              </section>
            ))}
            {lesson.words.length > 0 && (
              <section className="isl-note">
                <h3>Words</h3>
                <WordList words={lesson.words} />
              </section>
            )}
            <section className="isl-note">
              <h3>In our platform</h3>
              {lesson.platform.p.map((p, i) => <p key={i}>{p}</p>)}
              {lesson.platform.tickets.map((t) => <TicketCard key={t.key} ticket={t} />)}
            </section>
            {lesson.videos.length > 0 && (
              <section className="isl-note">
                <h3>More to watch</h3>
                {lesson.videos.map((v) => <VideoCard key={v.url} video={v} />)}
              </section>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default LessonSheet;
