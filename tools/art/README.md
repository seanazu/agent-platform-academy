# Course art

Cover dioramas and short intro clips, made with the Higgsfield CLI in the same visual family as the harness-lab
course (isometric clay diorama, floating slate platform, midnight navy background, small white robot with one visor).

Files: `scenes.py` (one scene line per id), `covers.py` (create image jobs), `fetch.py` (download and convert),
`clips.py` (part intro clips), `jobs.json` / `clips.json` (id -> Higgsfield job id). Full-size PNGs land in `src/`
(git-ignored); the app reads `public/art/<id>.webp`, `<id>-sm.webp`, `public/art/manifest.json` and `public/video/<part>.mp4`.

Needs `higgsfield` on PATH (logged in) and Pillow (`pip install pillow`). Run from the repo root:

```
python3 tools/art/covers.py                     # art: create jobs for every scene without one (2 credits each)
python3 tools/art/fetch.py                      # art:fetch: download finished covers, write webp + manifest
python3 tools/art/fetch.py --status             # just print job states
python3 tools/art/clips.py create               # art:clips: one clip per part from its cover job (5 credits each)
python3 tools/art/clips.py fetch                # art:clips:fetch: download finished clips to public/video
```

Regenerate one cover (edit its line in `scenes.py` first if the style drifted):

```
python3 tools/art/covers.py --only p3-2 --force
python3 tools/art/fetch.py --only p3-2          # once the job is completed; delete tools/art/src/p3-2.png first if it exists
```

Gotchas: never put `@` in a prompt or argument (the CLI treats it as a file reference and silently drops the style
reference); `generate wait` has no timeout, so the scripts poll `generate get`; the style reference upload id is
`REF` in `hf.py`, re-upload `harness-lab/tools/art/src/S0-ref.png` with `higgsfield upload create <png> --json` if it expires.
