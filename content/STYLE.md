# How to write a lesson

Read this before you write or rewrite anything in the course. It replaces the old guide, whose rules (twenty-word
sentences, one fact per sentence, an analogy first, a "because" before every code block) made the lessons read like a
parts list. The reasons behind each rule below come from the research summarised in `content/PLAYBOOK.md`; when a rule
and your judgment disagree, follow the reason, not the wording.

## Who you are writing for

Sean is a frontend engineer. He knows React, TypeScript, npm, git, GitHub pull requests, Playwright, HTTP and JSON well.
He has never run Kubernetes, written Terraform, or built a Temporal workflow. English is his second language: he reads
it well, but idioms and dense noun piles cost him time. He would rather watch and listen than read, and he learns best
by trying things. He wants to be able to do every ticket of the agent platform himself, so he needs real understanding,
not a summary.

Write the way a patient senior colleague talks at a whiteboard: warm, direct, specific, a little playful when it helps,
never condescending. Use "you" and "we".

## The voice, with the reason for each part

**Start with a problem he can feel.** Every lesson opens with a short scene: something breaks, something costs money,
someone is waiting. "You assign RH-1234 to Nova, and a minute later, unsure it worked, you type /nova RH-1234 in Slack."
People learn more when they meet the problem before the answer, and a scene gives every later sentence somewhere to
attach. Never open with a definition or with a list of what the lesson will cover.

**Say why before what.** Before you name a mechanism, say what goes wrong without it. If you cannot say what breaks
without it, the reader does not need it in this lesson.

**Concrete first, then the general idea.** Show the real request, error, log line or file, and only then give the idea
its name. "Five pushes, one fingerprint, one fixer" before "deduplication by root cause".

**Write connected paragraphs.** Let sentence length follow the thought. Use a short sentence to land a point and a
longer one to carry a chain of causes. Keep the words that join ideas: because, so, which means, but, that is why,
for example, instead. Research on second-language readers found they understand complex sentences that keep these
links *better* than chopped-up short ones, because the links carry the logic. A row of short sentences makes the reader
rebuild the logic alone.

**One new idea per lesson, and name the parts before the flow.** If a lesson needs two mechanisms, it is two lessons.
Before showing how things move, say who is on stage: "Three things are involved: the trigger, Temporal, and the run."

**Keep the real terms and explain them where they first appear.** Say "conflict policy", not a cute replacement,
because he will search for the real word later. Explain it in the same or the next sentence, in plain words. Do not
introduce more than about five new terms in a lesson; put the rest in a later lesson or a "Go deeper" panel.

**Use an analogy only when it really fits, and say where it stops fitting.** Good ones from the old course: Squid is
"a Content Security Policy for a whole VM"; SSM is "SSH without port 22"; a warm pool is "standby seats on a flight".
A forced analogy is worse than none. Never chain two analogies.

