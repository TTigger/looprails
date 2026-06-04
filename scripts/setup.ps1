# bootstrap (Windows / PowerShell). Zero-symlink by design (ADR-002): checks prerequisites and
# ensures runtime files exist. Creates NO symlinks (this is why Windows clones do not break).
Write-Host "-> looprails bootstrap"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Write-Error "node not found (need Node 18+)"; exit 1 }
if (-not (Get-Command git  -ErrorAction SilentlyContinue)) { Write-Host "! git not found - parallel worktree isolation will be unavailable" }
if (-not (Get-Command jq   -ErrorAction SilentlyContinue)) { Write-Host "! jq not found - hooks fall back to a cruder path parser (recommended: install jq)" }

New-Item -ItemType Directory -Force -Path "tasks", ".agent-learnings/entries", ".review" | Out-Null
if (-not (Test-Path "CLAUDE.md"))           { "@AGENTS.md"                | Out-File -Encoding utf8 "CLAUDE.md" }
if (-not (Test-Path ".agent-learnings.md")) { "# Agent Learnings (index)" | Out-File -Encoding utf8 ".agent-learnings.md" }

# Generate Claude Code slash commands from the single source in .agents/commands/.
# .claude/commands/ is gitignored and regenerated here (never hand-edited) - same
# bootstrap-generated-plain-file pattern as .claude/settings.json (ADR-001/002).
if (Test-Path ".agents/commands") {
  New-Item -ItemType Directory -Force -Path ".claude/commands" | Out-Null
  Copy-Item -Force ".agents/commands/*.md" ".claude/commands/" -ErrorAction SilentlyContinue
}

Write-Host "ok bootstrap done. Next:"
Write-Host "  1) Fill AGENTS.md (Project / Setup / Constraints), or run /calibrate."
Write-Host "  2) Write your phases in PHASES.md."
Write-Host "  3) Start a loop:  node scripts/loop.mjs phase-1 --tool claude"
