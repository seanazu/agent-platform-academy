#!/usr/bin/env bash
# Build the course and publish dist/ to the gh-pages branch (GitHub Pages serves that branch).
# Usage: npm run deploy
set -euo pipefail
cd "$(dirname "$0")/.."
node tools/scrub.mjs
npm run build
remote=$(git remote get-url origin)
cd dist
touch .nojekyll
rm -rf .git
git init -q -b gh-pages
git add -A
git commit -q -m "Deploy $(date -u +%Y-%m-%dT%H:%MZ)"
git push -q -f "$remote" gh-pages
echo "deployed to gh-pages"
