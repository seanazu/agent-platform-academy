# Build it

Three things in `startRun` decide what Temporal does with a second trigger: the workflow ID, the task queue,
and what to do when a run with that ID is already open. All three are in the options object of
`client.workflow.start`.

---

The ID must be the same for every trigger about the same ticket, so build it from the two arguments you
already have, `agent` and `thing`, with a colon between them. Do the same for the queue: `ai-agents-` plus the agent.

---

The option you are missing is `workflowIdConflictPolicy`. Its value comes from the import at the top:
`WorkflowIdConflictPolicy.USE_EXISTING`. It means "if a run with this ID is open, give me that run".

---

Almost the answer:

    workflowId: `${agent}:${thing}`,
    taskQueue: `ai-agents-${agent}`,
    workflowIdConflictPolicy: WorkflowIdConflictPolicy.USE_EXISTING,

# Fix it

Run `node clean.mjs && node triggers.mjs --fix` and look at the last column. Which runs are TERMINATED,
and who stopped them?

---

Only one word is wrong in `fix/start-run.mjs`: the conflict policy. TERMINATE_EXISTING kills the open run.
The policy you want joins it.
