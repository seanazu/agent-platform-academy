import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import IslandPanel from './IslandPanel';
import LessonSheet from './LessonSheet';
import World, { type IslandProgress, type WorldHandle } from './World';
import { ISLANDS, JOURNEY, PLAYABLE, islandById, islandOfLesson, lessonsOn } from './data';
import { allLessons, course } from '../lib/course';
import { getLesson, isV2 } from '../lib/lessons';
import { useProgress } from '../lib/progress';
import { href } from '../lib/router';
import type { Theme } from '../lib/theme';
import './islands.css';

const REVEAL_KEY = 'apa.islands.revealed';
const readRevealed = (): Set<string> => {
  try {
    const raw = localStorage.getItem(REVEAL_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : ['jira']);
  } catch {
    return new Set(['jira']);
  }
};

const PANEL = 460;
const onPhone = () => window.matchMedia('(max-width: 640px)').matches;
// The tour caption sits at the bottom, so on small screens the stop is framed in the part above it.
const tourFrame = () => {
  if (window.matchMedia('(max-height: 520px)').matches) return { scale: 0.6, panel: 400 };
  return onPhone() ? { scale: 0.6, bottom: 270, yFrac: 0.62 } : { scale: 0.92 };
};
// On a phone the island panel is a bottom sheet; the island is framed in the free strip between the island chips and the sheet.
const phoneFrame = () => {
  const sheet = Math.round(Math.min(460, Math.max(300, window.innerHeight * 0.5)));
  const free = window.innerHeight - 64 - sheet - 56;
  return { top: 56, bottom: sheet, yFrac: 0.6, scale: Math.min(0.55, Math.max(0.34, free / 330)) };
};
// The path from zero to hero: the playable lessons in course order.
const PATH = allLessons.filter((r) => PLAYABLE.has(r.lesson.id));

type Props = { island?: string; lesson?: string; theme: Theme; onToggleTheme: () => void };

