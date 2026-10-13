import { useEffect } from 'react';
import ArtBox from './ArtBox';
import Lab from './Lab';
import LessonMissing from './LessonMissing';
import Picture from './Picture';
import Quiz from './Quiz';
import Section from './Section';
import TicketCard from './TicketCard';
import VideoCard from './VideoCard';
import WordList from './WordList';
import { findLesson, lessonNumber, neighbours } from '../lib/course';
import { getLesson, isSample } from '../lib/lessons';
import { useProgress } from '../lib/progress';
import { href } from '../lib/router';

function LessonPage({ id }: { id: string }) {
  const ref = findLesson(id);
  const lesson = getLesson(id);
  const { progress, setDone, answer, visit } = useProgress();
  useEffect(() => {
    if (ref) visit(id);
  }, [id, ref, visit]);

  if (!ref) {
    return (
      <div className="empty">
        <h1>No such lesson</h1>
        <p><a href={href.home()}>Back to the path</a></p>
      </div>
    );
  }
  if (!lesson) return <LessonMissing lessonRef={ref} />;

  const { part } = ref;
  const { prev, next } = neighbours(id);
  const done = progress.done[id] === true;
  const quizAnswers = progress.quiz[id] ?? {};

  return (
    <article className="lesson" data-accent={part.accent} data-lesson={id}>
      <div className="lesson-top">
      <ArtBox src={`${import.meta.env.BASE_URL}art/${id}.webp`} ratio="16/9" accent={part.accent} seed={id} className="lesson-cover" />
      <header className="lesson-head">
        <a className="eyebrow" href={href.part(part.id)}>{part.title}</a>
        <h1>{lesson.title}</h1>
        <div className="lesson-meta">
          <span className="chip" data-tone="soft">Lesson {lessonNumber(id)}</span>
          <span className="chip" data-tone="soft">{lesson.minutes} min</span>
          {done && <span className="chip" data-tone="done">Done</span>}
          {isSample(id) && <span className="chip" data-tone="accent" title="Shown from src/sample because content/lessons has no file for this id yet">Sample lesson</span>}
        </div>
        {lesson.youNeed.length > 0 && (
          <p className="you-need">
            <span className="you-need-label">You need</span>
            {lesson.youNeed.map((need) => {
              const target = findLesson(need);
              return (
                <a key={need} className="chip" data-tone={progress.done[need] ? 'done' : 'plain'} href={href.lesson(need)}>
                  {target ? target.lesson.title : need}
                </a>
              );
            })}
          </p>
        )}
      </header>
      </div>

      <aside className="bridge">
        <span className="bridge-label">It's like… except…</span>
        <p>{lesson.bridge}</p>
      </aside>

      <p className="lesson-intro">{lesson.intro}</p>

      <h2 className="lesson-h2"><span className="h2-n">1</span>The picture</h2>
      <Picture picture={lesson.picture} lessonId={id} />

      <h2 className="lesson-h2"><span className="h2-n">2</span>How it works</h2>
      <div className="lesson-sections">
        {lesson.sections.map((s, i) => (
          <Section key={i} section={s} index={i} />
        ))}
      </div>

      <h2 className="lesson-h2"><span className="h2-n">3</span>The lab</h2>
      <Lab lab={lesson.lab} />

      <h2 className="lesson-h2"><span className="h2-n">4</span>Check yourself</h2>
      <Quiz questions={lesson.quiz} answers={quizAnswers} onAnswer={(q, o) => answer(id, q, o)} />

      {lesson.recall.length > 0 && (
        <section className="recall">
          <h3>Recall from earlier</h3>
          <ul>
            {lesson.recall.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </section>
      )}

      {lesson.videos.length > 0 && (
        <section className="videos">
          <h3>Watch</h3>
          <div className="video-grid">
            {lesson.videos.map((v) => (
              <VideoCard key={v.url} video={v} />
            ))}
          </div>
        </section>
      )}

      {lesson.words.length > 0 && (
        <section className="lesson-words">
          <h3>Words</h3>
          <WordList words={lesson.words} />
        </section>
      )}

      {lesson.tickets.length > 0 && (
        <section className="lesson-tickets">
          <h3>{part.kind === 'walkthrough' ? 'The tickets, step by step' : 'Tickets this unlocks'}</h3>
          <div className="ticket-list">
            {lesson.tickets.map((t) => (
              <TicketCard key={t.key} ticket={t} />
            ))}
          </div>
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

export default LessonPage;
