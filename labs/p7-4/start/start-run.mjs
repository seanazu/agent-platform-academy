// Starts an agent's run for one thing (a ticket, a PR, a red build).
// Every trigger calls this: the Jira poll, Slack /nova, a comment on the ticket.
import { randomUUID } from 'node:crypto';
import { WorkflowIdConflictPolicy } from '@temporalio/client';

export const startRun = async (client, agent, thing) => {
  return client.workflow.start('ticketToPr', {
    args: [thing],
    workflowId: randomUUID(), // TODO (Build it): the ID should name what the run works on: agent:thing
    taskQueue: 'ai-agents-nova', // TODO (Build it): every agent has its own queue: ai-agents-<agent>
    // TODO (Build it): when a run with this ID is already open, join it. WorkflowIdConflictPolicy has the options.
  });
};
