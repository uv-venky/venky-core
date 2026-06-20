# CLAUDE.md — venky-core

Optimized for LLM readers. Dense by design. Cross-references over restatement.

## 1. Project summary

`venky-core` is a private, Next.js 16 + React 19 npm package (published to GitHub Packages) that provides shared UI components, server utilities, an in-house DataSource ORM, an admin/auth/RBAC stack, a chat/AI agent framework ("Command Center"), and a workflow engine. It is consumed by VENKY applications: `demo` (template), and `metro-one-cop`, `metro-one-tim`, `metro-one-vm` (production). The repo is also runnable on its own (`pnpm dev`) as a reference app.

## 2. Tech stack (versions from `package.json` / `pnpm-lock.yaml`)

- Node `>=24.13.0`, pnpm only (never npm/yarn).
- Next.js `16.2.4` (App Router, React Compiler enabled, `transpilePackages: ['venky-core']`).
- React `19.2.5`, TypeScript `6.0.3` (strict, `verbatimModuleSyntax`). Typecheck via `tsgo` (TypeScript native preview).
- Tailwind CSS v4 (`@tailwindcss/postcss`), Shadcn UI / Radix UI primitives.
- Biome `2.4.13` for lint+format. ESLint only for `react-hooks` rules (`pnpm lint:react-hooks`).
- Vitest `4.1.5` (jsdom) for unit, Playwright `1.59.1` for e2e and visual regression.
- AI SDK `ai 6.0.157`, `@ai-sdk/anthropic`, `@ai-sdk/openai`, `@ai-sdk/react 3.0.159`.
- Postgres via `pg 8.20.0` (primary) + `postgres 3.4.9`; also `mysql2`, `oracledb` (peer-style).
- Auth: custom session + `better-auth 1.6.8` + SAML via `samlify`.
- State: `valtio 2.3.1` (custom `useStore`), `jotai 2.19.1`, `swr 2.4.1`.
- Validation: `zod 4.3.6` (some legacy `zod/v3` imports — see `src/auth.ts`).
- Embeddings: `@huggingface/transformers 3.8.1` (local, ONNX runtime).

## 3. Repository map

