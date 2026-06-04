---
name: onboarding
description: Guided calibration for /calibrate. Interview the user, DRAFT AGENTS.md fields + initial rubric weights, and write them only after the user confirms. Soft layer only — never weaken the hard spine.
---

# onboarding (/calibrate)

Lower the blank-page barrier WITHOUT opaque auto-learning (ADR-010). You **draft**; the user **decides**.

## 1. Interview (ask a few, one at a time)
1. Project: one-line description + domain.
2. Stack, and the install / dev / build / test commands.
3. Primary work type: mostly quantitative (code/logic), qualitative (UI/writing/design), or mixed?
4. For qualitative work: what does "good" mean to you here? Which dimensions matter most?
5. No-go zones: paths or actions the agent must never touch.

## 2. Draft (do NOT write yet)
- Propose the `Project`, `Setup`, and `Constraints` sections for `AGENTS.md`.
- Propose initial rubric **weights** for the relevant rubric(s), based on answer 4 (weights only).
- Show the drafts and ask for edits / confirmation.

## 3. Write (only after explicit confirmation)
- Patch the `<TODO>` fields in `AGENTS.md` with the confirmed text.
- Update rubric weights (must still sum to 100).
- **Arm gate 1**: make the Test command runnable as `npm test` — point `package.json` `"test"` at it,
  or set `TEST_CMD`. Until one of these exists, `stop-require-green` stays dormant (a fresh template
  cannot be blocked by a test that does not exist yet). Verify it now arms — a red test must block
  stop. This wires the hard spine on; it never weakens it, so it is in-bounds.

## Boundaries
- Touch the **soft layer only**: rubric weights, style preferences, rules wording.
- **Never** weaken the hard spine: tests must pass, scope/constraints must hold, gates stay binary.
- Keep it minimal. An over-stuffed `AGENTS.md` hurts more than a sparse one — do not auto-bloat.
