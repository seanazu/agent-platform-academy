# Fix it: a storm of fixers

Last night someone wanted "more precise" fixers, so they added the pushed commit to the fingerprint.
This morning main went red, ten people pushed, and ten fixer runs started on the same broken test.
Each one opened its own PR with the same one-line fix.

The bug is in `fix/fingerprint.mjs`.

See the storm:  node storm.mjs --fix
Check the fix:  ./academy check --fix
