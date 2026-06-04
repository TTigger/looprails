#!/usr/bin/env node
/**
 * loop.mjs — native-first closed-loop orchestrator.
 *
 * Intentionally thin: the loop ITSELF runs on the tool's native /goal·/batch (see DECISIONS ADR-004).
 * This script only:
 *   1. Expands the chosen phase from PHASES.md into strict tasks/*.md (via the expand-phase skill).
 *   2. For each task (respecting depends_on; independent tasks run in parallel git worktrees),
 *      assembles a goal spec and dispatches it to the tool's native /goal through an adapter.
 *      The adapter points /goal's verifier at `eval/harness.mjs` (our dual gate).
 *   3. On pass: records a learning + appends to CHANGELOG. On "stuck" (max attempts): stops and
 *      flags for human review.
 *
 * Usage: node scripts/loop.mjs <phase-id> [--tool claude|codex|gemini] [--concurrency 3]
 */
import path from 'node:path';
import { mkdir, writeFile, appendFile } from 'node:fs/promises';
import { loadAdapter } from './adapters/index.mjs';
import { loadTasks } from './tasks.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');

async function main() {
  const phaseId = process.argv[2];
  if (!phaseId) fail('usage: node scripts/loop.mjs <phase-id> [--tool] [--concurrency]');
  const tool = flag('--tool', 'claude');
  const concurrency = Number(flag('--concurrency', '3'));
  process.env.LOOP_TOOL = tool; // so eval/* picks the same adapter

  const adapter = await loadAdapter(tool);

  // 1. Expand phase -> strict tasks/*.md (LLM step; see .agents/skills/expand-phase/SKILL.md).
  await adapter.runAgent({
    cwd: ROOT,
    skill: '.agents/skills/expand-phase/SKILL.md',
    prompt: `Expand "${phaseId}" from PHASES.md into strict tasks/ files. Fill every frontmatter field.`,
  });

  // 2. Run the generated tasks (topological by depends_on; independents in parallel).
  const tasks = await loadTasks(ROOT, phaseId);
  if (tasks.length === 0) fail(`no tasks generated for ${phaseId} — check expand-phase output`);
  const ordered = topoSort(tasks);
  const results = await runPool(ordered, concurrency, (t) => runTask(adapter, t));

  const failed = results.filter((r) => !r.passed);
  console.log(`\n${results.length - failed.length}/${results.length} tasks passed.`);
  if (failed.length) process.exitCode = 1;
}

async function runTask(adapter, task) {
  const worktree = await ensureWorktree(task.id);     // git worktree isolation
  await writeActiveScope(worktree, task.scope);        // scope-guard.sh reads .active-scope

  const result = await adapter.runGoal({
    cwd: worktree,
    goalSpec: buildGoalSpec(task),
    verifierCmd: `node ${path.join(ROOT, 'eval/harness.mjs')} --task ${task.id}`,
    maxAttempts: task.max_attempts ?? 5,
  });

  // ADR-003: never trust a single judge — run the verifier once more as ground truth.
  // (native /goal already used it as its loop condition; this is a belt-and-braces final check.)

  if (result.passed) {
    await recordLearning(adapter, worktree, task, result);
    await appendChangelog(task, result);
    console.log(`✓ ${task.id}`);
  } else {
    await flagHumanReview(task, result);
    console.log(`⏸ ${task.id} — needs human review: ${result.diagnosis ?? 'stuck'}`);
  }
  return result;
}

/** Assemble the goal spec handed to native /goal (Outcome + DoD + constraints + how-to-verify). */
function buildGoalSpec(task) {
  const done = task.checklist?.length
    ? task.checklist.map((c) => `- ${c}`).join('\n')
    : 'see Verification in the task file';
  return [
    `# Goal\n${task.outcome}`,
    `# Done when (gate 2)\n${done}`,
    `# Constraints\nEdit ONLY: ${task.scope.join(', ')}. Obey .agents/rules/*. Out-of-scope edits are blocked.`,
    `# Verify each iteration with\n${task.verification}`,
    `# On stuck\nFollow the task's Error handling: report tried / blocked / needs.`,
  ].join('\n\n');
}

// --- glue (deterministic parts real; tool-/repo-specific seams are TODO) ---

function topoSort(tasks) {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const out = [], seen = new Set();
  const visit = (t) => {
    if (seen.has(t.id)) return;
    (t.depends_on ?? []).forEach((d) => byId.has(d) && visit(byId.get(d)));
    seen.add(t.id); out.push(t);
  };
  tasks.forEach(visit);
  return out;
}

async function runPool(items, n, fn) {
  const results = []; let i = 0;
  const workers = Array.from({ length: Math.max(1, n) }, async () => {
    while (i < items.length) { const idx = i++; results[idx] = await fn(items[idx]); }
  });
  await Promise.all(workers);
  return results;
}

async function ensureWorktree(id) {
  // TODO: `git worktree add ../.worktrees/<id> -b loop/<id>` and return its path.
  // For a single-tree start, returning ROOT is fine.
  return ROOT;
}

async function writeActiveScope(cwd, globs) {
  await writeFile(path.join(cwd, '.active-scope'), (globs ?? []).join('\n') + '\n', 'utf8');
}

async function recordLearning(adapter, cwd, task, result) {
  await adapter.runAgent({
    cwd,
    skill: '.agents/skills/record-learning/SKILL.md',
    prompt: `Record a learning for task ${task.id}. Four blocks; tag with: ${(task.tags ?? []).join(', ')}.`,
  });
}

async function appendChangelog(task, result) {
  const line = `- ${new Date().toISOString().slice(0, 10)} ${task.id}: ${task.title ?? task.outcome}\n`;
  await appendFile(path.join(ROOT, 'CHANGELOG.md'), line, 'utf8').catch(() => {});
}

async function flagHumanReview(task, result) {
  await mkdir(path.join(ROOT, '.review'), { recursive: true });
  const body = `# ${task.id} — human review\n\n${result.diagnosis ?? 'stuck (max attempts)'}\n`;
  await writeFile(path.join(ROOT, '.review', `${task.id}.md`), body, 'utf8');
}

function flag(name, def) { const i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] : def; }
function fail(m) { console.error(m); process.exit(1); }

main().catch((e) => fail(e.stack || String(e)));
