#!/usr/bin/env node
/**
 * harness.mjs — the verifier that native /goal calls each iteration (the dual gate, ADR-003).
 *
 * Gate 1 (deterministic) always runs. Gate 2 depends on the task's eval_mode:
 *   - quant / mixed : checklist judged by the INDEPENDENT validator subagent
 *   - qual          : rubric scoring via score.mjs (pairwise + screenshot)
 *
 * Contract: prints a single JSON line { pass, diagnosis, scores? } to stdout, and exits
 * 0 when pass === true, non-zero otherwise. The orchestrator/native goal reads the exit code;
 * the JSON diagnosis is fed back to the builder on failure.
 *
 * Usage: node eval/harness.mjs --task <task-id>
 */
import { execSync } from 'node:child_process';
import { loadTask } from '../scripts/tasks.mjs';
import { scoreQual } from './score.mjs';
import { loadAdapter } from '../scripts/adapters/index.mjs';

const taskId = flag('--task');
if (!taskId) finish(false, 'usage: node eval/harness.mjs --task <task-id>');

const task = await loadTask(taskId);

// --- Gate 1: deterministic pipeline ---
const g1 = runGate1(task);
if (!g1.pass) finish(false, g1.diagnosis);

// --- Gate 2 ---
let g2;
if (task.eval_mode === 'qual') {
  g2 = await scoreQual(task);              // rubric, pairwise, screenshot
} else {
  g2 = await judgeChecklist(task);         // validator subagent (quant / mixed)
}
finish(g2.pass, g2.diagnosis, g2.scores);

// ---------------------------------------------------------------------------

function runGate1(task) {
  const cmd = task.test_cmd || process.env.TEST_CMD || 'npm test';
  try {
    execSync(cmd, { stdio: 'pipe' });
    return { pass: true };
  } catch (e) {
    const tail = String(e.stdout || e.stderr || e.message).split('\n').slice(-20).join('\n');
    return { pass: false, diagnosis: `gate 1 failed (\`${cmd}\`):\n${tail}` };
  }
}

async function judgeChecklist(task) {
  if (!task.checklist?.length) return { pass: true }; // nothing extra to judge beyond gate 1
  const adapter = await loadAdapter(process.env.LOOP_TOOL || 'claude');
  const out = await adapter.runAgent({
    cwd: process.cwd(),
    subagent: '.agents/agents/validator.md',
    prompt:
      `Judge this checklist for task ${task.id} against the current repository state.\n` +
      task.checklist.map((c) => `- ${c}`).join('\n') +
      `\n\nReturn strict JSON: {"pass": boolean, "diagnosis": "..."}.`,
  });
  return safeJson(out, { pass: false, diagnosis: 'validator returned unparseable output' });
}

function finish(pass, diagnosis = '', scores) {
  const payload = { pass: !!pass, diagnosis };
  if (scores) payload.scores = scores;
  process.stdout.write(JSON.stringify(payload) + '\n');
  process.exit(pass ? 0 : 1);
}

function flag(name) { const i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] : null; }
function safeJson(s, fallback) {
  const m = String(s).match(/\{[\s\S]*\}/);
  if (!m) return fallback;
  try { return JSON.parse(m[0]); } catch { return fallback; }
}
