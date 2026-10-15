// What does Temporal do with two starts for the same ID when you set no conflict policy?
import { connect } from './connect.mjs';

const client = await connect();
const options = { taskQueue: 'ai-agents-nova', workflowId: 'demo:RH-1234', args: ['RH-1234'] };

const first = await client.workflow.start('ticketToPr', options);
console.log(`first start  → ID ${first.workflowId}   run ${first.firstExecutionRunId.slice(-8)}`);
try {
  await client.workflow.start('ticketToPr', options);
  console.log('second start → a second run started (that should not happen)');
} catch (error) {
  console.log(`second start → ${error.name}`);
}
await first.terminate('demo finished');
console.log();
console.log('With a fixed ID, Temporal refuses a second open run. Its default answer is this error.');
console.log('USE_EXISTING changes the answer: "here is the run that is already open".');
await client.connection.close();
