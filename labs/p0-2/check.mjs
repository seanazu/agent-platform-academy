// Checks for lab p0-2. The same checks run on approval.mjs (build) and on fix/approval.mjs (fix).
export const expect = {
  start: 'canMerge is not written yet',
  fix: 'approvals from agents and bots never count',
};
export const celebrate = "Nova's PRs can now merge only one way: a person who did not ask for the change said yes.";
export const fixed = 'Byte can review, but it can no longer open the merge gate on its own.';

const pr = { number: 2512, ticket: 'RH-1234', author: 'nova', requester: 'sean' };
const person = (by) => ({ by, kind: 'human' });
const bot = (by) => ({ by, kind: 'bot' });
const agent = (by) => ({ by, kind: 'agent' });

export const prepare = async (ctx) => {
  ctx.canMerge = (await ctx.load('approval.mjs')).canMerge;
  if (typeof ctx.canMerge !== 'function') throw new Error('approval.mjs does not export canMerge: keep the line "export const canMerge = (pr, approvals) => {"');
};

// Ask with copies, so one answer can't change the next question.
const ask = (ctx, approvals, request = pr) => ctx.canMerge(structuredClone(request), structuredClone(approvals));

const expectAnswer = (ok, approvals, what, why, request) => (ctx) => {
  const answer = ask(ctx, approvals, request);
  if (answer?.ok !== ok) return { what, why };
};

export const checks = [
  {
    pass: 'canMerge gives back an answer like { ok: true, reason: "..." }',
    gate: true,
    run: (ctx) => {
      let answer;
      try {
        answer = ask(ctx, [person('dana')]);
      } catch (error) {
        if (/TODO/.test(error.message)) return { what: 'canMerge is not written yet', why: 'approval.mjs still throws the TODO error, so replace that line with the three rules' };
        return { what: 'canMerge crashed', why: `it threw "${error.message}"` };
      }
      if (typeof answer?.ok !== 'boolean' || typeof answer.reason !== 'string' || !answer.reason.trim()) {
        return { what: `canMerge gave back ${JSON.stringify(answer)}`, why: 'it must give back an object with ok (true or false) and reason (a short sentence), like { ok: false, reason: "needs an approval" }' };
      }
    },
  },
  {
    pass: 'with no approvals, nobody may merge',
    run: expectAnswer(false, [], 'a PR with no approvals was allowed to merge', 'with zero approvals the answer must be no, because nobody has looked at the change'),
  },
  {
    pass: 'one approval from a person who did not ask (Dana) is enough',
    run: expectAnswer(true, [person('dana')], 'Dana approved, she did not ask for the change, and you still said no', 'one approval from a person who is not the requester is enough'),
  },
  {
    pass: "the requester's own approval (Sean) does not count",
    run: expectAnswer(false, [person('sean')], "the requester approved their own agent's PR and you allowed the merge", "the requester's approval must never count, because they asked for the change"),
  },
  {
    pass: "an agent's approval (Byte) does not count",
    run: expectAnswer(false, [agent('byte')], 'Byte (an agent) approved and you allowed the merge', "approvals from agents and bots never count, only people's approvals do"),
  },
  {
    pass: "the author's own approval (Nova) does not count",
    run: expectAnswer(false, [agent('nova')], 'Nova approved its own PR and you allowed the merge', "approvals from agents and bots never count, only people's approvals do"),
  },
  {
    pass: "a bot's approval does not count",
    run: expectAnswer(false, [bot('renovate')], 'the renovate bot approved and you allowed the merge', "approvals from agents and bots never count, only people's approvals do"),
  },
  {
    pass: "this morning's story (Byte and Sean approved) is still a no",
    run: expectAnswer(false, [agent('byte'), person('sean')], 'Byte and the requester approved and you allowed the merge', 'neither approval counts: one is an agent, the other asked for the change'),
  },
  {
    pass: 'Dana approving after Byte and Sean makes it a yes',
    run: expectAnswer(true, [agent('byte'), person('sean'), person('dana')], 'Dana approved after Byte and Sean and you still said no', "Dana's approval counts even when the others don't"),
  },
  {
    pass: 'two people approving is fine too',
    run: expectAnswer(true, [person('dana'), person('noa')], 'Dana and Noa both approved and you said no', 'one approval is needed and one is enough, so two is fine too'),
  },
  {
    pass: 'the requester comes from the PR, not from a fixed name',
    run: expectAnswer(true, [person('sean')], 'Dana asked for this change, Sean approved it, and you said no', 'use pr.requester, because a different person asks on every ticket', { ...pr, requester: 'dana' }),
  },
];
