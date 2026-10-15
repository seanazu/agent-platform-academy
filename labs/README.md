# Labs

Hands-on labs for the Agent Platform Academy, in the style of CodeCrafters and Rustlings: one command starts a lab,
a checker runs on your own machine and says exactly what is wrong, and hints come one at a time.

Every lab has five steps:

1. **Guess**: a question on the lesson page, answered before you read any code.
2. **Follow along**: real commands with the output you should see.
3. **Build it**: you write a small piece of real code until `./academy check` passes.
4. **Fix it**: code that is broken on purpose, with a short story of what went wrong.
5. **Explain it**: three questions in your own words, and a prompt to ask Claude what you missed.

## Commands

Run them from the course folder. Each lab folder also gets an `academy` link, so they work there too.

| Command | What it does |
|---|---|
| `./academy lab <id>` | Copies `labs/<id>/start/` to `~/academy-labs/<id>/` (and `fix/` into it), runs `npm install` when there is a `package.json`, and prints the goal, the steps and the next command. An existing folder is kept; `--fresh` starts over. |
| `./academy check` | Runs `labs/<id>/check.mjs` on your folder: one `✔` or `✘` line per check. When everything passes it prints a pass code `APA-<id>-<6 hex>` for the lesson page. Exit code 0 or 1. |
| `./academy check --fix` | The same checks, on `~/academy-labs/<id>/fix/`. |
| `./academy hint` | The next hint from `hints.md` (`--fix` for the Fix it hints). It remembers how many you have seen. |
| `./academy diff` | Your file next to `labs/<id>/solution/` (`--fix` compares the fix folder). |
| `./academy explain` | Asks the questions in `explain.md`, saves the answers in `~/academy-labs/notes/<id>.md`, and prints a prompt for Claude. |
| `./academy solve <id>` | For authors and CI: copies the solution into a temporary folder and checks it. |
| `./academy selftest` | For CI: for every lab, the untouched `start/` and `fix/` must fail with the intended message, and both must pass once the solution is copied in. Also checks `hints.md` and `lesson-lab.json`. |

The lab id is optional after the first `./academy lab <id>`: the tool uses the lab folder you are in, or else the
last lab you started (`~/academy-labs/.current`).

Needs Node 22 or newer. No global installs and no packages: `labs/cli.mjs` is plain ESM, and `./academy` is a
small sh wrapper around it. Colour is used only when the output is a terminal (and never with `NO_COLOR`).

## Run the self-test in CI

```sh
./academy selftest
```

It must pass before a lab change is merged. Labs that need Temporal (`export const needs = ['temporal']`) use the
server on `TEMPORAL_ADDRESS` (default `localhost:7233`); when nothing listens there and the `temporal` CLI is
installed, the self-test starts a throwaway dev server and stops it afterwards.

## Add a lab

Create `labs/<id>/` (the id is the lesson id) with:

| File | What goes in it |
|---|---|
| `README.md` | The learner's guide: goal, time, the five steps. It is copied into the lab folder. |
| `lesson-lab.json` | The same content as data for the lesson page: `id, title, minutes, needs, goal, guess {q, options[{text, correct, why}]}, follow[{say, do, see}], build, fix, explain[3], done`. `./academy lab` reads the title, goal and steps from here. |
| `start/` | What the learner starts with. Small, real, runnable code with a `TODO` where the Build it step goes. |
| `solution/` | Only the files the learner changes, in their finished form. `diff` and `solve` use it. |
| `fix/` | The same file(s), broken on purpose, plus a `README.md` with the story. |
| `check.mjs` | The checks, used for both `check` (build) and `check --fix`. See below. |
| `hints.md` | A `# Build it` section and a `# Fix it` section; hints inside a section are separated by `---` lines, from a nudge to almost the answer. |
| `explain.md` | Three numbered questions (`1. ...`). |

`check.mjs` exports:

```js
export const expect = { start: '...', fix: '...' }; // text the selftest expects in a ✘ line of the untouched start/ and fix/
export const celebrate = '...';                     // printed when the build passes
export const fixed = '...';                         // printed when the fix passes
export const needs = ['temporal'];                  // optional
export const prepare = async (ctx) => {};           // optional: load code, connect; throw new Error('plain message') to stop
export const cleanup = async (ctx) => {};           // optional: always runs
export const checks = [
  { pass: 'what is true when it passes', gate: true, run: async (ctx) => undefined /* or { what, why } */ },
];
```

`ctx` has `dir` (the folder being checked), `mode` (`build` or `fix`), `lab` (the `labs/<id>` folder) and
`load(file)`, which imports a learner file fresh and turns a syntax error into one plain sentence. A failing check
prints `✘ <what>: <why>`, so write `what` as what happened and `why` as the cause in plain words. A `gate` check
stops the rest when it fails. Only the first five failures are printed.

Write for a reader whose first language is not English: short connected sentences with "because" and "so", no
jargon labels, and no ticket keys in the explanations.
