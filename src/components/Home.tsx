import ArtBox from './ArtBox';
import PartCard from './PartCard';
import ProgressBar from './ProgressBar';
import { allLessons, course, findLesson } from '../lib/course';
import { useProgress } from '../lib/progress';
import { href } from '../lib/router';

function Home() {
  const { progress } = useProgress();
  const doneCount = allLessons.filter((l) => progress.done[l.lesson.id]).length;
  const last = progress.lastLesson ? findLesson(progress.lastLesson) : undefined;
  const firstOpen = allLessons.find((l) => !progress.done[l.lesson.id]);
  const resume = last && !progress.done[last.lesson.id] ? last : (firstOpen ?? last);

  const groups = [
    { key: 'start', title: 'Start here', parts: course.parts.filter((p) => p.kind === 'start') },
    { key: 'foundation', title: 'Foundations', blurb: 'The tools, one at a time, from zero.', parts: course.parts.filter((p) => p.kind === 'foundation') },
    { key: 'walkthrough', title: 'Walkthroughs', blurb: 'Goal by goal, every ticket, step by step.', parts: course.parts.filter((p) => p.kind === 'walkthrough') },
  ];
  let number = 0;

  return (
    <div className="home">
      <section className="hero">
        <ArtBox src={`${import.meta.env.BASE_URL}art/hero.webp`} ratio="21/9" accent="sky" seed="hero" className="hero-art" />
        <div className="hero-text">
          <span className="eyebrow">A guided path · {course.parts.length} parts</span>
          <h1>{course.title}</h1>
          <p className="hero-goal">Learn to build Rhino Health's agent platform yourself: every one of the {course.ticketCount} tickets, explained from zero, one picture at a time.</p>
          <dl className="title-block hero-stats">
            <div><dt className="tb-label">Lessons</dt><dd>{course.lessonCount}</dd></div>
            <div><dt className="tb-label">Tickets</dt><dd>{course.ticketCount}</dd></div>
            <div><dt className="tb-label">Parts</dt><dd>{course.parts.length}</dd></div>
            <div className="tb-accent"><dt className="tb-label">Done</dt><dd>{doneCount}</dd></div>
          </dl>
        </div>
      </section>

      <section className="pilot" aria-labelledby="pilot-title">
        <span id="pilot-title" className="eyebrow">New lesson format · pilot</span>
        <p className="pilot-lead">Three lessons rebuilt to watch, play and do. Try them and tell me what works.</p>
        <div className="pilot-links">
          {['p0-2', 'p7-4', 'g5-2'].map((pid) => {
            const ref = findLesson(pid);
            return ref ? (
              <a key={pid} className="pilot-link" href={href.lesson(pid)} data-accent={ref.part.accent}>
                <span className="pilot-part">{ref.part.title}</span>
                <span className="pilot-title">{ref.lesson.title}</span>
              </a>
            ) : null;
          })}
        </div>
      </section>

      <section className="resume" aria-labelledby="resume-title">
        <div className="resume-text">
          <span id="resume-title" className="eyebrow">{doneCount === 0 ? 'Begin' : 'Continue where you left off'}</span>
          {resume ? (
            <>
              <a className="resume-link" href={href.lesson(resume.lesson.id)}>{resume.lesson.title} →</a>
              <span className="resume-part">{resume.part.title}</span>
            </>
          ) : (
            <span className="resume-link">You have finished every lesson.</span>
          )}
        </div>
        <div className="resume-progress">
          <span>{doneCount} of {course.lessonCount} lessons done</span>
          <ProgressBar value={doneCount} max={course.lessonCount} />
        </div>
      </section>

      {groups.map((g) => (
        <section key={g.key} className="path-group" aria-labelledby={`group-${g.key}`}>
          <div className="path-group-head">
            <h2 id={`group-${g.key}`}>{g.title}</h2>
            {g.blurb && <p>{g.blurb}</p>}
          </div>
          <div className="part-grid">
            {g.parts.map((part) => {
              number += 1;
              const done = part.lessons.filter((l) => progress.done[l.id]).length;
              return <PartCard key={part.id} part={part} done={done} number={number} />;
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export default Home;
