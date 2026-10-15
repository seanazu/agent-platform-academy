// Someone wanted "the newest trigger to win", so they changed the conflict policy.
// Read fix/README.md for the story, then make the checks pass: ./academy check --fix
import { WorkflowIdConflictPolicy } from '@temporalio/client';

export const startRun = async (client, agent, thing) => {
  return client.workflow.start('ticketToPr', {
    args: [thing],
    workflowId: `${agent}:${thing}`,
    taskQueue: `ai-agents-${agent}`,
    workflowIdConflictPolicy: WorkflowIdConflictPolicy.TERMINATE_EXISTING,
  });
};
