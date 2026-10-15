import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import IslandPanel from './IslandPanel';
import LessonSheet from './LessonSheet';
import World, { type IslandProgress, type WorldHandle } from './World';
import { ISLANDS, JOURNEY, PLAYABLE, islandById, islandOfLesson, lessonsOn } from './data';

const islandOfLessonId = (id: string) => islandOfLesson(id)?.id;
import { speak, stopSpeaking } from './speech';
import { course } from '../lib/course';
import { getLesson, isV2 } from '../lib/lessons';
import { useProgress } from '../lib/progress';
import { href } from '../lib/router';
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

type Props = { island?: string; lesson?: string };

function IslandsApp({ island, lesson }: Props) {
  const world = useRef<WorldHandle | null>(null);
  const { progress, setDone } = useProgress();
  const [revealed, setRevealed] = useState<Set<string>>(readRevealed);
  const [journey, setJourney] = useState<{ step: number; paused: boolean } | null>(null);
  const [celebrate, setCelebrate] = useState<string | null>(null);
  const runId = useRef(0);

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

  useEffect(() => {
    if (island) {
      reveal(island);
      world.current?.flyTo(island, { panel: PANEL });
    }
  }, [island, reveal]);

  const go = (target: string) => {
    window.location.hash = target;
  };

  const stopJourney = useCallback(() => {
    runId.current++;
    stopSpeaking();
    world.current?.hideToken();
    setJourney(null);
  }, []);

  const playJourney = useCallback(async (from = 0) => {
    const mine = ++runId.current;
    go(href.islands());
    for (let i = from; i < JOURNEY.length; i++) {
      const id = JOURNEY[i] ?? '';
      const stop = islandById(id);
      if (!stop || runId.current !== mine) return;
      setJourney({ step: i, paused: false });
      reveal(id);
      world.current?.flyTo(id, { scale: 0.92 });
      if (i === from) world.current?.moveToken(id, id, 1);
      await new Promise((r) => setTimeout(r, 900));
      if (runId.current !== mine) return;
      await speak(`${stop.name}. ${stop.story}`);
      if (runId.current !== mine) return;
      const next = JOURNEY[i + 1];
      if (next) await world.current?.moveToken(id, next, 1500);
    }
    if (runId.current === mine) setJourney({ step: JOURNEY.length, paused: false });
  }, [reveal]);

  useEffect(() => () => stopSpeaking(), []);

  const lessonData = lesson ? getLesson(lesson) : undefined;
  const openLesson = lessonData && isV2(lessonData) ? lessonData : undefined;
  const current = island ? islandById(island) : undefined;
  const doneCount = Object.keys(progress.done).length;
  const step = journey ? ISLANDS.find((i) => i.id === JOURNEY[journey.step]) : undefined;

  return (
    <div className="isl">
      <header className="isl-top">
        <a className="isl-brand" href={href.islands()} onClick={stopJourney}>
          <span className="isl-logo" aria-hidden="true" />
          Agent Platform Academy
        </a>
        {!openLesson && <button type="button" className="isl-journey-btn" onClick={() => (journey ? stopJourney() : void playJourney())}>
          <span aria-hidden="true">{journey ? '■' : '▶'}</span>
          {journey ? 'Stop the journey' : 'Play the journey'}
        </button>}
        <div className="isl-top-right">
          <span className="isl-stat"><b>{doneCount}</b> of {course.lessonCount} lessons</span>
          <span className="isl-stat"><b>{revealed.size}</b> of {ISLANDS.length} islands explored</span>
          <a className="isl-classic" href={href.home()}>Classic view</a>
        </div>
      </header>

      <World
        ref={world}
        progress={islandProgress}
        revealed={revealed}
        selected={island}
        dimmed={Boolean(openLesson)}
        bloom={celebrate ? islandOfLessonId(celebrate) : undefined}
        onSelect={(id) => {
          stopJourney();
          go(href.islands(id));
        }}
      />

      {!island && !journey && (
        <aside className="isl-welcome">
          <p className="isl-welcome-kicker">Start here</p>
          <h1>Follow one ticket across the platform</h1>
          <p>Each island is one part of the agent platform. Watch ticket RH-1234 travel from Jira to a merged pull request in two minutes, then explore the islands one by one.</p>
          <div className="isl-welcome-actions">
            <button type="button" className="isl-btn isl-btn-primary" onClick={() => void playJourney()}>▶ Play the journey</button>
            <button type="button" className="isl-btn" onClick={() => go(href.islands('jira'))}>Open the Ticket Dock</button>
          </div>
        </aside>
      )}

      {journey && (
        <div className="isl-caption" role="status" aria-live="polite">
          {step ? (
            <>
              <p className="isl-caption-step">Stop {journey.step + 1} of {JOURNEY.length} · {step.name}</p>
              <p className="isl-caption-text">{step.story}</p>
              <div className="isl-caption-dots" aria-hidden="true">
                {JOURNEY.map((j, i) => (
                  <span key={j} data-on={i <= journey.step || undefined} />
                ))}
              </div>
              <div className="isl-caption-actions">
                <button type="button" className="isl-btn" onClick={() => go(href.islands(step.id))}>Open this island</button>
                <button type="button" className="isl-btn" onClick={stopJourney}>Exit</button>
              </div>
            </>
          ) : (
            <>
              <p className="isl-caption-step">Journey complete</p>
              <p className="isl-caption-text">That is the whole platform. Now let's take it apart, one island at a time, starting where the ticket arrived.</p>
              <div className="isl-caption-actions">
                <button type="button" className="isl-btn isl-btn-primary" onClick={() => { stopJourney(); go(href.islands('jira', 'p0-2')); }}>Start the first lesson</button>
                <button type="button" className="isl-btn" onClick={stopJourney}>Explore the map</button>
              </div>
            </>
          )}
        </div>
      )}

      {current && !openLesson && (
        <IslandPanel
          island={current}
          lessons={lessonsOn(current.id)}
          done={progress.done}
          celebrate={celebrate}
          onClose={() => go(href.islands())}
          onStart={(id) => go(href.islands(current.id, id))}
        />
      )}

      {current && openLesson && (
        <LessonSheet
          key={openLesson.id}
          lesson={openLesson}
          island={current}
          onClose={() => go(href.islands(current.id))}
          onFinish={() => {
            setDone(openLesson.id, true);
            setCelebrate(openLesson.id);
            go(href.islands(current.id));
            window.setTimeout(() => setCelebrate(null), 4000);
          }}
        />
      )}
    </div>
  );
}

export default IslandsApp;
