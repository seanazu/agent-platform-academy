#!/usr/bin/env python3
"""Attach verified YouTube videos (content/videos.json, a list of {topic, title, url, channel, minutes, year, why})
to lessons that have none, by topic number. At most 2 videos per lesson. Run after the lessons are written:
python3 tools/attach_videos.py"""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
videos = json.load(open(ROOT / 'content/videos.json'))

# topic number (from the video search brief) -> lesson ids that should show it
TOPIC_TO_LESSONS = {
  1: ['p1-2', 'p1-3'], 2: ['p1-6'], 3: ['p1-5'], 4: ['p1-7'], 5: ['p1-1'], 6: ['p1-8'],
  7: ['p2-1', 'p2-2'], 8: ['p2-3'], 9: ['p2-4'], 10: ['p3-1', 'p3-2', 'p3-3'], 11: ['p3-4'], 12: ['p3-5'],
  13: ['p4-1'], 14: ['p4-2'], 15: ['p4-4'], 16: ['p5-1'], 17: ['p5-2'], 18: ['p5-3'], 19: ['p4-5'],
  20: ['p6-1'], 21: ['p6-2', 'p6-3'], 22: ['p7-1'], 23: ['p7-2', 'p7-3'], 24: ['p8-1'], 25: ['p8-3'],
  26: ['p12-1', 'p12-2'], 27: ['p9-1'], 28: ['p2-5', 'p9-3'], 29: ['p9-2'], 30: ['p10-1'], 31: ['p10-2'],
  32: ['p10-3'], 33: ['p10-4'], 34: ['p11-1'], 35: ['p12-3'], 36: ['g4-4'], 37: ['p3-5'],
}
# Walkthrough refreshers: one video per lesson, for the main tool the lesson builds with.
WALK = {
  'g0-3': 7, 'g0-5': 1, 'g1-1': 20, 'g1-3': 21, 'g2-2': 35, 'g3-2': 13, 'g3-3': 22, 'g3-4': 9, 'g3-5': 15, 'g3-6': 19,
  'g3-7': 11, 'g3-8': 12, 'g3-9': 24, 'g3-10': 23, 'g3-12': 22, 'g3-13': 27, 'g3-16': 34, 'g4-1': 29, 'g4-5': 25,
  'g4-7': 35, 'g5-2': 23, 'g6-4': 26, 'g6-6': 27, 'g7-1': 31, 'g7-2': 33, 'g7-4': 32, 'g7-8': 13, 'g8-1': 26, 'g8-4': 35,
}
for lid, topic in WALK.items():
  TOPIC_TO_LESSONS.setdefault(topic, []).append(lid)

by_topic = {}
for v in videos:
  by_topic.setdefault(v['topic'], []).append(v)

changed = 0
for topic, lessons in TOPIC_TO_LESSONS.items():
  for lid in lessons:
    f = ROOT / 'content/lessons' / f'{lid}.json'
    if not f.exists():
      continue
    d = json.load(open(f))
    have = {x['url'] for x in d.get('videos', [])}
    for v in by_topic.get(topic, []):
      if len(d['videos']) >= (1 if lid.startswith('g') else 2):
        break
      if v['url'] in have:
        continue
      d['videos'].append({'title': v['title'], 'url': v['url'], 'channel': v['channel'], 'minutes': v.get('minutes'), 'why': v['why']})
      have.add(v['url']); changed += 1
    with open(f, 'w') as out:
      json.dump(d, out, ensure_ascii=False, indent=1); out.write('\n')
print('attached', changed, 'videos')