function IslandsApp({ island, lesson, theme, onToggleTheme }: Props) {
  const world = useRef<WorldHandle | null>(null);
  const { progress, setDone } = useProgress();
  const [revealed, setRevealed] = useState<Set<string>>(readRevealed);
  const [journey, setJourney] = useState<number | null>(null);
  const [celebrate, setCelebrate] = useState<string | null>(null);
  const [pathOpen, setPathOpen] = useState(() => window.innerWidth >= 900);
  const pathList = useRef<HTMLOListElement | null>(null);

  const reveal = useCallback((id: string) => {
    setRevealed((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev).add(id);
      try {
        localStorage.setItem(REVEAL_KEY, JSON.stringify([...next]));
      } catch {
        // Storage blocked: the map still works, it just forgets what you explored.
      }
      return next;
    });
  }, []);

  const islandProgress = useMemo(() => {
    const out: Record<string, IslandProgress> = {};
    for (const i of ISLANDS) {
      const refs = lessonsOn(i.id);
      out[i.id] = { total: refs.length, done: refs.filter((r) => progress.done[r.lesson.id]).length, ready: refs.filter((r) => PLAYABLE.has(r.lesson.id)).length };
    }
    return out;
  }, [progress.done]);

  // Open the path card on the next lesson, not on lesson 1.
  useEffect(() => {
    const list = pathList.current;
    const target = list?.querySelector<HTMLElement>('[data-next]');
    if (list && target) list.scrollTop = target.offsetTop - list.offsetTop - list.clientHeight / 2 + target.offsetHeight / 2;
  }, [pathOpen, island]);

  useEffect(() => {
    const chip = document.querySelector<HTMLElement>('.isl-chips [data-on]');
    const row = chip?.parentElement;
    if (chip && row) row.scrollTo({ left: chip.offsetLeft - (row.clientWidth - chip.offsetWidth) / 2, behavior: 'smooth' });
  }, [island]);

  useEffect(() => {
    if (island) {
      reveal(island);
      world.current?.flyTo(island, onPhone() ? phoneFrame() : { panel: PANEL });
    }
  }, [island, reveal]);

  const go = (target: string) => {
    window.location.hash = target;
  };

  // The journey is a guided tour you step through yourself: Next moves the ticket to the next island.
  const showStop = useCallback((i: number, from?: number) => {
    const id = JOURNEY[i];
    if (!id) return;
    setJourney(i);
    reveal(id);
    world.current?.flyTo(id, tourFrame());
    const prev = from === undefined ? undefined : JOURNEY[from];
    if (prev && prev !== id) void world.current?.moveToken(prev, id, 1300);
    else void world.current?.moveToken(id, id, 1);
  }, [reveal]);

  const startJourney = () => {
    go(href.islands());
    window.setTimeout(() => showStop(0), 50);
  };
  const endJourney = () => {
    world.current?.hideToken();
    setJourney(null);
  };

  const lessonData = lesson ? getLesson(lesson) : undefined;
  const openLesson = lessonData && isV2(lessonData) ? lessonData : undefined;
  const current = island ? islandById(island) : undefined;
  const doneCount = Object.keys(progress.done).length;
  const next = PATH.find((r) => !progress.done[r.lesson.id]);
  const stop = journey === null ? undefined : islandById(JOURNEY[journey] ?? '');

  return (
    <div className="isl">
      <header className="isl-top">
        <a className="isl-brand" href={href.islands()} onClick={endJourney}>
          <span className="isl-logo" aria-hidden="true" />
          Agent Platform Academy
        </a>
        {!openLesson && (
          <button type="button" className="isl-journey-btn" onClick={() => (journey === null ? startJourney() : endJourney())}>
            <span aria-hidden="true">{journey === null ? '▶' : '■'}</span>
            {journey === null ? 'Tour the platform' : 'End the tour'}
          </button>
        )}
        <div className="isl-top-right">
          <span className="isl-stat"><b>{doneCount}</b> of {course.lessonCount} lessons</span>
          <span className="isl-stat"><b>{revealed.size}</b> of {ISLANDS.length} islands explored</span>
          <a className="isl-classic" href={href.home()}>List view</a>
          <button
            type="button"
            className="isl-theme-btn"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? '☾' : '☀'}
          </button>
        </div>
      </header>

      <World
        ref={world}
        progress={islandProgress}
        revealed={revealed}
        selected={island}
        dimmed={Boolean(openLesson)}
        bloom={celebrate ? islandOfLesson(celebrate)?.id : undefined}
        leftInset={pathOpen ? 420 : 0}
        onSelect={(id) => {
          endJourney();
          go(href.islands(id));
        }}
      />

      {!openLesson && journey === null && (
        <nav className="isl-chips" aria-label="Islands">
          {ISLANDS.map((i) => (
            <a key={i.id} href={href.islands(i.id)} data-on={i.id === island || undefined}>{i.name}</a>
          ))}
        </nav>
      )}

      {!island && journey === null && (
        <aside className="isl-path" data-open={pathOpen || undefined}>
          <button type="button" className="isl-path-head" onClick={() => setPathOpen(!pathOpen)} aria-expanded={pathOpen}>
            <span>
              <span className="isl-path-kicker">Your path · {PATH.filter((r) => progress.done[r.lesson.id]).length} of {PATH.length} lessons done</span>
              <span className="isl-path-title">{next ? `Next: ${next.lesson.title}` : 'All ready lessons done'}</span>
            </span>
            <span aria-hidden="true" className="isl-path-chev">{pathOpen ? '–' : '+'}</span>
          </button>
          {pathOpen && (
            <>
              <ol className="isl-path-list" ref={pathList}>
                {PATH.map((r, i) => {
                  const where = islandOfLesson(r.lesson.id);
                  const isDone = progress.done[r.lesson.id] === true;
                  return (
                    <li key={r.lesson.id}>
                      <a href={href.islands(where?.id, r.lesson.id)} data-done={isDone || undefined} data-next={r === next || undefined}>
                        <span className="isl-path-n">{isDone ? '✓' : i + 1}</span>
                        <span className="isl-path-text">
                          <b>{r.lesson.title}</b>
                          <span>{where?.name} · {r.part.title}</span>
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ol>
              <div className="isl-path-actions">
                <button type="button" className="isl-btn isl-btn-primary" onClick={startJourney}>▶ Tour the platform</button>
                {PATH.length < course.lessonCount && <span className="isl-path-note">{course.lessonCount - PATH.length} more lessons are being rebuilt for this map.</span>}
              </div>
            </>
          )}
        </aside>
      )}

      {journey !== null && (
        <div className="isl-caption" role="status" aria-live="polite">
          {stop && (
            <>
              <p className="isl-caption-step">Stop {journey + 1} of {JOURNEY.length} · {stop.name}</p>
              <p className="isl-caption-text">{stop.story}</p>
              <div className="isl-caption-dots" aria-hidden="true">
                {JOURNEY.map((j, i) => <span key={j} data-on={i <= journey || undefined} />)}
              </div>
              <div className="isl-caption-actions">
                <button type="button" className="isl-btn" disabled={journey === 0} onClick={() => showStop(journey - 1, journey)}>← Back</button>
                {journey < JOURNEY.length - 1 ? (
                  <button type="button" className="isl-btn isl-btn-primary" onClick={() => showStop(journey + 1, journey)}>Next stop →</button>
                ) : (
                  <button type="button" className="isl-btn isl-btn-primary" onClick={() => { endJourney(); go(href.islands('jira', 'p0-2')); }}>Start the first lesson</button>
                )}
                <button type="button" className="isl-btn" onClick={() => go(href.islands(stop.id))}>Open this island</button>
                <button type="button" className="isl-btn isl-caption-exit" onClick={endJourney}>Exit</button>
              </div>
            </>
          )}
        </div>
      )}

      {current && !openLesson && (
        <IslandPanel island={current} lessons={lessonsOn(current.id)} done={progress.done} celebrate={celebrate} onClose={() => go(href.islands())} onStart={(id) => go(href.islands(current.id, id))} />
      )}

      {current && openLesson && (
        <LessonSheet
          key={openLesson.id}
          lesson={openLesson}
          island={current}
          onClose={() => go(href.islands(current.id))}
          onComplete={(isDone) => {
            setDone(openLesson.id, isDone);
            if (isDone) {
              setCelebrate(openLesson.id);
              window.setTimeout(() => setCelebrate(null), 4000);
            }
          }}
        />
      )}
    </div>
  );
}

export default IslandsApp;
