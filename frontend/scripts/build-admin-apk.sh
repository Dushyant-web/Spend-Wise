#!/usr/bin/env bash
# Build SpendWise Admin APK
# - Builds Next.js with NEXT_PUBLIC_APP_MODE=admin
# - Copies static export into android-admin/ project
# - Opens Android Studio for the admin project

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "▸ Cleaning previous build…"
rm -rf .next out

echo "▸ Building Next.js (admin mode)…"
NEXT_PUBLIC_APP_MODE=admin npx next build

ASSETS_DIR="$ROOT/android-admin/app/src/main/assets/public"
echo "▸ Syncing web bundle → $ASSETS_DIR"
rm -rf "$ASSETS_DIR"
mkdir -p "$ASSETS_DIR"
cp -R out/. "$ASSETS_DIR/"

echo "✓ Admin web bundle synced."
echo ""
echo "Next steps:"
echo "  1. Open Android Studio at: $ROOT/android-admin"
echo "  2. Build → Build APK(s)"
echo "  3. Output: android-admin/app/build/outputs/apk/debug/SpendWiseAdmin.apk"

# Optional: auto-open Android Studio if the binary is available
if command -v open >/dev/null 2>&1 && [ -d "/Applications/Android Studio.app" ]; then
  open -a "Android Studio" "$ROOT/android-admin"
fi
