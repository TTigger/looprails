#!/usr/bin/env bash
# bootstrap (macOS / Linux). Zero-symlink by design (ADR-002): this makes hooks runnable, checks
# prerequisites, and ensures runtime files exist. It creates NO symlinks.
set -euo pipefail
echo "-> looprails bootstrap"

# 1. Make hooks + entry scripts executable.
chmod +x .agents/hooks/*.sh scripts/loop.mjs eval/harness.mjs 2>/dev/null || true

# 2. Prerequisite checks.
command -v node >/dev/null 2>&1 || { echo "x node not found (need Node 18+)"; exit 1; }
command -v git  >/dev/null 2>&1 || echo "! git not found - parallel worktree isolation will be unavailable"
command -v jq   >/dev/null 2>&1 || echo "! jq not found - hooks fall back to a cruder path parser (recommended: install jq)"

# 3. Ensure runtime dirs/files exist (no symlinks - see ADR-002).
mkdir -p tasks .agent-learnings/entries .review
[ -f CLAUDE.md ]           || printf '@AGENTS.md\n' > CLAUDE.md
[ -f .agent-learnings.md ] || printf '# Agent Learnings (index)\n' > .agent-learnings.md

# 4. Generate Claude Code slash commands from the single source in .agents/commands/.
#    .claude/commands/ is gitignored and regenerated here (never hand-edited) - the same
#    bootstrap-generated-plain-file pattern as .claude/settings.json (ADR-001/002). Zero symlinks.
if [ -d .agents/commands ]; then
  mkdir -p .claude/commands
  cp -f .agents/commands/*.md .claude/commands/ 2>/dev/null || true
fi

cat <<'EOF'
ok bootstrap done. Next:
  1) Fill AGENTS.md (Project / Setup / Constraints), or run /calibrate for guided setup.
  2) Write your phases in PHASES.md.
  3) Start a loop:  node scripts/loop.mjs phase-1 --tool claude
EOF
