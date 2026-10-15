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

// ---------- Lesson format v2 (content/SCHEMA-v2.md) ----------
export type ActorKind = NodeKind | 'queue' | 'data';
export type SceneActor = { id: string; label: string; kind: ActorKind; at: [number, number]; sub?: string };
export type SceneLink = { from: string; to: string };
export type Tone = 'ok' | 'bad' | 'accent';
export type Cue = {
  focus?: string[];
  send?: { from: string; to: string; label?: string; tone?: Tone };
  mark?: { id: string; badge: string; tone?: Tone };
  unmark?: string;
  fail?: string;
  heal?: string;
  caption?: string;
  reset?: boolean;
};
export type Scene = { cols: number; rows: number; actors: SceneActor[]; links: SceneLink[] };
export type NarrationLine = { say: string; cue?: Cue };
export type Chapter = { title: string; lines: NarrationLine[]; check?: QuizQuestion };
export type Watch = { scene: Scene; chapters: Chapter[] };

export type PlayTask = { kind: 'guess' | 'break' | 'explore'; text: string };
export type Play = { widget: string; intro: string; config?: Record<string, unknown>; tasks: PlayTask[] };

export type ReadCode = { lang: CodeLang; file: string; text: string; notes?: CodeNote[] };
export type ReadSection = { h: string; p: string[]; code?: ReadCode; see?: string; deeper?: { h: string; p: string[]; code?: ReadCode } };

export type LabGuess = { q: string; options: QuizOption[] };
export type LabFollowStep = { say: string; do?: string; see?: string };
export type LabV2 = {
  id: string;
  title: string;
  minutes: number;
  needs: string[];
  goal: string;
  guess: LabGuess;
  follow: LabFollowStep[];
  build: string;
  fix?: string;
  explain: string[];
  done: string;
};

export type VideoClip = Video & { start?: number; end?: number };
export type ReviewItem = { q: string; a: string };

export type LessonV2 = {
  v: 2;
  id: string;
  title: string;
  minutes: number;
  youNeed: string[];
  map: string;
  hook: { story: string[]; question: string };
  watch: Watch;
  play: Play;
  read: ReadSection[];
  lab: LabV2;
  check: QuizQuestion[];
  platform: { p: string[]; tickets: LessonTicket[] };
  words: Word[];
  videos: VideoClip[];
  review: ReviewItem[];
  remember: string;
};

export type CardDep = { key: string; why: string; proof?: string };
export type CardStep = { do: string; cmd?: string; see?: string };
export type TicketCardData = {
  key: string;
  title: string;
  lesson: string;
  goal: string;
  outcome: string;
  dependsOn: CardDep[];
  access: { what: string; who: string }[];
  decide: { q: string; owner: string; fallback: string }[];
  files: { path: string; what: string; code?: ReadCode }[];
  steps: CardStep[];
  prove: CardStep[];
  gaps: string[];
  pr: string[];
  rollback: string;
  prompt: string;
};

// ---------- Video clips and practice drills (content/clips/<lesson>.json) ----------
export type Clip = {
  videoId: string;
  title: string;
  channel: string;
  start: number;
  end: number;
  minutes: number;
  why: string;
  look: string[];
  after: string;
  quote?: string;
};
export type ChoiceDrill = { kind: 'choice'; q: string; options: QuizOption[] };
export type FillDrill = { kind: 'fill'; q: string; before?: string; after?: string; answers: string[]; hint?: string; why: string };
export type OrderDrill = { kind: 'order'; q: string; items: string[]; why: string };
export type Drill = ChoiceDrill | FillDrill | OrderDrill;
export type ClipSet = { lesson: string; clips: Clip[]; practice: Drill[] };
