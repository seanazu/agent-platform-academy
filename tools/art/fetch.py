#!/usr/bin/env python3
"""Download finished cover jobs from tools/art/jobs.json to tools/art/src/<id>.png and write web-sized WebP files
to public/art/<id>.webp (1600 wide, hero 2400) and <id>-sm.webp (800 wide), plus public/art/manifest.json.

Usage: tools/art/fetch.py [--only hero,p0,p1-1] [--status]   (--status only prints job states, downloads nothing)
"""
import json, sys, urllib.request
from PIL import Image
from hf import ART_DIR, ROOT, SRC, job, load, only

JOBS = ART_DIR / 'jobs.json'
ART = ROOT / 'public/art'


def fetch(ids, status_only=False):
  jobs = load(JOBS)
  SRC.mkdir(parents=True, exist_ok=True); ART.mkdir(parents=True, exist_ok=True)
  counts = {}
  for cid in ids:
    jid = jobs.get(cid)
    if not jid: counts['no job'] = counts.get('no job', 0) + 1; continue
    png = SRC / f'{cid}.png'
    if not png.exists() or status_only:
      d = job(jid)
      st = d.get('status')
      if status_only:
        counts[st] = counts.get(st, 0) + 1
        if st not in ('completed',): print(cid, st, d.get('error') or '')
        continue
      if st != 'completed' or not d.get('result_url'):
        counts[st] = counts.get(st, 0) + 1; print(cid, st, d.get('error') or ''); continue
      urllib.request.urlretrieve(d['result_url'], png)
    im = Image.open(png).convert('RGB')
    for w, suffix in ((2400 if cid == 'hero' else 1600, ''), (800, '-sm')):
      im.resize((w, round(im.height * w / im.width)), Image.LANCZOS).save(ART / f'{cid}{suffix}.webp', 'WEBP', quality=82, method=6)
    counts['ok'] = counts.get('ok', 0) + 1
  have = sorted(p.stem for p in ART.glob('*.webp') if not p.stem.endswith('-sm'))
  (ART / 'manifest.json').write_text(json.dumps(have) + '\n')
  print(counts, '| manifest:', len(have), 'covers')


if __name__ == '__main__':
  fetch(only(sys.argv) or list(load(JOBS)), status_only='--status' in sys.argv)
