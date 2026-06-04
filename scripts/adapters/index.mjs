/**
 * adapters/index.mjs — load a tool adapter by name.
 *
 * Every adapter exports a default object implementing this contract so loop.mjs and eval/*
 * never speak a tool's CLI directly:
 *
 *   name: string
 *
 *   // Drive the tool's NATIVE goal loop in `cwd` until `verifierCmd` passes or maxAttempts hit.
 *   // Returns { passed: boolean, attempts: number, diagnosis?: string }.
 *   runGoal({ cwd, goalSpec, verifierCmd, maxAttempts }): Promise<Result>
 *
 *   // One-shot agent turn (used for expand-phase, validator judging, record-learning).
 *   // `skill` and `subagent` are optional file refs; `images` is an optional path[] for
 *   // multimodal judging (screenshots). Returns raw text output.
 *   runAgent({ cwd, prompt, skill?, subagent?, images? }): Promise<string>
 */
export async function loadAdapter(name) {
  try {
    const mod = await import(`./${name}.mjs`);
    return mod.default;
  } catch (e) {
    throw new Error(`unknown or broken adapter "${name}": ${e.message}`);
  }
}
