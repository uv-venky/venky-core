# Repository Agent Guide

This is **venky-core** - the shared component library and utilities package for all VENKY applications.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (strict mode)
- **UI**: Shadcn UI, Radix UI, Tailwind CSS v4
- **State**: valtio-based store system
- **Testing**: Vitest (unit), Playwright (e2e)
- **Linting/Formatting**: Biome
- **Package Manager**: pnpm (always use pnpm, never npm/yarn)

## Package Structure

- `src/components/core/` – Shared React components (UI primitives, page layouts, forms)
- `src/lib/core/client/` – Client-side utilities (store, hooks, useQuery)
- `src/lib/core/server/` – Server-side utilities (database, auth, logging)
- `src/lib/core/common/` – Shared utilities (types, validation, helpers)
- `src/venky-exports/` – Package export definitions
- `src/plugins/` – Workflow integration plugins
- `migrations/` – Database migration files
- `.cursor/rules/` – Detailed development patterns

## Quick Start

- Install: `pnpm install`
- Dev server: `pnpm dev`
- Build package: `pnpm build`

## Package Exports

```typescript
// Client utilities
import { useStore } from 'venky-core/client';
import { useQuery, useMutation, useSuspenseQuery } from 'venky-core/client';

// Store hooks
import { useDBRows, useCurrentRowSync, useIsStoreLoading } from 'venky-core/ui';
import { useIsStoreDirty, useIsStorePosting, useRowValue } from 'venky-core/ui';

// UI Components
import { PageShell, PageLayoutTemplate, TextInput } from 'venky-core/ui';
import { Popup, TableCell, HeaderCell } from 'venky-core/ui';

// Server utilities
import { withDBSessionRoute, logger } from 'venky-core/server';

// Common utilities
import { isEmpty, cn, UserError } from 'venky-core/common';
```

## Consuming Projects

This package is consumed by:
- `demo` – Template/reference project
- `metro-one-cop`, `metro-one-tim`, `metro-one-vm` – Production projects

**When making changes:**
- Ensure backwards compatibility or coordinate with consuming projects
- Breaking changes require updates to all consumers

**Disabling workflow:** Set `features: { workflow: false }` in `config/default.yml` (or env.yml). The job registry reads config at load time and omits the four workflow jobs. In server-config, pass a `teams` array that excludes the workflow portal (e.g. `[adminPortal, chatPortal]` from `venky-core/server/sidebar`). Omit `workflowPlugins` or pass `[]` in your layout. See `.cursor/rules/config-externalization-pattern.mdc` (Disabling Workflow).

**Natural language SmartSearch:** NL/voice parse is allowed at deployment level unless `features.naturalLanguageSearch: false` in config (server: `isNaturalLanguageSearchEnabled()`; client: `naturalLanguageSearchEnabled` on `AppContext`). Enable per app via `DEFAULT_ENABLE_NATURAL_LANGUAGE_SEARCH` on `AppProvider`, and per page with `enableNaturalLanguageSearch` on `PageLayoutTemplate` (or `SmartSearch`). See `.cursor/rules/config-externalization-pattern.mdc` (Natural language SmartSearch).

**pgvector schema:** SQL uses unqualified casts to `vector` (not `vector`). The pg pool sets the session `search_path` when **`VENKY_PG_SEARCH_PATH`** is set (e.g. `extensions, public` so the schema where `CREATE EXTENSION vector` ran appears before `public`). Omit the variable when pgvector lives in `public` (default). Invalid characters (`;`, `\`, newlines, null) are rejected. Because `search_path` affects all unqualified names on that connection, avoid shadowing between schemas; use explicit table schemas in SQL where needed. **Migrations** that create HNSW indexes with `vector_cosine_ops` must use the same `search_path` as the app session, or qualify the opclass (e.g. `extensions.vector_cosine_ops`), or run `SET search_path` at the top of the migration script.

## Important Documentation

### Cursor Rules (Detailed Patterns)

- `.cursor/rules/general.mdc` – Core development guidelines (always applied)
- `.cursor/rules/architecture.mdc` – Architecture rationale (DataSource vs Prisma/React Query)
- `.cursor/rules/page-pattern.mdc` – Page structure with PageShell/PageLayoutTemplate
- `.cursor/rules/store-pattern.mdc` – Store configuration, hooks, CRUD operations
- `.cursor/rules/action-pattern.mdc` – Server actions with useQuery/useMutation
- `.cursor/rules/table-columns-pattern.mdc` – Table columns with useRowValue
- `.cursor/rules/datasource-pattern.mdc` – DataSource definitions
- `.cursor/rules/testing-pattern.mdc` – Unit and E2E testing patterns

### Key Files

- `package.json` – Package exports configuration
- `tsconfig.build.json` – TypeScript build config
- `src/venky-exports/` – Export barrel files

## Coding Standards

- Use TypeScript with strict mode; prefer `interface` over `type`
- Use named exports for components
- Use `@/` path alias for internal imports
- Use `pnpm` for all package operations, never npm/yarn
- No `console.log` - use `logger` on server, `console.info/warn/error` on client
- No enums - use const maps instead
- No inline styles or CSS files - use Tailwind classes
- Always export new components/utilities from the appropriate barrel file

## Required Checks Before Commit

Run these commands and fix any issues before committing:

1. **Typecheck** – `pnpm typecheck`
2. **Format** – `pnpm format`
3. **Lint** – `pnpm lint:all`
4. **Unit tests** – `pnpm test --run`

## Publishing (only when asked)

When the user asks to publish core changes:

1. Ensure consuming projects have latest code: `git pull` in each project
2. From core directory: `pnpm publish && pnpm sync-deps:fix`

This publishes core and propagates the new version to all consuming projects.
