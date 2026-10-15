import mapJson from '../../content/platform-map.json';
import { allLessons, type LessonRef } from '../lib/course';

export type Island = {
  id: string;
  name: string;
  what: string;
  story: string;
  x: number;
  y: number;
  art: string;
  video?: string;
  card?: 'left';
};

// The world is a 2400 x 1400 canvas. The journey of one ticket reads left to right along the top, then back
// along the bottom: arrive, start a run, take a machine, work, reach the model and GitHub, get reviewed, measure.
export const WORLD = { w: 2640, h: 1460 };

export const ISLANDS: Island[] = [
  { id: 'jira', name: 'Ticket Dock', what: 'Where work arrives: Jira, Slack and the poll that checks every minute.', story: 'You assign RH-1234 to Nova. Within a minute the poll notices it and writes down that you asked.', x: 300, y: 380, art: 'jira', video: 'jira' },
  { id: 'temporal', name: 'Clock Tower', what: 'Temporal: it starts every run and keeps its history, so nothing is lost.', story: 'Temporal starts one run called nova:RH-1234. If anyone asks again, they join the same run.', x: 890, y: 300, art: 'temporal', video: 'temporal' },
  { id: 'pool', name: 'Machine Harbor', what: 'Where machines come from: AWS, Terraform, Kubernetes, and a warm pool of ready VMs so a run never waits.', story: 'The run claims a warm machine. It wakes up in seconds, already set up.', x: 1460, y: 420, art: 'pool' },
  { id: 'vm', name: 'Sandbox', what: 'One fresh machine per run. Nova works here, and holds no keys at all.', story: 'Nova reads the code, makes a plan, and asks you in Slack before it builds.', x: 2010, y: 320, art: 'vm' },
  { id: 'gateway', name: 'Model Gate', what: 'The only door to Claude. The real key stays here; the machine only has a short-lived pass.', story: 'Every call to Claude goes through the gate, which swaps the run token for the real key.', x: 2360, y: 660, art: 'gateway', card: 'left' },
  { id: 'broker', name: 'Key Vault', what: 'The broker: it holds GitHub and Jira access and checks every request.', story: 'Nova pushes its branch through the vault. Only nova/RH-1234 is allowed, never main.', x: 1990, y: 960, art: 'broker' },
  { id: 'review', name: 'Review Observatory', what: 'Byte reviews every pull request, and a person who did not ask for it approves.', story: 'Byte reviews the draft PR. You cannot approve your own request, so a teammate does.', x: 1430, y: 1060, art: 'review' },
  { id: 'lighthouse', name: 'Lighthouse', what: 'Telemetry and evals: we watch every run and test agents before we trust them.', story: 'The merged run shows up in the metrics: time, cost and whether the fix held.', x: 870, y: 1080, art: 'lighthouse' },
  { id: 'workshop', name: 'Fix-it Workshop', what: 'Routines: agents that repair a red main, failed upgrades and flaky tests on their own.', story: 'When main breaks, one fixer per problem gets to work, however many builds fail.', x: 300, y: 930, art: 'workshop', video: 'workshop' },
];

export const LINKS: [string, string][] = [
  ['jira', 'temporal'], ['temporal', 'pool'], ['pool', 'vm'], ['vm', 'gateway'], ['vm', 'broker'],
  ['broker', 'review'], ['review', 'lighthouse'], ['temporal', 'workshop'], ['workshop', 'review'],
];

export const JOURNEY = ['jira', 'temporal', 'pool', 'vm', 'gateway', 'broker', 'review', 'lighthouse'];

// Lessons rebuilt for the new format. Everything else on an island is listed as coming soon.
export const PLAYABLE = new Set(['p0-2', 'p7-4', 'g5-2']);

const PIECE_TO_ISLAND: Record<string, string> = {
  jira: 'jira', slack: 'jira', poll: 'jira', github: 'review', temporal: 'temporal', 'vm-pool': 'pool',
  vm: 'vm', skills: 'vm', brain: 'vm', gateway: 'gateway', broker: 'broker', egress: 'broker',
  byte: 'review', approval: 'review', telemetry: 'lighthouse', evals: 'lighthouse',
};
const OVERRIDE: Record<string, string> = { 'p0-2': 'jira', 'p7-4': 'temporal' };
const lessonToPiece = (mapJson as { lessonToPiece: Record<string, string> }).lessonToPiece;

const islandOf = (id: string): string => {
  if (OVERRIDE[id]) return OVERRIDE[id];
  if (id.startsWith('g5-')) return 'workshop';
  if (id.startsWith('p0-')) return 'jira';
  if (/^p[345]-/.test(id)) return 'pool';
  return PIECE_TO_ISLAND[lessonToPiece[id] ?? ''] ?? 'vm';
};

const byIsland = new Map<string, LessonRef[]>();
for (const ref of allLessons) {
  const key = islandOf(ref.lesson.id);
  byIsland.set(key, [...(byIsland.get(key) ?? []), ref]);
}
// Playable lessons first, so each island opens on something you can do today.
for (const [key, refs] of byIsland) {
  byIsland.set(key, [...refs].sort((a, b) => Number(PLAYABLE.has(b.lesson.id)) - Number(PLAYABLE.has(a.lesson.id))));
}

export const lessonsOn = (islandId: string): LessonRef[] => byIsland.get(islandId) ?? [];
export const islandById = (id: string): Island | undefined => ISLANDS.find((i) => i.id === id);
export const islandOfLesson = (lessonId: string): Island | undefined => islandById(islandOf(lessonId));
export const asset = (name: string) => `${import.meta.env.BASE_URL}islands/${name}`;
