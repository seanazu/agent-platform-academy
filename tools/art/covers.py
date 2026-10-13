#!/usr/bin/env python3
"""Create the cover images (Nano Banana Pro, 2 credits each) for every scene that has no job yet.

Usage: tools/art/covers.py [--only hero,p0,p1-1] [--force]
  default: every scene in scenes.py without a job in tools/art/jobs.json
  --only:  just these ids (an existing job is replaced only with --force)
Then tools/art/fetch.py downloads the finished jobs.
"""
import sys
from hf import ART_DIR, REF, STYLE, SCENES, accents, hf, job, load, only, parse, save

JOBS = ART_DIR / 'jobs.json'


def create(ids, force=False):
  jobs = load(JOBS)
  acc = accents()
  todo = [i for i in ids if force or i not in jobs]
  print(f'{len(todo)} to create, {len(ids) - len(todo)} already have a job')
  for n, cid in enumerate(todo, 1):
    prompt = STYLE.format(accent=acc[cid], scene=SCENES[cid])
    assert '@' not in prompt
    r = hf('generate', 'create', 'nano_banana_pro', '--prompt', prompt, '--aspect_ratio', '21:9' if cid == 'hero' else '16:9',
           '--resolution', '2k', '--image-references', REF)
    try: jid = parse(r.stdout)['id']
    except Exception:
      print(f'[{n}/{len(todo)}] {cid} FAILED', r.stdout[:300], r.stderr[:300]); continue
    refs = job(jid).get('params', {}).get('input_images') or []
    flag = '' if len(refs) == 1 else f'  WARNING: {len(refs)} image references, expected 1'
    jobs[cid] = jid
    save(JOBS, jobs)
    print(f'[{n}/{len(todo)}] {cid} {jid}{flag}')


if __name__ == '__main__':
  ids = only(sys.argv) or list(SCENES)
  create(ids, force='--force' in sys.argv)
