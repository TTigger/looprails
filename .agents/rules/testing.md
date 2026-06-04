# Rule: Testing

- Tests are **gate 1**. A task is not done until its tests pass — `stop-require-green` enforces this
  once a Test command is wired (`npm test` or `TEST_CMD`; see `/calibrate`). Until then it stays dormant.
- Every behavioral change ships with a test that would fail without it.
- Unit tests are deterministic: no network, no real clock/random without injection, no shared state.
- Test behavior and contracts, not implementation details.
- Keep the suite fast; quarantine slow/integration tests behind a separate command.
- <TODO: project test command, coverage target, framework.>
