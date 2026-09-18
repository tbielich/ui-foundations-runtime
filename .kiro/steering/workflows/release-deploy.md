---
inclusion: manual
---

# Release & Deployment

## Environments

| Environment | URL | Trigger |
|-------------|-----|---------|
| Production docs | https://ui-foundations.netlify.app | Auto-deploy on push to `main` |
| npm package | https://www.npmjs.com/package/ui-foundations | Version tag stages package; maintainer approval publishes |

No application staging environment exists. npm staged publishing is the release
approval gate for package versions. Preview deploys on Netlify PRs are available
via Netlify's default deploy preview feature.

## Docs Deployment (Netlify)

Automatic on every push. Configuration in `.netlify/netlify.toml`:

- Build command: `npm run docs:site`
- Publish directory: `_site/`
- Node version: 20
- Security headers: CSP, X-Frame-Options DENY, nosniff

No manual steps needed for docs deployment.

## npm Package Release

### Prerequisites

- `NPM_TOKEN` set in GitHub Actions secrets with granular
  **Read and write (stage only)** access to `ui-foundations`
- npm account for the approving maintainer has two-factor authentication enabled
- Clean working tree
- All CI and release checks passing
- Release version and changelog merged to protected `main` before tagging

### Workflow

The release flow intentionally separates automated staging from human
publication approval:

```text
release PR → protected main → version tag → GitHub Actions
           → npm stage publish → maintainer review → 2FA approval → npm
```

#### 1. Verify the release candidate

```bash
npm run release:check
```

`release:check` runs the full CI gate and an `npm pack --dry-run`.

#### 2. Prepare the version through a PR

Update `package.json`, `package-lock.json`, and `CHANGELOG.md` on a release
branch. Merge the reviewed release PR to protected `main`.

Do not publish from the release branch.

#### 3. Re-verify the merged release commit

```bash
git switch main
git pull --ff-only
npm run release:check
```

Confirm the expected package version before tagging:

```bash
node -p "require('./package.json').version"
```

#### 4. Tag the exact release commit

```bash
git tag -a vX.Y.Z <main-commit-sha> -m "UI Foundations vX.Y.Z"
git push origin vX.Y.Z
```

Pushing a `v*` tag triggers `.github/workflows/publish.yml`.

#### 5. GitHub Actions stages the package

The publish workflow:

1. checks out the tagged release;
2. uses Node 22.14.0;
3. upgrades npm to 11.15.0 or newer;
4. runs `npm ci`;
5. runs `npm run ci:check`;
6. runs `npm stage publish --access public`.

The workflow does **not** make the version public. A successful run creates an
npm stage that still requires maintainer approval.

#### 6. Review and approve the npm stage

Inspect the staged package:

```bash
npx --yes npm@11.15.0 stage view <stage-id>
```

Approve only after verifying package name, version, tag, access, and staged
artifact:

```bash
npx --yes npm@11.15.0 stage approve <stage-id>
```

Approval requires the maintainer's npm two-factor authentication and promotes
the staged version to the public registry.

#### 7. Verify the published version

```bash
npm view ui-foundations@X.Y.Z version
npm view ui-foundations dist-tags
```

The released version should resolve and the intended dist-tag should point to it.

### Manual recovery / existing tag

The workflow also supports `workflow_dispatch` with a `ref` input. This is
used when the workflow implementation changes after a release tag already
exists and the existing tag must be staged without moving or recreating it.

```bash
gh workflow run publish.yml --ref main -f ref=vX.Y.Z
```

The workflow definition comes from `main`, while the checkout step uses the
supplied release ref.

Do not rerun an older failed workflow attempt when the workflow definition
itself has since changed; create a new manual dispatch from current `main`.

### What `release:check` validates

1. `npm run ci:check` — full pipeline (lint, test, build, validate)
2. `npm run pack:check` — dry-run of `npm pack` to verify package contents

### Package Contents (`files` in package.json)

```
dist/**
README.md
CHANGELOG.md
MIGRATION.md
docs/foundations/**
docs/agentic/assistant-behavior-rules.md
docs/agentic/skills/**
```

## CI Pipeline

`.github/workflows/ci.yml` runs on every push and PR:
- Matrix: Node 20 + Node 22
- Steps: `npm ci` → `npm run ci:check`

## Version Strategy

- Patch: bug fixes, token value corrections, doc typos
- Minor: new components, new tokens, new features
- Major: breaking API changes (CSS class renames, removed exports, token renames)

Current version: check `package.json` → `version` field.
