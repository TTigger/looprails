#!/usr/bin/env bash
# stop-require-green.sh — Stop hook: refuse to end the session until gate 1 (tests) is green.
# This is the deterministic enforcement of "no 'done' without green" (ADR-003).
# Exit 0 = allow stop. Exit 2 = block stop and tell the model to keep going.
set -uo pipefail

# Resolve the project's Test command (gate 1). Order:
#   1. $TEST_CMD env override (use this for non-npm runners, e.g. TEST_CMD=pytest).
#   2. a "test" script in package.json -> `npm test`.
#   3. none of the above -> the template is not calibrated yet; stay DORMANT and allow stop
#      (mirrors scope-guard's "no active scope -> don't interfere"). /calibrate wires a real
#      Test command (AGENTS.md §Setup + package.json "test" or $TEST_CMD), which arms this gate.
cmd="${TEST_CMD:-}"
if [ -z "$cmd" ]; then
  if [ -f package.json ] && grep -Eq '"test"[[:space:]]*:' package.json; then
    cmd="npm test"
  else
    exit 0
  fi
fi

log="$(mktemp -t stop-require-green.XXXXXX.log)"
if sh -c "$cmd" >"$log" 2>&1; then
  exit 0
fi

echo "stop-require-green: gate 1 is not green ('$cmd' failed); not allowed to stop. Fix it first. Log: $log" >&2
exit 2
