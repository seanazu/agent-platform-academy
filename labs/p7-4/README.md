# Lab p7-4: One ticket, one run

Make every trigger for the same ticket land in one Temporal run, by naming the run after the ticket and joining the run that is already open.

About 25 minutes. You need:

- Node 22+
- The temporal CLI (brew install temporal)
- Three terminal tabs
- About 150 MB of disk for the Temporal packages

The ./academy commands work from the course folder and from this lab folder.

## 1. Guess

The Jira poll, Slack /nova and a Jira comment all ask Nova to work on the same ticket within one minute. The run's ID is nova:RH-1234 and you did not set a conflict policy. What happens?

- Three runs start, and Nova does the work three times.
- The first trigger starts the run, and the second and third get a WorkflowExecutionAlreadyStartedError.
- The last trigger wins: it stops the first run and starts a new one.

Pick one on the lesson page before you read any code. The page tells you why each answer is right or wrong.

## 2. Follow along

**1.** Start the lab first, because it copies the code into a folder of your own and installs the Temporal packages.

```
cd ~/Projects/ai-agents-course && ./academy lab p7-4
```

You should see:

```
Created: ~/academy-labs/p7-4
added 150 packages in 22s
Lab p7-4: One ticket, one run  about 25 minutes
…
Next: temporal server start-dev
```

**2.** Temporal keeps every run, so start a small Temporal server on your laptop. Leave this terminal open.

```
temporal server start-dev
```

You should see:

```
Temporal CLI 1.9.1 (Server 1.32.0, UI 2.54.1)

Temporal Server:      localhost:7233
Temporal Persistence: in-memory
Temporal UI:          http://localhost:8233
```

**3.** Nova's worker runs the code of every run on the ai-agents-nova queue, so start it in a second terminal and leave it open too.

```
cd ~/academy-labs/p7-4 && node worker.mjs
```

You should see:

```
Nova's worker is listening on the ai-agents-nova queue. Leave this terminal open (Ctrl+C stops it).
```

**4.** In a third terminal, fire three triggers for one ticket, because that is what happens on a busy morning.

```
cd ~/academy-labs/p7-4 && node triggers.mjs
```

You should see:

```
Jira poll     → ID a2337fcc-c20e-4b87-937d-727bfa41c04f   run 1287c26d
Slack /nova   → ID 7a4ca0ce-e7bd-41aa-a3a2-4e4bbfda734a   run 23128d04
Jira comment  → ID adc04cfe-0865-40b1-b18d-a6e37cbdefae   run a8e8907c

3 triggers for RH-1234 → 3 runs
(your IDs are different, because they are random; the worker terminal says "Nova started working on RH-1234" three times)
```

**5.** Ask Temporal what is open, so you see the problem with your own eyes: three runs for one ticket.

```
temporal workflow list --query "ExecutionStatus='Running'"
```

You should see:

```
  Status                WorkflowId                  Type     StartTime
  Running  adc04cfe-0865-40b1-b18d-a6e37cbdefae  ticketToPr  now
  Running  7a4ca0ce-e7bd-41aa-a3a2-4e4bbfda734a  ticketToPr  now
  Running  a2337fcc-c20e-4b87-937d-727bfa41c04f  ticketToPr  now
```

**6.** Clean the board, because the next steps need a fresh start.

```
node clean.mjs
```

You should see:

```
Stopped 3 open runs. The board is clean.
```

**7.** Now see what Temporal does with the same ID twice when you set no policy, because USE_EXISTING will replace this error.

```
node try-default.mjs
```

You should see:

```
first start  → ID demo:RH-1234   run b7492f2e
second start → WorkflowExecutionAlreadyStartedError

With a fixed ID, Temporal refuses a second open run. Its default answer is this error.
USE_EXISTING changes the answer: "here is the run that is already open".
```

## 3. Build it

Open start-run.mjs and change three options: workflowId becomes `${agent}:${thing}`, taskQueue becomes `ai-agents-${agent}`, and add workflowIdConflictPolicy: WorkflowIdConflictPolicy.USE_EXISTING. Run node clean.mjs && node triggers.mjs: all three triggers now show the ID nova:RH-1234 with the same run, and the summary says 3 triggers for RH-1234 → 1 run. Approve that run to finish the story, temporal workflow signal --workflow-id nova:RH-1234 --name approve --input '"Dana"', and watch the worker terminal say "Dana approved RH-1234". Finish with ./academy check while the dev server is still running.

Stuck? `./academy hint` gives one hint at a time, from a small nudge to almost the answer. `./academy diff` shows the answer next to your file.

## 4. Fix it

Someone wanted the newest trigger to win, so they changed one word in startRun. Today Nova worked on a ticket for 40 minutes, then Sean typed /nova in Slack to ask how it was going, and Nova started again from zero. Run node clean.mjs && node triggers.mjs --fix to see two TERMINATED runs, then repair fix/start-run.mjs so a new trigger joins the open run.

Check it with `./academy check --fix`. Hints: `./academy hint --fix`.

## 5. Explain it

Run `./academy explain`. It asks these three questions one by one, saves your answers in `~/academy-labs/notes/`, and gives you a prompt to paste into Claude so it can tell you what you missed.

1. Why is the run's workflow ID nova:RH-1234 and not a random ID?
2. A second trigger arrives while the run is still open. What does each policy do: the default (FAIL), USE_EXISTING, and TERMINATE_EXISTING?
3. Why should the platform never use TERMINATE_EXISTING for an agent's run?

## Done when

Three triggers for one ticket show one run, ./academy check passes, and you stopped the worker and the dev server with Ctrl+C.

## When you are done

Press Ctrl+C in the worker terminal and in the dev server terminal. The dev server keeps everything in memory, so stopping it clears every run.
