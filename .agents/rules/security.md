# Rule: Security

- Never commit secrets. `.env` and credentials are off-limits to edits and to logs.
- Validate and sanitize all external input; never trust client data.
- Never `eval`/exec untrusted input; avoid shelling out with unsanitized strings.
- Pin and review dependencies; do not add a package to dodge a small amount of code.
- Least privilege for tokens and DB access; scope and expire credentials.
- <TODO: project-specific — authn/authz model, data classes, compliance constraints.>
