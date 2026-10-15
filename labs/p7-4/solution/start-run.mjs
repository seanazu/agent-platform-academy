// Starts an agent's run for one thing (a ticket, a PR, a red build).
// Every trigger calls this: the Jira poll, Slack /nova, a comment on the ticket.
import { WorkflowIdConflictPolicy } from '@temporalio/client';

export const startRun = async (client, agent, thing) => {
  return client.workflow.start('ticketToPr', {
    args: [thing],
    workflowId: `${agent}:${thing}`,
    taskQueue: `ai-agents-${agent}`,
    workflowIdConflictPolicy: WorkflowIdConflictPolicy.USE_EXISTING,
  });
};
