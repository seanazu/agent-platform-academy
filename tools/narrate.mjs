// Records the narration of v2 lessons with ElevenLabs, one mp3 per spoken line, into public/narration/<lesson>/.
// The lesson player plays these files and falls back to the browser's voice for any line without one.
//
//   node tools/narrate.mjs p7-4 g5-2            record (or re-use cached) lines for these lessons
//   node tools/narrate.mjs --all                every v2 lesson
//   node tools/narrate.mjs --voices             list the voices on the account
//   node tools/narrate.mjs --sample p7-4 --voice "George" --voice "Alice"   first chapter only, one folder per voice
//
// Options: --voice <name or id> (default $ELEVENLABS_VOICE or "George"), --model <id> (default eleven_v4).
// The key is read from ELEVENLABS_API_KEY or .env.local; it is never written anywhere.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://api.elevenlabs.io/v1';

const envKey = () => {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY;
  const file = join(root, '.env.local');
  if (!existsSync(file)) return undefined;
  const line = readFileSync(file, 'utf8').split('\n').find((l) => l.startsWith('ELEVENLABS_API_KEY='));
  return line?.slice('ELEVENLABS_API_KEY='.length).trim().replace(/^["']|["']$/g, '');
};

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const values = (name) => args.flatMap((a, i) => (a === name && args[i + 1] ? [args[i + 1]] : []));
const ids = args.filter((a, i) => !a.startsWith('--') && !['--voice', '--model'].includes(args[i - 1]));
const model = values('--model')[0] ?? 'eleven_v4';

const key = envKey();
if (!key) {
  console.error('No ElevenLabs key. Put ELEVENLABS_API_KEY=... in .env.local (it is git-ignored) and run again.');
  process.exit(1);
}
const headers = { 'xi-api-key': key, 'content-type': 'application/json' };

const listVoices = async () => {
  const res = await fetch(`${API}/voices`, { headers });
  if (!res.ok) throw new Error(`voices: ${res.status} ${await res.text()}`);
  return (await res.json()).voices.map((v) => ({ id: v.voice_id, name: v.name, labels: v.labels ?? {} }));
};

const resolveVoice = async (wanted) => {
  if (/^[A-Za-z0-9]{20}$/.test(wanted)) return { id: wanted, name: wanted };
  const voices = await listVoices();
  const hit = voices.find((v) => v.name.toLowerCase() === wanted.toLowerCase()) ?? voices.find((v) => v.name.toLowerCase().startsWith(wanted.toLowerCase()));
  if (!hit) throw new Error(`No voice called "${wanted}". Run with --voices to see the list.`);
  return hit;
};

const speak = async (voice, text, previous, next) => {
  const body = { text, model_id: model, previous_text: previous, next_text: next };
  const url = `${API}/text-to-speech/${voice.id}?output_format=mp3_44100_64`;
  let res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  if (res.status === 400) {
    // Some models do not accept the neighbouring-text hints; record the line on its own instead.
    res = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ text, model_id: model }) });
  }
  if (!res.ok) throw new Error(`text-to-speech: ${res.status} ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
};

const lessonFile = (id) => join(root, 'content/lessons', `${id}.json`);
const v2Ids = () =>
  readdirSync(join(root, 'content/lessons'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
    .filter((id) => JSON.parse(readFileSync(lessonFile(id), 'utf8')).v === 2);

const record = async (id, voice, { outDir, chapters: onlyChapters } = {}) => {
  const lesson = JSON.parse(readFileSync(lessonFile(id), 'utf8'));
  if (lesson.v !== 2) return console.log(`${id}: not a v2 lesson, skipped`);
  const dir = outDir ?? join(root, 'public/narration', id);
  mkdirSync(dir, { recursive: true });
  const flat = lesson.watch.chapters.flatMap((c, ci) => c.lines.map((l, li) => ({ ci, li, say: l.say })));
  const lines = {};
  let made = 0;
  for (const [i, l] of flat.entries()) {
    if (onlyChapters && !onlyChapters.includes(l.ci)) continue;
    const hash = createHash('sha256').update(`${model}|${voice.id}|${l.say}`).digest('hex').slice(0, 10);
    const src = `${l.ci}-${l.li}-${hash}.mp3`;
    if (!existsSync(join(dir, src))) {
      const audio = await speak(voice, l.say, flat[i - 1]?.say, flat[i + 1]?.say);
      writeFileSync(join(dir, src), audio);
      made++;
      process.stdout.write('.');
    }
    lines[`${l.ci}-${l.li}`] = { src };
  }
  const keep = new Set(Object.values(lines).map((v) => v.src));
  for (const f of readdirSync(dir)) if (f.endsWith('.mp3') && !keep.has(f)) rmSync(join(dir, f));
  writeFileSync(join(dir, 'manifest.json'), `${JSON.stringify({ voice: voice.name, model, lines }, null, 1)}\n`);
  console.log(`\n${id}: ${Object.keys(lines).length} lines (${made} new) → ${dir.replace(`${root}/`, '')}`);
};

if (flag('--voices')) {
  for (const v of await listVoices()) console.log(`${v.name.padEnd(28)} ${v.id}  ${Object.values(v.labels).join(', ')}`);
} else if (flag('--sample')) {
  const voices = values('--voice').length ? values('--voice') : ['George', 'Alice', 'Brian'];
  for (const id of ids) {
    for (const name of voices) {
      const voice = await resolveVoice(name);
      await record(id, voice, { outDir: join(root, 'tools/narration-samples', id, voice.name.replace(/\W+/g, '-')), chapters: [0] });
    }
  }
  console.log('Samples are in tools/narration-samples/. Listen, pick a voice, then record with --voice <name>.');
} else {
  const voice = await resolveVoice(values('--voice')[0] ?? process.env.ELEVENLABS_VOICE ?? 'George');
  const targets = flag('--all') ? v2Ids() : ids;
  if (targets.length === 0) console.error('Name the lessons to record, or pass --all.');
  for (const id of targets) await record(id, voice);
}
