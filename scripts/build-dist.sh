#!/usr/bin/env bash
# scripts/build-dist.sh — stage the deployable bundle.
#
# Cloudflare Pages will host this dist/ folder. Everything not needed at
# runtime (tests, docs, the CPACC_BoK.pdf, personal data.json, etc.) is
# deliberately excluded so we don't ship copyrighted material or personal
# state with the public deploy.

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
cat > "$DIST/.assetsignore" <<'EOF'
*.test.js
data.json
CPACC_BoK.pdf
node_modules/
EOF

echo "Staged $(find "$DIST" -type f | wc -l | tr -d ' ') files in $DIST"
du -sh "$DIST"
