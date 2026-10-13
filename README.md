# Agent Platform Academy

A guided course that teaches how to build Rhino Health's AI-agent platform, one picture at a time.
The app is a static React site (Vite + React 19 + TypeScript, hand-written CSS, hash routing, no server).

## Run it

```sh
npm install
npm run dev        # http://localhost:4310
npm run build      # typecheck + production build into dist/ (also refreshes public/tickets/)
npm run preview    # serve dist/ on http://localhost:4311
npm run typecheck  # tsc --noEmit
npm run test:e2e   # Playwright (Chrome); starts the dev server itself
npm run shots      # screenshots of every view at 1440 and 390 px into tools/shots/
```

Node 22+ and Google Chrome (Playwright uses the `chrome` channel).

## Routes

| Hash | What it shows |
|---|---|
| `#/` | Hero, course goal, "continue where you left off", and the path: one card per part with cover, tagline, lesson count and progress |
| `#/part/<id>` | A part: intro video (if present), tagline, lesson list with goals and done state |
| `#/lesson/<id>` | A lesson: cover, bridge, intro, the picture (step by step), sections with code and notes, lab (worked / faded / alone), check yourself, recall, videos, words, tickets, remember, mark done, previous / next |
| `#/tickets` (`?k=G0-09` focuses one) | The ticket map: all 242 tickets by goal, team chips, days, the lesson that teaches each one, and "You can do N of 242" |
| `#/words` | Glossary of every `words` entry across lessons, searchable |
| `#/search` | Search lesson titles, section headings and words |

Progress (done lessons, quiz answers, last lesson) lives in `localStorage` under `apa.progress.v1`; the theme under `apa.theme`.

## Where content lives

- `content/course.json`: parts → lessons, accents, kinds, and `ticketToLesson`.
- `content/lessons/<lesson id>.json`: one file per lesson, in the shape of `content/SCHEMA.md`. Validate with
  `python3 tools/check_content.py <id>`.
- The app loads lessons with `import.meta.glob('../../content/lessons/*.json', { query: '?raw' })` and parses
  them at runtime, so a half-written or invalid file shows "This lesson is being written" instead of breaking
  the build. A lesson with no file shows its title, goal and covers in the same state.
- `src/sample/*.json`: two sample lessons (`p7-2`, `g0-3`) used only by the dev server, and only when
  `content/lessons` has no file for that id. They never ship in the build.
- Tickets: `tools/copy_tickets.mjs` copies `~/Desktop/agentic-plan-app/tickets/g*.json` into `public/tickets/`
  before `dev` and `build` (set `TICKETS_DIR` to use another folder; when the source is missing, the copies
  already in `public/tickets/` are kept). The ticket map fetches them at runtime.

## Adding art and video

Every image slot has a fixed aspect ratio and a drawn fallback, so a missing file never changes the layout.

| File | Where it shows | Ratio |
|---|---|---|
| `public/art/hero.webp` | Home hero | 21:9 |
| `public/art/<part id>.webp` | Part card on the home page, part page poster | 16:9 |
| `public/art/<lesson id>.webp` | Lesson cover | 16:9 |
| `public/video/<part id>.mp4` | Part page intro (muted, looping, poster = the part cover) | 16:9 |

Drop the file in; nothing else to change.

## The no-jump rule

Nothing a reader clicks changes the height of the box it is in:

- `src/components/Stack.tsx` renders every variant of a tab set, quiz feedback or picture step in the same grid
  cell and shows one, so the box is always as tall as the tallest variant.
- `src/lib/stable.ts` (`useGrowOnly`) lets lists that filter (tickets, words, search) only grow.
- Image and video boxes have a fixed `aspect-ratio`; the picture stage is sized from its viewBox.
- Code blocks render plain text first, at the final line height, and the highlighter colours it later.

`tests/nojump.spec.ts` clicks every picture step, lab tab and quiz option at 1440 px and 390 px and fails if any
`[data-stable]` box moves by more than 2 px.

## Layout

- `src/components/`: one component per file (function declarations).
- `src/lib/`: course data, lesson loading, progress, router, theme, highlighting, tickets.
- `src/styles/tokens.css`: colours (light and dark), fonts, accents per part. `src/styles/app.css`: everything else.
- `tests/`: Playwright specs. `tools/`: content checker, ticket copier, screenshot script.
