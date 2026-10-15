# Lesson files, format v2

A v2 lesson is `content/lessons/<id>.json` with `"v": 2`. The app renders v1 lessons with the old page until each one
is rewritten. Types live in `src/lib/types.ts` (`LessonV2`). Voice and shape: `content/STYLE.md`. Check a lesson with
`python3 tools/check_v2.py <id>`.

```jsonc
{
  "v": 2,
  "id": "p7-4",                      // from course.json
  "title": "One ticket, one run",    // from course.json (update course.json when a lesson is renamed or split)
  "minutes": 35,                     // honest: watch + play + read + lab
  "youNeed": ["p7-3"],               // 0–3 earlier lesson ids
  "map": "temporal",                 // platform-map.json piece lit up on the "you are here" map

  "hook": {
    "story": ["One or two short paragraphs: a scene with a problem he can feel."],
    "question": "The question this lesson answers, in his words."
  },

  "watch": {
    "scene": {
      "cols": 4, "rows": 3,          // a small grid; place actors so the story reads left→right, top→bottom
      "actors": [ { "id": "poll", "label": "Jira poll", "kind": "service", "at": [0, 0], "sub": "every minute" } ],
      "links": [ { "from": "poll", "to": "temporal" } ]   // faint roads drawn from the start; arrows mean "sends to"
    },
    "chapters": [                    // 2–3 chapters, each under 6 minutes spoken
      {
        "title": "Two triggers, one ticket",
        "lines": [
          { "say": "One to three sentences, written to be heard.", "cue": { "focus": ["poll"] } }
        ],
        "check": { "q": "…?", "options": [ { "text": "…", "correct": true, "why": "…" } ] }   // optional, shown at the chapter end
      }
    ]
  },

  "play": {
    "widget": "id-policy",           // a key of WIDGETS in src/widgets/index.ts
    "intro": "One sentence: what to do here.",
    "config": {},                    // optional, widget-specific
    "tasks": [ { "kind": "guess", "text": "…" }, { "kind": "break", "text": "…" } ]
  },

  "read": [                          // 2–5 short sections in teaching order
    {
      "h": "Heading",
      "p": ["Connected paragraph.", "Another."],
      "code": { "lang": "typescript", "file": "path", "text": "…", "notes": [ { "line": 3, "text": "only lines that need it" } ] },
      "see": "exact output after a command (optional)",
      "deeper": { "h": "Go deeper: …", "p": ["…"], "code": { } }   // optional, closed by default
    }
  ],

  "lab": {                           // generated with the lab: labs/<id>/lesson-lab.json
    "id": "p7-4", "title": "…", "minutes": 25, "needs": ["Node 22+"], "goal": "…",
    "guess": { "q": "…", "options": [ { "text": "…", "correct": true, "why": "…" } ] },
    "follow": [ { "say": "why this step", "do": "command or edit", "see": "exact output" } ],
    "build": "The task, checked by ./academy check.",
    "fix": "The broken-on-purpose story, checked by ./academy check --fix.",
    "explain": ["…", "…", "…"],
    "done": "One sentence he can check."
  },

  "check": [ { "q": "…", "options": [ { "text": "…", "correct": false, "why": "…" } ] } ],   // 2–3, one correct each
  "platform": { "p": ["How our platform uses this idea. Ticket keys are allowed here."], "tickets": [ { "key": "G3-25", "why": "…" } ] },
  "words": [ { "term": "conflict policy", "plain": "…" } ],                  // ≤ 6, each also explained in the text
  "videos": [ { "title": "…", "url": "https://www.youtube.com/watch?v=…", "channel": "…", "minutes": 7, "start": 95, "end": 260, "why": "…" } ],
  "review": [ { "q": "A small task that comes back later", "a": "What a good answer contains" } ],
  "remember": "One sentence."
}
```

## Cues

Cues change the drawing at the moment their line starts. The drawing's state at any line is all cues up to that line
applied in order, so scrubbing backwards always shows the right picture.

| cue | effect |
|---|---|
| `focus: [ids]` | these actors light up; the rest dim. `[]` clears focus. |
| `send: {from, to, label?, tone?}` | a token travels along the road from one actor to another, with an optional label |
| `mark: {id, badge, tone?}` | a small badge on an actor ("run open", "joined ×2", "$4") that stays until `unmark` |
| `unmark: id` | removes the badge |
| `fail: id` / `heal: id` | the actor turns red with a cross, or back to normal |
| `caption: "text"` | a key phrase shown large under the drawing until the next caption |
| `reset: true` | clears badges, failures, focus and caption |

Tones: `ok` (green), `bad` (red), `accent` (the part's colour).

## Ticket cards

`content/cards/<KEY>.json`, type `TicketCardData` in `src/lib/types.ts`: goal, the outcome a user sees, what must be
merged first and how to prove it, the access needed and who gives it, decisions to make first (with an owner and a
fallback), files with complete code, numbered steps with commands and output, how to prove it works, plan gaps, the PR
checklist, rollback, and a ready-to-paste Claude Code prompt.
