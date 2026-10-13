import type { Lesson } from './types';

// Lesson files are read as raw text and parsed here, so a half-written file shows the "being written" state
// instead of breaking the build while writers are working.
const contentFiles = import.meta.glob('../../content/lessons/*.json', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;
const sampleFiles = import.meta.env.DEV
  ? (import.meta.glob('../sample/*.json', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>)
  : {};

const idOf = (path: string): string => path.slice(path.lastIndexOf('/') + 1).replace(/\.json$/, '');

const parse = (raw: string, id: string): Lesson | undefined => {
  try {
    const data = JSON.parse(raw) as Partial<Lesson>;
    if (!data || typeof data !== 'object' || !Array.isArray(data.sections) || !data.picture) return undefined;
    return { ...data, id } as Lesson;
  } catch {
    return undefined;
  }
};

const build = (): { lessons: Map<string, Lesson>; sampled: Set<string> } => {
  const lessons = new Map<string, Lesson>();
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

export const getLesson = (id: string): Lesson | undefined => lessons.get(id);
export const isSample = (id: string): boolean => sampled.has(id);
export const loadedLessons = (): Lesson[] => [...lessons.values()];
