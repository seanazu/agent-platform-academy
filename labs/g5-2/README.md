# Lab g5-2: One red main, one fixer

Give every red build a fingerprint of its problem, so that all the builds that are red for the same reason join one fixer run, and builds with different problems never share one.

About 30 minutes. You need:

- Node 22+

The ./academy commands work from the course folder and from this lab folder.

## 1. Guess

Main went red because of one broken test, and then 5 people pushed. All 5 builds fail on that same test. If the fixer's workflow ID is cifix:fcp:<hash of the whole failure record>, how many fixer runs start?

- 1, because it is the same problem.
- 5, one for every red build.
- 0, because Temporal refuses to start the same thing twice.

Pick one on the lesson page before you read any code. The page tells you why each answer is right or wrong.

## 2. Follow along

**1.** Start the lab first, because it copies 7 real-looking red builds and the code into a folder of your own.

```
cd ~/Projects/ai-agents-course && ./academy lab g5-2
```

You should see:

```
Created: ~/academy-labs/g5-2
Lab g5-2: One red main, one fixer  about 30 minutes
…
Next: cd ~/academy-labs/g5-2 && node storm.mjs
```

**2.** See the storm first, because that is the bug you will fix: every red build gets its own fixer.

```
cd ~/academy-labs/g5-2 && node storm.mjs
```

You should see:

```
7 red builds on main → 7 fixer runs  a storm of fixers

  cifix:fcp:b369a1fd9ada  ■      1 build   runs 18823011
      unit-tests: (firstError is not written yet)
  cifix:fcp:3600d2999e30  ■      1 build   runs 18823377
      unit-tests: (firstError is not written yet)
  … five more, one per build
```

**3.** Look at the 7 builds side by side, because some fields change on every build and some stay the same.

```
node peek.mjs
```

You should see:

```
run id     pushed    last green  started               failing job
18823011   4b7e2a9   9f2c4e1     2026-10-14T10:00:58Z  unit-tests
18823377   c1d2e3f   9f2c4e1     2026-10-14T10:24:11Z  unit-tests
…
18825560   3c4d5e6   9f2c4e1     2026-10-14T12:31:20Z  check
18826021   aa11bb2   9f2c4e1     2026-10-14T13:02:09Z  check
```

**4.** Compare the first error line of two builds with the same broken test, because every difference between them is something you must remove.

```
node peek.mjs 18823011 | grep FAIL && node peek.mjs 18824410 | grep FAIL
```

You should see:

```
2026-10-14T10:01:22.2113356Z  FAIL  /tmp/ci-8sK2pq/fcp/frontend/src/components/ProjectsTable/ProjectsTable.test.tsx > ProjectsTable > shows a "No projects yet" card when there are no projects 48ms
2026-10-14 11:20:15.668  FAIL  /tmp/ci-Wq81mC/fcp/frontend/src/components/ProjectsTable/ProjectsTable.test.tsx > ProjectsTable > shows a "No projects yet" card when there are no projects 1.2s
```

**5.** Ask the checker, because it changes one thing at a time in a real build and tells you which part your fingerprint must keep or drop.

```
./academy check
```

You should see:

```
✔ fingerprint gives back a short hex string, and the same one every time
✘ firstError is not written yet: fingerprint.mjs still throws the TODO error there
✘ 7 red builds made 7 fixer runs: the 5 builds with the same broken test got 5 different fingerprints, …
✘ two builds that differ only in the pushed commit got different fingerprints: …
…
  · 7 more checks fail too. Fix the ones above first; they often fix the rest.
```

## 3. Build it

Open fingerprint.mjs and write three small functions. firstError(log) gives back the first line that says error or fail. normalise(line) removes what changes on every run: timestamps (in both formats), temp folders like /tmp/ci-8sK2pq, and durations like 48ms or 1.2s. fingerprint(failure) hashes lastGreenSha plus one line per failing job, "job name | normalised first error", sorted, and gives back the first 12 hex characters. Run node storm.mjs until it says 7 red builds on main → 3 fixer runs, then run ./academy check, which also tries 3 red builds you have not seen.

Stuck? `./academy hint` gives one hint at a time, from a small nudge to almost the answer. `./academy diff` shows the answer next to your file.

## 4. Fix it

Last night someone wanted "more precise" fixers, so they added the pushed commit to the fingerprint. This morning main went red, ten people pushed, and ten fixer runs started on the same broken test, each one with its own PR. Run node storm.mjs --fix to see the storm, then repair fix/fingerprint.mjs.

Check it with `./academy check --fix`. Hints: `./academy hint --fix`.

## 5. Explain it

Run `./academy explain`. It asks these three questions one by one, saves your answers in `~/academy-labs/notes/`, and gives you a prompt to paste into Claude so it can tell you what you missed.

1. Why does the fixer's workflow ID come from a fingerprint of the problem, and not from the build that failed?
2. Name two things you strip before hashing and two things you keep. Why does each one belong on its side?
3. Main turned green again, and an hour later the same test broke again. Should that start a new fixer, or join the old one? Why?

## Done when

node storm.mjs shows 7 red builds on main → 3 fixer runs, and ./academy check passes, also on the hidden builds.
