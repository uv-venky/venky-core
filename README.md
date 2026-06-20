# venky-core

Venky Core is a trimmed shared library for Venky applications. It provides admin
portal UI, DataSource utilities, auth/session helpers, and server bootstrap code
for Venky applications.

**Out of scope (removed from this fork):** chat, workflows, command center, KB
video, SSO, Google auth, mobile auth, and AI features.

## Consumer guide

**[CONSUMER.md](./CONSUMER.md)** — step-by-step guide for building a Next.js app
that installs venky-core from GitHub (dependencies, pnpm, migrations, API routes,
proxy, troubleshooting).

## Installation

Published as `venky-core` from [uv-venky/venky-core](https://github.com/uv-venky/venky-core).

```bash
pnpm add venky-core
```

Configure GitHub Packages in `.npmrc` if installing from the registry:

```
@uv-venky:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

## Package exports

Import from `venky-core/*` entry points:

| Export | Purpose |
|--------|---------|
| `venky-core/ui` | Admin UI, tables, smart search, session pages |
| `venky-core/data-ui` | Framework-agnostic data UI (SmartSearch, DataTable, Pivot) |
| `venky-core/client` | Client store, query, and notification utilities |
| `venky-core/server` | Server bootstrap, DB, actions, jobs |
| `venky-core/server/init` | Default `ServerConfig` wiring |
| `venky-core/auth` | Session/auth types and helpers |
| `venky-core/ds` | DataSource registry and query helpers |
| `venky-core/common` | Shared types and utilities |

Removed exports: `./ai`, `./components/chat/*`.

## Configuration

Default feature flags in `config/default.yml`:

```yaml
appId: core
features:
  workflow: false
  naturalLanguageSearch: false
  complianceExport: false
```

## Database

Postgres connections use `search_path` from the environment variable
`VENKY_PG_SEARCH_PATH` (default: `core,public`). Set this when your schema is
not `public`.

## Development

```bash
pnpm install
pnpm build
pnpm dev      # Next.js demo app
pnpm test
```

## Repository

- **Package:** `venky-core@0.1.0`
- **Git:** https://github.com/uv-venky/venky-core.git
