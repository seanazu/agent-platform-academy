// Names the problem behind a red build, so every build that is red for the same reason
// joins ONE fixer run with the workflow ID cifix:fcp:<fingerprint>.
//
// A failure (see fixtures/*.json) looks like:
//   { repo, branch, runId, pushedSha, lastGreenSha, startedAt, jobs: [{ name, log }] }
//
// Keep what stays the same while main is broken:
//   the last green commit, the failing job names, each job's first error line.
// Drop what changes on every run:
//   timestamps, temp folders, run ids, durations, the pushed commit.
import { createHash } from 'node:crypto';

// The first line of a log that looks like an error.
export const firstError = (log) => {
  // TODO (Build it): find the first line that says "error" or "fail".
  throw new Error('TODO: firstError is not written yet');
};

// One error line without the parts that change on every run.
export const normalise = (line) => {
  // TODO (Build it): strip timestamps, temp folders (/tmp/...) and durations (48ms, 1.2s).
  throw new Error('TODO: normalise is not written yet');
};

// Today this hashes the whole record, so every red build gets its own fixer.
export const fingerprint = (failure) => {
  // TODO (Build it): hash lastGreenSha + the sorted "job name | normalised first error" lines instead.
  return createHash('sha256').update(JSON.stringify(failure)).digest('hex').slice(0, 12);
};
