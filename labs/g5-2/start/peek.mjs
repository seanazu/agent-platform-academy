// Look at the red builds in fixtures/.
//   node peek.mjs            one line per build
//   node peek.mjs 18823011   one build in full, with its log
import { readdirSync, readFileSync } from 'node:fs';

const folder = new URL('./fixtures/', import.meta.url);
const builds = readdirSync(folder).filter((file) => file.endsWith('.json')).sort().map((file) => JSON.parse(readFileSync(new URL(file, folder), 'utf8')));
const [runId] = process.argv.slice(2);

if (!runId) {
  console.log('run id     pushed    last green  started               failing job');
  for (const build of builds) {
    console.log(`${build.runId}   ${build.pushedSha.slice(0, 7)}   ${build.lastGreenSha.slice(0, 7)}     ${build.startedAt}  ${build.jobs.map((job) => job.name).join(', ')}`);
  }
} else {
  const build = builds.find((b) => String(b.runId) === runId);
  if (!build) {
    console.log(`There is no build ${runId}. Run node peek.mjs to see the run ids.`);
    process.exit(1);
  }
  console.log(`run ${build.runId} on ${build.repo}/${build.branch}, pushed ${build.pushedSha.slice(0, 7)}, last green ${build.lastGreenSha.slice(0, 7)}, started ${build.startedAt}`);
  for (const job of build.jobs) {
    console.log(`\n── job: ${job.name} ──`);
    console.log(job.log);
  }
}
