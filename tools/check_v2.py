#!/usr/bin/env python3
"""Checks v2 lessons (content/SCHEMA-v2.md). python3 tools/check_v2.py [lesson ids]  (no ids = every v2 lesson)
Errors break the lesson; warnings are things a reviewer should look at. The voice itself is judged by the reviewer
pass in content/STYLE.md, not here: this only catches what a script can catch reliably."""
import json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
course = json.load(open(ROOT / 'content/course.json'))
order = [l['id'] for p in course['parts'] for l in p['lessons']]
cast_file = ROOT / 'content/cast.json'
cast = json.load(open(cast_file)) if cast_file.exists() else []
people = [c['name'] for c in cast if c.get('kind') == 'person' and c['name'] != 'Sean']
widgets_src = (ROOT / 'src/widgets/index.ts').read_text() if (ROOT / 'src/widgets/index.ts').exists() else ''
_widgets_body = re.search(r'WIDGETS[^=]*=\s*\{(.*?)\}', widgets_src, re.S)
WIDGETS = set(re.findall(r"['\"]?([a-zA-Z0-9-]+)['\"]?\s*:", _widgets_body.group(1))) if _widgets_body else set()

TICKET = re.compile(r'\b[GP]\d{1,2}-\d{2}\b')
LEAKS = [r'\bthe sketch\b', r'\ba writer\b', r"\bthis lesson's writer\b", r'\bcheck with [A-Z]', r'\bthe ticket does not say\b',
         r'\bask the [A-Z]\d+ owner\b', r'\bplaceholder\b', r'\bTODO\b', r'\blines? \d+ to \d+ of the\b']
SPOKEN_WPM = 150
PHRASAL = ['carry on', 'carries on', 'let go of', 'lets go of', 'step in', 'steps in', 'pick up', 'picks up', 'spin up', 'spins up', 'kick off', 'kicks off', 'look into', 'figure out', 'set up', 'sets up', 'show up', 'shows up', 'end up', 'ends up', 'run into', 'runs into', 'turn out', 'turns out', 'under the hood', 'hand off', 'hands off']


def teaching_texts(d):
    """(where, text) for every part of the lesson that teaches, i.e. everything except the platform part."""
    yield 'hook', ' '.join(d['hook']['story']) + ' ' + d['hook']['question']
    for ci, c in enumerate((d.get('watch') or {}).get('chapters', [])):
        for li, l in enumerate(c['lines']):
            yield f'watch {ci + 1}.{li + 1}', l['say']
    if d.get('play'):
        yield 'play', d['play']['intro'] + ' ' + ' '.join(t['text'] for t in d['play']['tasks'])
    for s in d['read']:
        yield f'read "{s["h"]}"', ' '.join(s['p'])
        if s.get('deeper'):
            yield f'read "{s["deeper"]["h"]}"', ' '.join(s['deeper']['p'])
    lab = d['lab']
    yield 'lab', ' '.join([lab['goal'], lab['build'], lab.get('fix', ''), lab['done'], *lab['explain'], *(f['say'] for f in lab['follow'])])
    for q in d['check']:
        yield 'check', q['q'] + ' ' + ' '.join(o['text'] + ' ' + o['why'] for o in q['options'])


