# Lesson files

Every lesson has two files:

- `content/lessons/<id>.json`: the lesson itself (story, explanation, lab, checkpoint).
- `content/clips/<id>.json`: the video clips and the practice drills.

The islands app (`#/islands`) shows a lesson in six steps the learner can open in any order:
Story · Watch · Understand · Practice · Build · Checkpoint. Voice and shape: `content/STYLE.md`. Canon names and the
journey of ticket RH-1234: `content/STORY.md`. Check both files with `python3 tools/check_v2.py <id>`.
Model lessons: `p7-4` (written first, the reference for voice), `g5-2`, `p0-2`, with their clips files.

## content/lessons/<id>.json

```jsonc
{
  "v": 2,
  "id": "p7-4",                      // from course.json
  "title": "One ticket, one run",    // from course.json
  "minutes": 40,                     // honest: clips + reading + practice + lab
  "youNeed": ["p7-3"],               // 0-3 earlier lesson ids
  "map": "temporal",                 // a platform-map.json piece id

  "hook": {                          // Story step
    "story": ["One or two short paragraphs: a scene with a problem the learner can feel."],
    "question": "The question this lesson answers, in the learner's words."
  },

  "play": {                          // optional: only when one of the simulators in src/widgets/index.ts fits
    "widget": "id-policy", "intro": "One sentence.", "tasks": [ { "kind": "guess", "text": "..." } ]
  },

  "read": [                          // Understand step: 2-5 short sections in teaching order
    {
      "h": "Heading",
      "p": ["Connected paragraphs."],
      "code": { "lang": "typescript", "file": "path", "text": "...", "notes": [ { "line": 3, "text": "only lines that need it" } ] },
      "see": "exact output after a command (optional)",
      "deeper": { "h": "Go deeper: ...", "p": ["..."] }        // optional, closed by default
    }
  ],

  "lab": {                           // Build step
    "id": "p7-4", "title": "...", "minutes": 25, "needs": ["Node 22+"], "goal": "One sentence.",
    "mode": "guided",                // "checked" only when labs/<id>/ exists with ./academy check; otherwise "guided"
    "guess": { "q": "...", "options": [ { "text": "...", "correct": true, "why": "..." } ] },
    "follow": [ { "say": "why this step", "do": "the command or the edit", "see": "the output you should see" } ],
    "build": "A new small task of the same shape, done without help.",
    "checks": ["Guided labs: 3-6 things the learner can verify themselves, e.g. 'terraform plan shows 1 to add, 0 to change'."],
    "solution": { "lang": "typescript", "file": "...", "text": "..." },   // guided labs: one possible answer
    "fix": "A broken-on-purpose story: what is broken and what the learner should find.",
    "explain": ["Three questions that make the learner explain why it works."],
    "done": "One sentence the learner can check."
  },

  "check": [ { "q": "...", "options": [ { "text": "...", "correct": false, "why": "..." } ] } ],  // Checkpoint: exactly 3
  "platform": { "p": ["How our platform uses this idea. Ticket keys are allowed here only."], "tickets": [ { "key": "G3-25", "why": "..." } ] },
  "words": [ { "term": "conflict policy", "plain": "..." } ],     // 3-6, each also explained in the text
  "review": [ { "q": "A small task that comes back later", "a": "What a good answer contains" } ],   // 2-3
  "remember": "One sentence."
}
```

Labs run only on the learner's laptop with free tools (Node, Docker, git, the temporal CLI, kind, terraform with no
cloud, LocalStack, a scratch GitHub repo). Never real company systems, never anything that costs money.

## content/clips/<id>.json

```jsonc
{
  "lesson": "p7-4",
  "clips": [                         // Watch step: 2-4 clips, about 6-15 minutes in total, in watching order
    {
      "videoId": "JpBNKuYMB10", "title": "exact video title", "channel": "...",
      "start": 374, "end": 485, "minutes": 1.9,
      "verified": "transcript",      // "transcript" when start/end/quote come from the transcript, "chapters" when from chapters
      "why": "One sentence: why this clip is here.",
      "look": ["2-3 short 'watch for' points tied to this lesson"],
      "after": "One sentence that connects the clip back to our platform.",
      "quote": "A short phrase (12 words or fewer) said inside the clip (transcript-verified clips only)."
    }
  ],
  "practice": [                      // Practice step: 4-6 drills about the idea, not trivia
    { "kind": "choice", "q": "...", "options": [ { "text": "...", "correct": true, "why": "..." } ] },
    { "kind": "fill", "q": "...", "before": "text before the blank", "after": "text after", "answers": ["accepted", "answers"], "hint": "...", "why": "..." },
    { "kind": "order", "q": "Put these in order", "items": ["first", "second", "third"], "why": "..." }
  ]
}
```

Find and check videos with `python3 tools/yt.py` (search, meta with chapters and embeddability, transcript, grep).
Never invent a timestamp: every start and end comes from a transcript or from the video's chapters.
