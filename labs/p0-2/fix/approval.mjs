// Someone made canMerge "simpler" last week. Since then, Byte's review alone is enough to merge.
// Read fix/README.md for the story, then make the checks pass: ./academy check --fix

export const canMerge = (pr, approvals) => {
  const counted = approvals.filter((approval) => approval.by !== pr.requester);
  if (counted.length === 0) {
    return { ok: false, reason: `it needs one approval from someone who is not ${pr.requester}` };
  }
  return { ok: true, reason: `${counted[0].by} approved, and ${counted[0].by} did not ask for the change` };
};
