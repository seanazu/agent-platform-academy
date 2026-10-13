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
          <span className="eyebrow">A guided path</span>
          <h1>{course.title}</h1>
          <p className="hero-goal">Learn to build Rhino Health's agent platform yourself: every one of the {course.ticketCount} tickets, explained from zero, one picture at a time.</p>
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
