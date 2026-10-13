# Lesson files: `content/lessons/<lesson id>.json`

One file per lesson in `content/course.json`. The app renders exactly these fields. Validate with
`python3 tools/check_content.py <lesson id>` (no arguments = every lesson).

```jsonc
{
  "id": "p7-2",                       // from course.json; do not change
  "title": "Writing a workflow",      // from course.json; do not change
  "minutes": 35,                      // honest reading + lab time, 15–60
  "youNeed": ["p7-1", "p1-6"],        // lesson ids to finish first (0–3). Foundations only name earlier lessons.
  "bridge": "A Temporal workflow is like a React component as a state machine: a pure function re-run from its history. Except: it replays a stored event log, so no Date.now(), Math.random() or I/O inside it.",
                                      // 1–3 sentences: "X is like Y you know, except Z". Z is required.
  "intro": "2 or 3 short sentences: what this lesson is about and why it matters for the platform.",
  "picture": {                        // the one drawing to understand before any code
    "caption": "One sentence under the drawing.",
    "nodes": [                        // 3–8 boxes. kind: person | agent | machine | service | file | cloud | check
      { "id": "wf", "label": "ticketToPr workflow", "kind": "service" },
      { "id": "act", "label": "acquireSandbox activity", "kind": "service" }
    ],
    "steps": [                        // 3–8 arrows, shown one at a time with a Next button
      { "from": "wf", "to": "act", "text": "asks for a lite VM (an activity call)" }
    ]
  },
  "sections": [                       // 4–8 sections, in teaching order
    {
      "h": "Short heading (≤ 8 words)",
      "p": ["Paragraph of ≤ 4 sentences.", "Another paragraph."],   // 1–4 paragraphs
      "because": "One sentence that starts with why we do this (optional, but required before any code block).",
      "code": {                       // optional. ≤ 25 lines. Real code in the style of the tickets.
        "lang": "typescript",         // typescript | javascript | yaml | hcl | python | bash | json | toml | markdown | text
        "file": "ai-agents/orchestrator/src/workflows/ticket-to-pr.ts",
        "text": "import { proxyActivities } from \"@temporalio/workflow\";\n...",
        "notes": [                    // one note per important line (≥ 3 per block). line is 1-based.
          { "line": 1, "text": "Plain words: what this line does and why it is here." }
        ]
      },
      "see": "Optional: the exact output the reader should see after a command (≤ 8 lines).",
      "ifInstead": "Optional: 'If instead you see X, then Y' for the one most likely error.",
      "callout": { "kind": "why", "text": "..." }   // optional. kind: why | gotcha | tip | wall
    }
  ],
  "lab": {                            // hands-on on the laptop. Three rungs: worked, faded, alone.
    "title": "Run a workflow on your laptop",
    "youNeed": ["Node 24", "Docker Desktop", "temporal CLI (brew install temporal)"],
    "worked": [                       // 4–10 steps, each with the command and what you should see
      { "do": "temporal server start-dev", "see": "Server:  localhost:7233\nUI:      http://localhost:8233" }
    ],
    "faded": "The same task with the last step left to the reader: say exactly what is left out.",
    "alone": "A new small task of the same shape, done without help. One paragraph.",
    "done": "What success looks like, in one sentence the reader can check."
  },
  "quiz": [                           // exactly 3. One correct answer each. Vary its position.
    { "q": "...?", "options": [ { "text": "...", "correct": true, "why": "..." }, { "text": "...", "correct": false, "why": "..." }, { "text": "...", "correct": false, "why": "..." } ] }
  ],
  "recall": ["One question from the previous lesson.", "One from an earlier lesson."],   // 1–2, answered from memory
  "videos": [                         // 0–3 real YouTube videos. Only from content/videos.json (verified) or verified yourself.
    { "title": "...", "url": "https://www.youtube.com/watch?v=...", "channel": "...", "minutes": 12, "why": "≤ 16 words" }
  ],
  "words": [ { "term": "activity", "plain": "One sentence in plain words." } ],   // 3–7 new terms, each also explained in the text
  "tickets": [                        // walkthrough lessons: every ticket in course.json's `covers`, in build order.
    {                                 // foundation lessons: 0–4 tickets this lesson unlocks (title + why only).
      "key": "G3-24",
      "why": "One sentence: what this lesson taught that this ticket needs.",
      "walk": [                       // walkthrough lessons only: 3–8 plain steps of how we will do the ticket, each naming the file or command.
        "Create orchestrator/src/workflows/ticket-to-pr.ts with the workflow function (code above)."
      ]
    }
  ],
  "remember": "One sentence to remember from this lesson."
}
```

Rules the checker enforces: all required fields; sizes above; every code block has ≥ 3 notes and ≤ 25 lines; every
`tickets[].key` of a walkthrough lesson matches `covers` in course.json; quiz has 3 questions with exactly one
correct; sentences ≤ 22 words (warning); no em dashes; no "simply", "just", "obviously", "easy".
