# Build it

Run `node peek.mjs 18823011 | grep FAIL` and `node peek.mjs 18824410 | grep FAIL`. The two lines say the same
thing, but they are not the same text. Write down every part that is different: that is what normalise must remove.

---

Write it in three small pieces. `firstError(log)`: split the log into lines and find the first one that matches
`/error|fail/i`. `normalise(line)`: a few `.replace()` calls, one for each changing part. `fingerprint`: join
`lastGreenSha` and one `"job name | normalised first error"` line per job (sorted), then hash that text.

---

There are three changing parts in a FAIL line, and one regular expression can catch each of them.
Timestamps come in two formats (2026-10-14T10:01:22.2113356Z and 2026-10-14 11:20:15.668),
temp folders look like /tmp/ci-8sK2pq, and durations look like 48ms or 1.2s:

    /\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(\.\d+)?Z?/g
    /\/tmp\/[^/\s]+/g
    /\b\d+(\.\d+)?m?s\b/g

---

Almost the answer:

    export const firstError = (log) => log.split('\n').find((line) => /error|fail/i.test(line)) ?? '';

    export const normalise = (line) => line
      .replace(/\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(\.\d+)?Z?/g, '')
      .replace(/\/tmp\/[^/\s]+/g, '/tmp/x')
      .replace(/\b\d+(\.\d+)?m?s\b/g, '')
      .replace(/\s+/g, ' ').trim();

    export const fingerprint = (failure) => {
      const jobs = failure.jobs.map((job) => `${job.name} | ${normalise(firstError(job.log))}`).sort();
      return createHash('sha256').update([failure.lastGreenSha, ...jobs].join('\n')).digest('hex').slice(0, 12);
    };

# Fix it

Run `node storm.mjs --fix`. Every build has its own fixer again. Which field of a build changes on every push?

---

Look at the line in `fix/fingerprint.mjs` that builds the text to hash. One field in it changes on every push: remove it.
