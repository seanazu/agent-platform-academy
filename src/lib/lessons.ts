import type { Lesson, LessonV2 } from './types';

export type AnyLesson = Lesson | LessonV2;
export const isV2 = (l: AnyLesson): l is LessonV2 => 'v' in l && l.v === 2;

// Lesson files are read as raw text and parsed here, so a half-written file shows the "being written" state
// instead of breaking the build while writers are working.
const contentFiles = import.meta.glob('../../content/lessons/*.json', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;
const sampleFiles = import.meta.env.DEV
  ? (import.meta.glob('../sample/*.json', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>)
  : {};

const idOf = (path: string): string => path.slice(path.lastIndexOf('/') + 1).replace(/\.json$/, '');

const parse = (raw: string, id: string): AnyLesson | undefined => {
  try {
    const data = JSON.parse(raw) as Partial<Lesson> & Partial<LessonV2>;
    if (!data || typeof data !== 'object') return undefined;
    if (data.v === 2) return data.watch && data.hook ? ({ ...data, id } as LessonV2) : undefined;
    if (!Array.isArray(data.sections) || !data.picture) return undefined;
    return { ...data, id } as Lesson;
  } catch {
    return undefined;
  }
};

const build = (): { lessons: Map<string, AnyLesson>; sampled: Set<string> } => {
  const lessons = new Map<string, AnyLesson>();
  const sampled = new Set<string>();
  for (const [path, raw] of Object.entries(contentFiles)) {
    const id = idOf(path);
    const lesson = parse(raw, id);
    if (lesson) lessons.set(id, lesson);
  }
  for (const [path, raw] of Object.entries(sampleFiles)) {
    const id = idOf(path);
    if (lessons.has(id)) continue;
    const lesson = parse(raw, id);
    if (lesson) {
      lessons.set(id, lesson);
      sampled.add(id);
    }
  }
  return { lessons, sampled };
};

const { lessons, sampled } = build();

export const getLesson = (id: string): AnyLesson | undefined => lessons.get(id);
export const isSample = (id: string): boolean => sampled.has(id);
export const loadedLessons = (): AnyLesson[] => [...lessons.values()];