def check(lid):
    errors, warns = [], []
    path = ROOT / 'content/lessons' / f'{lid}.json'
    d = json.load(open(path))
    if d.get('v') != 2:
        return None
    for field in ['id', 'title', 'minutes', 'youNeed', 'map', 'hook', 'read', 'lab', 'check', 'platform', 'words', 'review', 'remember']:
        if field not in d:
            errors.append(f'missing field {field}')
    if errors:
        return errors, warns

    for y in d['youNeed']:
        if y not in order:
            errors.append(f'youNeed {y} is not a lesson')
        elif order.index(y) >= order.index(lid):
            errors.append(f'youNeed {y} comes after this lesson')

    watch = d.get('watch') or {'scene': {'cols': 1, 'rows': 1, 'actors': [], 'links': []}, 'chapters': []}
    scene = watch['scene']
    ids = {a['id'] for a in scene['actors']}
    spots = [tuple(a['at']) for a in scene['actors']]
    if len(spots) != len(set(spots)):
        errors.append('two actors share a grid cell')
    for a in scene['actors']:
        c, r = a['at']
        if not (0 <= c < scene['cols'] and 0 <= r < scene['rows']):
            errors.append(f'actor {a["id"]} is outside the {scene["cols"]}x{scene["rows"]} grid')
    for l in scene['links']:
        if l['from'] not in ids or l['to'] not in ids:
            errors.append(f'link {l["from"]}->{l["to"]} names an unknown actor')
        if l['from'] == l['to']:
            errors.append(f'link {l["from"]} loops to itself')

    total_words = 0
    for ci, c in enumerate(watch['chapters']):
        words = sum(len(l['say'].split()) for l in c['lines'])
        total_words += words
        if words / SPOKEN_WPM > 6:
            warns.append(f'chapter {ci + 1} is about {words / SPOKEN_WPM:.1f} min spoken (keep under 6)')
        for li, l in enumerate(c['lines']):
            where = f'watch {ci + 1}.{li + 1}'
            n = len(l['say'].split())
            if n > 40:
                warns.append(f'{where}: {n} words in one line; lines over 40 words are hard to follow by ear')
            for token in re.findall(r'\b(?:[A-Z][A-Z0-9]*_[A-Z0-9_]+|[a-z]+[A-Z][A-Za-z]+)\b', l['say']):
                warns.append(f'{where}: "{token}" is code; the voice reads it as written. Say it in words and keep the code in a caption')
            for phrase in PHRASAL:
                if re.search(rf'\b{phrase}\b', l['say'], re.I):
                    warns.append(f'{where}: phrasal verb "{phrase}" (use a plain verb for a second-language listener)')
            cue = l.get('cue') or {}
            named = [*cue.get('focus', []), *(x for x in [cue.get('unmark'), cue.get('fail'), cue.get('heal')] if x)]
            if cue.get('mark'):
                named.append(cue['mark']['id'])
            if cue.get('send'):
                named += [cue['send']['from'], cue['send']['to']]
                if cue['send']['from'] == cue['send']['to']:
                    errors.append(f'{where}: a send from {cue["send"]["from"]} to itself draws nothing')
            for n_id in named:
                if n_id not in ids:
                    errors.append(f'{where}: cue names unknown actor "{n_id}"')
            if re.search(r'```|=>|\);', l['say']):
                warns.append(f'{where}: looks like code read aloud')
        if c.get('check'):
            if sum(o['correct'] for o in c['check']['options']) != 1:
                errors.append(f'chapter {ci + 1} check needs exactly one correct option')

    if d.get('play'):
        if WIDGETS and d['play']['widget'] not in WIDGETS:
            errors.append(f'play widget "{d["play"]["widget"]}" is not in src/widgets/index.ts ({", ".join(sorted(WIDGETS))})')
    lab_dir = (ROOT / 'labs' / lid).is_dir()
    if lab_dir and d['lab'].get('mode') != 'checked':
        errors.append('labs/<id>/ exists, so the lab mode must be "checked"')
    if not lab_dir and d['lab'].get('mode') != 'guided':
        errors.append('no labs/<id>/ folder, so the lab mode must be "guided" (otherwise the page shows ./academy commands that do not exist)')
    if d['lab'].get('mode') == 'guided' and not d['lab'].get('checks'):
        errors.append('a guided lab needs a "checks" list the learner can tick off')
    clips_file = ROOT / 'content/clips' / f'{lid}.json'
    if not clips_file.exists():
        errors.append('no content/clips/<id>.json (clips and practice drills)')
    else:
        cs = json.load(open(clips_file))
        if not 1 <= len(cs.get('clips', [])) <= 5:
            warns.append(f'{len(cs.get("clips", []))} clips (aim for 2-4)')
        for c in cs.get('clips', []):
            if not (0 <= c['start'] < c['end']):
                errors.append(f'clip {c["videoId"]} has start {c["start"]} and end {c["end"]}')
            if c['end'] - c['start'] > 9 * 60:
                warns.append(f'clip {c["videoId"]} is {(c["end"] - c["start"]) / 60:.1f} min (keep clips short)')
            if c.get('verified') not in ('transcript', 'chapters'):
                errors.append(f'clip {c["videoId"]} needs "verified": "transcript" or "chapters"')
        if not 4 <= len(cs.get('practice', [])) <= 8:
            warns.append(f'{len(cs.get("practice", []))} practice drills (aim for 4-6)')
        for q in cs.get('practice', []):
            if q['kind'] == 'choice' and sum(o['correct'] for o in q['options']) != 1:
                errors.append(f'drill "{q["q"][:40]}" needs exactly one correct option')
            if q['kind'] == 'fill' and not q.get('answers'):
                errors.append(f'fill drill "{q["q"][:40]}" has no answers')

    if not 2 <= len(d['check']) <= 3:
        errors.append(f'check has {len(d["check"])} questions (2-3)')
    for qi, q in enumerate(d['check']):
        if sum(o['correct'] for o in q['options']) != 1:
            errors.append(f'check question {qi + 1} needs exactly one correct option')
    if len({next((i for i, o in enumerate(q['options']) if o['correct']), -1) for q in d['check']}) == 1 and len(d['check']) > 1:
        warns.append('the correct answer is in the same position in every check question')
    if sum(o['correct'] for o in d['lab']['guess']['options']) != 1:
        errors.append('lab guess needs exactly one correct option')
    if len(d['words']) > 6:
        warns.append(f'{len(d["words"])} words (keep to 6 or fewer new terms)')
    for code_owner in [*d['read'], *(s['deeper'] for s in d['read'] if s.get('deeper'))]:
        code = code_owner.get('code')
        if code:
            lines = code['text'].count('\n') + 1
            if lines > 30:
                warns.append(f'code in "{code_owner["h"]}" is {lines} lines')
            text_lines = code['text'].split('\n')
            for note in code.get('notes', []):
                if not 1 <= note['line'] <= lines:
                    errors.append(f'code note on line {note["line"]} is outside "{code_owner["h"]}" ({lines} lines)')
                elif not text_lines[note['line'] - 1].strip():
                    warns.append(f'code note on line {note["line"]} of "{code_owner["h"]}" points at a blank line (probably one line off)')

    for where, text in teaching_texts(d):
        for key in sorted(set(TICKET.findall(text))):
            errors.append(f'{where}: ticket key {key} in the teaching text (keep keys in "platform")')
        for pat in LEAKS:
            if re.search(pat, text, re.I):
                errors.append(f'{where}: working note leaked ("{re.search(pat, text, re.I).group(0)}")')
        for name in people:
            if re.search(rf'\b{re.escape(name)}\b', text):
                warns.append(f'{where}: names {name}; say the role unless the cast introduces them here')

    minutes = total_words / SPOKEN_WPM + d['lab']['minutes'] + 10 + (sum(c['end'] - c['start'] for c in json.load(open(clips_file)).get('clips', [])) / 60 if clips_file.exists() else 0)
    if abs(minutes - d['minutes']) > 15:
        warns.append(f'minutes is {d["minutes"]}, the parts add up to about {minutes:.0f}')
    return errors, warns


def main():
    ids = sys.argv[1:] or [p.stem for p in sorted((ROOT / 'content/lessons').glob('*.json'))]
    bad = 0
    for lid in ids:
        res = check(lid)
        if res is None:
            continue
        errors, warns = res
        status = 'OK' if not errors else 'FAIL'
        print(f'{lid}: {status} ({len(errors)} errors, {len(warns)} warnings)')
        for e in errors:
            print(f'  ✘ {e}')
        for w in warns:
            print(f'  ! {w}')
        bad += bool(errors)
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
