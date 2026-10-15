// Stops every open ticketToPr run, so you can try again from a clean board.
import { connect } from './connect.mjs';

const client = await connect();
let stopped = 0;
for await (const run of client.workflow.list({ query: "WorkflowType = 'ticketToPr' AND ExecutionStatus = 'Running'" })) {
  await client.workflow.getHandle(run.workflowId, run.runId).terminate('lab clean-up');
  stopped += 1;
}
console.log(stopped ? `Stopped ${stopped} open run${stopped === 1 ? '' : 's'}. The board is clean.` : 'No open runs. The board is clean.');
await client.connection.close();
