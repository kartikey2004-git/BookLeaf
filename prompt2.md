# Engineering Directive: Deployment Blocker Resolution

Act as a Senior Staff Software Engineer responsible for taking the BookLeaf repository from deployment preparation to a verified pre-deployment state.

Your task is to **investigate, resolve, and verify every locally resolvable blocker** identified in `docs/deployment/production-readiness-audit.md`.

This is an execution task, not a planning exercise. Do not stop after producing recommendations.

## 1. Mandatory safety boundaries

You are authorized to:
- Inspect the entire repository and local configuration.
- Run local tests, builds, linting, typechecks, and validation.
- Repair repository code and configuration when justified.
- Fix local CLI resolution and diagnose environment permissions.
- Update deployment documentation and audit findings.

You are NOT authorized to:
- Create GCP projects or cloud resources.
- Enable GCP APIs or configure billing.
- Create IAM roles, service accounts, WIF providers, or secrets.
- Create or modify Neon databases.
- Run production migrations.
- Deploy to Cloud Run, Vercel, or Inngest.
- Commit, push, merge, or rewrite Git history.
- Expose, print, copy into reports, or commit credentials, tokens, private keys, or secrets.
- Disable sandbox security globally to bypass access restrictions.

If an operation requires external approval, record the exact blocker and continue with independent tasks.

## 2. Establish the baseline

Before changing anything:

1. Read:
   - `CLAUDE.md`
   - `BOOKLEAF_KNOWLEDGE_BASE.md`
   - `docs/deployment/production-readiness-audit.md`
   - `package.json`
   - `pnpm-workspace.yaml`
   - `turbo.json`
   - All deployment-related configuration.
2. Inspect the complete Git working tree.
3. Identify existing uncommitted and untracked files.
4. Preserve all existing user work, especially `docs/deployment/` and `prompt.md`.
5. Record baseline test, lint, typecheck, build, and Prisma validation results.

Do not overwrite or discard existing work.

## 3. Resolve the database test blocker

Investigate the missing `prompts/sample.json`.

Determine:
- Which tests require this fixture.
- Whether it is intentionally ignored by Git.
- Whether a generation script or documented setup process exists.
- Whether the fixture is expected to be supplied externally.
- Whether the tests depend on a specific schema or content structure.

Then:
- Recover the intended fixture if its legitimate source exists.
- If it is generated, use the documented generator.
- If it is intentionally external, document the required setup and make tests fail with a clear actionable message.
- Never fabricate production-like fixture content simply to make tests pass.
- Never remove or weaken tests to hide the failure.

Run the affected tests and full relevant test suite afterward.

## 4. Resolve CLI access inside Codex

Verify these commands from the actual Codex execution environment:

- Node
- pnpm
- Vercel CLI
- Google Cloud SDK
- Docker CLI
- GitHub CLI

Use the known installation locations where necessary.

For GCP, the known executable is:

`C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd`

For npm global binaries, investigate:

`%APPDATA%\npm`

Distinguish between:
- Executable missing.
- Executable not on PATH.
- Access denied.
- Sandbox restrictions.
- Configuration directory not writable.
- Authentication failure.
- Network failure.

Do not reinstall tools unless evidence proves the installation is broken.

For Google Cloud:
- Verify SDK version.
- Verify authentication status without exposing tokens.
- Verify active account and project selection.
- Diagnose log/config directory permission failures.
- Do not create or select a production project without approval.

For Vercel:
- Verify CLI version and authentication.
- Inspect existing project linkage.
- Do not link or create a project without approval.

For GitHub:
- Verify CLI installation, authentication status, repository visibility, and network access.
- Never print token contents.
- Do not modify GitHub repository settings.

## 5. Diagnose Docker access

Verify:
- Docker CLI resolution.
- Docker daemon availability.
- Docker Desktop status.
- Current user access to the daemon.
- Whether the failure originates from Codex sandbox restrictions.

If permitted, build the API and worker images locally.

Do not change Docker security settings or disable sandbox protections to force a successful build.

If the daemon remains inaccessible, document the exact error and provide the minimum required permission or environment change.

## 6. Audit deployment implementation

Review the actual implementation of:

- API Dockerfile.
- Worker Dockerfile.
- `.dockerignore`.
- Cloud Run PORT handling.
- Next.js same-origin API/auth/SSE proxy.
- Cookie forwarding and CORS.
- SSE streaming, disconnect handling, and reconnect behavior.
- Prisma pooled `DATABASE_URL`.
- Direct migration `DIRECT_URL`.
- GitHub Actions deployment workflow.
- GCP Workload Identity Federation configuration.
- Secret Manager integration.
- Inngest endpoint registration.
- Health and readiness endpoints.

Check for:
- Monorepo Docker build-context problems.
- Missing workspace dependencies.
- Runtime dependencies accidentally omitted.
- Secrets included in image layers.
- Incorrect Cloud Run port binding.
- Incorrect proxy headers.
- Broken SSE streaming.
- Unsafe migration execution.
- Long-running worker or request lifecycle issues.
- Incorrect environment variable names.
- Workflow permissions broader than necessary.
- Unprotected production deployment jobs.

Fix confirmed implementation defects. Do not make speculative architectural changes.

## 7. Validate the complete local system

Run all applicable checks:

- Unit tests.
- Integration tests that do not require production infrastructure.
- Typechecks.
- Lint.
- Formatting checks.
- Prisma validation.
- AI artifact validation.
- API build.
- Worker build.
- Frontend build.
- Docker builds, if Docker access permits.

Report each check independently as:
- PASS
- FAIL
- BLOCKED
- NOT APPLICABLE

Do not report a check as passing unless it actually ran successfully.

## 8. Update the deployment audit

Update:

`docs/deployment/production-readiness-audit.md`

Include:
- Original blocker.
- Root cause.
- Evidence.
- Changes made.
- Verification performed.
- Remaining risks.
- External approvals required.

Separate local engineering blockers from external infrastructure and authorization blockers.

## 9. Final acceptance criteria

The task is complete only when:

1. Every locally resolvable blocker has been addressed.
2. All relevant local validations have been rerun.
3. Remaining blockers have reproducible evidence.
4. No existing user work has been lost.
5. No secrets have been exposed.
6. No cloud resources, production migrations, commits, pushes, or deployments have occurred.
7. The deployment audit accurately reflects the final repository state.

## 10. Final report

Provide:

1. Executive summary.
2. Blockers resolved.
3. Blockers remaining and exact root causes.
4. Files created or modified.
5. Validation results with actual outcomes.
6. CLI and Docker accessibility matrix.
7. Security and architecture findings.
8. External approvals still required.
9. Exact next steps before production deployment.

**Engineering standard:** Prefer evidence over assumptions, root-cause fixes over workarounds, and minimal changes over unnecessary refactoring. Continue through all independent tasks even when one blocker cannot be resolved.