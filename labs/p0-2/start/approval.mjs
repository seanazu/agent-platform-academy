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
  // TODO: write the three rules above, then delete the next line.
  throw new Error('TODO: canMerge is not written yet');
};
