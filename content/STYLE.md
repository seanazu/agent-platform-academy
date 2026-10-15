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

## The parts of a lesson (field names in `content/SCHEMA.md`)

The learner opens six steps in any order, so each step must make sense on its own.

1. **Story** (`hook`): the problem scene in one or two short paragraphs, ending with the question this lesson answers.
2. **Watch** (clips file): 2 to 4 parts of real YouTube videos by people who explain this well, each starting and
   stopping on the minutes that matter. Say why each clip is there, what to watch for, and how it connects to our
   platform. Pick clear speakers and good audio; prefer short and recent, but a classic beats a weak new video.
3. **Understand** (`read`): the explanation in connected prose with code, short. Code notes only on lines that need
   them. Details most readers can skip go in `deeper`.
4. **Practice** (`play` if a simulator fits, plus the drills in the clips file): drills make the learner use the idea:
   pick, fill in a blank in real code, or put steps in order. Every wrong option is a mistake people really make.
5. **Build** (`lab`): Guess, Follow along, Build it, Fix it, Explain it, on the learner's laptop with free tools.
   Real commands with the output the learner will really see. Guided labs end with a checklist the learner can tick.
6. **Checkpoint** (`check`, `review`, `remember`): three questions about the one idea, never ticket trivia.

The **In our platform** part (`platform`) says how our platform uses the idea and lists the tickets it unlocks; it is
the only place for ticket keys.

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
