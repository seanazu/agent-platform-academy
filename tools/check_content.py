#!/usr/bin/env python3
"""Checks lesson files against content/SCHEMA.md and STYLE.md.
python3 tools/check_content.py            # every lesson
python3 tools/check_content.py p7-2 g3-4  # some lessons
Exit 1 on errors. Warnings are printed but don't fail."""
import json, re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
course = json.load(open(ROOT / 'content/course.json'))
LESSONS = {l['id']: (p, l) for p in course['parts'] for l in p['lessons']}
BANNED = re.compile(r'\b(simply|just|obviously|easy|easily|straightforward|trivial)\b', re.I)
LANGS = {'typescript', 'javascript', 'yaml', 'hcl', 'python', 'bash', 'json', 'toml', 'markdown', 'text', 'jsonc', 'json5', 'diff'}
KINDS = {'person', 'agent', 'machine', 'service', 'file', 'cloud', 'check'}
ids = sys.argv[1:] or list(LESSONS)
errors, warns = [], []


def E(lid, msg): errors.append(f'{lid}: {msg}')
def Wn(lid, msg): warns.append(f'{lid}: {msg}')


def text_of(x):
    if isinstance(x, str): return [x]
    if isinstance(x, dict): return [t for v in x.values() for t in text_of(v)]
    if isinstance(x, list): return [t for v in x for t in text_of(v)]
    return []


