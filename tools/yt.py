#!/usr/bin/env python3
"""Shared YouTube helper for the lesson writers. Everything is cached under content/.cache/yt/ (git-ignored), and
transcript fetches are paced across all processes, because YouTube blocks an IP that asks for too many.

  python3 tools/yt.py search "temporal workflow id" [n]   -> id | title | channel | minutes | views  (no transcript cost)
  python3 tools/yt.py meta <id>                            -> embeddable?, title, channel, minutes, chapters
  python3 tools/yt.py transcript <id> [from] [to]          -> "seconds text" lines (optionally only a window)
  python3 tools/yt.py grep <id> "<words>"                   -> transcript lines containing the words

Exit code 3 means transcripts are blocked right now: pick the span from chapters instead and mark the clip
"verified": "chapters"."""
import fcntl, json, os, pathlib, re, subprocess, sys, time, urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
CACHE = ROOT / 'content/.cache/yt'
CACHE.mkdir(parents=True, exist_ok=True)
LOCK = CACHE / '.lock'
STATE = CACHE / '.state.json'
GAP = 25          # seconds between two transcript fetches, across every writer
BLOCK_PAUSE = 45 * 60


def state():
    try:
        return json.loads(STATE.read_text())
    except Exception:
        return {}


def save_state(s):
    STATE.write_text(json.dumps(s))


def yt_dlp(args):
    return subprocess.run(['yt-dlp', '--no-warnings', *args], capture_output=True, text=True, timeout=120)


def search(query, n=10):
    sep = '~#~'
    r = yt_dlp(['--flat-playlist', '--print', sep.join(['%(id)s', '%(title)s', '%(channel)s', '%(duration)s', '%(view_count)s']), f'ytsearch{n}:{query}'])
    for line in r.stdout.strip().splitlines():
        vid, title, channel, dur, views = (line.split(sep) + [''] * 5)[:5]
        try:
            mins = f'{float(dur) / 60:.1f}'
        except ValueError:
            mins = '?'
        print(f'{vid} | {title} | {channel} | {mins} min | {views} views')


def meta(vid):
    f = CACHE / f'{vid}.meta.json'
    if f.exists():
        data = json.loads(f.read_text())
    else:
        try:
            with urllib.request.urlopen(f'https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json', timeout=20) as r:
                embeddable = r.status == 200
        except Exception:
            embeddable = False
        r = yt_dlp(['--skip-download', '--dump-json', f'https://www.youtube.com/watch?v={vid}'])
        info = json.loads(r.stdout) if r.returncode == 0 and r.stdout.strip() else {}
        data = {
            'id': vid, 'embeddable': embeddable, 'title': info.get('title'), 'channel': info.get('channel'),
            'minutes': round((info.get('duration') or 0) / 60, 1), 'upload_date': info.get('upload_date'),
            'views': info.get('view_count'),
            'chapters': [{'start': int(c['start_time']), 'end': int(c['end_time']), 'title': c['title']} for c in (info.get('chapters') or [])],
            'description': (info.get('description') or '')[:1500],
        }
        f.write_text(json.dumps(data, indent=1))
    print(json.dumps(data, indent=1))


def vtt_lines(text):
    out, last = [], None
    for block in text.split('\n\n'):
        m = re.search(r'(\d+):(\d+):(\d+)\.\d+ -->', block)
        if not m:
            continue
        t = int(m.group(1)) * 3600 + int(m.group(2)) * 60 + int(m.group(3))
        words = ' '.join(re.sub(r'<[^>]+>', '', l) for l in block.split('\n')[1:] if '-->' not in l).strip()
        if words and words != last:
            out.append([t, words])
            last = words
    return out


def fetch_transcript(vid):
    f = CACHE / f'{vid}.transcript.json'
    if f.exists():
        return json.loads(f.read_text())
    with open(LOCK, 'w') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        if f.exists():
            return json.loads(f.read_text())
        s = state()
        if time.time() - s.get('blocked_at', 0) < BLOCK_PAUSE:
            print('BLOCKED: transcripts are paused after a block; use chapters and mark the clip "verified": "chapters".', file=sys.stderr)
            sys.exit(3)
        wait = GAP - (time.time() - s.get('last', 0))
        if wait > 0:
            time.sleep(wait)
        s['last'] = time.time()
        save_state(s)
        lines = None
        try:
            from youtube_transcript_api import YouTubeTranscriptApi as Y
            try:
                t = Y().fetch(vid)
                lines = [[int(x.start), x.text] for x in t]
            except AttributeError:
                lines = [[int(x['start']), x['text']] for x in Y.get_transcript(vid)]
        except Exception as e:
            msg = str(e)
            blocked = 'Blocked' in msg or '429' in msg or 'Too Many' in msg
            if not blocked:
                r = yt_dlp(['--skip-download', '--write-auto-subs', '--write-subs', '--sub-langs', 'en.*', '--sub-format', 'vtt', '-o', str(CACHE / f'{vid}.%(ext)s'), f'https://www.youtube.com/watch?v={vid}'])
                vtts = sorted(CACHE.glob(f'{vid}*.vtt'))
                if vtts:
                    lines = vtt_lines(vtts[0].read_text())
                elif '429' in r.stderr:
                    blocked = True
            if lines is None:
                if blocked:
                    s['blocked_at'] = time.time()
                    save_state(s)
                    print('BLOCKED: YouTube is limiting transcripts from this machine; use chapters and mark the clip "verified": "chapters".', file=sys.stderr)
                    sys.exit(3)
                print(f'NO TRANSCRIPT for {vid}: {msg[:200]}', file=sys.stderr)
                sys.exit(4)
        f.write_text(json.dumps(lines))
        return lines


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    cmd, arg = sys.argv[1], sys.argv[2]
    if cmd == 'search':
        search(arg, int(sys.argv[3]) if len(sys.argv) > 3 else 10)
    elif cmd == 'meta':
        meta(arg)
    elif cmd == 'transcript':
        lo = int(sys.argv[3]) if len(sys.argv) > 3 else 0
        hi = int(sys.argv[4]) if len(sys.argv) > 4 else 10 ** 9
        for t, w in fetch_transcript(arg):
            if lo <= t <= hi:
                print(t, w)
    elif cmd == 'grep':
        needle = sys.argv[3].lower()
        for t, w in fetch_transcript(arg):
            if needle in w.lower():
                print(t, w)
    else:
        print(__doc__)
        sys.exit(1)


if __name__ == '__main__':
    main()
