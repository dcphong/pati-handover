# PATI Handover

Handover documentation for the [`pati-master-app`](https://github.com/dev-pati/pati-master-app) platform at PATI Group.

Framework-style docs site covering:

- Local setup, env vars, Supabase connection
- Architecture, tech stack, data flow, database schema
- Deployment: Vercel, cron jobs, Mac mini self-host, Cloudflared tunnel
- Every feature: Shopify sync, Lark Base, Analytics (TW parity), Multi-store, IAM, COGS, ChargeFlow, CS Dashboard, Best Fulfillment, VNH/NS3, Bulk Update
- API routes catalog
- Python workers reference
- Troubleshooting guide
- Glossary

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- shadcn/ui
- Bun

## Run locally

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
bun run build
```

## Deploy

Linked to Vercel. Pushes to `main` deploy automatically.

```bash
vercel --prod --yes
```

---

Written by Phong before leaving PATI (2026-05-24). Maintained by the team after.
