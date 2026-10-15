# Fix it: the newest trigger wins

Someone wanted "the newest trigger to win", so they changed one word in `startRun`.
Today Nova worked on a ticket for 40 minutes. Then Sean typed /nova in Slack to ask how it was going,
and Nova started again from zero. The 40 minutes of work were thrown away.

The bug is in `fix/start-run.mjs`.

See it (the dev server and the worker must be running):  node clean.mjs && node triggers.mjs --fix
Check the fix:                                            ./academy check --fix
