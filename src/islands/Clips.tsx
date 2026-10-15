import { useState } from 'react';
import { clock } from './clipData';
import type { Clip } from '../lib/types';

type Props = { clips: Clip[]; watched: Set<number>; onWatched: (i: number, on: boolean) => void };

const embed = (c: Clip, autoplay: boolean) =>
  `https://www.youtube-nocookie.com/embed/${c.videoId}?start=${c.start}&end=${c.end}&rel=0&modestbranding=1&playsinline=1${autoplay ? '&autoplay=1' : ''}`;

// Hand-picked parts of real videos: each clip starts and stops on the minutes that matter for this lesson,
// with what to look for before you press play and how it connects to our platform after.
function Clips({ clips, watched, onWatched }: Props) {
  const [at, setAt] = useState(0);
  const [started, setStarted] = useState(false);
  const clip = clips[at];
  if (!clip) return null;
  const total = clips.reduce((s, c) => s + (c.end - c.start), 0);

  const pick = (i: number) => {
    setAt(i);
    setStarted(true);
  };

  return (
    <div className="isl-clips">
      <div className="isl-clip-main">
        <div className="isl-clip-frame">
          <iframe
            key={`${clip.videoId}-${clip.start}`}
            src={embed(clip, started)}
            title={`${clip.title}, from ${clock(clip.start)} to ${clock(clip.end)}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
        <div className="isl-clip-info">
          <p className="isl-clip-kicker">Clip {at + 1} of {clips.length} · {clock(clip.start)} – {clock(clip.end)} · {clock(clip.end - clip.start)} min</p>
          <h3>{clip.title}</h3>
          <p className="isl-clip-channel">{clip.channel} · <a href={`https://www.youtube.com/watch?v=${clip.videoId}&t=${clip.start}s`} target="_blank" rel="noopener noreferrer">Open on YouTube</a></p>
          <p className="isl-clip-why">{clip.why}</p>
          <div className="isl-clip-cols">
            <div>
              <p className="isl-clip-label">Watch for</p>
              <ul>
                {clip.look.map((l) => <li key={l}>{l}</li>)}
              </ul>
            </div>
            <div className="isl-clip-after">
              <p className="isl-clip-label">How it connects</p>
              <p>{clip.after}</p>
            </div>
          </div>
          <div className="isl-clip-actions">
            <label className="isl-check">
              <input type="checkbox" checked={watched.has(at)} onChange={(e) => onWatched(at, e.target.checked)} />
              I watched this clip
            </label>
            {at < clips.length - 1 && (
              <button type="button" className="isl-btn" onClick={() => pick(at + 1)}>Next clip →</button>
            )}
          </div>
        </div>
      </div>

      <aside className="isl-clip-list" aria-label="Clips in this lesson">
        <p className="isl-clip-label">{clips.length} clips · {clock(total)} min in total</p>
        <ol>
          {clips.map((c, i) => (
            <li key={`${c.videoId}-${c.start}`}>
              <button type="button" className="isl-clip-item" aria-current={i === at || undefined} onClick={() => pick(i)}>
                <span className="isl-clip-thumb">
                  <img src={`https://i.ytimg.com/vi/${c.videoId}/mqdefault.jpg`} alt="" loading="lazy" />
                  <span>{clock(c.end - c.start)}</span>
                </span>
                <span className="isl-clip-item-text">
                  <span className="isl-clip-item-title">{c.title}</span>
                  <span className="isl-clip-item-meta">{watched.has(i) ? '✓ Watched' : `${c.channel} · from ${clock(c.start)}`}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}

export default Clips;
