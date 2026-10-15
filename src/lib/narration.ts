import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Chapter, Cue, Tone } from './types';

export type FlatLine = { chapter: number; line: number; say: string; cue?: Cue; last: boolean };
export type Send = { from: string; to: string; label?: string; tone?: Tone; key: number };
export type SceneState = {
  focus: string[];
  badges: Record<string, { badge: string; tone?: Tone }>;
  failed: string[];
  caption?: string;
  send?: Send;
};

export const flatten = (chapters: Chapter[]): FlatLine[] =>
  chapters.flatMap((c, ci) => c.lines.map((l, li) => ({ chapter: ci, line: li, say: l.say, cue: l.cue, last: li === c.lines.length - 1 })));

const emptyState: SceneState = { focus: [], badges: {}, failed: [] };

// The drawing at line i is every cue up to i applied in order, so jumping backwards always shows the right picture.
export const sceneAt = (lines: FlatLine[], index: number): SceneState =>
  lines.slice(0, index + 1).reduce<SceneState>((s, l, i) => {
    const cue = l.cue;
    if (!cue) return { ...s, send: undefined };
    let next: SceneState = cue.reset ? { ...emptyState } : { ...s, badges: { ...s.badges }, failed: [...s.failed] };
    if (cue.focus) next.focus = cue.focus;
    if (cue.mark) next.badges[cue.mark.id] = { badge: cue.mark.badge, tone: cue.mark.tone };
    if (cue.unmark) delete next.badges[cue.unmark];
    if (cue.fail && !next.failed.includes(cue.fail)) next.failed.push(cue.fail);
    if (cue.heal) next.failed = next.failed.filter((id) => id !== cue.heal);
    if (cue.caption !== undefined) next.caption = cue.caption;
    next = { ...next, send: cue.send ? { ...cue.send, key: i } : undefined };
    return next;
  }, emptyState);

type Manifest = { voice?: string; lines: Record<string, { src: string }> };

const pickVoice = (): SpeechSynthesisVoice | undefined => {
  if (typeof speechSynthesis === 'undefined') return undefined;
  const voices = speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'));
  const prefer = ['Samantha (Enhanced)', 'Ava (Premium)', 'Zoe (Premium)', 'Samantha', 'Google US English', 'Daniel'];
  return prefer.map((n) => voices.find((v) => v.name === n)).find(Boolean) ?? voices.find((v) => v.lang === 'en-US') ?? voices[0];
};

export const RATES = [0.75, 1, 1.25, 1.5, 2] as const;

// Plays the lines one after another: recorded audio when public/narration/<lesson>/manifest.json exists,
// otherwise the browser's own voice. Stops at the end of a chapter that has a check question.
export const useNarration = (lessonId: string, chapters: Chapter[]) => {
  const lines = useMemo(() => flatten(chapters), [chapters]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState<number>(1);
  const [paused, setPaused] = useState<'check' | undefined>();
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const token = useRef(0);

  useEffect(() => {
    let alive = true;
    fetch(`${import.meta.env.BASE_URL}narration/${lessonId}/manifest.json`)
      .then((r) => (r.ok ? (r.json() as Promise<Manifest>) : null))
      .then((m) => alive && setManifest(m))
      .catch(() => alive && setManifest(null));
    return () => {
      alive = false;
    };
  }, [lessonId]);

  const stop = useCallback(() => {
    token.current++;
    audio.current?.pause();
    if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
  }, []);

  useEffect(() => stop, [stop]);
  useEffect(() => {
    stop();
    setIndex(0);
    setPlaying(false);
    setPaused(undefined);
  }, [lessonId, stop]);

  const advance = useCallback(
    (from: number) => {
      const line = lines[from];
      if (!line) return;
      if (line.last && chapters[line.chapter]?.check) {
        setPlaying(false);
        setPaused('check');
        return;
      }
      if (from + 1 >= lines.length) {
        setPlaying(false);
        return;
      }
      setIndex(from + 1);
    },
    [lines, chapters],
  );

  useEffect(() => {
    if (!playing) return;
    const line = lines[index];
    if (!line) return;
    stop();
    const mine = ++token.current;
    const done = () => {
      if (token.current === mine) advance(index);
    };
    const recorded = manifest?.lines[`${line.chapter}-${line.line}`];
    if (recorded) {
      const el = audio.current ?? new Audio();
      audio.current = el;
      el.src = `${import.meta.env.BASE_URL}narration/${lessonId}/${recorded.src}`;
      el.playbackRate = rate;
      el.onended = done;
      el.play().catch(() => setPlaying(false));
      return;
    }
    if (typeof speechSynthesis === 'undefined') {
      const t = window.setTimeout(done, Math.max(2500, line.say.length * 55) / rate);
      return () => window.clearTimeout(t);
    }
    const u = new SpeechSynthesisUtterance(line.say);
    const voice = pickVoice();
    if (voice) u.voice = voice;
    u.rate = rate;
    u.onend = done;
    speechSynthesis.speak(u);
  }, [playing, index, rate, lines, manifest, lessonId, stop, advance]);

  const play = useCallback(() => {
    setPaused(undefined);
    setPlaying(true);
  }, []);
  const pause = useCallback(() => {
    stop();
    setPlaying(false);
  }, [stop]);
  const seek = useCallback(
    (i: number) => {
      stop();
      setPaused(undefined);
      setIndex(Math.max(0, Math.min(lines.length - 1, i)));
    },
    [lines.length, stop],
  );
  const resumeAfterCheck = useCallback(() => {
    setPaused(undefined);
    const line = lines[index];
    if (line && index + 1 < lines.length) {
      setIndex(index + 1);
      setPlaying(true);
    }
  }, [index, lines]);

  return { lines, index, playing, rate, setRate, paused, play, pause, seek, resumeAfterCheck, recorded: Boolean(manifest), scene: sceneAt(lines, index) };
};
