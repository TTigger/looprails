/**
 * tasks.mjs — shared loader for the GENERATED strict task files (tasks/<phase>-<n>.md).
 * These are produced by the expand-phase skill; humans never hand-write them.
 * Frontmatter is a small, strict YAML subset (no nested maps beyond simple lists), so we parse
 * it with a tiny reader rather than pulling a dependency. Swap in `gray-matter` if you prefer.
 */
import path from 'node:path';
import { readFile, readdir } from 'node:fs/promises';

export async function loadTasks(root, phaseId) {
  const dir = path.join(root, 'tasks');
  const files = (await readdir(dir)).filter((f) => f.startsWith(`${phaseId}-`) && f.endsWith('.md'));
  return Promise.all(files.map((f) => loadTask(path.join(dir, f))));
}

export async function loadTask(file) {
  // `file` may be an absolute path or a bare task id (resolve against ./tasks).
  const p = file.endsWith('.md') ? file : path.join('tasks', `${file}.md`);
  const raw = await readFile(p, 'utf8');
  const { meta, body } = splitFrontmatter(raw);
  const sections = splitSections(body); // by `# <Title>` headings
  return {
    id: meta.id,
    title: meta.title,
    eval_mode: meta.eval_mode ?? 'quant',
    rubric: meta.rubric || null,
    depends_on: meta.depends_on ?? [],
    tags: meta.tags ?? [],
    scope: meta.scope ?? [],
    checklist: meta.checklist ?? [],
    test_cmd: meta.test_cmd || null,
    max_attempts: meta.max_attempts ?? 5,
    outcome: sections.Outcome ?? '',
    verification: sections.Verification ?? '',
    constraints: sections.Constraints ?? '',
    iteration_policy: sections['Iteration policy'] ?? '',
    error_handling: sections['Error handling'] ?? '',
  };
}

function splitFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  return { meta: parseYamlLite(m[1]), body: m[2] };
}

/** Minimal YAML: `key: scalar`, `key:` followed by `- item` lines. Sufficient for our frontmatter. */
function parseYamlLite(text) {
  const out = {}; let key = null;
  for (const line of text.split('\n')) {
    if (/^\s*$/.test(line)) continue;
    const li = line.match(/^\s*-\s+(.*)$/);
    if (li && key) { (out[key] ??= []).push(coerce(li[1])); continue; }
    const kv = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (kv) {
      key = kv[1];
      const v = kv[2].trim();
      if (v === '') { out[key] = []; }
      else if (v.startsWith('[') && v.endsWith(']')) out[key] = v.slice(1, -1).split(',').map((s) => coerce(s.trim())).filter(Boolean);
      else { out[key] = coerce(v); key = null; }
    }
  }
  return out;
}

function coerce(v) {
  if (v === 'null' || v === '~') return null;
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (/^-?\d+$/.test(v)) return Number(v);
  return v.replace(/^["']|["']$/g, '');
}

function splitSections(body) {
  const out = {}; let cur = null;
  for (const line of body.split('\n')) {
    const h = line.match(/^#\s+(.+?)\s*$/);
    if (h) { cur = h[1]; out[cur] = ''; continue; }
    if (cur) out[cur] += (out[cur] ? '\n' : '') + line;
  }
  for (const k of Object.keys(out)) out[k] = out[k].trim();
  return out;
}
