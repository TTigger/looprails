# AGENTS.md

> Single source of truth. Every AI agent reads this **first**.
> Claude reads it via the `@AGENTS.md` import in `CLAUDE.md`; other tools read this file natively.
> Principle: this file holds **pointers + rule summaries only**. Push detail out via references;
> never inline-stack content here. (Kept under 100 lines on purpose — before adding a line,
> ask: does it earn its place?)

## Project
<!-- TODO: fill via /calibrate or by hand. One line + domain constraints. -->
- Name: `<TODO>`
- Domain: `<TODO>`
- Stack: `<TODO e.g. Next.js 15 / TypeScript / Prisma / PostgreSQL>`

## Setup
<!-- TODO: point at your existing commands; do not reinvent them. -->
- Install: `<TODO e.g. pnpm i>`
- Dev:     `<TODO e.g. pnpm dev>`
- Build:   `<TODO e.g. pnpm build>`
- Test:    `<TODO e.g. pnpm test>`   # gate 1 deterministic signal

## Closed-loop protocol
- Start: `/loop <phase-id>` (full flow in `.agents/skills/closed-loop/SKILL.md`).
- The loop itself runs on native `/goal`·`/batch`; this template only assembles the spec,
  runs verification, and persists learnings.
- **Definition of Done = both gates green**:
  - gate 1 — deterministic tests (`Test` command / `eval/harness.mjs`), by exit code.
  - gate 2 — acceptance judgement (quantitative → checklist; qualitative → rubric, see §Evaluation).
- Max attempts `N = <TODO, default 5>`; beyond it, **STOP and hand off for human review**. Never ship on a guess.
- After each iteration, log per the task's `Iteration policy` (see §Tasks & Phases).

## Evaluation
- Mode is declared per task in its `Verification` field; output is **always binary** pass/fail.
- Quantitative: checklist judged item-by-item; all must pass.
- Qualitative: rubric score → threshold → binary. **Default: pairwise (vs the best prior attempt)
  and judge the rendered screenshot**, not the source code.
- Rubrics: `.agents/rubrics/*.md` (dimensions + anchors + weights + threshold; weights are tunable =
  your personal benchmark).
- Run by an **independent validator** (isolated context, not shared with the builder):
  see `.agents/agents/validator.md`.

## Memory
- New session: read the thin index `.agent-learnings.md` first, then pull only the entries
  matching the task's `tag`s.
- After solving a new pitfall, append one entry via `/learn`
  (four-block format in `.agents/skills/record-learning/SKILL.md`).

## Rules (summaries here; detail behind links)
- Code style → `.agents/rules/code-style.md`
- Testing    → `.agents/rules/testing.md`
- Security   → `.agents/rules/security.md`

## Constraints (some enforced deterministically by hooks)
- Only edit paths allowed by the task's generated `scope`; out-of-scope Edit/Write is blocked by
  `.agents/hooks/scope-guard.sh`.
- Must pass `.agents/hooks/stop-require-green.sh` before ending a session (no "done" without green).
- `<TODO project-level no-go zones, e.g. never touch .env / never auto-push to main>`

## Tasks & Phases
- Authoring is conversational: `/calibrate` sets up the project (fills this file), `/plan` turns a
  multi-turn conversation into `PHASES.md`. You can also write `PHASES.md` by hand.
- Blueprint `PHASES.md` (human Markdown) → the `expand-phase` skill generates strict `tasks/*.md`
  (machine-readable frontmatter + body). `loop.mjs` and the hooks read the **generated** files,
  not `PHASES.md`.
- **Task body schema (five parts, all required)**: `Outcome` / `Verification` / `Constraints` /
  `Iteration policy` / `Error handling`.

## Decisions
- Architecture rationale lives in `DECISIONS.md`. Read it before changing architecture;
  supersede records — do not silently edit them.
