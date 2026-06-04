/**
 * Codex CLI adapter — stub. Codex ships a persisted /goal (create/pause/resume/clear).
 * Implement the two contract methods against the current Codex CLI; see adapters/index.mjs.
 * Kept as a stub on purpose (ADR-004: small surface; add real adapters when you actually use them).
 */
export default {
  name: 'codex',
  async runGoal({ cwd, goalSpec, verifierCmd, maxAttempts }) {
    // TODO: drive `codex` persisted /goal here, pointing its verifier at verifierCmd.
    throw new Error('codex adapter not implemented yet — see scripts/adapters/claude.mjs for the shape');
  },
  async runAgent({ cwd, prompt, skill, subagent, images }) {
    // TODO: one-shot `codex exec`-style turn.
    throw new Error('codex adapter not implemented yet');
  },
};
