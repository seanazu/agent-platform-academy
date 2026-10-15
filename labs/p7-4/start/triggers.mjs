// Three triggers ask Nova to work on the same ticket, one after the other.
//   node triggers.mjs         uses start-run.mjs (your Build it step)
//   node triggers.mjs --fix   uses fix/start-run.mjs (the Fix it step)
import { connect } from './connect.mjs';

const useFix = process.argv.includes('--fix');
const { startRun } = await import(useFix ? './fix/start-run.mjs' : './start-run.mjs');
const client = await connect();

const handles = [];
for (const trigger of ['Jira poll', 'Slack /nova', 'Jira comment']) {
  try {
    const handle = await startRun(client, 'nova', 'RH-1234');
    handles.push(handle);
    console.log(`${trigger.padEnd(13)} → ID ${handle.workflowId}   run ${handle.firstExecutionRunId.slice(-8)}`);
  } catch (error) {
    console.log(`${trigger.padEnd(13)} → ${error.name}: ${error.message}`);
  }
}

const runs = [...new Map(handles.map((handle) => [`${handle.workflowId}/${handle.firstExecutionRunId}`, handle])).values()];
console.log();
console.log(`3 triggers for RH-1234 → ${runs.length} run${runs.length === 1 ? '' : 's'}`);
for (const handle of runs) {
  const { status } = await client.workflow.getHandle(handle.workflowId, handle.firstExecutionRunId).describe();
  console.log(`  ${handle.workflowId}   run ${handle.firstExecutionRunId.slice(-8)}   ${status.name}`);
}
await client.connection.close();
