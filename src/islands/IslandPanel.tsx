import { useState } from 'react';
import { PLAYABLE, asset, type Island } from './data';
import { getLesson } from '../lib/lessons';
import type { LessonRef } from '../lib/course';

type Props = {
  island: Island;
  lessons: LessonRef[];
  done: Record<string, true>;
  celebrate: string | null;
  onClose: () => void;
  onStart: (lessonId: string) => void;
};

const SHOWN = 7;

// The island opened beside the map: what it is, a living picture of it, and its lessons in order.
function IslandPanel({ island, lessons, done, celebrate, onClose, onStart }: Props) {
  const [all, setAll] = useState(false);
  const doneCount = lessons.filter((l) => done[l.lesson.id]).length;
  const next = lessons.find((l) => PLAYABLE.has(l.lesson.id) && !done[l.lesson.id]) ?? lessons.find((l) => PLAYABLE.has(l.lesson.id));
  const shown = all ? lessons : lessons.slice(0, SHOWN);
  const celebrated = celebrate ? lessons.find((l) => l.lesson.id === celebrate) : undefined;

  return (
    <aside className="isl-panel" aria-label={island.name}>
      <button type="button" className="isl-panel-close" onClick={onClose} aria-label="Close the island">×</button>
      <div className="isl-panel-media">
        {island.video ? (
          <>
            <video src={asset(`${island.video}.mp4`)} poster={asset(`${island.art}.webp`)} autoPlay muted loop playsInline aria-hidden="true" />
            <img className="isl-media-dark" src={asset(`${island.art}.webp`)} alt="" />
          </>
        ) : (
          <img src={asset(`${island.art}.webp`)} alt="" />
        )}
      </div>
      {celebrated && (
        <p className="isl-panel-celebrate" role="status">
          <span aria-hidden="true">✓</span> You finished “{celebrated.lesson.title}”. The island is a little brighter.
        </p>
      )}
      <div className="isl-panel-body">
        <h2>{island.name}</h2>
        <p className="isl-panel-what">{island.what}</p>
        <div className="isl-panel-progress">
          <span className="isl-bar"><span style={{ width: `${lessons.length ? (doneCount / lessons.length) * 100 : 0}%` }} /></span>
          <span>{doneCount} of {lessons.length} done</span>
        </div>

        <ol className="isl-lessons">
          {shown.map((l, i) => {
            const ready = PLAYABLE.has(l.lesson.id);
            const data = ready ? getLesson(l.lesson.id) : undefined;
            const state = done[l.lesson.id] ? 'done' : ready ? 'ready' : 'soon';
            return (
              <li key={l.lesson.id}>
                <button type="button" className="isl-lesson" data-state={state} disabled={!ready} onClick={() => onStart(l.lesson.id)}>
                  <span className="isl-lesson-n">{state === 'done' ? '✓' : i + 1}</span>
                  <span className="isl-lesson-text">
                    <span className="isl-lesson-title">{l.lesson.title}</span>
                    <span className="isl-lesson-meta">{state === 'done' ? `Done · ${data?.minutes ?? 30} min · play again any time` : ready ? `${data?.minutes ?? 30} min · ready to play` : 'Coming soon in the new format'}</span>
                  </span>
                  {ready && <span className="isl-lesson-go" aria-hidden="true">▶</span>}
                </button>
              </li>
            );
          })}
        </ol>
        {lessons.length > SHOWN && (
          <button type="button" className="isl-more" onClick={() => setAll(!all)}>
            {all ? 'Show fewer' : `Show all ${lessons.length} lessons`}
          </button>
        )}
      </div>
      <div className="isl-panel-foot">
        {next ? (
          <button type="button" className="isl-btn isl-btn-primary isl-btn-wide" onClick={() => onStart(next.lesson.id)}>
            ▶ {done[next.lesson.id] ? 'Play again' : 'Start'}: {next.lesson.title}
          </button>
        ) : (
          <p className="isl-panel-soon">This island's lessons are being rebuilt. Try the Ticket Dock, the Clock Tower or the Fix-it Workshop.</p>
        )}
      </div>
    </aside>
  );
}

export default IslandPanel;