**Simple words, not simple logic.** Avoid idioms and phrasal verbs ("spin up", "look into", "kick off", "under the
hood") unless the field uses them, in which case explain them. Spell out abbreviations the first time. Keep the subject
and the verb close together.

**Ticket keys and insider names stay out of the teaching.** In the problem, watch, play and read parts, never write
"G3-25" or "the G4 owner". Use what the thing does. Ticket keys appear only in the "In our platform" part at the end.
Names of agents, services and people may appear only after the cast page (`content/cast.json`) introduces them, and
the first mention in a lesson says what they are ("Byte, our review agent,").

**Never leave working notes in a lesson.** No "the sketch is 26 lines", "a writer checked", "check with Nave", "the
ticket does not say". Open questions about the plan go into the ticket card's `gaps` list. If you are not sure a fact
is true, check the docs or the ticket; if you still cannot tell, leave the fact out of the lesson.

**Say each wall once, with its story.** The walls (no keys on the VM, the requester never approves their own agent's
PR, agents never merge or apply, one fresh VM per run, guide don't cage) are taught where they belong, with the attack
or accident they stop. Elsewhere, refer to them in a phrase; do not repeat them as slogans.

**Every part of a lesson makes him do something.** Guess before the reveal, click the simulator, run the command,
fix the broken file. Reading alone is the weakest way to learn.

## Writing for the ear (the narration)

The `watch` script is spoken by a voice while the drawing moves. Write it to be heard:
- One idea per line. A line is one to three sentences and at most about 40 words; longer lines are hard to follow
  by ear, and splitting them gives each half its own moment in the drawing.
- Never put code names in a spoken line: the voice reads `USE_EXISTING` or `signalWithStart` letter by letter. Say
  "use existing" or "signal with start" and keep the code form in a `caption` cue.
- Every sentence that describes a visible change ("claims a VM", "look at the slots") needs the cue on that same
  line, and badges count exactly what the voice counts.
- When an earlier term comes back, re-explain it in about five words ("a slot, one of Nova's three VMs"). Never use
  one word for two things close together (a parked VM and a parked ticket).
- Say numbers and symbols the way a person would: "nova colon RH-1234" the first time, then "the ticket's ID".
- Repeat the key term a few times; a listener cannot glance back.
- Point at the drawing: "Watch the Slack box", "See how the second start stops at Temporal".
- Each chapter is under 6 minutes spoken and ends with the one thing to remember. Most lessons need 2 or 3 chapters.
- No code read aloud. Name what the code does; the code lives in the read part.

## The parts of a lesson (field names in `content/SCHEMA-v2.md`)

1. **hook**: the problem scene in one or two short paragraphs, ending with the question this lesson answers.
2. **watch**: the narrated drawing. The scene places the actors on a small grid so the story reads left to right and
   top to bottom. Arrows always mean "sends to" or "starts". Every line may carry a cue that moves the drawing.
3. **play**: one simulator from `src/widgets`, with tasks that start with a guess.
4. **read**: the explanation in words with code, short. Code notes only on the lines that need them; no notes that
   repeat the code. Details most readers can skip go in `deeper`.
5. **lab**: Guess, Follow along, Build it, Fix it, Explain it, run with `./academy lab <id>`.
6. **check**: two or three questions about the one idea of the lesson, never about ticket trivia. Every wrong option is
   a mistake people really make, and every option explains itself.
7. **platform**: how our platform uses the idea, and the tickets it unlocks.
8. **review**: two or three small tasks that come back days and weeks later.

Times must be honest: count about 150 spoken words a minute for watch, and the lab's real time.

## Before and after

These show the voice better than any rule.

**Before:** "A workflow ID is like a primary key: two inserts with the same key cannot both succeed. Except: you choose
what the second start does with a conflict policy, fail or join the open run."

**After:** You assign RH-1234 to Nova. A minute later, unsure it worked, you type /nova RH-1234 in Slack. That is two
triggers for one ticket, and if each one started its own run we would pay for two agents fighting over one branch. The
fix is to name every run after the thing it works on, so this run is called nova:RH-1234, and Temporal allows only one
open run per name. It works much like a database refusing a second row with the same primary key. The new part is that
you choose what the second attempt does: fail with an error, or quietly join the run that is already working.

**Before:** "tools sets the base set of built-in tools… allowedTools is the list of tools that run without asking.
disallowedTools removes tools from the model's view completely. These are different questions."

**After:** Think about setting up a laptop for an intern. First you decide which apps get installed. Then you decide
which ones they can open freely and which need your admin password. The SDK asks the same two questions. `tools` is the
install list, `allowedTools` is the "no password needed" list, and `disallowedTools` uninstalls a tool so completely that
the model never knows it existed. The trap: putting Write in `allowedTools` installs nothing.

**Before:** "A small sample can look perfect by luck. Zero false out of 60 looks like 0%, but the true rate could still
be 6%."

**After:** Say the check has been right 60 times out of 60. It is tempting to call it perfect. But think of a new
restaurant with three five-star reviews: you trust it less than one with 3,000 reviews averaging 4.8, even though 5.0 is
the higher number. With few samples, luck plays a big part.

## The reviewer pass

Every lesson is read by a separate reviewer who plays Sean. The reviewer must be able to answer, from the lesson alone:
What problem does this lesson solve? What is the one idea? What is the running example? Which terms did I not
understand, and where? Where did I lose the thread? A lesson with an unclear answer goes back to the writer.
