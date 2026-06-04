---
name: expand-phase
description: Read PHASES.md and generate strict tasks/*.md (machine-readable frontmatter + five-part body) for one phase. Use when loop.mjs or a user asks to expand a phase into tasks.
---

# expand-phase

Turn ONE human-written phase from `PHASES.md` into one or more strict task files that `loop.mjs`,
`scope-guard`, and `eval/harness.mjs` can read deterministically. Humans never hand-write these.

## Input
- A phase id (e.g. `phase-1`).
- `PHASES.md` — read the matching `### Phase N` block.

## Output
For each exit criterion (or coherent sub-goal), write `tasks/<phase>-<n>.md` in EXACTLY this shape.
The frontmatter is strict: fill every field; lists use `- ` items.

```
---
id: phase-1-1
phase: 1
title: <short imperative title>
eval_mode: quant            # quant | qual | mixed  (inherit from the phase)
rubric: null                # e.g. frontend-beauty  (REQUIRED if eval_mode includes qual)
depends_on: []              # task ids that must finish first
tags: [auth, jwt]           # for learnings retrieval
scope:                      # globs the builder may edit (copy from the phase Scope; do not widen)
  - src/features/auth/**
checklist:                  # gate-2a items the validator judges (quant/mixed); [] for pure qual
  - Passwords stored hashed with argon2
test_cmd: null              # override the AGENTS.md Test command only if this task needs it
max_attempts: 5
---
# Outcome
<the concrete end state, derived from the exit criterion>

# Verification
<how to verify: the test command and/or which rubric; this ties to gate 1 / gate 2>

# Constraints
<no-go zones; restate scope in prose; reference relevant .agents/rules/*>

# Iteration policy
After each change, record: what changed, the measured quality, the single next thing most worth trying.

# Error handling
If the verifier won't run, or all reasonable approaches are exhausted, stop and report:
what was tried, where it is blocked, and what input is needed to continue.
```

## Rules
- Keep each task small enough to run in its own parallel worktree.
- Never widen `scope` beyond the phase's Scope.
- `eval_mode: qual` (or `mixed`) MUST set a `rubric`.
- All five body sections are mandatory.
- Prefer several small tasks over one large task when a phase has independent exit criteria.
