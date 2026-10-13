#!/usr/bin/env python3
"""Short intro clips for each part (Seedance 2.0 Mini, 5 credits each), started from the part's cover job.

Usage: tools/art/clips.py create [--only p0,p1] [--force]   # one clip per part that has no clip yet
       tools/art/clips.py fetch  [--only p0,p1]             # download finished clips to public/video/<part>.mp4
"""
import sys, urllib.request
from hf import ART_DIR, ROOT, SCENES, hf, job, load, only, parse, parts, save

JOBS = ART_DIR / 'jobs.json'
CLIPS = ART_DIR / 'clips.json'
OUT = ROOT / 'public/video'
PROMPT = ('Keep this exact image: the same miniature clay diorama, objects, colours and lighting. A gentle, slow camera move only: '
          'a soft dolly in and a slight orbit around the floating platform, with a subtle flicker in the glowing lights. '
          'Nothing is added, nothing is removed, no people walk in, no cuts, no text, no letters, no logos. Scene: {scene}')


def create(ids, force=False):
  jobs, clips = load(JOBS), load(CLIPS)
  todo = [i for i in ids if force or i not in clips]
  print(f'{len(todo)} clips to create')
  for n, pid in enumerate(todo, 1):
    cover = jobs.get(pid)
    if not cover: print(pid, 'no cover job yet'); continue
    prompt = PROMPT.format(scene=SCENES[pid])
    assert '@' not in prompt
    r = hf('generate', 'create', 'seedance_2_0_mini', '--prompt', prompt, '--start-image', cover, '--duration', '5',
           '--generate_audio', 'false', '--resolution', '720p', '--aspect_ratio', '16:9')
    try: jid = parse(r.stdout)['id']
    except Exception:
      print(f'[{n}/{len(todo)}] {pid} FAILED', r.stdout[:300], r.stderr[:300]); continue
    medias = job(jid).get('params', {}).get('medias') or []
    flag = '' if medias else '  WARNING: params.medias is empty, start image missing'
    clips[pid] = jid
    save(CLIPS, clips)
    print(f'[{n}/{len(todo)}] {pid} {jid}{flag}')


def fetch(ids):
  clips = load(CLIPS)
  OUT.mkdir(parents=True, exist_ok=True)
  counts = {}
  for pid in ids:
    jid = clips.get(pid)
    if not jid: counts['no job'] = counts.get('no job', 0) + 1; continue
    mp4 = OUT / f'{pid}.mp4'
    if mp4.exists(): counts['ok'] = counts.get('ok', 0) + 1; continue
    d = job(jid)
    st = d.get('status')
    if st != 'completed' or not d.get('result_url'):
      counts[st] = counts.get(st, 0) + 1; print(pid, st, d.get('error') or ''); continue
    url = d['result_url']
    _, headers = urllib.request.urlretrieve(url, mp4)
    ctype = headers.get('Content-Type', '')
    if 'mp4' not in ctype and not url.split('?')[0].endswith('.mp4'):
      print(pid, 'NOTE: result is not mp4:', ctype, url.split('?')[0][-40:])
    counts['ok'] = counts.get('ok', 0) + 1
  print(counts, '|', len(list(OUT.glob('*.mp4'))), 'clips in public/video')


if __name__ == '__main__':
  cmd = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('--') else 'fetch'
  ids = only(sys.argv) or parts()
  create(ids, force='--force' in sys.argv) if cmd == 'create' else fetch(ids)
