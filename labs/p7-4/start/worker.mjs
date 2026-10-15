// Nova's worker: it runs ticketToPr for every run on the ai-agents-nova task queue.
// Start it in its own terminal and leave it open:  node worker.mjs
import { fileURLToPath } from 'node:url';
import { DefaultLogger, NativeConnection, Runtime, Worker } from '@temporalio/worker';
import * as activities from './activities.mjs';
import { address } from './connect.mjs';

// Quiet logs: only real errors, so the lines from the runs stand out.
Runtime.install({
  logger: new DefaultLogger('ERROR'),
  telemetryOptions: { logging: { filter: { core: 'ERROR', other: 'ERROR' }, forward: {} } },
});

let connection;
try {
  connection = await NativeConnection.connect({ address });
} catch {
  console.log(`I can't reach Temporal on ${address}, so the dev server is probably not running.`);
  console.log('Start it in another terminal and leave it open:  temporal server start-dev');
  process.exit(1);
}

const worker = await Worker.create({
  connection,
  namespace: 'default',
  taskQueue: 'ai-agents-nova',
  workflowsPath: fileURLToPath(new URL('./workflows.mjs', import.meta.url)),
  activities,
});
console.log("Nova's worker is listening on the ai-agents-nova queue. Leave this terminal open (Ctrl+C stops it).");
try {
  await worker.run();
} finally {
  await connection.close();
}
