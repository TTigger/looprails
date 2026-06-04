# PHASES.md — Phase Blueprint (task source)

> This is the **input** to the loop. You write it by hand, in plain readable Markdown.
> `scripts/loop.mjs` invokes the `expand-phase` skill, which reads this file and generates strict
> `tasks/*.md` (machine-readable frontmatter + body). The loop and the hooks read the **generated**
> task files — never this file directly — so you never have to hand-write YAML here.
>
> **Contract**
> 1. One phase = one bounded milestone; size it so it can split into a few parallelizable tasks.
> 2. A phase's **Exit criteria become the gate-2 checklist** — write them as machine-verifiable as you can.
> 3. Declare dependencies with **Depends on**; phases with none can run in parallel worktrees.
> 4. For qualitative phases, name the **Rubric** to use (see `.agents/rubrics/`).
>
> The §Example below is illustrative — **replace it with your own phases** (or draft it via `/calibrate`).

## How to write a phase

Use a `### Phase N: <name>` heading, then these fields as plain prose / bullets:

- **Goal** — what this milestone delivers, in one or two sentences.
- **Eval mode** — `quant` (tests + checklist) · `qual` (rubric) · `mixed`.
- **Rubric** — required when the eval mode includes `qual` (e.g. `frontend-beauty`).
- **Depends on** — phases that must finish first; `none` if it can start now.
- **Exit criteria** — a bullet list of verifiable conditions (these become the gate-2 checklist).
- **Scope** — bullet list of path globs the agent may edit (everything else is blocked by `scope-guard`).
- **Notes** — optional hints for the expander.

`expand-phase` turns each exit criterion / sub-goal into a `tasks/<phase>-<n>.md` whose body follows the
five-part schema: **Outcome / Verification / Constraints / Iteration policy / Error handling**.

---

## Example (replace me)

### Phase 1: User authentication
- **Goal**: Local email + password auth with hashed credentials and JWT sessions.
- **Eval mode**: quant
- **Depends on**: none
- **Exit criteria**:
  - Users can register with email + password; passwords stored hashed with argon2.
  - A successful login issues a JWT that expires and is rejected after expiry.
  - All auth routes have unit tests; coverage ≥ 80%.
  - `pnpm test`, lint, and typecheck all pass.
- **Scope**:
  - `src/features/auth/**`
  - `src/lib/auth/**`
- **Notes**: SSO is a later phase; this one is local credentials only.

### Phase 2: Login page UI
- **Goal**: A polished, responsive login screen consistent with the design system.
- **Eval mode**: qual
- **Rubric**: frontend-beauty
- **Depends on**: Phase 1
- **Exit criteria**:
  - frontend-beauty composite ≥ 80 with no single dimension < 3 (judged on the rendered screenshot).
  - Passes pairwise: better than the best prior attempt.
  - Responsive with no breakage at 375px / 768px / 1280px (verified on screenshots).
  - Usability: a first-time user can complete login without instructions.
- **Scope**:
  - `src/app/(auth)/login/**`
  - `src/components/auth/**`
- **Notes**: Reuse the existing design system; rubric weights live in `.agents/rubrics/frontend-beauty.md`.

---

## Your phases

<!-- TODO: start here. Recommended: write a PRD first, then break it into phases. -->

### Phase 0: <TODO>
- **Goal**: <TODO>
- **Eval mode**: <TODO>
- **Depends on**: none
- **Exit criteria**:
  - <TODO>
- **Scope**:
  - <TODO>
