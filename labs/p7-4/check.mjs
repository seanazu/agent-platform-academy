// Checks for lab p7-4. They talk to the Temporal dev server on localhost:7233 (or TEMPORAL_ADDRESS)
// and run on start-run.mjs (build) or fix/start-run.mjs (fix). Every run they start is terminated at the end.
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const needs = ['temporal'];
export const expect = {
  start: '5 starts made 5 runs',
  fix: 'killed the run that was already working',
};
export const celebrate = 'However many triggers fire for one ticket, Nova now works on it in exactly one run.';
export const fixed = 'A new trigger joins the run that is already working, so no work is thrown away.';

const address = process.env.TEMPORAL_ADDRESS ?? 'localhost:7233';
const TRIGGERS = 5;
const withTimeout = (promise, ms, message) => Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms))]);

export const prepare = async (ctx) => {
  let clientPath;
  try {
    clientPath = createRequire(join(ctx.dir, 'check.cjs')).resolve('@temporalio/client');
  } catch {
    throw new Error(`the Temporal packages are not installed: run npm install in ${ctx.pretty(ctx.dir.replace(/\/fix$/, ''))}`);
  }
  const temporal = await import(pathToFileURL(clientPath).href);
  try {
    const connection = await temporal.Connection.connect({ address, connectTimeout: '3 seconds' });
    ctx.client = new temporal.Client({ connection, namespace: 'default' });
    await withTimeout(ctx.client.workflowService.getSystemInfo({}), 5000, 'no answer');
  } catch {
    throw new Error(`I can't reach Temporal on ${address}: the dev server is probably not running. Start it in another terminal with "temporal server start-dev", leave it open, and check again`);
  }
  ctx.temporal = temporal;
  ctx.startRun = (await ctx.load('start-run.mjs')).startRun;
  if (typeof ctx.startRun !== 'function') throw new Error('start-run.mjs does not export startRun: keep the line "export const startRun = async (client, agent, thing) => {"');

  // Runs left behind by an earlier check that was stopped half-way.
  for await (const run of ctx.client.workflow.list({ query: "WorkflowType = 'ticketToPr' AND ExecutionStatus = 'Running'" })) {
    if (run.workflowId.includes('RH-CHECK-')) await ctx.client.workflow.getHandle(run.workflowId, run.runId).terminate('academy check: leftover').catch(() => {});
  }

  ctx.started = [];
  ctx.start = async (agent, thing) => {
    const handle = await withTimeout(ctx.startRun(ctx.client, agent, thing), 15000, 'startRun did not finish in 15 seconds');
    ctx.started.push(handle);
    return handle;
  };
  ctx.thing = `RH-CHECK-${Math.floor(1000 + Math.random() * 9000)}`;
  ctx.results = await Promise.allSettled(Array.from({ length: TRIGGERS }, () => ctx.start('nova', ctx.thing)));
  ctx.handles = ctx.results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
  ctx.runKey = (h) => `${h.workflowId}/${h.firstExecutionRunId}`;
  ctx.runs = [...new Map(ctx.handles.map((h) => [ctx.runKey(h), h])).values()];
  ctx.describe = (h) => ctx.client.workflow.getHandle(h.workflowId, h.firstExecutionRunId).describe();
};

export const cleanup = async (ctx) => {
  for (const handle of ctx.started ?? []) {
    await ctx.client.workflow.getHandle(handle.workflowId, handle.firstExecutionRunId).terminate('academy check: done').catch(() => {});
  }
  await ctx.client?.connection.close();
};

export const checks = [
  {
    pass: `startRun gave back a run for all ${TRIGGERS} triggers`,
    gate: true,
    run: (ctx) => {
      const errors = ctx.results.filter((r) => r.status === 'rejected').map((r) => r.reason);
      if (!errors.length) return;
      const [error] = errors;
      if (error?.name === 'WorkflowExecutionAlreadyStartedError') {
        return { what: `${errors.length} of ${TRIGGERS} triggers crashed with WorkflowExecutionAlreadyStartedError`, why: "your ID is right, but by default Temporal refuses a second start while the run is open. Set workflowIdConflictPolicy to USE_EXISTING so the next trigger joins the run" };
      }
      return { what: `startRun crashed for ${errors.length} of ${TRIGGERS} triggers`, why: `it threw "${error?.message?.split('\n')[0]}"` };
    },
  },
  {
    pass: 'no trigger stopped the run that was already working',
    run: async (ctx) => {
      for (const handle of ctx.runs) {
        const { status } = await ctx.describe(handle);
        if (status.name === 'TERMINATED') {
          return { what: 'a later trigger killed the run that was already working', why: 'TERMINATE_EXISTING stops the open run and starts a new one, so Nova throws its work away. Use USE_EXISTING to join the open run instead' };
        }
      }
    },
  },
  {
    pass: `${TRIGGERS} triggers for one ticket made exactly one open run`,
    run: async (ctx) => {
      const ids = new Set(ctx.runs.map((h) => h.workflowId));
      if (ids.size > 1) return { what: `${TRIGGERS} starts made ${ctx.runs.length} runs`, why: "your workflow ID is random, so Temporal can't tell they are the same ticket. Build the ID from the agent and the ticket instead" };
      const open = [];
      for (const handle of ctx.runs) if ((await ctx.describe(handle)).status.name === 'RUNNING') open.push(handle);
      if (open.length !== 1) return { what: `${TRIGGERS} starts left ${open.length} open runs`, why: 'there must be exactly one open run for one ticket' };
    },
  },
  {
    pass: 'every trigger got back the same run',
    run: (ctx) => {
      if (ctx.runs.length > 1) return { what: `the ${TRIGGERS} triggers got ${ctx.runs.length} different runs back`, why: 'every trigger for the same ticket must get a handle to the same run (the same firstExecutionRunId), so all of them talk to one Nova' };
    },
  },
  {
    pass: 'the run ID names the agent and the ticket (nova:<ticket>)',
    run: (ctx) => {
      const id = ctx.runs[0].workflowId;
      if (id !== `nova:${ctx.thing}`) return { what: `the run's ID is "${id}"`, why: `it should be "nova:${ctx.thing}": the agent's name, a colon, and the thing it works on. Then anyone can find the run from the ticket` };
    },
  },
  {
    pass: "the run waits on Nova's queue, ai-agents-nova",
    run: async (ctx) => {
      const { taskQueue } = await ctx.describe(ctx.runs[0]);
      if (taskQueue !== 'ai-agents-nova') return { what: `the run is on the queue "${taskQueue}"`, why: "Nova's worker listens only on ai-agents-nova, so this run would wait forever" };
    },
  },
  {
    pass: 'another agent gets its own ID and queue (byte:<ticket> on ai-agents-byte)',
    run: async (ctx) => {
      const handle = await ctx.start('byte', ctx.thing);
      const { taskQueue } = await ctx.describe(handle);
      if (handle.workflowId !== `byte:${ctx.thing}` || taskQueue !== 'ai-agents-byte') {
        return { what: `Byte's run for the same ticket got the ID "${handle.workflowId}" on the queue "${taskQueue}"`, why: 'use the agent argument for both the ID and the queue (ai-agents-<agent>), not the word nova' };
      }
    },
  },
  {
    pass: 'a different ticket gets a run of its own',
    run: async (ctx) => {
      const handle = await ctx.start('nova', `${ctx.thing}-B`);
      if (ctx.runKey(handle) === ctx.runKey(ctx.runs[0])) return { what: 'a different ticket joined the same run', why: 'the ID must include the ticket, so every ticket gets its own run' };
    },
  },
];
