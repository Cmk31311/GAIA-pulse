#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"

echo "🚀 GAIA CODE Packaging Script"
echo "================================"

# Clean and create dist directory
rm -rf "$DIST"
mkdir -p "$DIST"

package() {
  NAME="$1"
  REQ="$ROOT/requirements/$2.txt"
  SRC="$ROOT/lambdas/$1"
  OUT="$DIST/$1.zip"
  TMP="$(mktemp -d)"
  
  echo ""
  echo "📦 Building $NAME Lambda..."
  echo "   Source: $SRC"
  echo "   Requirements: $REQ"
  
  # Install dependencies
  if [ -f "$REQ" ]; then
    python3 -m pip install -r "$REQ" -t "$TMP" --quiet
  fi
  
  # Copy source files
  cp -R "$SRC/"* "$TMP/"
  
  # Create zip
  (cd "$TMP" && zip -r "$OUT" . >/dev/null)
  
  # Cleanup
  rm -rf "$TMP"
  
  # Show size
  SIZE=$(du -h "$OUT" | cut -f1)
  echo "   ✅ Built $OUT ($SIZE)"
}

# Package both Lambdas
package ingest ingest
package narrative narrative

echo ""
echo "================================"
echo "✅ All packages built successfully!"
echo ""
echo "📂 Distribution files:"
ls -lh "$DIST"/*.zip

echo ""
echo "🎯 Next steps:"
echo "   1. Upload ingest.zip to gaia-ingest-lambda"
echo "   2. Upload narrative.zip to gaia-narrative-lambda"
echo "   3. Test the Step Functions state machine"

