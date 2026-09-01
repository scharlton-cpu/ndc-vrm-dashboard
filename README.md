# NDC Voter Relationship Manager (NDC VRM)

Campaign Intelligence & Operations Platform for the National Democratic
Congress of Grenada — **Campaign HQ**.

A production-shaped campaign command centre: voter register management,
constituency/polling-division drill-down analytics, a no-code Query Centre,
role-based governance with constituency-scoped access, and a full audit
trail — built on Next.js, PostgreSQL, and Prisma so it can be pointed at the
real electoral register without a rebuild.

## Tech stack

- **Framework:** Next.js 16 (App Router, Server Components, Server Actions), React 19, TypeScript
- **Styling/UI:** Tailwind CSS v4, shadcn/ui (Radix primitives), Lucide icons
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** Auth.js (NextAuth v5) — email/password credentials, JWT sessions, role + constituency scope embedded in the session
- **Forms/validation:** React Hook Form + Zod
- **Charts:** Recharts

## What's built (Phase 1)

Per the project's phased build plan, this first pass delivers the
foundation-priority slice end to end, with real data flowing through every
screen (nothing is a hard-coded mock):

- Authentication, sessions, and constituency-scoped role-based access
- Branded, responsive app shell (desktop sidebar, tablet-collapsible, mobile drawer) covering every module in the navigation spec
- **Campaign HQ** dashboard — election cycle / constituency / polling-division / date-range filters, 14 KPI cards with period-over-period deltas, electorate breakdown charts, ranked constituency & polling-division tables, all with working drill-down
- **Voter Roll** — server-side paginated/filtered register table, data-completeness KPIs, CSV export
- **Voter Desk** — universal debounced search (name/phone/voter ID/email) with geography narrowing
- **Voter 360** — full profile with Known/Estimated/Unknown provenance on every soft field, and tabs for interactions, issues, household, communication preferences, and audit history
- **Query Centre** — no-code AND/OR query builder across 9 field categories, plain-English generated filter logic, saved queries, saved segments, CSV export
- **Constituency & Polling Division dashboards** — full drill-down chain from national → constituency → polling division → underlying records
- **Audit Log** — immutable, filterable record of every export/save action, restricted to Administrator / Data Protection Lead
- Every other module in the spec (Campaign Workflow, Finance, Field & Polling, Election Readiness, Automation, Agent Workspace, etc.) has a real route and a clearly labeled "coming in a later phase" placeholder — the full Prisma schema already models their data, so building them out is additive, not a rebuild.

See the master build prompt's phase list for what's intentionally deferred
(Phases 2–8): field operations UI, campaign workflow boards, finance CRUD
screens, election-day operations, automation rules engine, and the governed
AI assistant.

## Prerequisites

- Node.js 20+
- A running PostgreSQL 14+ instance

## Getting started

```bash
npm install

# Copy and edit environment variables
cp .env.example .env
# Set DATABASE_URL to your Postgres instance and AUTH_SECRET to a random string
# (generate one with: openssl rand -base64 32)

# Create the schema
npx prisma migrate dev

# Seed realistic Grenada demo data (15 constituencies, 134 polling divisions,
# 92,573-elector register benchmark, 4,000 detailed voter records, and more)
npm run db:seed

# Start the dev server
npm run dev
```

Visit http://localhost:3000/login. Demo accounts (password for all:
`NdcDemo2026!`):

| Role | Email |
|---|---|
| Administrator | admin@ndcvrm.gd |
| Campaign Manager | campaign.manager@ndcvrm.gd |
| Candidate | candidate@ndcvrm.gd |
| Data Lead | data.lead@ndcvrm.gd |
| Communications Lead | comms.lead@ndcvrm.gd |
| Finance Lead | finance.lead@ndcvrm.gd |
| Data Protection Lead | dpo@ndcvrm.gd |
| Field Coordinator (Town of St. George area) | field.coordinator@ndcvrm.gd |
| Organiser (per constituency) | organiser.\<code\>@ndcvrm.gd — e.g. `organiser.tsg@ndcvrm.gd` |
| Canvasser (per constituency) | canvasser.\<code\>@ndcvrm.gd — e.g. `canvasser.tsg@ndcvrm.gd` |

Organiser, Canvasser, and Field Coordinator accounts are constituency-scoped
— logging in as one restricts the entire app (dashboard, Voter Roll, Query
Centre, drill-downs) to their assigned constituency automatically.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build (runs the TypeScript check) |
| `npm run start` | Start the production server |
| `npm run lint` | ESLint |
| `npm run db:seed` | Reset and reseed the database with demo data |
| `npm run db:migrate` | Run Prisma migrations in dev mode |
| `npm run db:studio` | Open Prisma Studio |

## Project structure

```
prisma/
  schema.prisma        Full data model (identity, geography, voter register,
                        field ops, issues, campaign workflow, finance,
                        relationships/risk, automation, audit, election day,
                        query/segment/provenance tables)
  seed.ts               Deterministic demo-data generator
  seed-data/             Grenada constituency/village/name reference data
src/
  app/(app)/            Authenticated app shell + every module route
  app/login/             Sign-in
  app/api/               Route handlers (NextAuth, CSV export)
  components/            UI: shadcn primitives + feature components by module
  lib/
    queries/             Server-side data-fetching (Prisma), scope-aware
    actions/              Server actions (mutations), audited
    query-centre/          No-code query field registry + resolver
    permissions.ts         Role → module access, constituency scope resolution
    audit.ts                Audit log writer
    roles.ts                Canonical role definitions (shared with the seed)
```

## Data model notes

- **Known / Estimated / Unknown provenance**: every soft demographic field
  on `Voter` (sex, age band, occupation, phone, email) carries a paired
  `*Source` enum. The UI never presents estimated data as verified —
  `DataQualityBadge` renders the distinction everywhere the field appears,
  with an explanatory tooltip.
- **Constituency-scoped access**: `UserConstituencyAccess` join rows define
  which constituencies a non-national role can see. National roles
  (Administrator, Campaign Manager, Candidate, Data Lead, Communications
  Lead, Finance Lead, Data Protection Lead) are unrestricted; Field
  Coordinator / Organiser / Canvasser are scoped. `resolveConstituencyScope`
  is the single choke point every query goes through.
- **Swapping in the real electoral register**: the seed script generates
  4,000 detailed `Voter` rows (a performant working set) while
  `PollingDivision.registeredElectors` carries the full 92,573-elector
  official benchmark. To load the real register, replace `prisma/seed.ts`
  with an importer that maps your source file onto the same `Voter` /
  `Constituency` / `PollingDivision` shape — no application code changes
  needed.
- **Audit log**: every export and Query Centre save writes an immutable
  `AuditLog` row (user, action, record type/id, module, before/after JSON).
  Extend `writeAuditLog` calls as further mutation screens are built.

## Deployment

This app expects a standard Node.js hosting environment with a reachable
PostgreSQL database and `DATABASE_URL` / `AUTH_SECRET` set. Run
`npx prisma migrate deploy` against the production database before first
boot; `npm run build && npm run start` serves the app.
