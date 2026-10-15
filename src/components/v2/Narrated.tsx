import { useEffect, useRef } from 'react';
import SceneView from './SceneView';
import { RATES, useNarration } from '../../lib/narration';
import type { Watch } from '../../lib/types';

type Props = { lessonId: string; watch: Watch; checkAnswers: Record<number, number>; onCheck: (chapter: number, option: number) => void };

const secondsOf = (text: string) => Math.round(text.split(/\s+/).length / 2.5);
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

// The narrated drawing: a voice reads the script line by line and every line moves the drawing. The transcript
// beside it highlights the spoken line, and any line can be clicked to jump there.
function Narrated({ lessonId, watch, checkAnswers, onCheck }: Props) {
  const n = useNarration(lessonId, watch.chapters);
  const current = n.lines[n.index];
  const chapter = current ? watch.chapters[current.chapter] : undefined;
  const transcript = useRef<HTMLOListElement | null>(null);
  const total = n.lines.reduce((s, l) => s + secondsOf(l.say), 0);
  const elapsed = n.lines.slice(0, n.index).reduce((s, l) => s + secondsOf(l.say), 0);

  useEffect(() => {
    const list = transcript.current;
    const el = list?.querySelector<HTMLElement>('[data-now]');
    if (!list || !el) return;
    const top = el.offsetTop - list.offsetTop - list.clientHeight / 3;
    list.scrollTo({ top, behavior: 'smooth' });
  }, [n.index]);

  const check = n.paused === 'check' && chapter?.check ? chapter.check : undefined;
  const answered = current ? checkAnswers[current.chapter] : undefined;

  return (
    <section className="watch" data-stable="watch" aria-label="Narrated explainer">
      <div className="watch-grid">
      <div className="watch-main">
        <div className="watch-stage">
          <p className="watch-caption" aria-live="polite">{n.scene.caption ?? ' '}</p>
          <div className="watch-scene">
            <SceneView scene={watch.scene} state={n.scene} label={chapter ? chapter.title : 'Drawing'} />
          </div>
          <p className="watch-subtitle">{current?.say}</p>
        </div>
        <div className="watch-controls">
          <button type="button" className="btn btn-primary watch-play" onClick={n.playing ? n.pause : n.play} aria-label={n.playing ? 'Pause' : 'Play'}>
            {n.playing ? '❚❚ Pause' : n.index === 0 && !n.playing ? '▶ Play' : '▶ Resume'}
          </button>
          <button type="button" className="btn" onClick={() => n.seek(n.index - 1)} disabled={n.index === 0} aria-label="Previous line">←</button>
          <button type="button" className="btn" onClick={() => n.seek(n.index + 1)} disabled={n.index >= n.lines.length - 1} aria-label="Next line">→</button>
          <div className="watch-progress" aria-hidden="true">
            {watch.chapters.map((c, ci) => {
              const count = c.lines.length;
              const before = n.lines.findIndex((l) => l.chapter === ci);
              const fill = current && current.chapter > ci ? 1 : current && current.chapter === ci ? (n.index - before + 1) / count : 0;
              return (
                <span key={ci} className="watch-seg" style={{ flexGrow: count }}>
                  <span style={{ width: `${fill * 100}%` }} />
                </span>
              );
            })}
          </div>
          <span className="watch-time">{clock(elapsed)} / {clock(total)}</span>
          <label className="watch-rate">
            <span className="sr-only">Speed</span>
            <select value={n.rate} onChange={(e) => n.setRate(Number(e.target.value))}>
              {RATES.map((r) => (
                <option key={r} value={r}>{r}×</option>
              ))}
            </select>
          </label>
        </div>
        <p className="watch-voice">{n.recorded ? 'Recorded narration' : "Preview voice: your browser's built-in voice reads the script until the recorded narration is added."}</p>
      </div>

      <div className="watch-side">
        <div className="watch-side-panel" data-mode={check ? 'check' : 'transcript'}>
          {check && current ? (
            <div className="watch-check">
              <p className="label">Quick check · {chapter?.title}</p>
              <p className="watch-check-q">{check.q}</p>
              <div className="watch-check-options">
                {check.options.map((o, oi) => (
                  <button
                    key={oi}
                    type="button"
                    className="quiz-option"
                    aria-pressed={answered === oi}
                    data-mark={answered === undefined ? undefined : o.correct ? 'right' : answered === oi ? 'wrong' : undefined}
                    onClick={() => onCheck(current.chapter, oi)}
                  >
                    <span className="quiz-letter">{String.fromCharCode(65 + oi)}</span>
                    <span>{o.text}</span>
                  </button>
                ))}
              </div>
              <p className="watch-check-why" aria-live="polite">{answered === undefined ? 'Pick one, then carry on.' : check.options[answered]?.why}</p>
              <button type="button" className="btn btn-primary" onClick={n.resumeAfterCheck}>
                {n.index + 1 < n.lines.length ? 'Continue ▶' : 'Done'}
              </button>
            </div>
          ) : (
            <ol className="watch-transcript" ref={transcript}>
              {watch.chapters.map((c, ci) => (
                <li key={ci} className="watch-chapter">
                  <p className="watch-chapter-title">{ci + 1}. {c.title}</p>
                  <ol>
                    {c.lines.map((l, li) => {
                      const flat = n.lines.findIndex((x) => x.chapter === ci && x.line === li);
                      return (
                        <li key={li}>
                          <button type="button" className="watch-line" data-now={flat === n.index || undefined} data-past={flat < n.index || undefined} onClick={() => n.seek(flat)}>
                            {l.say}
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
      </div>
    </section>
  );
}

export default Narrated;
