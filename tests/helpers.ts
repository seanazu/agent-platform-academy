import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type CoursePart = { id: string; kind: string; title: string; lessons: { id: string; title: string }[] };
export type Course = { parts: CoursePart[]; lessonCount: number; ticketCount: number };

export const course: Course = JSON.parse(readFileSync(resolve(process.cwd(), 'content/course.json'), 'utf8')) as Course;

// A lesson that always renders: the writers' file when it exists, else the sample in src/sample.
export const LESSON_ID = 'p7-2';
