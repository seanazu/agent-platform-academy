export type PartKind = 'start' | 'foundation' | 'walkthrough';
export type Accent = 'silver' | 'sky' | 'violet' | 'amber' | 'teal' | 'coral' | 'mint';

export type CourseLesson = { id: string; title: string; goal: string; covers: string[] };
export type CoursePart = {
  id: string;
  kind: PartKind;
  title: string;
  tagline: string;
  accent: Accent;
  lessons: CourseLesson[];
};
export type Course = {
  title: string;
  parts: CoursePart[];
  lessonCount: number;
  ticketCount: number;
  ticketToLesson: Record<string, string>;
};

export type NodeKind = 'person' | 'agent' | 'machine' | 'service' | 'file' | 'cloud' | 'check';
export type PictureNode = { id: string; label: string; kind: NodeKind };
export type PictureStep = { from: string; to: string; text: string };
export type Picture = { caption: string; nodes: PictureNode[]; steps: PictureStep[] };

export type CodeLang =
  | 'typescript' | 'javascript' | 'yaml' | 'hcl' | 'python' | 'bash' | 'json' | 'toml' | 'markdown' | 'diff' | 'text';
export type CodeNote = { line: number; text: string };
export type CodeBlock = { lang: CodeLang; file: string; text: string; notes: CodeNote[] };
export type CalloutKind = 'why' | 'gotcha' | 'tip' | 'wall';
export type Callout = { kind: CalloutKind; text: string };

export type Section = {
  h: string;
  p: string[];
  because?: string;
  code?: CodeBlock;
  see?: string;
  ifInstead?: string;
  callout?: Callout;
};

export type LabStep = { do: string; see: string };
export type Lab = {
  title: string;
  youNeed: string[];
  worked: LabStep[];
  faded: string;
  alone: string;
  done: string;
};

export type QuizOption = { text: string; correct: boolean; why: string };
export type QuizQuestion = { q: string; options: QuizOption[] };
export type Video = { title: string; url: string; channel: string; minutes: number; why: string };
export type Word = { term: string; plain: string };
export type LessonTicket = { key: string; why: string; walk?: string[] };

export type Lesson = {
  id: string;
  title: string;
  minutes: number;
  youNeed: string[];
  bridge: string;
  intro: string;
  picture: Picture;
  sections: Section[];
  lab: Lab;
  quiz: QuizQuestion[];
  recall: string[];
  videos: Video[];
  words: Word[];
  tickets: LessonTicket[];
  remember: string;
};

export type Ticket = {
  key: string;
  title: string;
  team: string[];
  days: number;
  w?: number[];
  flag?: string | null;
  deps?: string[];
  needs?: string;
  what?: string;
  why?: string;
  how?: string[];
};
