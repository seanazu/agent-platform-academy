// Someone wanted "more precise" fixers and added the pushed commit to the fingerprint.
// Read fix/README.md for the story, then make the checks pass: ./academy check --fix
//
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
export const firstError = (log) => log.split('\n').find((line) => /error|fail/i.test(line)) ?? '';

// One error line without the parts that change on every run.
export const normalise = (line) =>
  line
    .replace(/\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(\.\d+)?Z?/g, '') // timestamps, with or without the T and Z
    .replace(/\/tmp\/[^/\s]+/g, '/tmp/x') // temp folders
    .replace(/\b\d+(\.\d+)?m?s\b/g, '') // durations: 48ms, 1.2s
    .replace(/\s+/g, ' ')
    .trim();

// lastGreenSha + the pushed commit + the sorted "job name | normalised first error" lines, as 12 hex characters.
export const fingerprint = (failure) => {
  const jobs = failure.jobs.map((job) => `${job.name} | ${normalise(firstError(job.log))}`).sort();
  return createHash('sha256').update([failure.lastGreenSha, failure.pushedSha, ...jobs].join('\n')).digest('hex').slice(0, 12);
};
