# IT Helpdesk — replit.md

## Overview

IT Helpdesk is a full-stack internal IT support and asset management system. It allows company staff to submit and track support tickets, while IT admins and analysts manage a structured inventory of technological equipment (computers, monitors, networking gear, phones, tablets, licenses, SIM cards, etc.).

Key functional areas:
- **Ticket management**: Create, assign, resolve, and close support tickets with evidence uploads
- **Asset/inventory management**: Register and track IT assets with technical specs, licenses, and movement history
- **User management**: Role-based access control (`usuario`, `analista`, `admin`)
- **PWA support**: Installable progressive web app with a service worker and offline fallback

---

## User Preferences

Preferred communication style: Simple, everyday language.

---

## System Architecture

### Frontend
- **Framework**: React (with Vite as the build tool and dev server)
- **Routing**: `wouter` (lightweight client-side routing)
- **State/Data fetching**: TanStack Query v5 for server state, cache, and mutations
- **UI components**: shadcn/ui (New York style) built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming; dark-mode-first design using a deep navy palette
- **Fonts**: Plus Jakarta Sans (body) and Outfit (display/headings) from Google Fonts
- **Charts**: Recharts (used in inventory dashboard)
- **Forms**: react-hook-form with `@hookform/resolvers` and Zod for validation
- **PWA**: Service worker (`sw.js`) with network-first for API, cache-first for static assets; `manifest.json` for installability
- **Path aliases**:
  - `@/` → `client/src/`
  - `@shared/` → `shared/`
  - `@assets/` → `attached_assets/`

### Backend
- **Runtime**: Node.js with Express (TypeScript, ESM modules)
- **Entry point**: `server/index.ts`; routes split between `server/routes.ts` (tickets, inventory, users, uploads) and `server/routes_assets.ts` (asset module)
- **Session handling**: `express-session` with `connect-pg-simple` for PostgreSQL-backed session persistence (table: `sessions`)
- **Auth strategy**: Passport.js with `passport-local`; passwords hashed with `scrypt` + random salt. Also has Replit OIDC integration scaffolded in `server/replit_integrations/auth/` (OpenID Connect via `openid-client`)
- **File uploads**: `multer` storing files to `client/public/uploads/`, 5 MB limit
- **Build**: Custom `script/build.ts` runs Vite for the client and esbuild for the server (bundling an allowlisted set of server deps for fast cold starts)

### Shared Layer
- `shared/schema.ts`: Core tables — `tickets`, `inventory`, constants (ZONES, CATEGORIES, TICKET_STATUS, etc.)
- `shared/schema_assets.ts`: Asset module tables — `asset_categories`, `assets`, `asset_specs`, `asset_licenses`, `asset_movements`
- `shared/models/auth.ts`: `users` and `sessions` tables
- `shared/routes.ts`: Typed API route registry (method, path, Zod input/response schemas) consumed by both client hooks and server handlers

### Database
- **Database**: PostgreSQL (via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM (`drizzle-orm/node-postgres`), using `pg` Pool
- **Schema management**: Drizzle Kit (`drizzle-kit push` / migrations in `./migrations/`)
- **Schemas included in drizzle config**: `shared/schema.ts`, `shared/models/auth.ts`, `shared/schema_assets.ts`

### Role-Based Access Control
Three roles enforced server-side on every sensitive route:
| Role | Capabilities |
|---|---|
| `usuario` | Create/view own tickets only |
| `analista` | View all tickets, assign/resolve, view inventory |
| `admin` | Full access including user management, asset CRUD, category management |

### Data Model Summary
- **tickets**: Support requests with status lifecycle (`abierto → asignado → resuelto → cerrado`), damage/solution evidence URLs, resolution notes
- **inventory** (legacy): Simple device registry with JSON support history
- **assets** (new module): Rich equipment registry tied to `asset_categories`, with separate `asset_specs` (technical details), `asset_licenses`, and `asset_movements` tables
- **users**: UUID primary key, username/password auth, role field, optional profile image
- **sessions**: Server-side session store in Postgres

---

## External Dependencies

| Dependency | Purpose |
|---|---|
| PostgreSQL | Primary relational database (requires `DATABASE_URL` env var) |
| `connect-pg-simple` | PostgreSQL-backed Express session store |
| `passport` / `passport-local` | Local username/password authentication |
| `openid-client` (Replit OIDC) | Replit Auth integration (scaffolded, parallel to local auth) |
| `drizzle-orm` + `drizzle-kit` | ORM and schema migration tooling |
| `multer` | Multipart file upload handling |
| `express-session` | HTTP session middleware |
| `@tanstack/react-query` | Client-side server state management |
| `recharts` | Charts in inventory dashboard |
| `wouter` | Lightweight React router |
| shadcn/ui + Radix UI | Accessible, unstyled component primitives |
| Tailwind CSS | Utility-first CSS framework |
| `date-fns` | Date formatting (Spanish locale used throughout) |
| `zod` / `drizzle-zod` | Schema validation (shared between client and server) |
| Google Fonts | Plus Jakarta Sans and Outfit typefaces |
| Vite + `@vitejs/plugin-react` | Frontend build and dev server |
| `esbuild` | Server bundle for production |
| `@replit/vite-plugin-runtime-error-modal` | Dev-time error overlay (Replit) |
| `@replit/vite-plugin-cartographer` | Replit dev tooling (dev only) |
| `SESSION_SECRET` env var | Required for secure session signing |
| `DATABASE_URL` env var | Required for database connection |