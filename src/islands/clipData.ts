import type { ClipSet } from '../lib/types';

const files = import.meta.glob('../../content/clips/*.json', { eager: true, import: 'default' }) as Record<string, ClipSet>;
const sets = new Map(Object.values(files).map((s) => [s.lesson, s]));

export const clipsFor = (lessonId: string): ClipSet | undefined => sets.get(lessonId);
export const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s) % 60).padStart(2, '0')}`;
