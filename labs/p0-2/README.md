# Lab p0-2: Follow one ticket

Follow one ticket from the moment you assign it to Nova until a person may merge its PR, and write the rule that decides whose approval counts.

About 20 minutes. You need:

- Node 22+
- The course repo at ~/Projects/ai-agents-course

The ./academy commands work from the course folder and from this lab folder.

## 1. Guess

You (Sean) asked Nova for a change. Nova opened the PR, Byte (the review agent) approved it, and then you approved it too. May a person press Merge now?

- Yes, because the PR has two approvals.
- No. It still needs one approval from a person who did not ask for the change, like Dana.
- Yes, but only you may press Merge, because it is your ticket.

Pick one on the lesson page before you read any code. The page tells you why each answer is right or wrong.

## 2. Follow along

**1.** Start the lab first, because it copies a small simulated platform into a folder of your own, so you can't break the course.

```
cd ~/Projects/ai-agents-course && ./academy lab p0-2
```

You should see:

```
Created: ~/academy-labs/p0-2
Lab p0-2: Follow one ticket  about 20 minutes
…
Next: cd ~/academy-labs/p0-2 && node journey.mjs
```

**2.** Watch the ticket's journey, because every line is a real step on the platform: assign, poll, run, PR, review, approval.

```
cd ~/academy-labs/p0-2 && node journey.mjs
```

You should see:

```
  09:48  Nova       agent   opened draft PR #2512 "Empty projects table shows a No projects yet card"
  09:55  Byte       agent   reviewed PR #2512 and approved it (two small notes)
  10:02  Sean       person  approved PR #2512: "LGTM, ship it!"

Can a person merge PR #2512 now?
  nobody knows yet: canMerge says "TODO: canMerge is not written yet".
  … waiting for an approval… (writing canMerge is your Build it step)
```

**3.** The poll wrote down who asked for the change at the very start, so find that line in the data.

```
grep -n requester events.json
```

You should see:

```
16:    { "at": "09:01", "who": "poll", "type": "poll", "requester": "sean", "text": "noticed RH-1234 and wrote down who asked for it: Sean" },
```

**4.** Two approvals arrived, so look at who sent them, because that decides everything.

```
grep -n '"approve"' events.json
```

You should see:

```
19:    { "at": "09:55", "who": "byte", "type": "approve", "text": "reviewed PR #2512 and approved it (two small notes)" },
20:    { "at": "10:02", "who": "sean", "type": "approve", "text": "approved PR #2512: \"LGTM, ship it!\"" }
```

**5.** Ask the checker what is missing, because it tries eleven small stories against your canMerge and tells you which one goes wrong.

```
./academy check
```

You should see:

```
✘ canMerge is not written yet: approval.mjs still throws the TODO error, so replace that line with the three rules
  · 10 more checks wait until this one passes

→ stuck? ./academy hint
```

## 3. Build it

Open approval.mjs and write canMerge(pr, approvals) so it gives back { ok, reason }. Approvals from agents and bots never count, the requester's own approval never counts, and one approval from any other person is needed (one is enough). Run node journey.mjs: the answer is now no, because Byte is an agent and you (Sean) asked for the change. Then add Dana's approval as the last event in events.json, { "at": "10:20", "who": "dana", "type": "approve", "text": "approved PR #2512" }, and run it again: now the answer is yes. Finish with ./academy check.

Stuck? `./academy hint` gives one hint at a time, from a small nudge to almost the answer. `./academy diff` shows the answer next to your file.

## 4. Fix it

Last week someone made canMerge "simpler", and this morning a PR was merged after only Byte had approved it, so no person had looked at it. Run node journey.mjs --fix to see the wrong yes, then repair fix/approval.mjs so an agent's approval no longer counts.

Check it with `./academy check --fix`. Hints: `./academy hint --fix`.

## 5. Explain it

Run `./academy explain`. It asks these three questions one by one, saves your answers in `~/academy-labs/notes/`, and gives you a prompt to paste into Claude so it can tell you what you missed.

1. Why can't the person who asked for the change approve their own agent's PR?
2. Byte reviews every PR. Why doesn't Byte's approval count, even when Byte is right?
3. Why does the Jira poll write down who asked, at the very start, instead of looking it up when the PR is ready?

## Done when

./academy check passes and prints your pass code, and node journey.mjs says yes only after Dana approves.
