# Teaching playbook (research summary, 13 Oct 2026)

## How to teach so it sticks
1. Cognitive load and chunking (Sweller; Hermans, The Programmer's Brain). Rule: one new concept per lesson, at most 5–7 new terms; code blocks ≤ 20–25 lines that change one thing from the previous block.
2. Worked examples, then faded scaffolding (Sweller & Cooper; Renkl & Atkinson). Rule: every lab is a 3-rung ladder: full worked example with a label per step; the same task with the last step blank; a new task of the same shape, alone.
3. Concrete before abstract, "concreteness fading" (Fyfe, McNeil & Borjas 2015). Rule: real file on the laptop → drawing → general rule. Never open with the definition.
4. Mental models and analogies (Clancy; Halasz & Moran). Rule: "X is like Y, except Z", and Z is in the same paragraph.
5. Retrieval practice and spacing (Dunlosky et al. 2013). Rule: 3 questions from memory at the end; 1–2 recall questions from earlier lessons at the start; every answer comes with one line of why.
6. Show the result after each step (Diátaxis). Rule: every command has a "You should see" block (≤ 8 lines) and an "If instead you see … then …" line for the most likely error.
7. Why before how (Mayer, pre-training principle; Brown & Wilson). Rule: one sentence "We do this because …" before each code block; ask the reader to predict before a demo.
8. Tutorial failure modes: wall of text (≤ 4 sentences per paragraph; a picture or code every ≤ 150 words); skipped steps (run the lab on a clean machine); assumed knowledge (a "You need" box); jargon (define on first use, one word per thing); options (show one way; alternatives go to a "Later" note); non-native readers (≤ 20 words per sentence, active voice).

## Bridge analogies for a React/TypeScript developer (each says where it breaks)
- Temporal workflow ≈ a React component as a state machine, re-run from its history. Breaks: it replays a stored event log and crashes on non-determinism (no Date.now(), Math.random(), I/O in the workflow).
- Activity ≈ an API call from inside that component. Breaks: Temporal retries it, so it must be idempotent; results are recorded, not re-run on replay.
- Terraform ≈ package.json + lockfile for machines. Breaks: state records what exists; apply changes real infrastructure and can destroy it.
- Terragrunt ≈ monorepo workspaces for Terraform (shared root config, per-env folders, run-all). Breaks: it only generates and calls Terraform.
- Packer AMI ≈ a Docker image for a whole VM. Breaks: no layers or cache; rebuilds take minutes; region-specific.
- Docker layers ≈ the npm cache. Breaks: changing one layer invalidates everything after it, so order matters.
- Pod / Deployment / Helm release ≈ `npm start` on many machines. Breaks: pods are disposable and get new IPs; you never ssh and restart.
- Vault + ExternalSecrets ≈ .env files copied in by an operator. Breaks: values rotate without a redeploy; a Kubernetes Secret is only base64, so access control matters.
- IAM role ≈ a user with a scoped token, except nobody holds a password: the machine assumes the role and gets short-lived credentials.
- VPC / subnets / NAT ≈ an office network. Breaks: "private" means no route out, not a firewall.
- SSM ≈ SSH without port 22 or keys: the agent dials out, IAM decides who may connect. Breaks: command logging is off unless turned on.
- GitHub App installation token ≈ a 1-hour API key that acts as the bot. Breaks: minted from a private key each time; nothing static to paste.
- Reusable workflow ≈ a shared React component with inputs as props. Breaks: its own job; no shared files without artifacts.
- OIDC for CI ≈ "login with Google": GitHub vouches for the job, AWS hands out temporary credentials. Breaks: the trust policy must pin repo and branch.
- OpenTelemetry ≈ console.log that goes to a dashboard, with a trace ID across services. Breaks: spans have start, end and parents.
- Prometheus counter ≈ a Redux counter that only goes up. Breaks: it is scraped; you query rates on a server, never read it back in code.
- Squid egress allow-list ≈ a browser CSP for outbound traffic from a VM. Breaks: it also stops curl, pip and the agent.
- systemd unit ≈ pm2 owned by the OS (restart policy, logs, start on boot). Breaks: no file watching; production, not dev.
- Python venv / uv ≈ node_modules / npm. Breaks: you activate it (or use `uv run`); the interpreter version is part of it.
- pytest fixture ≈ beforeEach that returns a value, requested by parameter name. Breaks: fixtures have scopes and depend on each other.
- Django model / serializer / viewset ≈ Prisma model + zod schema + API route. Breaks: Django generates migrations and the admin; a viewset gives all CRUD routes.
- Celery ≈ a background job queue (BullMQ). Breaks: tasks are plain functions registered by import path; a worker must import the same code.
- Agent SDK query() ≈ a fetch that returns an async iterator. Breaks: it runs tools and many turns on your machine; it has interrupt().
- MCP tool ≈ a function the model can call (name, description, zod input, handler returning content). Breaks: the model chooses when to call it; the description is the API.
- Hook ≈ Express middleware on agent events. Breaks: per event, not per request; PreToolUse runs even when permissions would auto-allow.
- Sandbox VM ≈ a fresh CI runner. Breaks: it holds a live agent with network access, so egress rules and secrets matter more.
- Broker ≈ a backend-for-frontend that holds the secrets. Breaks: it must also decide which sandbox may ask for what, or it is only a secret relay.
