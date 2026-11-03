---
name: monorepo-management
description: Safely manage pnpm and Turborepo workspace boundaries, tasks, and dependency ownership.
---

# Monorepo management

## Purpose

Maintain a fast, explicit, reproducible workspace without leaking dependencies or running the wrong package's tasks.

## Activation conditions

Use for workspace/package additions, dependency changes, shared configuration, Turborepo pipeline changes, pnpm filters, task scripts, lockfile work, or build-cache issues. This directory currently has no `package.json`, `pnpm-workspace.yaml`, `turbo.json`, lockfile, or application packages, despite the assignment's target architecture; treat that as an audit finding rather than fabricating a monorepo.

## Required repository context

Locate the root manifest, workspace declaration, lockfile, Turbo config, package manifests, TypeScript configs, lint/test configs, CI workflow, and package dependency graph. Inspect existing scripts before proposing or running commands. Determine whether `apps/*`, `packages/*`, or another convention is actually used.

## Engineering rules

- Root tooling belongs at the root; runtime dependencies belong only to the package that imports them.
- Declare internal dependencies using the workspace protocol and maintain acyclic dependency direction.
- Do not import an application's private code from another application. Promote genuinely shared code to a package with a focused public API.
- Use `pnpm --filter` and `turbo run` targets intentionally; avoid broad workspace commands when validating a narrow change.
- Keep tasks cacheable only when inputs/outputs are correctly declared. Mark tasks non-cacheable when they depend on external mutable state.
- Preserve the lockfile and package-manager version convention. Do not substitute npm/yarn or globally install tooling.
- Keep environment inputs explicit in Turbo configuration and never cache or expose secret values in logs/artifacts.
- Add dependencies only after checking existing equivalents and license/security implications.

## Implementation workflow

1. Map packages, their imports, scripts, and ownership using manifests and source imports.
2. Decide whether the change belongs to an existing app/package, a shared package, or only root tooling.
3. Make the smallest manifest/config change; update dependency declarations and lockfile using the repository package manager.
4. Verify from the root with targeted `pnpm --filter <package> <script>` commands, then run Turbo tasks dictated by CI.
5. Inspect cache behavior, outputs, and CI effects when changing `turbo.json`.
6. Run workspace-wide checks only for cross-cutting config/dependency changes.

## Common failure scenarios

- A package compiles locally due to hoisting but lacks its declared dependency.
- Turbo cache restores stale/missing output because outputs or environment inputs are misdeclared.
- An app imports another app, obscuring deployment ownership.
- Root scripts use ambiguous working directories or do not propagate exit codes.
- Lockfile changes are hand-edited or generated with a different package-manager version.
- A shared package accidentally pulls browser-only code into server builds (or Node-only code into Next.js client bundles).

## Validation requirements

Confirm manifests parse, all changed dependencies are declared at the correct scope, lockfile consistency checks pass, and targeted build/typecheck/lint/test scripts succeed. For task-pipeline changes, verify at least one cold and warm run where feasible and inspect affected CI commands. In the current empty directory, report that these checks are unavailable rather than claiming them.

## Relevant documentation references

- Root `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, and `turbo.json` when they exist.
- Package manifests and CI workflows that define the actual task graph.
- Installed pnpm/Turbo versions and their matching official documentation.