for lid in ids:
    f = ROOT / 'content/lessons' / f'{lid}.json'
    if not f.exists():
        E(lid, 'missing file'); continue
    try:
        d = json.load(open(f))
    except Exception as ex:
        E(lid, f'invalid JSON: {ex}'); continue
    part, meta = LESSONS[lid]
    for k in ['id', 'title', 'minutes', 'youNeed', 'bridge', 'intro', 'picture', 'sections', 'lab', 'quiz', 'recall', 'videos', 'words', 'tickets', 'remember']:
        if k not in d: E(lid, f'missing field {k}')
    if errors and errors[-1].startswith(lid + ': missing field'): continue
    if d['id'] != lid: E(lid, 'id mismatch')
    if d['title'] != meta['title']: E(lid, f'title changed (course.json says {meta["title"]!r})')
    if not (15 <= d['minutes'] <= 60): Wn(lid, f'minutes {d["minutes"]}')
    for y in d['youNeed']:
        if y not in LESSONS: E(lid, f'youNeed unknown lesson {y}')
    if ' except' not in d['bridge'].lower() and 'except' not in d['bridge'].lower(): E(lid, 'bridge has no "except" (where the analogy breaks)')
    pic = d['picture']
    if not (3 <= len(pic.get('nodes', [])) <= 8): E(lid, f'picture has {len(pic.get("nodes", []))} nodes (3–8)')
    if not (3 <= len(pic.get('steps', [])) <= 8): E(lid, f'picture has {len(pic.get("steps", []))} steps (3–8)')
    nid = {n['id'] for n in pic.get('nodes', [])}
    for n in pic.get('nodes', []):
        if n.get('kind') not in KINDS: E(lid, f'picture node {n.get("id")} kind {n.get("kind")!r}')
    for s in pic.get('steps', []):
        if s.get('from') not in nid or s.get('to') not in nid: E(lid, f'picture step points to unknown node: {s}')
    if not (4 <= len(d['sections']) <= 9): E(lid, f'{len(d["sections"])} sections (4–8)')
    for i, s in enumerate(d['sections']):
        if 'h' not in s or 'p' not in s: E(lid, f'section {i} needs h and p'); continue
        for p in s['p']:
            if len(re.findall(r'[.!?](\s|$)', p)) > 5: Wn(lid, f'section {i}: a paragraph has more than 4 sentences')
        c = s.get('code')
        if c:
            if 'because' not in s: E(lid, f'section {i} has code but no "because"')
            if c.get('lang') not in LANGS: E(lid, f'section {i} code lang {c.get("lang")!r}')
            n = len(c.get('text', '').splitlines())
            if n > 25: E(lid, f'section {i} code has {n} lines (max 25)')
            if n < 3: E(lid, f'section {i} code has {n} lines')
            if len(c.get('notes', [])) < 3: E(lid, f'section {i} code has {len(c.get("notes", []))} notes (min 3)')
            for note in c.get('notes', []):
                if not (1 <= note.get('line', 0) <= n): E(lid, f'section {i} note line {note.get("line")} out of range')
        if 'callout' in s and s['callout'].get('kind') not in {'why', 'gotcha', 'tip', 'wall'}: E(lid, f'section {i} callout kind')
    lab = d['lab']
    for k in ['title', 'youNeed', 'worked', 'faded', 'alone', 'done']:
        if k not in lab: E(lid, f'lab missing {k}')
    if 'worked' in lab:
        if not (3 <= len(lab['worked']) <= 12): E(lid, f'lab has {len(lab["worked"])} worked steps (3–12)')
        for st in lab['worked']:
            if 'do' not in st or 'see' not in st: E(lid, 'lab worked step needs do and see')
    if len(d['quiz']) != 3: E(lid, f'{len(d["quiz"])} quiz questions (need 3)')
    for i, q in enumerate(d['quiz']):
        opts = q.get('options', [])
        if len(opts) != 3: E(lid, f'quiz {i} has {len(opts)} options')
        if sum(1 for o in opts if o.get('correct')) != 1: E(lid, f'quiz {i} must have exactly one correct option')
        for o in opts:
            if not o.get('why'): E(lid, f'quiz {i} option without why')
    if not (1 <= len(d['recall']) <= 2): E(lid, f'{len(d["recall"])} recall questions (1–2)')
    for v in d['videos']:
        if not re.match(r'^https://www\.youtube\.com/watch\?v=[\w-]{11}$', v.get('url', '')): E(lid, f'video url not a watch URL: {v.get("url")}')
        for k in ['title', 'channel', 'why']:
            if not v.get(k): E(lid, f'video missing {k}')
    if not (3 <= len(d['words']) <= 7): Wn(lid, f'{len(d["words"])} words (3–7)')
    keys = [t['key'] for t in d['tickets']]
    if part['kind'] == 'walkthrough':
        if keys != meta['covers']: E(lid, f'tickets {keys} != covers {meta["covers"]} (same keys, same order)')
        for t in d['tickets']:
            if not (3 <= len(t.get('walk', [])) <= 10): E(lid, f'ticket {t["key"]} has {len(t.get("walk", []))} walk steps (3–8)')
    else:
        if len(keys) > 4: Wn(lid, f'{len(keys)} unlocked tickets (max 4)')
        for k in keys:
            if k not in course['ticketToLesson']: E(lid, f'unknown ticket {k}')
    for t in d['tickets']:
        if not t.get('why'): E(lid, f'ticket {t.get("key")} has no why')
    # style
    prose = {k: v for k, v in d.items() if k not in ('videos', 'sections', 'lab', 'tickets')}
    prose['sections'] = [{k: v for k, v in sec.items() if k not in ('code', 'see')} | ({'notes': sec['code'].get('notes', [])} if sec.get('code') else {}) for sec in d['sections']]
    prose['lab'] = {k: v for k, v in d['lab'].items() if k not in ('worked',)} | {'worked': [st.get('note', '') for st in d['lab'].get('worked', [])]}
    prose['tickets'] = [{'why': t.get('why', ''), 'walk': t.get('walk', [])} for t in d['tickets']]
    for s in text_of(prose):
        if '—' in s: E(lid, f'em dash in: {s[:60]!r}')
        if BANNED.search(s): Wn(lid, f'banned word in: {s[:70]!r}')
        for sent in re.split(r'(?<=[.!?])\s+', s):
            if len(sent.split()) > 22 and not sent.strip().startswith(('import', '//', '#', 'const', 'export')): Wn(lid, f'long sentence ({len(sent.split())} words): {sent[:60]!r}')

print(f'checked {len(ids)} lessons: {len(errors)} errors, {len(warns)} warnings')
for e in errors: print('ERROR', e)
for w in warns[:60]: print('warn ', w)
if len(warns) > 60: print(f'... {len(warns) - 60} more warnings')
sys.exit(1 if errors else 0)
