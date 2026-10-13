import ArtBox from './ArtBox';
import { href } from '../lib/router';
import type { LessonRef } from '../lib/course';

function LessonMissing({ lessonRef: { part, lesson } }: { lessonRef: LessonRef }) {
  return (
    <article className="lesson" data-accent={part.accent}>
      <div className="lesson-top">
        <ArtBox src={`${import.meta.env.BASE_URL}art/${lesson.id}.webp`} ratio="16/9" accent={part.accent} seed={lesson.id} className="lesson-cover" />
        <header className="lesson-head">
          <a className="eyebrow" href={href.part(part.id)}>{part.title}</a>
          <h1>{lesson.title}</h1>
          <p className="lesson-goal">{lesson.goal}</p>
        </header>
      </div>
      <div className="being-written">
        <span className="being-written-dot" aria-hidden="true" />
        <div>
          <b>This lesson is being written.</b>
          <p>Come back soon. The goal above says what it will teach.</p>
          {lesson.covers.length > 0 && (
            <p className="being-written-covers">
              Covers tickets {lesson.covers.map((k, i) => (
                <span key={k}>{i > 0 && ', '}<a href={href.tickets(k)}>{k}</a></span>
              ))}.
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export default LessonMissing;
