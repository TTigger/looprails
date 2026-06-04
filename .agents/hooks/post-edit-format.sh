#!/usr/bin/env bash
# post-edit-format.sh — PostToolUse(Edit|Write|MultiEdit): format the edited file if possible.
# Best-effort and non-blocking: never fail the tool call just because formatting failed.
set -uo pipefail

input="$(cat)"
if command -v jq >/dev/null 2>&1; then
  target="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.path // empty' 2>/dev/null || true)"
else
  target="$(printf '%s' "$input" | grep -oE '"(file_path|path)"[^"]*"[^"]*"' | head -n1 | sed -E 's/.*"([^"]*)"$/\1/')"
fi
[ -n "${target:-}" ] && [ -f "$target" ] || exit 0

# TODO: swap for your formatter of choice (biome, eslint --fix, ruff, gofmt, ...).
if command -v npx >/dev/null 2>&1; then
  npx --no-install prettier --write "$target" >/dev/null 2>&1 || true
fi
exit 0
