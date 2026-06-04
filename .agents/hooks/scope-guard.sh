#!/usr/bin/env bash
# scope-guard.sh — PreToolUse(Edit|Write|MultiEdit): block edits outside the active task scope.
#
# Reads allowed path globs from `.active-scope` (one per line) written by loop.mjs per task.
# The agent CLI passes the tool call as JSON on stdin; we extract the target file path and check it.
# Exit 0 = allow. Exit 2 = block (non-zero blocks the tool call and the reason goes to the model).
set -uo pipefail

scope_file=".active-scope"
[ -f "$scope_file" ] || exit 0          # no active scope -> do not interfere

input="$(cat)"
# Prefer jq; fall back to a crude grep if jq is absent.
if command -v jq >/dev/null 2>&1; then
  target="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.path // empty' 2>/dev/null || true)"
else
  target="$(printf '%s' "$input" | grep -oE '"(file_path|path)"[^"]*"[^"]*"' | head -n1 | sed -E 's/.*"([^"]*)"$/\1/')"
fi
[ -n "${target:-}" ] || exit 0          # not a file-targeting tool -> allow

rel="${target#"$PWD/"}"                  # make repo-relative when possible

# NOTE: bash `case` does not expand `**` recursively. For a faithful match, enable globstar
# (shopt -s globstar extglob) or replace this with a real globmatch util. Simplified here.
shopt -s extglob globstar 2>/dev/null || true
while IFS= read -r glob; do
  [ -z "$glob" ] && continue
  # shellcheck disable=SC2254
  case "$rel" in
    $glob) exit 0 ;;
  esac
done < "$scope_file"

echo "scope-guard: '$rel' is outside this task's scope. Allowed: $(paste -sd',' "$scope_file"). If you need more scope, stop and report it." >&2
exit 2