```
.
├── src/
│   ├── app/                      Next.js App Router routes (this repo runs as an app too)
│   │   ├── (secure)/             Auth-required route group
│   │   │   ├── (cc)/             Command Center (AI chat) — domain-routed
│   │   │   │   ├── command-center/[domainSlug]/[[...id]]/   Chat UI
│   │   │   │   └── api/command-center/                       CC-specific API routes
│   │   │   ├── (chat)/           Legacy chat group
│   │   │   ├── admin/, core/, user/, workflows/, dashboards (under (cc)), home, gen, go
│   │   ├── api/                  Top-level API routes (auth, ds, files, sse, workflow, …)
│   │   ├── login/, layout.tsx, page.tsx, globals.css
│   ├── auth.ts                   Server actions for sign-in / SAML / magic-link / password
│   ├── components/
│   │   ├── core/                 Shared primitives (PageShell, table, forms, charts, sidebar)
│   │   ├── ui/                   Shadcn UI re-exports
│   │   ├── elements/, chat/, ai-elements/, sidebar/, settings/, workflow(s)/, agents/
│   ├── lib/
│   │   ├── core/                 Stable, exported "core" library
│   │   │   ├── client/           useStore, useQuery, valtioQueryStore, notifications, …
│   │   │   ├── server/           db, session, secure (CSRF/headers), email, migrate, ratelimit
│   │   │   └── common/           date-utils, types, errors, ds types
│   │   ├── server/               App-level server: actions/, ds/defs/, agents/, jobs/, embeddings/
│   │   ├── chat/                 Chat infra (ai/types, db, command-center module — see also app/(secure)/(cc)/lib/agent for newer code)
│   │   ├── workflow*, steps/, sse/, integrations-store.ts, …
│   ├── venky-exports/core/       PUBLIC PACKAGE BARRELS — ui, client, server, common, ds, auth, ai, …
│   │   └── browser-stubs/        Browser-safe shims for server-only entrypoints (see `package.json#exports`)
│   ├── plugins/                  Workflow integration plugins (slack, github, linear, stripe, …)
│   ├── artifacts/, hooks/, types/, test/, instrumentation.ts, proxy.ts, proxyCore.ts
├── migrations/                   .sql files, run by `tsx scripts/migrate run` (see §5)
├── config/                       default.yml, env.yml, production.yml, local.yml (gitignored)
├── scripts/                      migrate.ts, codegen-action-param-schemas.ts, sync-deps.js,
│                                 check-server-routes-boundary.mjs, check-data-ui-client-boundary.mjs
├── e2e/                          Playwright specs incl. visual-regression
├── email-templates/, public/, certs/, .cursor/rules/, .husky/
├── AGENTS.md                     Primary contributor guide — read this
├── README.md                     Consumer install instructions (GitHub Packages auth)
├── biome.jsonc, eslint.config.js, knip.json, vitest.config.ts, playwright.config.ts
├── tsconfig.json (dev), tsconfig.build.json (publish)
├── next.config.ts, package.json, pnpm-lock.yaml
└── dist/                         Build output (committed to npm tarball, NOT to git — see `files`)
```

Authoritative supplementary docs (read before changing relevant areas):

- `AGENTS.md` — top-level contributor rules, package exports, required pre-commit checks.
- `.cursor/rules/general.mdc` — coding standards (always applies).
- `.cursor/rules/architecture.mdc` — DataSource vs Prisma rationale.
- `.cursor/rules/page-pattern.mdc` — `PageShell` + `page.tsx` / `page-content.tsx` split.
- `.cursor/rules/store-pattern.mdc` — `useStore` config, hooks, dialog pattern.
- `.cursor/rules/action-pattern.mdc` — server action signature + registration.
- `.cursor/rules/datasource-pattern.mdc` — DataSource definitions.
- `.cursor/rules/table-columns-pattern.mdc`, `multi-tab-detail-page-pattern.mdc`, `date-handling.mdc`, `named-parameters.mdc`, `config-externalization-pattern.mdc`, `testing-pattern.mdc`.

## 4. Architecture overview

This repo is **simultaneously** a publishable npm package (`venky-core`) and a runnable Next.js app. Everything in `src/venky-exports/core/**` is the public API surface; `package.json#exports` maps subpaths (`./ui`, `./server`, `./client`, `./auth`, `./ds`, `./common`, `./ai`, etc.) to compiled `dist/` outputs, with **`browser`-conditional stubs** in `src/venky-exports/core/browser-stubs/` so server-only modules don't leak into client bundles.

Request/data flow:

1. Client component calls `useStore({ datasourceId, page, … })` from `venky-core/client` (inside core: `@/lib/core/client/store`). State lives in valtio.
2. `useStore` POSTs to `/api/ds/...` (see `src/app/api/ds/`); the route resolves a DataSource definition (`src/lib/server/ds/defs/**`) and applies role-based access, lifecycle hooks, audit, optimistic locking.
3. Complex queries skip DataSources and use **server actions**: a function `(client: PgPoolClient, session: Session, …params)` in some `action.ts`, registered in `src/lib/server/actions/{module}.ts` (`ACTIONS` + `ACTION_ACCESS_ROLES`), invoked from the client via `useQuery('actionName', …)` → `/api/action`. Param schemas are codegen'd into `src/lib/server/actions/param-schemas.generated.ts` via `pnpm codegen:action-params` (runs in pre-commit hook).
4. Routes that need DB+session use the `withDB*` wrappers in `src/lib/core/server/withDB*.ts`. Read-only variants exist (`withReadOnlyDB*`).
5. Auth: `src/auth.ts` (server actions for sign-in, magic-link, SAML) + `src/lib/core/server/session.ts` + `db-ratelimit.ts` (Postgres-backed buckets — see `migrations/20260422_rate_limit_buckets.sql`). RBAC roles drive both DataSource access and action access.
6. AI / Command Center: domain-scoped chat at `/command-center/[domainSlug]/[[...id]]`. Agent resolver at `src/app/(secure)/(cc)/lib/agent/agent-resolver.ts` builds prompt + tools (KB chunks, schema catalog, memories) from `cc_*` tables. See the auto-memory file `~/.claude/projects/-Users-sthamman-Work-uv-venky-core/memory/MEMORY.md` for deeper CC architecture notes.
7. Workflow engine: `src/lib/workflow*`, `src/lib/steps/`, plus plugins under `src/plugins/`. Disabled by setting `features.workflow: false` in `config/*.yml`.

Boundaries enforced by scripts (run by hooks/CI):

- `scripts/check-server-routes-boundary.mjs` — server modules don't import client-only code.
- `scripts/check-data-ui-client-boundary.mjs` — `data-ui` doesn't pull server code.
- `scripts/check-node-security.js` — node-side security checks.

## 5. Common commands

| Task | Command |
|---|---|
| Install | `pnpm install` |
| Dev (Next app) | `pnpm dev` |
| Debug dev | `pnpm debug` (Node `--inspect`) |
| Build npm package | `pnpm build` (rimraf dist → tsc → tsc-alias → copy-static) |
| Build Next app | `pnpm build:next` |
| Start prod | `pnpm start` |
| Typecheck | `pnpm typecheck` (uses `tsgo`, NOT `tsc`) |
| Lint | `pnpm lint:all` (= `biome lint .` + `eslint react-hooks`) |
| Lint autofix | `pnpm lint:fix` |
| Format | `pnpm format` (Biome write) |
| Format check | `pnpm format:check` |
| Unit tests (watch) | `pnpm test` |
| Unit tests (one shot) | `pnpm test --run` |
| Single test file | `pnpm test --run path/to/file.test.ts` |
| E2E | `pnpm test:e2e` (Playwright; needs dev server, baseURL `http://localhost:3000`) |
| E2E UI | `pnpm test:e2e:ui` |
| Visual regression | `pnpm test:visual`, update with `pnpm test:visual:update` |
| Add migration | `pnpm migrate add <name>` (creates `migrations/<date>_<name>.sql`) |
| Run migrations | `pnpm migrate run` (needs `DATABASE_URL` in `.env` / `.env.local`) |
| Action param codegen | `pnpm codegen:action-params` (auto-runs in pre-commit) |
| Unused exports | `pnpm check:unused` (knip) |
| Boundary checks | `pnpm check:server-routes-boundary`, `pnpm check:data-ui-client-boundary`, `pnpm check:node-security` |
| Sync consuming-project deps | `pnpm sync-deps` (check), `pnpm sync-deps:fix` (apply) |
| Bump version (no tag) | `pnpm version patch --no-git-tag-version` |
| Publish | **Do not run.** User publishes manually with `pnpm publish` (or `pnpm go`). |

Pre-commit (`.husky/pre-commit`): runs `pnpm codegen:action-params`, formats the generated file, then `lint-staged` (Biome format/lint + ESLint react-hooks).

Required-before-commit checklist (from `AGENTS.md`): `pnpm typecheck && pnpm format && pnpm lint:all && pnpm test --run`. The user's auto-memory additionally calls out `pnpm build` after substantive changes.

## 6. Code conventions

- **Imports inside core**: use `@/...` (TS path alias to `src/`). NEVER import from `venky-core/...` inside this repo — those paths target the built `dist/` and break typecheck pre-publish. Consumers do the opposite.
- **Named exports only** for components. Default exports allowed for Next.js page files.
- **No enums** — use `const X = { … } as const; type X = (typeof X)[keyof typeof X]`.
- **No `console.log`**. Server: `import logger from '@/lib/core/server/logger'`. Client: `console.info/warn/error` only.
- **No raw CSS files / inline styles** — Tailwind only. Use `cn()` from `@/lib/utils`.
- **`interface` for object shapes**, `type` for unions/intersections.
- **File header** on new source files (lint-staged adds it): `/* Copyright (c) 2024-present Venky Corp. */`.
- **Server actions**: signature `(client: PgPoolClient, session: Session, …params)`. Register in `src/lib/server/actions/{module}.ts` under `ACTIONS` and `ACTION_ACCESS_ROLES`. Re-export from `src/lib/server/actions/index.ts`.
- **3+ params → use a named-params object** (`.cursor/rules/named-parameters.mdc`).
- **Pages**: `page.tsx` is a thin client wrapper using `PageShell` + `dynamic(() => import('./page-content'), { ssr: false })`. Real UI lives in `page-content.tsx`. `PageShell` already provides `ErrorBoundary` + `Suspense`.
- **Forms**: store-backed binding via `<TextInput store={store} attributeCode="…">` is preferred over controlled `value/onChange`. Use `useCurrentRowSync(store)` (not `useCurrentRow`) inside forms to avoid cursor jump.
- **Framework-agnostic navigation**: in core, import `Link` from `@/components/core/link`, `useRouter`/`usePathname`/`useSearchParams`/`useParams` from `@/components/core/hooks/*`, and `redirect` from `@/lib/core/server/redirect`. Do NOT import from `next/navigation` or `next/link` outside the adapter files (`InitNextJSCoreHooksSetup.ts`, `redirect-nextjs.ts`).
- **Toasts**: use `showError` / `showSuccess` from `@/lib/core/client/notifications` (per user feedback memory), not `sonner` directly.
- **No `any`** without justification. No TODOs left behind.
- **Defensive display**: `user.name || user.email || 'Unknown'`, `value ?? default`.
- **Date display**: use UTC methods (`getUTCMonth`, etc.) for date-only values to avoid TZ drift. See `.cursor/rules/date-handling.mdc`.

## 7. Testing

- **Unit**: Vitest, jsdom env, setup `src/test/setup.ts`, server-only mock in `src/test/mocks/server-only.ts`. Tests colocated in `__tests__/` or as `*.test.ts(x)` (~67 files at time of writing). Run a single test: `pnpm test --run src/lib/sse/server/__tests__/publisher.test.ts`. Use `--run` to prevent watch mode from hanging.
- **E2E / visual**: Playwright in `e2e/`. `playwright.config.ts` expects a dev server on `http://localhost:3000` (start `pnpm dev` separately). Visual regression baselines under `e2e/performance-baselines/` and `playwright-report/`; update with `pnpm test:visual:update`.
- See `.cursor/rules/testing-pattern.mdc` for component test setup details.

## 8. Gotchas & non-obvious behavior

- **Build vs typecheck mismatch**: `next.config.ts` sets `typescript.ignoreBuildErrors: true` — `pnpm build:next` does NOT type-check. Always run `pnpm typecheck` separately. The publish build (`pnpm build`) uses `tsconfig.build.json` and DOES emit, so type errors there will fail.
- **`tsgo`, not `tsc`**: typecheck uses `@typescript/native-preview`. If you see odd diagnostics, fall back to `pnpm exec tsc --noEmit -p tsconfig.json`.
- **`pdf-parse` / `pdfjs-dist`**: must remain in `serverExternalPackages` in `next.config.ts`; bundling breaks the worker.
- **pgvector `search_path`**: SQL uses unqualified `vector` casts. Set `VENKY_PG_SEARCH_PATH` (e.g. `extensions, public`) when pgvector lives outside `public`. HNSW indexes in migrations must use the same `search_path` or qualify `extensions.vector_cosine_ops`. See `AGENTS.md`.
- **Reactive store rows**: use `useDBRows(store)` — `Object.values(store.rows())` is non-reactive and won't re-render.
- **`settings.theme`** in `bulkCreateUsers`/`createUser`: needs `as const` for `'light' | 'dark'` narrowing.
- **Bulk user inserts**: prefer `bulkCreateUsers` / `bulkAssignRolesToUsers` over loops — single insert into `uv_email_requests`.
- **Click-outside + Radix portals**: dropdowns render in portals; check `[data-radix-popper-content-wrapper]` and `[role="listbox"]` before treating clicks as "outside". See `.cursor/rules/general.mdc#Click-Outside`.
- **DataSource hot reload (dev only)**: `src/lib/server/init/init.ts` clears require cache for DS files. No restart needed unless you touch `init.ts` itself.
- **Action codegen is checked in**: `src/lib/server/actions/param-schemas.generated.ts` is committed and refreshed by the pre-commit hook. Don't hand-edit; run `pnpm codegen:action-params`.
- **Browser stubs**: when you add a server-only export to `src/venky-exports/core/server/**`, add a matching no-op stub in `src/venky-exports/core/browser-stubs/` and reference it via the `browser` condition in `package.json#exports`. Otherwise, importing it in a client bundle pulls in `pg`, `oracledb`, etc.
- **Workflow can be disabled**: `features.workflow: false` in `config/default.yml`/`env.yml` (see `AGENTS.md` "Disabling workflow").
- **Natural language SmartSearch**: deployment allows NL unless `features.naturalLanguageSearch: false`; each page opts in with `enableNaturalLanguageSearch` on `PageLayoutTemplate`/`SmartSearch`; see `AGENTS.md`.
- **`zod/v3` imports** appear in `src/auth.ts` even though the project pins `zod 4.3.6` — the v3 sub-export is intentional for AI-SDK compatibility (see `_comments` in `package.json`). Don't "fix" this without checking.

## 9. Do-not-touch

- `dist/` — build output; regenerated by `pnpm build`.
- `src/lib/server/actions/param-schemas.generated.ts` — regenerated by `pnpm codegen:action-params` (pre-commit hook).
- `src/lib/app-info.js` / `app-info.d.ts` — generated.
- `tsconfig.tsbuildinfo`, `.next/`, `playwright-report/`, `test-results/`, `hf_cache/` — build/cache.
- `pnpm-lock.yaml` — only modify by running pnpm commands, never hand-edit.
- `next-env.d.ts` — managed by Next.
- Don't run `npm publish` — user publishes manually.
- `.env*` and `config/local.yml` are gitignored; never commit credentials.

## 10. When making changes

- **New page**: create `src/app/(secure)/<area>/<feature>/page.tsx` (PageShell + dynamic import) and `page-content.tsx` (default export). Optional `hooks/`, `components/`, `action.ts`. Mirror an existing area like `src/app/(secure)/admin/` or reference `src/components/core/admin/health-dashboard.tsx`.
- **New API route**: only when no DataSource/action fits (webhooks, file streaming, public endpoints). Wrap with `withDBSessionRoute` from `@/lib/core/server/withDBRoutes`. Add `export const runtime = 'nodejs'` if you use Node APIs.
- **New server action**: write `(client, session, …params): Promise<T>` in an `action.ts` near the page. Register in `src/lib/server/actions/<module>.ts` (`ACTIONS` + `ACTION_ACCESS_ROLES`). Re-run `pnpm codegen:action-params`. Call from the client via `useQuery('actionName', …)` from `@/lib/core/client/useQuery`.
- **New DataSource**: define under `src/lib/server/ds/defs/<area>/<Name>DS.ts`, register from `src/lib/server/ds/defs/index.ts`. Add the matching TypeScript row type in `src/lib/common/ds/types/<area>/<Name>.ts`. Use `joins` array (new format) for joined fields, mark joined columns `calculated: true`. See `.cursor/rules/datasource-pattern.mdc`.
- **New shared component**: under `src/components/core/...` with named export. Add to the appropriate barrel in `src/venky-exports/core/ui/...`. If it touches server code, also add a browser stub.
- **New migration**: `pnpm migrate add <snake_case_name>` → edit the generated file under `migrations/`. Run with `pnpm migrate run`. For pgvector indexes, see the search_path note in §8.
- **New workflow plugin**: copy `src/plugins/_template/`, register in `src/plugins/registry.ts`. See `src/plugins/AGENTS.md`.
- **New chat tool / Command Center capability**: see auto-memory `MEMORY.md` for current architecture; tools live under `src/app/(secure)/(cc)/command-center/[domainSlug]/[[...id]]/server/tools/`, agent resolver at `src/app/(secure)/(cc)/lib/agent/agent-resolver.ts`.
- **Breaking changes**: this package has 4 known consumers (`demo`, `metro-one-cop`, `-tim`, `-vm`). Coordinate or keep backwards-compatible exports.

## 11. Glossary

- **DataSource (DS)**: in-house full-stack data abstraction (schema + RBAC + lifecycle + client store). See `.cursor/rules/architecture.mdc`.
- **`useStore`**: valtio-backed client hook that binds a DataSource to a page; provides loading/dirty/posting/pagination state. From `venky-core/client`.
- **`useQuery` / `useMutation`**: client hooks that call registered server actions (NOT React-Query — custom).
- **PageShell**: layout wrapper with built-in `ErrorBoundary` + `Suspense`. From `venky-core/ui`.
- **Action**: a `(client, session, …)` async function callable from the client via the action registry.
- **Command Center (CC)**: domain-scoped AI chat product. Tables: `cc_domains`, `cc_domain_schemas`, `cc_memories`, `cc_skills`, `cc_knowledge_bases`, `cc_kb_documents`, `cc_kb_chunks`.
- **Domain (CC)**: user-selected scope at the start of a chat — restricts schemas/KBs/skills/tools.
- **Skill (CC)**: admin-authored instruction blob auto-loaded into a chat by similarity on `description_embedding`. (Distinct from Claude Code "skills".)
- **`uv_*` tables**: core platform tables (users, sessions, roles, activity, deployments, jobs, …). `cc_*` tables are Command Center.
- **Workflow / Plugin**: graph-based job runner under `src/lib/workflow*` with integration plugins in `src/plugins/`.
- **Consuming project**: an app that depends on `venky-core` via GitHub Packages.
- **`PREFIX`**: app-id prefix (`src/lib/server/constants.ts`) used to namespace cache/ratelimit keys.
