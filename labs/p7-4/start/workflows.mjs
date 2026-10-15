// Nova's run for one ticket, cut down to the part this lab needs:
// it says hello, then waits (up to 7 days) for a person to approve.
import { condition, defineSignal, proxyActivities, setHandler, workflowInfo } from '@temporalio/workflow';

const { say } = proxyActivities({ startToCloseTimeout: '10 seconds' });

export const approve = defineSignal('approve');

export async function ticketToPr(ticket) {
  const { workflowId, runId } = workflowInfo();
  let approvedBy;
  setHandler(approve, (who) => {
    approvedBy = who;
  });
  await say(`Nova started working on ${ticket}   ID ${workflowId}   run ${runId.slice(-8)}`);
  if (!(await condition(() => approvedBy !== undefined, '7 days'))) {
    await say(`Nobody approved ${ticket} in 7 days, so Nova stops.`);
    return 'nobody approved';
  }
  await say(`${approvedBy} approved ${ticket}, so a person can merge the PR now.`);
  return `approved by ${approvedBy}`;
}
