import VideoBox from './VideoBox';
import ProgressBar from './ProgressBar';
import { course, findPart } from '../lib/course';
import { getLesson } from '../lib/lessons';
import { useProgress } from '../lib/progress';
import { href } from '../lib/router';

function PartPage({ id }: { id: string }) {
  const part = findPart(id);
  const { progress } = useProgress();
  if (!part) {
    return (
      <div className="empty">
        <h1>No such part</h1>
        <p><a href={href.home()}>Back to the path</a></p>
      </div>
    );
  }
  const index = course.parts.indexOf(part);
  const prev = course.parts[index - 1];
  const next = course.parts[index + 1];
  const done = part.lessons.filter((l) => progress.done[l.id]).length;
  const base = import.meta.env.BASE_URL;
  return (
    <article className="part" data-accent={part.accent}>
      <div className="lesson-top">
      <VideoBox videoSrc={`${base}video/${part.id}.mp4`} posterSrc={`${base}art/${part.id}.webp`} accent={part.accent} seed={part.id} />
      <header className="part-head">
        <a className="eyebrow" href={href.home()}>{part.kind === 'walkthrough' ? 'Walkthrough' : part.kind === 'start' ? 'Start here' : 'Foundation'}</a>
        <h1>{part.title}</h1>
        <p className="part-tagline">{part.tagline}</p>
        <div className="part-progress">
          <span>{done} of {part.lessons.length} lessons done</span>
          <ProgressBar value={done} max={part.lessons.length} />
        </div>
      </header>
      </div>
      <ol className="lesson-list">
        {part.lessons.map((lesson, i) => {
          const isDone = progress.done[lesson.id] === true;
          const written = getLesson(lesson.id) !== undefined;
          return (
            <li key={lesson.id} className="lesson-row" data-done={isDone || undefined}>
              <a href={href.lesson(lesson.id)} className="lesson-row-link">
                <span className="lesson-row-n" aria-hidden="true">{isDone ? '✓' : i + 1}</span>
                <span className="lesson-row-body">
                  <span className="lesson-row-title">{lesson.title}</span>
                  <span className="lesson-row-goal">{lesson.goal}</span>
                  {!written && <span className="lesson-row-soon">Being written</span>}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
      <nav className="part-nav" aria-label="Part navigation">
        {prev ? <a className="nav-link" href={href.part(prev.id)}><span className="nav-dir">← Previous part</span><span className="nav-title">{prev.title}</span></a> : <span />}
        {next ? <a className="nav-link nav-next" href={href.part(next.id)}><span className="nav-dir">Next part →</span><span className="nav-title">{next.title}</span></a> : <span />}
      </nav>
    </article>
  );
}

export default PartPage;
