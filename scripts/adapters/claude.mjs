/**
 * Claude Code adapter — the day-1 reference implementation.
 *
 * IMPORTANT: the exact CLI flags for the native /goal loop and for headless runs change across
 * Claude Code versions and shipped AFTER this template was written. VERIFY against current
 * Claude Code docs before relying on the commands below. The function SHAPES are the contract;
 * the flag strings marked TODO are the only thing you should need to adjust.
 */
import { spawn } from 'node:child_process';

export default {
  name: 'claude',

  async runGoal({ cwd, goalSpec, verifierCmd, maxAttempts }) {
    // TODO(verify-flags): map to the current Claude Code goal invocation, conceptually:
    //   claude goal "<goalSpec>" --verify "<verifierCmd>" --max-attempts <n> --no-interactive
    // Until confirmed, we drive a headless run and use verifierCmd as ground truth.
    const args = ['-p', goalSpec, /* TODO: '--permission-mode', 'acceptEdits', '--verify', verifierCmd */];
    await run('claude', args, cwd).catch(() => {});
    return await verify(verifierCmd, cwd, maxAttempts);
  },

  async runAgent({ cwd, prompt, skill, subagent, images }) {
    const preamble = [
      skill ? `Use the skill at ${skill}.` : '',
      subagent ? `Act strictly as the subagent defined in ${subagent}.` : '',
    ].filter(Boolean).join(' ');
    // TODO(verify-flags): attach images for multimodal judging when present, e.g. `--image <path>`.
    const args = ['-p', `${preamble}\n\n${prompt}`.trim()];
    if (images?.length) {/* TODO: images.forEach(p => args.push('--image', p)); */}
    return await run('claude', args, cwd);
  },
};

/** Run the deterministic verifier as ground truth; returns a structured Result. */
async function verify(verifierCmd, cwd, maxAttempts) {
  try {
    const out = await run('/bin/sh', ['-c', verifierCmd], cwd);
    const r = safeJson(out);
    return { passed: !!r.pass, attempts: maxAttempts, diagnosis: r.diagnosis };
  } catch (e) {
    return { passed: false, attempts: maxAttempts, diagnosis: extractJson(e.stdout)?.diagnosis ?? e.message };
  }
}

function run(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { cwd, env: process.env });
    let out = '', err = '';
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => (err += d));
    p.on('close', (code) => (code === 0 ? resolve(out) : reject(Object.assign(new Error(err || `exit ${code}`), { stdout: out }))));
    p.on('error', reject);
  });
}

function extractJson(s = '') { const m = s.match(/\{[\s\S]*\}/); return m ? safeParse(m[0]) : null; }
function safeJson(s = '') { return extractJson(s) ?? {}; }
function safeParse(s) { try { return JSON.parse(s); } catch { return null; } }
