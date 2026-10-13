#!/usr/bin/env python3
"""Builds content/course.json: the syllabus (parts -> lessons) and the map from every ticket to the lesson
that walks through it. Run: python3 content/build_course.py. Fails if any of the 242 tickets is unmapped
or mapped twice."""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
TICKETS = pathlib.Path.home() / 'Desktop/agentic-plan-app/tickets'

# (id, title, what you can do after it, tickets it walks through)
F = lambda pid, lessons: {'lessons': [{'id': i, 'title': t, 'goal': g, 'covers': []} for i, t, g in lessons]}
W = lambda pid, lessons: {'lessons': [{'id': i, 'title': t, 'goal': g, 'covers': c} for i, t, g, c in lessons]}

PARTS = [
  dict(id='p0', kind='start', title='Start here', tagline='How this course works and what we are building', accent='silver', **F('p0', [
    ('p0-1', 'How to use this course', 'Know how a lesson works: picture, code, lab, check, and the ticket map.'),
    ('p0-2', 'The big picture: what we are building', 'Explain the agent platform in one drawing: VM, broker, gateway, Temporal, walls and guidance.'),
    ('p0-3', 'The nine goals and the thirteen weeks', 'Name G0 to G8, what each delivers, and the order they are built in.'),
    ('p0-4', 'Our repos and how a ticket is written', 'Find your way in fcp, infrastructure, gitops, byte, ai-agents, claude-plugins and rnd-kb; read a ticket (What, Why, How, code).'),
  ])),
  dict(id='p1', kind='foundation', title='Node and TypeScript beyond the browser', tagline='The language you know, used for servers, CLIs and tools', accent='sky', **F('p1', [
    ('p1-1', 'Running TypeScript on Node', 'Set up an ESM TypeScript project with npm workspaces, tsx, tsc and exact-pinned packages.'),
    ('p1-2', 'Files, processes and streams', 'Read and write files, run other programs safely with execFile, and move data through streams.'),
    ('p1-3', 'A web server with node:http', 'Write a small HTTP service with routes, status codes and a body-size limit.'),
    ('p1-4', 'Secrets in code', 'Make random tokens, hash them, compare them safely, and never log them.'),
    ('p1-5', 'Checking data with zod', 'Describe data with a schema, get the TypeScript type for free, and turn it into JSON Schema.'),
    ('p1-6', 'Tests with node:test', 'Write and run tests with Node’s test runner, use fakes, and test AWS calls without AWS.'),
    ('p1-7', 'One file to ship: bundling with esbuild', 'Bundle a Node program into one file with a shebang and publish it as a release.'),
    ('p1-8', 'Docker for a Node service', 'Write a hardened Dockerfile: pinned base image, non-root user, read-only filesystem.'),
  ])),
  dict(id='p2', kind='foundation', title='GitHub as a platform', tagline='Actions, Apps, rulesets and the API', accent='violet', **F('p2', [
    ('p2-1', 'GitHub Actions from zero', 'Read and write a workflow: triggers, jobs, steps, runners and permissions.'),
    ('p2-2', 'Reusable workflows and pinning', 'Share a workflow between repos, pin it by SHA, and run a job inside a container image.'),
    ('p2-3', 'Keeping Actions safe', 'Spot script injection, use github-script, and log in to AWS and Vault with OIDC.'),
    ('p2-4', 'GitHub Apps, tokens and rulesets', 'Create a GitHub App, mint short one-repo tokens, and enforce approvals with rulesets and required checks.'),
    ('p2-5', 'Talking to GitHub from code', 'Use Octokit to read PRs, reviews and checks, and to open a draft PR.'),
    ('p2-6', 'Renovate', 'Configure grouped, monthly dependency updates instead of a weekly bump workflow.'),
  ])),
  dict(id='p3', kind='foundation', title='The cloud from zero: AWS', tagline='Accounts, networks, machines and buckets', accent='amber', **F('p3', [
    ('p3-1', 'Accounts, regions and IAM', 'Explain accounts, roles and policies, and give a machine the smallest role it needs.'),
    ('p3-2', 'Networks: VPC, subnets and endpoints', 'Build a private network with no way out, and let it reach AWS services through endpoints.'),
    ('p3-3', 'Machines: EC2, AMIs and launch templates', 'Pick an instance size, start it from an image, and lock down its metadata.'),
    ('p3-4', 'Warm pools and Spot', 'Keep stopped machines ready, start one in a minute, and use cheap Spot machines for retryable work.'),
    ('p3-5', 'Reaching a machine without SSH', 'Run a command on a machine with SSM and keep long jobs alive with systemd.'),
    ('p3-6', 'Buckets: S3 for runs', 'Store run artifacts in S3 with encryption, presigned links and lifecycle rules.'),
    ('p3-7', 'Small jobs with Lambda', 'Write a Python Lambda that runs every 15 minutes and cleans up machines.'),
  ])),
  dict(id='p4', kind='foundation', title='Infrastructure as code', tagline='Terraform, Terragrunt, Packer and the egress proxy', accent='amber', **F('p4', [
    ('p4-1', 'Terraform basics', 'Describe resources in HCL, run plan and apply, and understand state and modules.'),
    ('p4-2', 'Terragrunt and our infrastructure repo', 'Find your way in the infrastructure repo: units, includes, dependencies, run-all, the n8n pattern.'),
    ('p4-3', 'Writing HCL for our modules', 'Read and change a module: the private VPC, the sandbox pool, the proxy.'),
    ('p4-4', 'Packer and Ansible: building the sandbox image', 'Bake a machine image nightly, test it, promote it or roll back.'),
    ('p4-5', 'Egress control: Squid allow-lists and PrivateLink', 'Explain why the VM can reach only a few names, and how the gateway and broker stay reachable.'),
    ('p4-6', 'Checks that keep infra safe', 'Run validate, tflint, trivy and checkov; post read-only plans on PRs; never apply from an agent.'),
  ])),
  dict(id='p5', kind='foundation', title='Kubernetes and the inf cluster', tagline='Where our services live', accent='teal', **F('p5', [
    ('p5-1', 'Containers, pods, deployments', 'Explain pods, deployments, services and namespaces, and what inf-rhinohealth is.'),
    ('p5-2', 'Helm releases through Terraform', 'Deploy a service the way n8n is deployed: a helm_release unit, an RDS database, an image by digest.'),
    ('p5-3', 'Secrets: Vault and ExternalSecrets', 'Store a secret in Vault, let a pod read it, and keep access narrow.'),
    ('p5-4', 'Network policy and PrivateLink', 'Limit what a pod can talk to, and expose a service to the sandbox VPC safely.'),
  ])),
  dict(id='p6', kind='foundation', title='Seeing what happens: telemetry', tagline='Metrics, logs, traces and dashboards', accent='teal', **F('p6', [
    ('p6-1', 'Metrics, logs and traces with OpenTelemetry', 'Explain the three signals, run a collector, and scrub content before it leaves.'),
    ('p6-2', 'Prometheus metrics in a Node service', 'Add counters and histograms, expose a metrics endpoint, and understand push versus pull.'),
    ('p6-3', 'Grafana dashboards and alerts', 'Build a dashboard from JSON and write an alert rule that posts to Slack.'),
    ('p6-4', 'Measuring delivery', 'Compute team-level delivery metrics nightly and show the three DX lenses.'),
  ])),
  dict(id='p7', kind='foundation', title='Temporal: workflows that survive anything', tagline='Long jobs, waiting for people, and never losing work', accent='sky', **F('p7', [
    ('p7-1', 'Why Temporal', 'Explain workflows, activities and workers, and why a long job needs them.'),
    ('p7-2', 'Writing a workflow', 'Write a deterministic workflow with proxied activities, timeouts that re-attach, and heartbeats.'),
    ('p7-3', 'Signals, queries, conditions and timers', 'Wait for a person for days at no cost, and react to a button press.'),
    ('p7-4', 'Starting runs', 'Use workflow IDs, conflict policies, signalWithStart, task queues and search attributes.'),
    ('p7-5', 'Schedules and polling', 'Create cron schedules with an overlap policy and poll Jira with no public webhook.'),
    ('p7-6', 'Safe changes and long histories', 'Change a running workflow safely with patched, and keep histories short with continueAsNew.'),
    ('p7-7', 'Testing workflows', 'Test with a time-skipping environment, mocked activities and replay tests.'),
  ])),
  dict(id='p8', kind='foundation', title='The Claude Agent SDK', tagline='How Nova actually runs', accent='coral', **F('p8', [
    ('p8-1', 'What an agent session is', 'Start a session with query(), read its messages and result, and point it at a pinned Claude binary.'),
    ('p8-2', 'Tools and permissions', 'Allow and deny tools, pick a permission mode, and control which settings load.'),
    ('p8-3', 'Your own tools with MCP', 'Give the model a function of yours with createSdkMcpServer and tool().'),
    ('p8-4', 'Hooks are walls', 'Block edits to protected paths, lint after edits, and demand proof before done.'),
    ('p8-5', 'Subagents and judges', 'Run a fresh-context reviewer or judge with its own tools and a structured answer.'),
    ('p8-6', 'Sessions that move between machines', 'Mirror a session to S3 and resume it on another VM.'),
    ('p8-7', 'Many agents on purpose', 'Run a dynamic workflow script with agent(), parallel() and pipeline(), sized on purpose.'),
    ('p8-8', 'Models, effort and cost', 'Route model and effort per job, send calls through the gateway, and keep the prompt cache warm.'),
  ])),
  dict(id='p9', kind='foundation', title='Talking to people’s tools', tagline='Slack, Jira and GitHub from code', accent='violet', **F('p9', [
    ('p9-1', 'Slack apps with Bolt', 'Build a Socket Mode app with a slash command, buttons and thread replies.'),
    ('p9-2', 'Jira from code', 'Search with JQL, read issue properties and the changelog, and poll safely.'),
    ('p9-3', 'Pull requests from an agent', 'Open a draft PR, write the Requested-by line, read checks, and mark it ready.'),
  ])),
  dict(id='p10', kind='foundation', title='Python for a TypeScript developer', tagline='Enough Python to work in fcp’s backend and the eval bench', accent='mint', **F('p10', [
    ('p10-1', 'Python syntax bridge', 'Read and write Python: types, async, dataclasses, imports, uv and pyproject.'),
    ('p10-2', 'pytest', 'Write tests with fixtures and parametrize, run them in parallel, and run only affected tests.'),
    ('p10-3', 'Django and DRF in one lesson', 'Understand models, serializers, viewsets, the test client and a template database.'),
    ('p10-4', 'Fakes, not mocks', 'Write an in-memory fake with a contract suite that also runs against the real thing.'),
    ('p10-5', 'Backend breaking-change checks', 'Use oasdiff, migration linters, buf breaking, an SDK smoke test and mutation reports.'),
    ('p10-6', 'Developer tools and the eval bench', 'Write poe tasks, a verify command, a setup doctor, and a Harbor task.'),
  ])),
  dict(id='p11', kind='foundation', title='Security walls', tagline='Why agents never hold keys', accent='coral', **F('p11', [
    ('p11-1', 'The lethal trifecta', 'Explain why an agent with private data, outside input and outward actions is dangerous, and what we remove.'),
    ('p11-2', 'Brokers and capabilities', 'Explain Byte’s broker: per-run capability, one-repo token, git proxy, refused writes.'),
    ('p11-3', 'Checks an agent cannot weaken', 'Explain independent approval, locked checks, weakened-test and false-heal checks.'),
    ('p11-4', 'Threat models and drills', 'Run a threat model, a design review and a failure drill, and write a runbook.'),
  ])),
  dict(id='p12', kind='foundation', title='Skills, plugins and evals', tagline='Teaching agents and proving they learned', accent='mint', **F('p12', [
    ('p12-1', 'Skills and SKILL.md', 'Write a skill with frontmatter and a plain body, and package it in a plugin.'),
    ('p12-2', 'Hooks and managed settings for people', 'Roll a plugin out to every laptop with managed settings and an MCP allow-list.'),
    ('p12-3', 'Evals', 'Write an eval case, run claude plugin eval, and read a golden set score.'),
    ('p12-4', 'Writing for agents', 'Write plan-and-grill, verify, pr-story and the checking guide in a voice agents follow.'),
  ])),
  dict(id='g0', kind='walkthrough', title='G0 · Guardrails and identity', tagline='Lock the front door before any agent writes code', accent='coral', **W('g0', [
    ('g0-1', 'Lock the front door: rulesets and the review rules', 'Turn on the fcp ruleset and write down the review rules.', ['G0-01', 'G0-02']),
    ('g0-2', 'The agents’ identity: ZDR org, GitHub App, Vault', 'Create the API org, the GitHub App and the keys, and narrow Vault’s runner role.', ['G0-03', 'G0-07', 'G0-08', 'G0-11']),
    ('g0-3', 'The independent-approval check', 'Build the required check that fails when only the requester approved.', ['G0-09']),
    ('g0-4', 'Locked checks and weakened tests', 'Build the checks that catch an agent changing what judges it.', ['G0-18', 'G0-19']),
    ('g0-5', 'The LLM gateway', 'Build and deploy the gateway that adds the key and meters spend.', ['G0-13', 'G0-14', 'G0-15']),
    ('g0-6', 'Inventory, managed settings and spend ceilings', 'Write the agent inventory, the managed settings and the spend limits.', ['G0-10', 'G0-12', 'G0-16']),
    ('g0-7', 'Handover: Byte, the Lab, Vanil and n8n', 'Move the tools into the org and make two people able to fix each one.', ['G0-04', 'G0-05', 'G0-06', 'G0-17']),
  ])),
  dict(id='g1', kind='walkthrough', title='G1 · Telemetry and metrics', tagline='See cost, quality and speed in one place', accent='teal', **W('g1', [
    ('g1-1', 'The collector and the settings that send to it', 'Deploy the OTel Collector with scrubbing and point every Claude Code at it.', ['G1-02', 'G1-04', 'G1-05']),
    ('g1-2', 'The nightly metrics job', 'Pull GitHub, Jira and CI data into VictoriaMetrics and backfill a baseline.', ['G1-03', 'G1-06', 'G1-07']),
    ('g1-3', 'Dashboards: operations, evals, delivery and spend', 'Build the four Grafana views and the burn-rate alert.', ['G1-09', 'G1-10', 'G1-11', 'G1-12']),
    ('g1-4', 'Step tracing and quality numbers', 'Tag every run by step, label failures, and compute nightly quality numbers.', ['G1-14', 'G1-15', 'G1-16']),
    ('g1-5', 'Evals store, the three lenses, surveys and model checks', 'Store eval results, show the DX lenses, run the surveys and the sweeps.', ['G1-08', 'G1-13', 'G1-01', 'G1-18', 'G1-17', 'G1-19']),
  ])),
  dict(id='g2', kind='walkthrough', title='G2 · Review gate (Byte)', tagline='Prove how good Byte is', accent='violet', **W('g2', [
    ('g2-1', 'BYTE-GOLD: mine, label, plant', 'Build the golden set from real bugs, clean PRs and planted bugs.', ['G2-01', 'G2-02', 'G2-03']),
    ('g2-2', 'Sealed replay and scoring', 'Replay Byte with no history or token, score it, and gate changes on it.', ['G2-04', 'G2-06', 'G2-08', 'G2-09']),
    ('g2-3', 'Fix mode and re-review rules', 'Enforce approval on fixes and skip re-reviews when everything is fixed.', ['G2-05', 'G2-07']),
    ('g2-4', 'Routing, risk labels and live metrics', 'Pick model and effort per PR, label risk, and track Byte live.', ['G2-10', 'G2-11', 'G2-12', 'G2-17']),
    ('g2-5', 'Byte on Nova’s PRs and the panel', 'Read the self-review receipt, post only what matters, and run the five-lens panel with a skeptic.', ['G2-13', 'G2-14', 'G2-15', 'G2-16']),
  ])),
  dict(id='g3', kind='walkthrough', title='G3 · Agent runtime', tagline='A safe throw-away computer per run', accent='sky', **W('g3', [
    ('g3-1', 'The repo: ai-agents on npm workspaces', 'Create the ai-agents repo with CI, images and a ruleset.', ['G3-01']),
    ('g3-2', 'The account and the network', 'Bootstrap the AWS account, the private VPC, the endpoints and the mirrors.', ['G3-02', 'G3-03', 'G3-04', 'G3-05']),
    ('g3-3', 'Temporal and the services on inf', 'Deploy Temporal and the agent services with Helm, Vault and PrivateLink.', ['G3-06', 'G3-17']),
    ('g3-4', 'The broker', 'Build the broker: capabilities, one-repo tokens, the git proxy, Jira and Slack scopes.', ['G3-07', 'G3-10', 'G3-13']),
    ('g3-5', 'The sandbox image', 'Bake the image with Packer and Ansible, nightly, with a smoke test.', ['G3-08', 'G3-14', 'G3-16']),
    ('g3-6', 'Egress proxy and launch templates', 'Run the Squid proxy and define the three machine sizes.', ['G3-09', 'G3-11']),
    ('g3-7', 'Warm pools, Spot and the sweeper', 'Keep machines ready, use Spot, and destroy leftovers every 15 minutes.', ['G3-15', 'G3-22']),
    ('g3-8', 'Sandbox activities: claim, run, park, release', 'Write the Temporal activities that drive a VM through its life.', ['G3-18', 'G3-20']),
    ('g3-9', 'The harness: session, hooks and store', 'Write nova-worker: the SDK session, the wall hooks and the S3 session store.', ['G3-19', 'G3-21', 'G3-23']),
    ('g3-10', 'ticketToPr and the fan-out walls', 'Write the main workflow, the slots and the kill switch, with the right timeouts.', ['G3-24', 'G3-25', 'G3-29']),
    ('g3-11', 'Checkpoints, recovery and outages', 'Save work as it goes, replace a dead VM, and wait out an outage.', ['G3-26', 'G3-27', 'G3-39']),
    ('g3-12', 'Triggers and waiting', 'Register Jira polls as schedules and wait for people with reminders and parking.', ['G3-28', 'G3-38']),
    ('g3-13', 'The Slack app', 'Build /nova, the status message, the buttons and question threads.', ['G3-30', 'G3-35']),
    ('g3-14', 'Watcher, ladder, routing and backstop', 'Spot loops, climb the ladder, route models, and pause at a far backstop.', ['G3-32', 'G3-33', 'G3-36', 'G3-37']),
    ('g3-15', 'Guard rails, alerts and the runbook', 'List refusals in the PR, alert on blocked egress, and write the runbook.', ['G3-31', 'G3-34']),
    ('g3-16', 'Security: threat model, review and drills', 'Threat-model the runtime, review it, and cause every failure on purpose.', ['G3-12', 'G3-40', 'G3-41', 'G3-42']),
  ])),
  dict(id='g4', kind='walkthrough', title='G4 · Nova pilot', tagline='Tickets to PRs, with checks first', accent='coral', **W('g4', [
    ('g4-1', 'Hand-off: poll, commands, readiness and status', 'Let people hand a ticket to Nova and see its status.', ['G4-04', 'G4-05', 'G4-06', 'G4-11']),
    ('g4-2', 'The plan: schema, grill and approval', 'Define the plan, ask questions first, and get a yes in Jira or Slack.', ['G4-07', 'G4-12', 'G4-14']),
    ('g4-3', 'Checks first', 'Write the checking guide, pick the checks, lock them, and get the QA agent’s co-sign.', ['G4-08', 'G4-15', 'G4-16', 'G4-13']),
    ('g4-4', 'Fresh eyes', 'Run the scope judge, the self-review loop and the QA agent in a browser.', ['G4-17', 'G4-18', 'G4-23', 'G4-24']),
    ('g4-5', 'Workflows: research, review panel and parallel attempts', 'Run the spike and the dynamic workflows inside the VM.', ['G4-01', 'G4-09', 'G4-19', 'G4-30']),
    ('g4-6', 'The PR: evidence, judge, Byte and the ready gate', 'Write the PR from the template, judge it, pass Byte, mark it ready.', ['G4-20', 'G4-21', 'G4-26', 'G4-27']),
    ('g4-7', 'TICKET-BENCH', 'Mine tasks, define them for Harbor, curate 40, score and gate.', ['G4-02', 'G4-03', 'G4-10', 'G4-25']),
    ('g4-8', 'Dogfood and the pilot', 'Run Nova on its own repo, then on fcp, with a weekly review.', ['G4-22', 'G4-28', 'G4-29']),
  ])),
  dict(id='g5', kind='walkthrough', title='G5 · Routines', tagline='A night crew for each team', accent='mint', **W('g5', [
    ('g5-1', 'Routines in one picture: charters and people', 'Write a charter, name owners and a reviewer of the day, close RH-7207.', ['G5-01', 'G5-06', 'G5-07']),
    ('g5-2', 'routineRun and the triggers', 'Write the routine workflow and start it from CI failures, Jira and schedules.', ['G5-08', 'G5-09', 'G5-12', 'G5-13']),
    ('g5-3', 'Noise rules, trust ladder and shadow report', 'Keep routines quiet, let them earn trust, and compare them with people.', ['G5-02', 'G5-03', 'G5-15', 'G5-16']),
    ('g5-4', 'Storm control and the circuit breaker', 'Handle a red main once, and pause a routine that keeps failing.', ['G5-17', 'G5-21']),
    ('g5-5', 'CI fixers and the false-heal check', 'Build the FE, BE and pipeline fixers that never weaken a test.', ['G5-20', 'G5-22', 'G5-14', 'G5-25']),
    ('g5-6', 'Renovate and the upgrade fixers', 'Configure Renovate and repair the updates that break.', ['G5-04', 'G5-05', 'G5-23', 'G5-24', 'G5-32']),
    ('g5-7', 'The bug fixers', 'Reproduce first, then fix with a proven test, for FE, BE and flaky tests.', ['G5-27', 'G5-28', 'G5-29', 'G5-30']),
    ('g5-8', 'Code health: dead code, test gaps, duplicates, security', 'Build the sweepers that keep the codebase healthy.', ['G5-31', 'G5-35', 'G5-33', 'G5-34', 'G5-36']),
    ('g5-9', 'ROUTINE-BENCH', 'Build the bench slices that prove each routine does its job honestly.', ['G5-10', 'G5-11', 'G5-18', 'G5-19', 'G5-26']),
  ])),
  dict(id='g6', kind='walkthrough', title='G6 · R&D brain', tagline='One place with the current facts', accent='violet', **W('g6', [
    ('g6-1', 'Scope, layout, schema and lint', 'Agree the scope, lay out rnd-kb, define pages, and lint them in CI.', ['G6-01', 'G6-02', 'G6-03', 'G6-04']),
    ('g6-2', 'Seed pages and their owners', 'Draft the first 35 pages and get owners to raise their confidence.', ['G6-05', 'G6-07', 'G6-09', 'G6-11', 'G6-15']),
    ('g6-3', 'CLAUDE.md and rules in fcp', 'Write the root CLAUDE.md, path-scoped rules, and a pointer to Vanil.', ['G6-06', 'G6-08', 'G6-13']),
    ('g6-4', 'The kb plugin, capture, freshness and PR comments', 'Ship the kb CLI and skill, capture threads, nudge owners, comment on PRs.', ['G6-10', 'G6-12', 'G6-14', 'G6-16']),
    ('g6-5', 'BRAIN-QA and ingest', 'Collect real questions, score answers nightly, and ingest merged work weekly.', ['G6-17', 'G6-18', 'G6-19', 'G6-20']),
    ('g6-6', 'The brain bot', 'Build, deploy and harden the Slack bot that answers with citations.', ['G6-21', 'G6-22', 'G6-23']),
  ])),
  dict(id='g7', kind='walkthrough', title='G7 · Fast feedback', tagline='Honest test results in minutes', accent='mint', **W('g7', [
    ('g7-1', 'The API test layer', 'Create tests_api with pytest-django, its CI job, agent-friendly output and testmon.', ['G7-01', 'G7-02', 'G7-03', 'G7-12', 'G7-13']),
    ('g7-2', 'The fakes', 'Build the on-prem client, object store and task queue fakes with contract suites.', ['G7-04', 'G7-05', 'G7-07']),
    ('g7-3', 'Builders and ported tests', 'Create data through the API and port the first integration tests.', ['G7-06', 'G7-08', 'G7-18', 'G7-27']),
    ('g7-4', 'Breaking-change checks', 'Add oasdiff, migration linters, buf breaking and the SDK smoke test.', ['G7-11', 'G7-15', 'G7-19', 'G7-21']),
    ('g7-5', 'verify and doctor', 'Give people and agents one verify command and a setup doctor.', ['G7-10', 'G7-14', 'G7-22', 'G7-25']),
    ('g7-6', 'FCP Lab in CI', 'Prove the Lab on Linux, build its images once, and run it on every PR.', ['G7-09', 'G7-16', 'G7-20', 'G7-26', 'G7-33']),
    ('g7-7', 'Nightly: history, triage, mutation and the locks', 'Record nightly results, triage failures, report mutants, and free the QA locks.', ['G7-24', 'G7-29', 'G7-35', 'G7-31']),
    ('g7-8', 'DevOps checks', 'Add validate, lint, trivy, chart checks, actionlint, read-only plans and Argo diffs.', ['G7-17', 'G7-23', 'G7-28', 'G7-30', 'G7-32', 'G7-34']),
  ])),
  dict(id='g8', kind='walkthrough', title='G8 · Skills and tools', tagline='The marketplace, the skills and the training', accent='amber', **W('g8', [
    ('g8-1', 'The marketplace and moving the skills', 'Create claude-plugins, move the guild skills, and write the catalog.', ['G8-01', 'G8-02', 'G8-05']),
    ('g8-2', 'rhino-core: plan-and-grill, verify and pr-story', 'Write the three core skills every agent uses.', ['G8-03', 'G8-04', 'G8-06']),
    ('g8-3', 'Plugin CI, hooks and managed settings', 'Validate plugins in CI, add the safety hooks, and roll out with managed settings.', ['G8-07', 'G8-08', 'G8-09', 'G8-12', 'G8-16']),
    ('g8-4', 'Codebase and task skills with evals', 'Write the fe, be, devops and task skills, each with an eval.', ['G8-10', 'G8-11', 'G8-13', 'G8-18', 'G8-19']),
    ('g8-5', 'Training and office hours', 'Run the four trainings and weekly office hours.', ['G8-14', 'G8-15', 'G8-17', 'G8-20', 'G8-21']),
  ])),
]

def main():
  tickets = {}
  for g in range(9):
    for t in json.load(open(TICKETS / f'g{g}.json')):
      tickets[t['key']] = t
  seen = {}
  for p in PARTS:
    for l in p['lessons']:
      for k in l['covers']:
        assert k in tickets, f'{l["id"]}: unknown ticket {k}'
        assert k not in seen, f'{k} mapped twice: {seen[k]} and {l["id"]}'
        seen[k] = l['id']
  missing = sorted(set(tickets) - set(seen))
  assert not missing, f'unmapped tickets: {missing}'
  n = sum(len(p['lessons']) for p in PARTS)
  course = {'title': 'Agent Platform Academy', 'parts': PARTS, 'lessonCount': n, 'ticketCount': len(tickets),
            'ticketToLesson': seen}
  (ROOT / 'course.json').write_text(json.dumps(course, ensure_ascii=False, indent=1) + '\n')
  print(f'{len(PARTS)} parts, {n} lessons, {len(seen)}/{len(tickets)} tickets mapped')

if __name__ == '__main__':
  main()
