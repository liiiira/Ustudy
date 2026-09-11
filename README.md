# UStudy

CS students don't struggle because the material doesn't exist — they struggle
because it's scattered across a hundred tabs, and nobody around them is
learning the same thing at the same time. UStudy is a place to fix both: a
community where students share resources, follow roadmaps through a subject,
and post/comment their way through problems together instead of alone in a
Discord server that died six months ago.

It's also a personal engineering playground — a real excuse to build a
backend, a database, an API, and (soon) a mobile client the way you'd actually
build them in production, and to document the reasoning behind each decision
along the way. See `docs/dev-logs/` for that side of it.

## Product

- **Communities** — spaces organized around a subject or topic.
- **Posts & comments** — ask, answer, discuss.
- **Roadmaps** *(planned)* — structured paths through a subject instead of a
  wall of unordered links.
- **Resource sharing** *(planned)* — curated, community-vetted material per
  topic.
- **Real-time messaging** *(planned)*.
- **AI assistant** *(planned)* — contextual help inside the platform.
- **Recommendation engine** *(long-term)* — surface the right community,
  roadmap, or resource for where a student actually is.

## Stack

**Backend** — Node.js, Express, TypeScript, PostgreSQL via `pg` (no ORM —
SQL is written and controlled directly), Redis, SQL migrations,
Vitest + Supertest for API testing.

**Frontend** — React, TypeScript, Vite, Tailwind CSS.

**Mobile** *(planned, `apps/mobile`)* — Flutter.

**Infra** — Docker Compose for Postgres/Redis, bash scripts for local dev and
test orchestration.

## Architecture

Layered backend;

```
Controller -> Service -> Repository -> PostgreSQL
```

Controllers handle HTTP, services hold business logic, repositories own SQL.
Cross-cutting concerns (validation, auth, error handling) live in middleware.
Full breakdown in `docs/dev-logs/`.

## Status

Early and actively built. Core layered backend, auth, communities, posts, and
comments exist today; everything under "planned" above — including the
Flutter mobile app — is roadmap, not yet code.
