# Fix it: Byte merged a PR on its own

Last week someone made `canMerge` "simpler". This morning Nova opened a PR, Byte (the review agent) approved it,
and a minute later the PR was merged, but no person had looked at it.

The bug is in `fix/approval.mjs`, so open it and find the line that lets an agent's approval count.

See the bug:   node journey.mjs --fix
Check the fix: ./academy check --fix
