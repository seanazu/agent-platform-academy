// The merge wall for PRs that an agent wrote.
//
// pr:        { number: 2512, ticket: 'RH-1234', author: 'nova', requester: 'sean' }
//            requester is the person who asked for the change (the Jira poll wrote it down).
// approvals: [{ by: 'byte', kind: 'agent' }, { by: 'sean', kind: 'human' }]
//            kind is 'human', 'agent' or 'bot'.
//
// Give back { ok: true, reason: '...' } when a person may press Merge,
// and { ok: false, reason: '...' } when not. The reason is a short sentence for people.
//
// The rules:
//   1. Approvals from agents and bots (Nova, Byte, any bot) never count.
//   2. The requester's own approval never counts, because they asked for the change.
//   3. One approval from any other person is needed, and one is enough.

export const canMerge = (pr, approvals) => {
  const counted = approvals.filter((approval) => approval.kind === 'human' && approval.by !== pr.requester);
  if (counted.length === 0) {
    return { ok: false, reason: `it needs one approval from a person who is not ${pr.requester} (agents and bots do not count)` };
  }
  return { ok: true, reason: `${counted[0].by} approved, and ${counted[0].by} did not ask for the change` };
};
