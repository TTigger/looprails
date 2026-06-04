# looprails

A cross-tool boilerplate for **closed-loop development**: an AI agent generates code, runs the
verifier, fixes what failed, records what it learned, and repeats until the goal is met — or it stops
and asks for help.

> **Native `/goal` gives you the engine. This template gives you the fuel, the rails, and the memory.**

By 2026 every major agent CLI ships a built-in loop (`/goal`, `/batch`, the "Ralph loop"). The loop is
no longer the hard part. This template is **native-first**: it delegates the loop to your tool's
`/goal` and adds the three things native loops don't give you.

## Why

1. **Verification quality.** A native loop is only as good as the verifier you hand it. Here, "done" is
   a **dual gate** — deterministic tests *and* an independent reviewer — and "good" is a tunable,
   anchored **rubric** (your personal benchmark), so qualitative work (UI, writing) is *judged*, not guessed.
2. **Cross-session memory.** Native loops don't make the *next* goal smarter. A structured learning
   store does: every solved pitfall is recorded and retrieved by tag.
3. **Cross-tool portability.** One set of rules, rubrics, and memory runs across Claude Code, Codex,
   Antigravity, and local models. No vendor lock-in.

## Requirements

Node ≥18, and a bash shell to run the hooks (built in on macOS/Linux; on Windows use Git Bash or WSL —
without it the `.sh` hooks silently no-op and you lose the guardrails).

## Quick start

Use this template on GitHub, clone your new repo, then **let your agent set it up**. Open your agent
CLI in the folder (e.g. `claude`) and just talk to it:

```text
"Set up this template: run scripts/setup.sh, read AGENTS.md and DECISIONS.md, then /calibrate."
        ↳ the agent bootstraps, interviews you, fills AGENTS.md + rubric weights — you confirm.

"/plan a phase for <what you want to build>"
        ↳ the agent asks questions over a few turns, then writes PHASES.md and waits for your OK.

"/loop phase-1"
        ↳ runs the closed loop until both gates are green, or it stops for human review.
```

> **Run `scripts/setup.sh` (or `setup.ps1` on Windows) first.** Bootstrap generates `.claude/commands/`
> from `.agents/commands/`, so `/calibrate`, `/plan`, `/loop`, and `/learn` only register as slash
> commands *after* it runs — a fresh clone has none yet.

You never have to hand-write config — the agent fills `AGENTS.md`, drafts rubric weights, and turns a
conversation into `PHASES.md`. Prefer the manual path? It's all still there: edit the files directly
and run `node scripts/loop.mjs phase-1 --tool claude`. CI and power users use that path too.

## How it works

You drive it in natural language — `/calibrate` to set up, `/plan` to turn a conversation into phases,
`/loop` to execute. Under the hood:

```
PHASES.md ──expand-phase──▶ tasks/*.md (strict)
  for each task (parallel worktrees):
    builder ─▶ harness.mjs  (gate1 tests + gate2 checklist|rubric)
       ├─ fail ─▶ diagnose-failure ─▶ builder        (iterate, on native /goal)
       └─ pass ─▶ record-learning + CHANGELOG
    stuck after N attempts ─▶ human review
```

- **Dual gate (binary).** gate 1 = deterministic tests; gate 2 = checklist (quantitative) or rubric
  score (qualitative). Both green = done.
- **Qualitative judging.** Rubrics score a rendered **screenshot**, **pairwise** against the best prior
  attempt — far steadier than an absolute "rate it 1–10."
- **Deterministic guardrails (hooks).** Edits outside a task's scope are blocked; a session can't end on
  red tests. Rules the model can't hallucinate around.

## Seams (script path only)

Pure conversational `/loop` (native `/goal`) needs none of these. Wire them only if you run the
`node scripts/loop.mjs` path with parallel worktrees:

- **Worktree isolation** — `scripts/loop.mjs:113` (`ensureWorktree`; returns ROOT until wired).
- **Native-goal CLI flags** — `scripts/adapters/claude.mjs:15` (verify against your tool's current CLI).
- **Screenshot render for qual scoring** — `eval/score.mjs:46`.

## Structure

```
AGENTS.md             single source of truth (CLAUDE.md is just `@AGENTS.md`)
PHASES.md             your phase blueprint (human Markdown)
DECISIONS.md          architecture decision records
.agents/              engine room: rules / skills / agents / rubrics / hooks
.claude/settings.json the one tool-specific file (hooks wiring)
.agent-learnings*     structured cross-session memory (index + tagged entries)
eval/                 harness.mjs (the verifier) + score.mjs (rubric scoring)
scripts/              loop.mjs + adapters/ + bootstrap
```

## Principles

Thin over clever. Native-first — don't reinvent the loop. Single source of truth — no drift. Every
rule earns its place; a wrong instruction is worse than none. Rationale lives in `DECISIONS.md`.

## Language

Engine-room files are English for maximum model compatibility; your own content (filled `AGENTS.md`
fields, phases, learnings) can be in any language.

繁體中文說明 → **[README.zh-TW.md](./README.zh-TW.md)**

## License

MIT — see [LICENSE](./LICENSE).
