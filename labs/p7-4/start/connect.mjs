// One place that connects to the local Temporal dev server and explains what to do when it is not running.
import { Client, Connection } from '@temporalio/client';

export const address = process.env.TEMPORAL_ADDRESS ?? 'localhost:7233';

export const connect = async () => {
  try {
    const connection = await Connection.connect({ address, connectTimeout: '3 seconds' });
    return new Client({ connection, namespace: 'default' });
  } catch {
    console.log(`I can't reach Temporal on ${address}, so the dev server is probably not running.`);
    console.log('Start it in another terminal and leave it open:  temporal server start-dev');
    process.exit(1);
  }
};
