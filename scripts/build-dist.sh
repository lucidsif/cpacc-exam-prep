#!/usr/bin/env bash
# scripts/build-dist.sh — stage the deployable bundle.
#
# Cloudflare Pages will host this dist/ folder. Only the folders and files
# copied below make it into dist/, so anything not needed at runtime
# (tests, docs, personal data.json, etc.) is left out by omission. The
# copyrighted CPACC_BoK.pdf isn't part of this repo at all anymore (it's
# git-ignored, see .gitignore) — it's still listed in the .assetsignore
# below as a backstop.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"

rm -rf "$DIST"
mkdir -p "$DIST"

cp "$ROOT/index.html"          "$DIST/"
cp -R "$ROOT/styles"           "$DIST/"
cp -R "$ROOT/src"              "$DIST/"
cp -R "$ROOT/data"             "$DIST/"
cp -R "$ROOT/functions"        "$DIST/"

# Belt-and-suspenders: pattern list for any future tooling that respects it.
# CPACC_BoK.pdf is already git-ignored and untracked, but the author's
# working copy still has it on disk at the repo root — keeping it listed
# here means a future change to the cp commands above (e.g. a broader
# `cp -R "$ROOT"/*`) can't accidentally ship it.
cat > "$DIST/.assetsignore" <<'EOF'
*.test.js
data.json
CPACC_BoK.pdf
node_modules/
EOF

echo "Staged $(find "$DIST" -type f | wc -l | tr -d ' ') files in $DIST"
du -sh "$DIST"
