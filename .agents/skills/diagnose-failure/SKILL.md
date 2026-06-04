---
name: diagnose-failure
description: Turn a verifier failure (gate-1 logs or gate-2 diagnosis/scores) into the single most actionable next instruction for the builder. Use between iterations when a gate fails.
---

# diagnose-failure

**Input**: the failing gate's output — gate-1 test/lint/type logs, or the gate-2 validator
`diagnosis` (+ rubric `scores`).
**Output**: ONE concrete instruction the builder can act on next. Not a list. Not "try harder."

## Method
1. Find the FIRST real cause, not a downstream symptom (a failing import often hides a missing
   export; a low "technical execution" score usually traces to one spacing/contrast root).
2. State the fix as a single concrete action, scoped to the task's allowed paths.
3. If the failure is environmental (verifier won't run, missing tool, flaky network), say so plainly
   and route to the task's Error handling — do not guess around a broken harness.
4. If the same diagnosis has repeated across iterations, escalate: propose a *different* approach, or
   recommend stopping for human review. Repeating the same fix is a loop smell.

## Style
Be specific. "Extract the duplicated card padding into a 16px spacing token and apply it to both
cards" beats "improve spacing." Specificity is what makes the next iteration converge instead of wander.
