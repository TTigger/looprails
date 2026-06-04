---
name: record-learning
description: Persist a learning after solving a pitfall — write a four-block entry under .agent-learnings/entries and update the index. Use on /learn or after a task passes a non-trivial fix.
---

# record-learning

Persist what was learned so the NEXT goal is smarter — the cross-session memory native /goal lacks.
Entry **content** may be in the project's language; keep the four block headers as-is.

## 1. Write the entry
Create `.agent-learnings/entries/<YYYY-MM-DD>-<slug>.md`:

```
---
date: 2026-06-04
tags: [auth, prisma]
---
# <Situation title>
**Pitfall**: what went wrong, the exact error, why it blocked progress.
**Fix / optimization**: how it was solved, and WHY this way (not just the diff).
**How to verify**: the exact command/test that confirms it — must be reproducible.
```

## 2. Update the index
Append one line to `.agent-learnings.md` under each relevant tag heading:
`- [<title>](.agent-learnings/entries/<file>.md) — one-line summary`

## Rules
- One pitfall per entry. Keep it short — link, don't dump.
- Mark superseded entries `[DEPRECATED]` in the index instead of deleting them.
- Record only durable lessons, not one-off noise. Every entry must earn its place (an over-grown
  store slows every future session).
- Tags are how `builder` finds this later — choose the words a future task would search for.
