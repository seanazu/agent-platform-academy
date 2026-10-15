# Build it

Start with the list of approvals and throw away the ones that don't count. Whatever is left decides the answer:
nothing left means no, anything left means yes.

---

`approvals.filter(...)` keeps the items you say yes to. An approval counts when two things are true:
its `kind` is `'human'`, and its `by` is not `pr.requester`.

---

Almost the answer:

    const counted = approvals.filter((a) => a.kind === 'human' && a.by !== pr.requester);
    if (counted.length === 0) return { ok: false, reason: 'needs an approval from a person who did not ask' };
    return { ok: true, reason: `${counted[0].by} approved` };

# Fix it

Run `node journey.mjs --fix` and read the yes. Which approval made it a yes?

---

The filter in `fix/approval.mjs` only throws away the requester. It also needs to throw away every approval
whose `kind` is not `'human'`.
