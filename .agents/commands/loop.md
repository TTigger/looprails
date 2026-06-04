---
description: Run the closed-loop development flow on a phase.
argument-hint: <phase-id>
---
Run the closed-loop flow for phase **$ARGUMENTS**.

Follow `.agents/skills/closed-loop/SKILL.md`. In short: expand the phase into strict tasks, then for
each task generate → verify (gate 1 tests + gate 2 checklist/rubric) → fix on failure → record a
learning on success. Stop and flag for human review if a task is stuck after its max attempts.

The mechanics run on native /goal·/batch. Script entrypoint, if you prefer it:
`node scripts/loop.mjs $ARGUMENTS --tool claude`.

Invariants: never declare done yourself (the verifier decides), never edit outside the task scope,
never end on red tests, never fake a pass.
