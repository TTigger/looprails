---
name: closed-loop
description: The end-to-end flow for /loop — generate, verify, fix, learn, until done or human review. Use when running a phase through the closed loop.
---

# closed-loop

The playbook `/loop <phase-id>` follows. The iterate-until-done mechanics (the loop, persistence,
parallel worktrees) run on the tool's NATIVE /goal·/batch; this skill is the discipline around it.

1. **EXPAND** — run `expand-phase` on the phase in `PHASES.md` → strict `tasks/*.md`.
2. For each task (independent ones in parallel worktrees):
   - **GENERATE** — the `builder` subagent implements it within scope, after reading the learnings
     whose tags match the task.
   - **VERIFY** — `eval/harness.mjs` runs every iteration: gate 1 (deterministic tests) + gate 2
     (checklist via `validator`, or rubric via `score.mjs` for qualitative). Output is binary + diagnosis.
   - **FIX** — on fail, `diagnose-failure` turns the result into one concrete next instruction; iterate.
   - **STOP** — both gates green → go to step 3. Stuck after `max_attempts` → flag for human review.
3. **LEARN** — `record-learning` writes a tagged four-block entry and updates the index; append a
   line to `CHANGELOG.md`.

## Invariants (do not violate)
- Never declare "done" yourself — the verifier (gate 1) and the independent validator (gate 2) decide.
- Never edit outside the task scope — `scope-guard` enforces it; if you need more, stop and report.
- Never end on red — `stop-require-green` blocks a stop while tests fail.
- Never ship on a guess — exhausting attempts means human review, not a fake pass.
