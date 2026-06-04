/**
 * Gemini / Antigravity CLI adapter — stub. (Gemini CLI is transitioning to Antigravity CLI.)
 * Implement the two contract methods against the current CLI; see adapters/index.mjs.
 */
export default {
  name: 'gemini',
  async runGoal({ cwd, goalSpec, verifierCmd, maxAttempts }) {
    // TODO: drive the native goal loop here, pointing its verifier at verifierCmd.
    throw new Error('gemini adapter not implemented yet — see scripts/adapters/claude.mjs for the shape');
  },
  async runAgent({ cwd, prompt, skill, subagent, images }) {
    // TODO: one-shot turn.
    throw new Error('gemini adapter not implemented yet');
  },
};
