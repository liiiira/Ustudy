# 00 — Project Setup

## Goal

Stand up a monorepo (pnpm workspace) with a clean process boundary between a
stateless HTTP API and a rich client, and a fast inner-loop for local
development.

## Topology

```
apps/backend/   Express API process
apps/web/       React SPA, built and served independently
```

Frontend and backend are separate deployable units communicating over HTTP —
not a monolith with server-rendered views. This buys independent deploy
cadence and lets the client target any future consumer of the same API
(the planned `apps/mobile` Flutter client included) without backend changes.

## Technology decisions

| Concern | Choice | Why |
|---|---|---|
| Package manager | pnpm workspaces | Content-addressable store (disk-efficient), strict node_modules resolution (no phantom dependencies), native workspace support for a multi-app monorepo |
| Frontend | React + TypeScript + Vite | Fast HMR dev loop, static typing across component boundaries, React Compiler enabled for automatic memoization instead of hand-rolled `useMemo`/`useCallback` |
| Styling | Tailwind CSS | Utility-first, keeps styling co-located with markup instead of a separate cascade to reason about |
| Backend runtime | Node.js + Express + TypeScript | Minimal, unopinionated HTTP layer — architecture decisions (layering, validation, error handling) are explicit in application code rather than framework-imposed |
| Primary datastore | PostgreSQL | ACID-compliant relational store; the domain (users, communities, posts, comments) is inherently relational — foreign keys enforce referential integrity that a document store would push into application code |
| Secondary datastore | Redis | Reserved for state that doesn't need ACID durability or relational structure: caching, rate limiting, ephemeral session/token bookkeeping. Not adopted speculatively — introduced only where it earns its keep over Postgres |

## Environment topology

Postgres and Redis run as containers (Docker Compose); the Express process and
the Vite dev server both run on the host directly. Rationale: the API process
is the thing under active iteration — running it natively avoids a
rebuild-and-restart-container cycle on every change, while the stateful
services (which change rarely during a feature's development) are fine
running in containers with a fixed, disposable state.

## Problems encountered

**Startup race condition.** The Express process can start before Postgres/Redis
finish accepting connections, since there's no `depends_on: condition:
service_healthy` gate between the natively-run API process and the
containerized databases (Docker Compose health-check gating only applies to
other containers, not host processes). Mitigated with a bounded
connect-with-retry loop on process boot rather than a real readiness check.
This is a stopgap, not a readiness protocol — see below.

## Things to add

- **Replace the retry loop with real readiness signaling.** A fixed-attempt
  retry loop is a heuristic, not a guarantee — it doesn't distinguish "still
  booting" from "will never come up." Either add Compose healthchecks the API
  process can poll, or fail fast with a clear error and let process
  supervision (a restart policy) handle the retry.
- **Environment variable validation at boot.** Config is currently read as
  `process.env.X!` with no schema — a missing/malformed var fails deep inside
  whatever code first dereferences it, not at startup. A boot-time schema
  check (zod, since it's already a dependency) would fail fast with a clear
  message instead.
- **Shared workspace tooling.** No shared `tsconfig`/ESLint base config across
  `apps/*` yet — each app currently configures these independently, which
  will drift as `apps/mobile` and any shared package are added.
- **`.env.example` files.** Neither `apps/backend` nor the repo root documents
  its required environment variables outside of the (gitignored) `.env` files
  themselves — onboarding a new environment currently means reverse-engineering
  required vars from source.
- **CI on push/PR.** No CI pipeline exists yet — tests currently only run
  locally via `pnpm test`.
