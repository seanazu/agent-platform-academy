# How to write a lesson (read before writing)

Who reads this: Sean, a frontend engineer (React, TypeScript, Playwright, git, GitHub PRs). Not a native English
speaker. New to everything else in this course. He wants to be able to do every one of the 242 tickets himself.
Write as a patient senior engineer sitting next to him, explaining from scratch, step by step.

## Voice
1. Plain English, short sentences (≤ 20 words), one idea per sentence, active voice, present tense, "you" and "we".
2. No marketing words, no cleverness, no "simply", "just", "obviously", "easy", "straightforward". No em dashes.
3. Explain every technical word the first time, in the same sentence or the next. Then use the same word every time.
   Assume he knows: React, TypeScript, npm, git, PRs, Playwright, basic HTTP and JSON. Assume nothing else.
4. Never invent facts. Numbers, names, paths, commands and settings come from the tickets
   (`~/Desktop/agentic-plan-app/tickets/g*.json`), the stack guide (`ts_platform.md`), the repo notes
   (`conv_*.md`) and official docs you checked. If you are not sure, say "check the docs for ..." instead of guessing.

## The shape of every lesson (the research behind it is in `content/PLAYBOOK.md`)
- **One new concept per lesson, at most 7 new terms.** If a lesson needs more, it is two lessons; tell me.
- **Bridge first.** "X is like Y you already know, except Z." Z (where the analogy breaks) is required.
- **Picture before code.** The `picture` is the one drawing that makes the mechanism clear. Boxes are things
  (a person, the agent, a VM, a service, a file, a check); arrows are what happens, in order.
- **Concrete → drawing → rule.** Start from a real file or command on his laptop, then the picture, then the
  general rule. Never open with a definition.
- **Why before how.** Every code block is preceded by `because`: one sentence that says why we do this.
- **Small code, every line explained.** ≤ 25 lines per block, taken from or faithful to the ticket sketches,
  with a note on every line that matters. A block changes one thing from the previous block.
- **Show the result.** After a command, `see` shows the exact output (≤ 8 lines). `ifInstead` names the one most
  likely error and what to do.
- **Lab = worked, faded, alone.** First a complete worked example with commands and outputs; then the same task
  with the last step left blank; then a new small task of the same shape with no help. Labs run on his laptop
  with free tools (Node 24, Docker Desktop, the temporal CLI, a scratch GitHub repo, LocalStack or `terraform plan`
  with no cloud). Never a lab that costs money or touches real company systems.
- **Check yourself.** 3 quiz questions, wrong options that are tempting (things people really do), and a one-line
  why for every option. Plus 1–2 recall questions from earlier lessons.
- **Walls stay exact.** No keys in the VM. PHI never enters a prompt. The requester never approves their own agent's
  PR; exactly one approval. Agents never merge, apply, destroy, sync or dispatch. Agents never change the checks
  they are judged by. No time, turn or budget limit cuts a run in the middle (guide, don't cage). One fresh VM per run.
- **Tickets at the end.** Walkthrough lessons walk through every ticket they cover: what we build, why, and the
  exact steps (files, commands, who to ask), with the code explained above. Foundation lessons name the tickets
  they unlock.

## Pictures that work
Good: "the requester assigns the ticket → the poll finds it → the workflow starts → the VM is claimed".
Bad: a box called "architecture" with arrows everywhere. If the picture needs more than 8 boxes, the lesson
is too big.

## Words
- Agent: a program that runs Claude with tools. Nova: our ticket-to-PR agent. Routine: Nova with a different trigger.
- Harness: the code around the model (nova-worker). Sandbox / VM: the fresh machine a run gets.
- Broker: the service that holds credentials and does GitHub, Jira and Slack calls for a run.
- Gateway: the service that adds the Anthropic key and meters spend. Wall: a rule enforced by infrastructure.
- Check: an automated test or required status on a PR. Eval: a fixed test set for an agent or skill.
