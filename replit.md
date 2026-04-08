# Serrat - Gestao Inteligente

A management system for cleaning and maintenance service orders (Work Orders), specifically focused on the sanitization of cabins (restrooms) in port terminals.

## Architecture

This is a **pnpm monorepo** with the following packages:

- `web/` — React 19 + TypeScript + Vite frontend (admin/manager dashboard)
- `mobile/` — Expo React Native app (operator QR scanner app)
- `shared/` — Common TypeScript types and constants

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Radix UI, TanStack Query, React Router DOM v7
- **Backend/Database:** Supabase (PostgreSQL, Auth, Realtime, RLS)
- **Build Tool:** Vite (web), Expo/Metro (mobile)
- **Package Manager:** pnpm with workspaces

## Environment Variables

The web app requires these environment variables (see `.env.example`):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_NAME=Serrat
```

## Development

- **Start web dev server:** `pnpm --filter web dev` (runs on port 5000)
- **Build:** `pnpm build`

## Deployment

- Deployment type: **static** (SPA connecting to Supabase)
- Build command: `pnpm build`
- Public directory: `web/dist`

## Key Features

- Multi-tenant architecture with `company_id`
- Role-based access: `admin`, `gestor` (manager), `operador` (operator)
- QR Code scanning for registering cleaning service events
- SLA monitoring and alerting
- Real-time dashboard with charts and metrics
- Geolocated work orders
