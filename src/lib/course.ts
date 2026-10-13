import courseJson from '../../content/course.json';
import type { Course, CourseLesson, CoursePart } from './types';

export const course = courseJson as Course;

export type LessonRef = { part: CoursePart; lesson: CourseLesson; index: number };

const order: LessonRef[] = course.parts.flatMap((part) =>
  part.lessons.map((lesson, i) => ({ part, lesson, index: i })),
);
const byId = new Map(order.map((ref, i) => [ref.lesson.id, i] as const));

export const allLessons = order;
export const findLesson = (id: string): LessonRef | undefined => {
  const i = byId.get(id);
  return i === undefined ? undefined : order[i];
};
export const findPart = (id: string): CoursePart | undefined => course.parts.find((p) => p.id === id);
export const neighbours = (id: string): { prev?: LessonRef; next?: LessonRef } => {
  const i = byId.get(id);
  if (i === undefined) return {};
  return { prev: order[i - 1], next: order[i + 1] };
};
export const lessonNumber = (id: string): number => (byId.get(id) ?? 0) + 1;

export const goalOfTicket = (key: string): string => key.split('-')[0]?.toLowerCase() ?? '';
export const partTeaching = (key: string): LessonRef | undefined => {
  const lessonId = course.ticketToLesson[key];
  return lessonId ? findLesson(lessonId) : undefined;
};
