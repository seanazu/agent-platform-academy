# Teaching playbook: the research behind STYLE.md

Collected 15 Oct 2026 for the v2 rebuild: 137 web searches by four research agents, plus a full audit of the v1 lessons.
The full plan is the "Academy 2.0" page. Short notes, with the sources named:

## R-visual (30 searches)
- Click-Next diagram = weakest interactivity. Best: predict-then-reveal (pretesting effect, hypercorrection), puzzles gating, break-it sims (guided tour -> sandbox, Nicky Case), add-one-variable (samwho load balancing: pause/play/reset/speed), counterfactual same-seed replay (Faultline), linked colour-coded terms text<->widget (Ciechanowski), Epic Web diff vs solution, Scrimba editable screencasts, Execute Program executable prompts + SRS 2d/1w/3w/2m.
- Gamification lowest value; progress map + review queue only.
- Existing examples: Temporal UI timeline (no replay scrubber = our gap), VPC sim engineersuniverse, Rover terraform, kube-scheduler-simulator, OAuth playground/PKCE visualizer, samwho retries/queueing (encore.dev/blog/retries), no agent-loop visualizer exists (gap).
- Libs: React Flow (own step state), Motion layout, D3 for math, Rive for state art, Remotion/Motion Canvas for clips only; Sandpack maybe unmaintained; WebContainers commercial licence.
- 8 widgets: FlowPlayer, HistoryReplayer, PathTracer, ChaosLab, DiffExplorer, PlacementToy, AgentLoopInspector(+OTel waterfall), CredentialBreaker. Loop: guided -> predict -> reveal -> break -> sandbox.
## R-writing (26 searches)
- Old rules backfired: readability formulas != comprehension (1979-80 studies); Blau 1982 ESL: complex sentences with connectives beat short ones; McNamara&Kintsch 1996 low-knowledge readers need cohesion; one-fact-per-sentence = transmissionism (Matuschak); forced analogy template -> strained analogies (Evans 13 patterns, Glynn TWA); Anthropic guide: say what to do + why, ban "overly short bullet points", style of prompt bleeds into output; curse of knowledge.
- Rules: problem first (productive failure, Kapur 53 studies); why before what; concrete first (Evans "scenes"); one running example/story (narrative meta-analysis); connected paragraphs w/ because/so/which means; vary sentence length; name the parts first (Mayer pre-training, segmenting); keep real jargon defined in place; analogies only when they earn it + where it breaks; conversational you/we (personalization d≈0.79); realistic examples; coherence + signaling; make reader act (LearnLM); non-native: simplify words/idioms not structure; write for one reader + test; style guide = outcomes + reasons + 3-5 example passages; separate reviewer pass for substance (Leinonen: LLM explanations rated fluent but learning unmeasured).
- Sources: jvns.ca/blog/confusing-explanations, platform.claude.com prompting best practices, paulgraham.com/simply.html, Mayer 2020, ajet personalization, gov.uk non-native tips, andymatuschak.org/books
## R-labs (24 searches)
- CodeCrafters: stage tests local, `test --previous` regression, tagged logs. Instruqt/Killercoda: check script w/ named-cause failure, setup/solve/cleanup, CI runs solve+check. SadServers/Rustlings: broken-on-purpose, clue ladder, watch mode, est time. Execute Program: runnable reviews 2d/1w/3w/2m, prereq gating, ~5 lessons/day cap. iximiuz/Codespaces devcontainer (CS50 80k users). Exercism/Boot.dev CLI: try vs check. TutorialKit/WebContainers for Node-only pieces. Capstone: build your own mini platform.
- Science: Dunlosky 2013 testing+spacing only high-utility; self-explanation g=.55 (Bisra 2018); expertise reversal -> adaptive fading, allow skip; interleaving g=.42; desirable difficulty w/ manageable load; PRIMM, Parsons; deliberate practice needs feedback; cognitive apprenticeship (show expert thinking, explore).
- Gamification: small effects; badges/leaderboards no effect in programming; levels/unlocks/story helped; forgiving streak; never charge for hints.
- Names: Guess / Follow along / Fill the gaps / Build it / Fix it / Explain it. CLI: `course lab 7-2`, `course check` (watch, rechecks earlier), `course hint`, `course diff`, `course skip`, `course explain`. Lab folder: README, setup.sh, check.ts, solve.sh, hints.md, broken/, review/. devcontainer w/ Temporal dev server, LocalStack, kind, terraform.

## What the audit of the v1 lessons found

- Sentences averaged 10-14 words in every lesson; up to 30 ticket keys in one lesson; 66 of 140 lessons had no video.
- The best v1 openings were stories (g5-4 "At 10:02 a runner image update breaks npm ci", g3-11 "A Spot VM disappears at step 4"); the worst opened with definitions or a list of tickets.
- The old rules caused most problems: the 20-word cap, the required "Except" analogy, a "because" before every code block, at least three notes per code block, lessons sized by ticket bundles.
