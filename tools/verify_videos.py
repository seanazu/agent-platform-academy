#!/usr/bin/env python3
"""Checks that every YouTube link in the lessons exists: fetches the watch page and reads its title.
A missing or 'unavailable' video is reported and (with --remove) removed from the lesson.
python3 tools/verify_videos.py [--remove]"""
import json, pathlib, re, sys, urllib.request, html

ROOT = pathlib.Path(__file__).resolve().parents[1]
remove = '--remove' in sys.argv
bad = []
seen = {}
for f in sorted((ROOT / 'content/lessons').glob('*.json')):
  d = json.load(open(f))
  keep = []
  for v in d.get('videos', []):
    url = v['url']
    if url not in seen:
      try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'en'})
        page = urllib.request.urlopen(req, timeout=20).read().decode('utf-8', 'ignore')
        m = re.search(r'<title>(.*?)</title>', page)
        title = html.unescape(m.group(1)) if m else ''
        m2 = re.search(r'"playabilityStatus":\{"status":"([A-Z_]+)"', page)
        status = m2.group(1) if m2 else 'UNKNOWN'
        ok = bool(title) and title != 'YouTube' and status in ('OK', 'LOGIN_REQUIRED')  # LOGIN_REQUIRED = age gate, still a real video
        seen[url] = (ok, f"{title.replace(' - YouTube', '')} [{status}]")
      except Exception as ex:
        seen[url] = (False, str(ex))
    ok, title = seen[url]
    if ok:
      keep.append(v)
    else:
      bad.append(f'{d["id"]}: {url} ({title})')
  if remove and len(keep) != len(d.get('videos', [])):
    d['videos'] = keep
    with open(f, 'w') as out:
      json.dump(d, out, ensure_ascii=False, indent=1); out.write('\n')
print(f'{len(seen)} unique videos checked, {len(bad)} bad')
for b in bad: print('BAD', b)
sys.exit(1 if bad and not remove else 0)
