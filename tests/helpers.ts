import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type CoursePart = { id: string; kind: string; title: string; lessons: { id: string; title: string }[] };
export type Course = { parts: CoursePart[]; lessonCount: number; ticketCount: number };

export const course: Course = JSON.parse(readFileSync(resolve(process.cwd(), 'content/course.json'), 'utf8')) as Course;

// The reference lesson, open in the lesson sheet on its island.
export const LESSON_URL = '/#/islands/temporal/p7-4';
