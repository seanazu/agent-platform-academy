import type { JSX } from 'react';
import CodeBlock from '../CodeBlock';
import Quiz from '../Quiz';
import Terminal from '../Terminal';
import TicketCard from '../TicketCard';
import VideoCard from '../VideoCard';
import WordList from '../WordList';
import LabSteps from './LabSteps';
import Narrated from './Narrated';
import PlatformMap from './PlatformMap';
import { course, lessonNumber, neighbours } from '../../lib/course';
import { useProgress } from '../../lib/progress';
import { href } from '../../lib/router';
import type { CoursePart, LessonV2, ReadCode } from '../../lib/types';

type WidgetMap = Record<string, (p: { config?: Record<string, unknown> }) => JSX.Element>;
const widgetModules = import.meta.glob('../../widgets/index.ts', { eager: true }) as Record<string, { WIDGETS?: WidgetMap }>;
const WIDGETS: WidgetMap = Object.values(widgetModules)[0]?.WIDGETS ?? {};

const asCode = (c: ReadCode) => ({ ...c, notes: c.notes ?? [] });

type Props = { lesson: LessonV2; part: CoursePart };

function LessonV2Page({ lesson, part }: Props) {
  const { id } = lesson;
  const { progress, setDone, answer, passLab } = useProgress();
  const { prev, next } = neighbours(id);
  const done = progress.done[id] === true;
  const Widget = WIDGETS[lesson.play.widget];
  const watchAnswers = progress.quiz[`${id}:watch`] ?? {};
  const labGuess = progress.quiz[`${id}:lab`]?.[0];

  return (
    <article className="lesson lesson2" data-accent={part.accent} data-lesson={id}>
      <header className="lesson2-head">
        <div className="lesson2-title">
          <a className="eyebrow" href={href.part(part.id)}>{part.title}</a>
          <h1>{lesson.title}</h1>
          <dl className="title-block lesson-title-block">
            <div><dt className="tb-label">Lesson</dt><dd>{lessonNumber(id)} / {course.lessonCount}</dd></div>
            <div><dt className="tb-label">Time</dt><dd>{lesson.minutes} min</dd></div>
            <div className={progress.labs[id] ? 'tb-accent' : undefined}><dt className="tb-label">Lab</dt><dd>{progress.labs[id] ? 'Passed' : 'Open'}</dd></div>
            <div className={done ? 'tb-accent' : undefined}><dt className="tb-label">Status</dt><dd>{done ? 'Done' : 'Open'}</dd></div>
          </dl>
        </div>
        <PlatformMap here={lesson.map} />
      </header>

      <section className="hook" aria-labelledby="hook-h">
        <h2 id="hook-h" className="step-h"><span className="step-n">1</span>The problem</h2>
        <div className="hook-story">
          {lesson.hook.story.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <p className="hook-question">{lesson.hook.question}</p>
      </section>

      <section aria-labelledby="watch-h">
        <h2 id="watch-h" className="step-h"><span className="step-n">2</span>Watch</h2>
        <Narrated lessonId={id} watch={lesson.watch} checkAnswers={watchAnswers} onCheck={(c, o) => answer(`${id}:watch`, c, o)} />
      </section>

      <section aria-labelledby="play-h">
        <h2 id="play-h" className="step-h"><span className="step-n">3</span>Play</h2>
        <p className="step-lead">{lesson.play.intro}</p>
        {Widget ? <Widget config={lesson.play.config} /> : <p className="empty-note">This simulator is being built.</p>}
      </section>

      <section aria-labelledby="read-h">
        <h2 id="read-h" className="step-h"><span className="step-n">4</span>How it works</h2>
        <div className="read2">
          {lesson.read.map((s) => (
            <section key={s.h} className="read2-section">
              <h3>{s.h}</h3>
              {s.p.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {s.code && <CodeBlock code={asCode(s.code)} />}
              {s.see && <Terminal text={s.see} />}
              {s.deeper && (
                <details className="deeper">
                  <summary>{s.deeper.h}</summary>
                  {s.deeper.p.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                  {s.deeper.code && <CodeBlock code={asCode(s.deeper.code)} />}
                </details>
              )}
            </section>
          ))}
          {lesson.words.length > 0 && (
            <aside className="read2-words" aria-label="Words in this lesson">
              <p className="label">Words in this lesson</p>
              <WordList words={lesson.words} />
            </aside>
          )}
        </div>
      </section>

      <section aria-labelledby="do-h">
        <h2 id="do-h" className="step-h"><span className="step-n">5</span>Do it</h2>
        <LabSteps lab={lesson.lab} passed={progress.labs[id] === true} guess={labGuess} onGuess={(o) => answer(`${id}:lab`, 0, o)} onPass={() => passLab(id)} />
      </section>

      <section aria-labelledby="check-h">
        <h2 id="check-h" className="step-h"><span className="step-n">6</span>Check yourself</h2>
        <Quiz questions={lesson.check} answers={progress.quiz[id] ?? {}} onAnswer={(q, o) => answer(id, q, o)} />
      </section>

      <section aria-labelledby="platform-h" className="platform2">
        <h2 id="platform-h" className="step-h"><span className="step-n">7</span>In our platform</h2>
        {lesson.platform.p.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        {lesson.platform.tickets.length > 0 && (
          <div className="ticket-list">
            {lesson.platform.tickets.map((t) => (
              <TicketCard key={t.key} ticket={t} />
            ))}
          </div>
        )}
      </section>

      {lesson.videos.length > 0 && (
        <section className="videos">
          <h3>More to watch</h3>
          <div className="video-grid">
            {lesson.videos.map((v) => (
              <VideoCard key={v.url} video={v} />
            ))}
          </div>
        </section>
      )}

      {lesson.review.length > 0 && (
        <section className="review2">
          <h3>Come back to these in a few days</h3>
          <ul>
            {lesson.review.map((r) => (
              <li key={r.q}>
                <details>
                  <summary>{r.q}</summary>
                  <p>{r.a}</p>
                </details>
              </li>
            ))}
          </ul>
        </section>
      )}

      <aside className="remember">
        <span className="remember-label">Remember</span>
        <p>{lesson.remember}</p>
      </aside>

      <div className="lesson-foot">
        <button type="button" className="btn btn-done" data-done={done || undefined} onClick={() => setDone(id, !done)} aria-pressed={done}>
          {done ? '✓ Lesson done' : 'Mark lesson done'}
        </button>
        <nav className="lesson-nav" aria-label="Lesson navigation">
          {prev ? (
            <a className="nav-link" href={href.lesson(prev.lesson.id)}>
              <span className="nav-dir">← Previous</span>
              <span className="nav-title">{prev.lesson.title}</span>
            </a>
          ) : <span />}
          {next ? (
            <a className="nav-link nav-next" href={href.lesson(next.lesson.id)}>
              <span className="nav-dir">Next →</span>
              <span className="nav-title">{next.lesson.title}</span>
            </a>
          ) : <span />}
        </nav>
      </div>
    </article>
  );
}

export default LessonV2Page;
