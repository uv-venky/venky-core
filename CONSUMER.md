# Consuming venky-core in a Next.js App

Step-by-step guide for building a **consumer application** that installs venky-core from GitHub, wires server bootstrapping, API routes, database migrations, and UI pages — without a local venky-core checkout.

**Latest release:** [v0.4.2](https://github.com/uv-venky/venky-core/releases/tag/v0.4.2)

A working reference implementation lives in the **repo1** consumer app (same patterns as documented here).

---

## Table of contents

1. [Prerequisites](#1-prerequisites)
2. [Create a new consumer app](#2-create-a-new-consumer-app)
3. [Install venky-core from GitHub](#3-install-venky-core-from-github)
4. [Configure pnpm for GitHub installs](#4-configure-pnpm-for-github-installs)
5. [Add post-install script](#5-add-post-install-script)
6. [Configure TypeScript paths](#6-configure-typescript-paths)
7. [Configure Next.js](#7-configure-nextjs)
8. [Configure Tailwind CSS](#8-configure-tailwind-css)
9. [Environment variables](#9-environment-variables)
10. [Application config (YAML)](#10-application-config-yaml)
11. [Wire server initialization](#11-wire-server-initialization)
12. [Add the proxy middleware](#12-add-the-proxy-middleware)
13. [Add API routes](#13-add-api-routes)
14. [Add instrumentation](#14-add-instrumentation)
15. [Database migrations](#15-database-migrations)
16. [Use venky-core UI pages](#16-use-venky-core-ui-pages)
17. [First-time setup and run](#17-first-time-setup-and-run)
18. [Upgrading venky-core](#18-upgrading-venky-core)
19. [Troubleshooting](#19-troubleshooting)
20. [Project layout](#20-project-layout)

---

## 1. Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | `>= 24.13.0` |
| pnpm | `11.x` |
| PostgreSQL | Neon, RDS, or local Postgres |

You also need:

- **GitHub access** to `uv-venky/venky-core` (if the repo is private, configure a [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) for npm/pnpm git installs).
- A Postgres database. venky-core stores tables in the **`core`** schema (`uv_*` tables). Set `VENKY_PG_SEARCH_PATH=core,public`.

---

## 2. Create a new consumer app

Start from a Next.js 16 App Router project:

```bash
pnpm create next-app@16 my-app --typescript --app --no-eslint
cd my-app
```

Set `"type": "module"` in `package.json` and pin the package manager:

```json
{
  "packageManager": "pnpm@11.5.3",
  "engines": {
    "node": ">=24.13.0"
  }
}
```

---

## 3. Install venky-core from GitHub

Add venky-core and its **peer dependencies** to `package.json`:

```json
{
  "dependencies": {
    "venky-core": "github:uv-venky/venky-core#v0.4.2",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "dotenv": "17.4.2",
    "framer-motion": "12.40.0",
    "jotai": "2.20.0",
    "lucide-react": "1.16.0",
    "motion": "12.40.0",
    "next": "16.2.6",
    "pg": "8.21.0",
    "pino": "10.3.1",
    "pino-pretty": "13.1.3",
    "react": "19.2.6",
    "react-dom": "19.2.6",
    "recharts": "2.15.4",
    "swr": "2.4.1",
    "tailwind-merge": "3.6.0",
    "tailwindcss-animate": "1.0.7",
    "valtio": "2.3.2",
    "zod": "4.4.3"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "4.3.0",
    "tailwind-scrollbar": "4.0.2",
    "tailwindcss": "4.3.0",
    "tsx": "4.22.3",
    "typescript": "6.0.3"
  },
  "overrides": {
    "venky-core>next": "$next",
    "venky-core>react": "$react",
    "venky-core>react-dom": "$react-dom"
  }
}
```

Pin Next/React versions with `overrides` so the app and venky-core resolve the same copies.

> **Note:** GitHub tarballs do not include a pre-built `dist/` folder. The post-install script (step 5) builds or restores it.

---

## 4. Configure pnpm for GitHub installs

pnpm 11 blocks dependency build scripts by default. Create `pnpm-workspace.yaml` at the project root:

```yaml
allowBuilds:
  esbuild: true
  sharp: true
  venky-core: true
```

When you bump the venky-core tag, pnpm may add a tarball-specific entry during install, for example:

```yaml
venky-core@https://codeload.github.com/uv-venky/venky-core/tar.gz/<commit-sha>: true
```

If `pnpm install` fails with `ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED` or `ERR_PNPM_IGNORED_BUILDS`, set that entry to `true` (or run `pnpm approve-builds`).

---

## 5. Add post-install script

Add `scripts/post-install.js` to your consumer app. It runs after every `pnpm install` and:

1. **Ensures `dist/` exists** — GitHub installs ship source only; the script restores `dist/` from the pnpm cache or builds venky-core in `node_modules/venky-core`.
2. **Copies SQL migrations** — copies new `.sql` files from `node_modules/venky-core/migrations/` into `./migrations/` (skips files that already exist).

Use the `scripts/post-install.js` from the **repo1** reference consumer app as a starting point.

Register it in `package.json`:

```json
{
  "scripts": {
    "postinstall": "node scripts/post-install.js"
  }
}
```

---

## 6. Configure TypeScript paths

venky-core publishes compiled output under `dist/venky-exports/`. Map import paths in `tsconfig.base.json` (or `tsconfig.json`):

```json
{
  "compilerOptions": {
    "paths": {
      "venky-core/ui": ["./node_modules/venky-core/dist/venky-exports/core/ui/index"],
      "venky-core/ui/*": ["./node_modules/venky-core/dist/venky-exports/core/ui/*/index"],
      "venky-core/client": ["./node_modules/venky-core/dist/venky-exports/core/client/index"],
      "venky-core/server": ["./node_modules/venky-core/dist/venky-exports/core/server/index"],
      "venky-core/server/*": ["./node_modules/venky-core/dist/venky-exports/core/server/*/index"],
      "venky-core/common": ["./node_modules/venky-core/dist/venky-exports/core/common/index"],
      "venky-core/types": ["./node_modules/venky-core/dist/venky-exports/core/types/index"],
      "venky-core/ds": ["./node_modules/venky-core/dist/venky-exports/core/ds/index"],
      "venky-core/auth": ["./node_modules/venky-core/dist/venky-exports/core/auth/index"],
      "venky-core/cli": ["./node_modules/venky-core/dist/venky-exports/core/cli/index"],
      "venky-core/data-ui": ["./node_modules/venky-core/dist/venky-exports/core/data-ui/index"],
      "@/components/ui/*": ["./node_modules/venky-core/dist/components/ui/*"],
      "@/components/elements/*": ["./node_modules/venky-core/dist/components/elements/*"],
      "@/*": ["./src/*"]
    }
  }
}
```

### Available import entry points

| Import | Purpose |
|--------|---------|
| `venky-core/ui` | React components, pages (`RolesPage`, `LoginPageContent`, …) |
| `venky-core/server` | Server runtime, proxy, data sources |
| `venky-core/server/boot` | `initVenkyApp()` bootstrap |
| `venky-core/server/routes` | Pre-built API route handlers |
| `venky-core/cli` | `ensureMigrationsTable`, `runMigrations` |
| `venky-core/auth` | Session and auth types |
| `venky-core/types` | `ServerConfig` and shared types |

---

## 7. Configure Next.js

In `next.config.ts`:

```typescript
import type { NextConfig } from 'next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  transpilePackages: ['venky-core'],
  outputFileTracingRoot: repoRoot,
  turbopack: {
    root: repoRoot,
  },
  // ...your other settings
};

export default nextConfig;
```

- **`transpilePackages`** — required so Next compiles venky-core.
- **`outputFileTracingRoot` / `turbopack.root`** — set to the app root (not a parent monorepo folder) so module resolution works when venky-core is the only package.

---

## 8. Configure Tailwind CSS

venky-core components use Tailwind v4. In `src/app/globals.css`, scan both your app and venky-core sources:

```css
@import 'tailwindcss';
@plugin 'tailwindcss-animate';
@plugin 'tailwind-scrollbar';

@source "../../node_modules/venky-core/src/**/*.{ts,tsx}";
@source "../../src/**/*.{ts,tsx}";
```

Without `@source` for venky-core, utility classes used by library components will be missing.

---

## 9. Environment variables

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Postgres connection string |
| `AUTH_SECRET` | Yes | Long random string for session signing |
| `AUTH_TRUST_HOST` | Recommended | Set `true` for local dev behind proxies |
| `VENKY_PG_SEARCH_PATH` | Yes | `core,public` — schema for `uv_*` tables |
| `VENKY_IGNORE_MIGRATION_CHECKSUM_MISMATCH` | Dev only | `true` when migration files changed after apply |
| `READONLY_DATABASE_URL` | No | Read replica for reporting queries |
| `SKIP_MIGRATIONS` | No | `true` to skip auto-migrations on server boot |

Example `.env`:

```env
DATABASE_URL=postgresql://user:pass@host/neondb?sslmode=require
AUTH_SECRET=your-long-random-secret
AUTH_TRUST_HOST=true
VENKY_PG_SEARCH_PATH=core,public
VENKY_IGNORE_MIGRATION_CHECKSUM_MISMATCH=true
```

`config/env.yml` maps YAML config keys to env var names:

```yaml
dbUrl: 'DATABASE_URL'
readonlyDbUrl: 'READONLY_DATABASE_URL'
secret: 'AUTH_SECRET'
smtp:
  auth:
    pass: 'SMTP_PASS'
```

---

## 10. Application config (YAML)

Create `config/default.yml` for app-specific settings:

```yaml
appId: 'my-app'          # must match your application id in the database
orgName: 'My App'
secret: ''               # overridden by AUTH_SECRET via config/env.yml

init:
  admin:
    email: 'admin@myapp.local'
    password: 'change-me-on-first-login!'

adminAlertEmails:
  - 'admin@myapp.local'

smtp:
  from: 'noreply@myapp.local'
  host: 'localhost'
  port: 1025

features:
  workflow: false
  complianceExport: false
  commandCenter: false
  naturalLanguageSearch: false
```

Optional overrides:

- `config/local.yml` — developer machine overrides (gitignored)
- `config/development.yml` — dev environment overrides
- `config/production.yml` — production overrides

On first server start, venky-core creates the init admin user from `init.admin` if it does not exist.

---

## 11. Wire server initialization

Create `src/lib/server/init/init.ts`:

```typescript
import { initVenkyApp } from 'venky-core/server/boot';

export async function init() {
  await initVenkyApp({
    loadServerConfig: () => import('./server-config'),
    appDsDefsResolve: require.resolve('../ds/defs'),
    serverConfigResolve: require.resolve('./server-config'),
    onAfterInit: async () => {
      // Optional: register app-specific SSE authorizers, jobs, etc.
    },
  });
}
```

Create `src/lib/server/init/server-config.ts` implementing `ServerConfig` from `venky-core/types` (teams, data sources, actions, access control). See the repo1 reference app for a full example.

Call `init()` from your root layout:

```typescript
import { init } from '../lib/server/init/init';

export default async function RootLayout({ children }) {
  await init();
  return (/* ... */);
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
```

---

## 12. Add the proxy middleware

Create `src/proxy.ts` (Next.js 16 middleware entry):

```typescript
import type { NextRequest } from 'next/server';
import { init } from './lib/server/init/init';
import logger from 'venky-core/server/logger';
import type { ProxyCoreOptions } from 'venky-core/server';

type ProxyHandler = (req: NextRequest, options?: ProxyCoreOptions) => Promise<Response>;

let proxyCoreImpl: ProxyHandler | null = null;

export default async function proxy(req: NextRequest) {
  if (!proxyCoreImpl) {
    await init();
    logger.info('Initializing proxy core');
    const { proxyCore } = await import('venky-core/server');
    proxyCoreImpl = proxyCore as unknown as ProxyHandler;
  }
  return proxyCoreImpl!(req);
}

export const config = {
  matcher: [
    '/((?!api/auth|robots.txt|.well-known/appspecific|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.ico$|.*\\.webp$|.*\\.svg$).*)',
  ],
};
```

The proxy handles auth redirects, session checks, and secure-route gating.

---

## 13. Add API routes

Delegate API handlers to venky-core. Example `src/app/api/ping/route.ts`:

```typescript
import { pingRoute } from 'venky-core/server/routes';

export const { GET } = pingRoute;
export const runtime = 'nodejs';
```

Routes to add (each follows the same pattern):

| Path | Export from `venky-core/server/routes` |
|------|----------------------------------------|
| `/api/ping` | `pingRoute` |
| `/api/health` | `healthRoute` |
| `/api/session` | `sessionRoute` |
| `/api/ds` | `dsRoute` |
| `/api/ds/list` | `dsListRoute` |
| `/api/ds-json-schema` | `dsJsonSchemaRoute` |
| `/api/action` | `actionRoute` |
| `/api/activity` | `activityRoute` |
| `/api/log` | `logRoute` |
| `/api/attributes` | `attributesRoute` |

---

## 14. Add instrumentation

Create `src/instrumentation.ts`:

```typescript
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { installCoreOomRecorder } = await import('venky-core/server/boot/oom-recorder');
    await installCoreOomRecorder();

    const { registerCoreInstrumentation } = await import('venky-core/server/boot/instrumentation');
    await registerCoreInstrumentation();
  }
}

export async function onRequestError(err: Error, request: { path: string; method: string }) {
  const { onCoreRequestError } = await import('venky-core/server/boot/instrumentation');
  await onCoreRequestError(err, request);
}
```

This triggers server initialization on boot and records OOM diagnostics.

---

## 15. Database migrations

### Copy migrations

`postinstall` copies venky-core migrations from `node_modules/venky-core/migrations/` into your app's `./migrations/`. App-specific SQL can be added with:

```bash
pnpm migrate add my_feature_name
# creates migrations/YYYYMMDD_my_feature_name.sql
```

### Run migrations

Add `scripts/migrate.ts` (see repo1 reference app) and register in `package.json`:

```json
{
  "scripts": {
    "migrate": "tsx scripts/migrate run"
  }
}
```

Run manually before first use:

```bash
pnpm migrate
```

Migrations also run automatically on server boot unless `SKIP_MIGRATIONS=true`.

### Migration naming

Files must match `{version}_{name}.sql`, e.g. `20240419_init.sql`. The version is a numeric date prefix used for ordering.

---

## 16. Use venky-core UI pages

Import pre-built pages from `venky-core/ui`:

```tsx
'use client';

import { RolesPage } from 'venky-core/ui';

export default function Page() {
  return <RolesPage />;
}
```

Other exported pages: `UsersPage`, `LoginPageContent`, `CodeGenPage`, `UserProfilePage`, etc.

Use `AppThemeProvider` from `venky-core/ui` in your root layout for theming.

---

## 17. First-time setup and run

```bash
# 1. Clone or scaffold your app
git clone <your-app-repo>
cd <your-app>

# 2. Configure environment
cp .env.example .env
# Edit DATABASE_URL, AUTH_SECRET

# 3. Install (builds venky-core dist + copies migrations)
pnpm install

# 4. Apply database schema
pnpm migrate

# 5. Start dev server
pnpm dev
```

Open http://localhost:3000 — you should be redirected to `/login`.

Set admin credentials in your app's `config/default.yml` under `init.admin`.

---

## 18. Upgrading venky-core

1. Update the git ref in `package.json`:
   ```json
   "venky-core": "github:uv-venky/venky-core#v0.4.3"
   ```
2. Run `pnpm install`.
3. If pnpm reports a new `allowBuilds` entry, approve it in `pnpm-workspace.yaml`.
4. Run `pnpm migrate` to apply any new SQL.
5. Run `pnpm dev` and smoke-test login, admin pages, and API routes.

Check the [releases](https://github.com/uv-venky/venky-core/releases) page for breaking changes.

---

## 19. Troubleshooting

### `Module not found: Can't resolve 'fs-extra'` or `'react-scan'`

venky-core v0.4.1 and earlier listed some runtime deps as devDependencies. Upgrade to **v0.4.2+**, or add them to your app's `dependencies` as a temporary workaround.

### `pnpm install` fails on venky-core build scripts

Add venky-core to `allowBuilds` in `pnpm-workspace.yaml` (see step 4).

### `venky-core dist is missing`

Re-run `pnpm install`. The post-install script restores `dist/` from cache or builds it. First install can take several minutes.

### `column "app_id" does not exist`

A migration was recorded but never applied (common after rebranding or checksum changes). Run pending migrations:

```bash
pnpm migrate
```

If migrations are stuck, add an idempotent repair migration with `ADD COLUMN IF NOT EXISTS`.

### Checksum mismatch on `pnpm migrate`

Set in `.env` for local development:

```env
VENKY_IGNORE_MIGRATION_CHECKSUM_MISMATCH=true
```

Do **not** use this in production.

### Turbopack workspace root error

Ensure `turbopack.root` and `outputFileTracingRoot` in `next.config.ts` point to your app directory, not a parent folder.

### Login returns 500 after install

1. Confirm `dist/` exists: `node_modules/venky-core/dist/venky-exports/core/ui/index.js`
2. Confirm migrations ran: `pnpm migrate`
3. Check server logs for the first database error

---

## 20. Project layout

```
your-consumer-app/
├── config/
│   ├── default.yml          # App id, admin user, feature flags
│   └── env.yml              # Env var name mapping
├── migrations/              # SQL migrations (copied from venky-core + app-specific)
├── scripts/
│   ├── migrate.ts           # CLI migration runner
│   └── post-install.js      # Build venky-core dist + copy migrations
├── src/
│   ├── app/
│   │   ├── api/             # Thin wrappers around venky-core/server/routes
│   │   ├── (secure)/        # Authenticated app routes
│   │   └── layout.tsx       # Calls init(), wraps with AppThemeProvider
│   ├── lib/server/
│   │   ├── init/            # initVenkyApp + ServerConfig
│   │   ├── ds/              # App data source definitions
│   │   └── actions/         # App server actions
│   ├── proxy.ts             # Auth proxy middleware
│   └── instrumentation.ts   # Boot-time server init
├── pnpm-workspace.yaml      # pnpm allowBuilds
├── next.config.ts
├── tsconfig.base.json       # venky-core path mappings
└── package.json
```

---

## Scripts reference

| Script | Description |
|--------|-------------|
| `pnpm install` | Install deps, build venky-core `dist/`, copy migrations |
| `pnpm dev` | Start Next.js dev server (port 3000) |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm migrate` | Run pending database migrations |
| `pnpm typecheck` | TypeScript check |

---

## Further reading

- [venky-core repository](https://github.com/uv-venky/venky-core)
- [venky-core releases](https://github.com/uv-venky/venky-core/releases)
- [pnpm allowBuilds](https://pnpm.io/settings#allowbuilds)
