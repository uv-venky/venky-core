# Publishing venky-core

This package is published to **GitHub Packages** at `https://npm.pkg.github.com` as `venky-core`. Publishing is manual — only run when you intend to release a new version to consuming projects (`demo`, `metro-one-cop`, `metro-one-tim`, `metro-one-vm`, etc.).

## Quick reference

```bash
# One-time: classic PAT in ~/.npmrc (see below) — gh auth token does NOT work for publish

# Before every publish
pnpm typecheck && pnpm format && pnpm lint:all && pnpm test --run

# Bump version (if needed)
pnpm version patch --no-git-tag-version

# Publish + sync consuming projects
export GITHUB_TOKEN=ghp_your_classic_pat   # or use ~/.npmrc with token baked in
pnpm go
```

`pnpm go` runs `pnpm publish && pnpm sync-deps:fix`. The `prepublish` script runs `pnpm build` automatically.

Ensure consuming projects have the latest code (`git pull`) before publishing if you rely on local workspace sync.

---

## One-time authentication setup

### Use a classic PAT — not `gh auth token`

[GitHub Packages only supports authentication with a personal access token (classic)](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-to-github-packages) for local `npm`/`pnpm` publish and install.

`gh auth token` returns an OAuth token (`gho_...`). That token can pass `npm whoami` and package reads, but **`pnpm publish` fails with 403** even when `gh auth status` lists `write:packages`:

```text
[E403] 403 Forbidden - PUT https://npm.pkg.github.com/@uv-venky%2fcore
Permission permission_denied: The token provided does not match expected scopes.
```

You need a **classic PAT** (`ghp_...`) with these scopes:

| Scope | Required for |
|---|---|
| `read:packages` | Install / read metadata |
| `write:packages` | Publish |
| `repo` | Private repos linked to packages |

Create one at: [github.com/settings/tokens/new](https://github.com/settings/tokens/new) → **Generate new token (classic)**.

Your GitHub account must also have permission to publish packages under the `uv-venky` org.

### Configure `.npmrc` (two files)

pnpm/npm treat project-level and user-level `.npmrc` differently. **Environment variables in `_authToken` are only expanded in your user-level `~/.npmrc`**, not in a project `.npmrc`. Putting `${GITHUB_TOKEN}` in the repo file produces:

```text
[WARN] Ignored project-level auth setting "//npm.pkg.github.com/:_authToken" ...
environment variables are not expanded in repository-controlled registry credentials
```

**Project** — create `core/.npmrc` (gitignored):

```ini
@uv-venky:registry=https://npm.pkg.github.com
```

**User** — create `~/.npmrc` (pick one approach):

Option A — env var (recommended; store PAT in shell profile or password manager):

```ini
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Then before publish:

```bash
export GITHUB_TOKEN=ghp_your_classic_pat
```

Option B — token directly in `~/.npmrc`:

```ini
//npm.pkg.github.com/:_authToken=ghp_your_classic_pat
```

Do **not** put the auth token line in the project `.npmrc`.

### Verify auth before publishing

```bash
export GITHUB_TOKEN=ghp_your_classic_pat   # must start with ghp_, not gho_
npm whoami --registry=https://npm.pkg.github.com
```

Expected output: your GitHub username. Confirm the token prefix:

```bash
echo "${GITHUB_TOKEN:0:4}"   # should print ghp_
```

---

## Publishing workflow

### Pre-publish checks

From the `core` directory:

```bash
pnpm typecheck
pnpm format
pnpm lint:all
pnpm test --run
```

Optionally run `pnpm build` to confirm the publish build succeeds (`prepublish` runs it anyway).

### Bump the version

If the current version is already on GitHub Packages, bump before publishing:

```bash
pnpm version patch --no-git-tag-version   # 1.2.66 → 1.2.67
# or: pnpm version minor --no-git-tag-version
# or: pnpm version major --no-git-tag-version
```

Commit the version change when ready.

### Publish

```bash
export GITHUB_TOKEN=ghp_your_classic_pat
pnpm go
```

Or step by step:

```bash
export GITHUB_TOKEN=ghp_your_classic_pat
pnpm publish
pnpm sync-deps:fix
```

`pnpm publish`:

1. Runs `prepublish` → `pnpm build` (compiles `dist/` via `tsconfig.build.json`)
2. Uploads `venky-core@<version>` to GitHub Packages

`pnpm sync-deps:fix`:

1. Updates `venky-core` version in sibling consuming projects under the workspace root
2. Aligns shared dependency versions with core's `package.json`

Run `pnpm sync-deps` (without `:fix`) to preview mismatches without applying changes.

---

## Troubleshooting

### `403 Forbidden` — token scopes mismatch (most common)

```text
[E403] 403 Forbidden - PUT https://npm.pkg.github.com/@uv-venky%2fcore
Permission permission_denied: The token provided does not match expected scopes.
```

**Most likely cause:** using `gh auth token` (`gho_...`) instead of a classic PAT (`ghp_...`).

Fix:

1. Create a classic PAT with `read:packages`, `write:packages`, and `repo`
2. `export GITHUB_TOKEN=ghp_...` (not `$(gh auth token)`)
3. `pnpm go`

If you already use a classic PAT, verify scopes include **both** `read:packages` and `write:packages`.

If scopes are correct and publish still fails, ask a `uv-venky` org admin to confirm your account can publish to the org's GitHub Packages.

### `401 Unauthorized` on publish

```text
[E401] 401 Unauthorized - PUT https://npm.pkg.github.com/@uv-venky%2fcore
unauthenticated: User cannot be authenticated with the token provided.
```

Checklist:

1. Classic PAT exported: `export GITHUB_TOKEN=ghp_...`
2. `~/.npmrc` contains `//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}` (or the token directly)
3. `core/.npmrc` contains only the `@uv-venky:registry=...` line (no auth token)
4. Token has `read:packages` and `write:packages`
5. Your account can publish to the `uv-venky` org on GitHub Packages

### Env var ignored in project `.npmrc`

Move the `_authToken` line from `core/.npmrc` to `~/.npmrc`. Keep only the registry scope mapping in the project file.

### `gh auth refresh` blocked by `GITHUB_TOKEN`

Only relevant if you use `gh` for other GitHub operations — not for npm publish:

```bash
unset GITHUB_TOKEN
gh auth refresh -s read:packages,write:packages
```

Even after refresh, `gh auth token` still produces an OAuth token unsuitable for `pnpm publish`. Use a classic PAT for publishing.

### Version already exists

GitHub Packages rejects publishing the same version twice. Bump with `pnpm version patch --no-git-tag-version` and publish again.

### Build succeeds but publish fails

The `prepublish` build step can succeed independently of registry auth. A failed publish means credentials or permissions — not a build problem.

---

## Consuming projects (install side)

Projects that **install** `venky-core` also need registry config. See [README.md](./README.md#2-configure-github-packages-registry):

```ini
@uv-venky:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=ghp_your_classic_pat
```

For local development, `read:packages` on a classic PAT is sufficient. Publishing requires `write:packages` as well.

---

## Related commands

| Command | Description |
|---|---|
| `pnpm go` | Publish + sync deps (`pnpm publish && pnpm sync-deps:fix`) |
| `pnpm publish` | Build (prepublish) and upload to GitHub Packages |
| `pnpm sync-deps` | Compare consuming-project deps against core |
| `pnpm sync-deps:fix` | Apply version sync to consuming projects |
| `pnpm build` | Compile package to `dist/` (runs automatically on publish) |
