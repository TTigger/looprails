/**
 * score.mjs — Gate 2b qualitative scoring (ADR-009).
 *
 * Renders the artifact to a screenshot, then asks the INDEPENDENT validator to score it against
 * the task's rubric, PAIRWISE versus the best prior attempt (judging the image, not the code).
 * Returns { pass, diagnosis, scores }.
 *
 * The deterministic plumbing (where files live, how a pass updates the "best prior") is real;
 * the render and the best-prior cache are marked TODO because they are project-specific.
 */
import path from 'node:path';
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { loadAdapter } from '../scripts/adapters/index.mjs';

const CACHE = '.agent-learnings/_best'; // per-task "best prior" screenshots live here

export async function scoreQual(task) {
  if (!task.rubric) return { pass: false, diagnosis: 'qual task has no rubric set (fix expand-phase output)' };

  const current = await renderScreenshot(task);          // -> path to PNG
  const best = await bestPriorPath(task.id);             // -> path | null

  const adapter = await loadAdapter(process.env.LOOP_TOOL || 'claude');
  const out = await adapter.runAgent({
    cwd: process.cwd(),
    subagent: '.agents/agents/validator.md',
    images: [current, best].filter(Boolean),
    prompt:
      `Qualitative judgement for task ${task.id}.\n` +
      `Rubric: .agents/rubrics/${task.rubric}.md (use its dimensions, anchors, weights, threshold).\n` +
      (best
        ? `Image 1 = current attempt, Image 2 = best prior. Prefer pairwise: is the current better overall ` +
          `and at least as good on every weighted dimension?\n`
        : `Image 1 = current attempt; no prior exists, so score against the anchors and threshold.\n`) +
      `Return strict JSON: {"pass": boolean, "diagnosis": "...", "scores": {"<dim>": n}}.`,
  });

  const res = safeJson(out, { pass: false, diagnosis: 'validator returned unparseable output' });
  if (res.pass) await promoteToBest(task.id, current);   // current becomes the bar for next pairwise
  return res;
}

// --- project-specific seams (TODO) ---

async function renderScreenshot(task) {
  // TODO: render the artifact to a PNG. For a Next.js route, spin a headless browser
  // (playwright/puppeteer), navigate to the page under test, screenshot it, return the path.
  // Keep one screenshot per attempt so pairwise has something to compare.
  throw new Error('renderScreenshot not implemented — wire your headless renderer here');
}

async function bestPriorPath(id) {
  const p = path.join(CACHE, `${id}.png`);
  try { await access(p); return p; } catch { return null; }
}

async function promoteToBest(id, currentPng) {
  await mkdir(CACHE, { recursive: true });
  await writeFile(path.join(CACHE, `${id}.png`), await readFile(currentPng));
}

function safeJson(s, fallback) {
  const m = String(s).match(/\{[\s\S]*\}/);
  if (!m) return fallback;
  try { return JSON.parse(m[0]); } catch { return fallback; }
}
