import { useCallback, useSyncExternalStore } from 'react';

export type Progress = {
  done: Record<string, true>;
  quiz: Record<string, Record<number, number>>;
  lastLesson?: string;
};

const KEY = 'apa.progress.v1';
const empty: Progress = { done: {}, quiz: {} };

const read = (): Progress => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    const data = JSON.parse(raw) as Partial<Progress>;
    return { done: data.done ?? {}, quiz: data.quiz ?? {}, lastLesson: data.lastLesson };
  } catch {
    return empty;
  }
};

let state: Progress = read();
const listeners = new Set<() => void>();

const write = (next: Progress) => {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private mode or blocked storage: progress lives for this page only.
  }
  listeners.forEach((l) => l());
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useProgress = () => {
  const progress = useSyncExternalStore(subscribe, () => state, () => empty);
  const setDone = useCallback((id: string, done: boolean) => {
    const next = { ...state.done };
    if (done) next[id] = true;
    else delete next[id];
    write({ ...state, done: next });
  }, []);
  const answer = useCallback((lessonId: string, q: number, option: number) => {
    write({ ...state, quiz: { ...state.quiz, [lessonId]: { ...(state.quiz[lessonId] ?? {}), [q]: option } } });
  }, []);
  const visit = useCallback((id: string) => {
    if (state.lastLesson === id) return;
    write({ ...state, lastLesson: id });
  }, []);
  return { progress, setDone, answer, visit };
};
