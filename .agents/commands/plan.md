---
description: Turn a multi-turn conversation into phases in PHASES.md.
argument-hint: <what you want to build>
---
Help me plan: **$ARGUMENTS**.

Do not write anything yet. Interview me over as many turns as it takes to make the goal concrete:
scope, what "done" looks like, constraints / no-go zones, whether each part is quantitative (tests)
or qualitative (which rubric), and dependencies between parts. Ask one focused thing at a time.

When we have nailed it, organize the result into `PHASES.md` following its Contract: a
`### Phase N: <name>` heading with **Goal / Eval mode / Rubric / Depends on / Exit criteria / Scope**.
Exit criteria must be verifiable — they become the gate-2 checklist. Show me the draft and get my
confirmation before saving.

Do not start building. Once `PHASES.md` is confirmed, I will run `/loop <phase-id>`.
