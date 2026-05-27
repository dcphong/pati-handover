import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { GlossaryBrowser } from "./glossary-browser";

export const metadata = { title: "Glossary — PATI Handover" };

const terms: { term: string; def: string }[] = [
  { term: "AOV", def: "Average Order Value." },
  { term: "Bitable", def: "Lark/Feishu's spreadsheet-database hybrid (Lark Base tables)." },
  { term: "Bulk Update", def: "Flask backend service xử lý mass fulfillment qua /api/bulk/* proxy." },
  { term: "CDP", def: "Chrome DevTools Protocol — Playwright/Puppeteer-style remote browser control. Used cho ChargeFlow sync." },
  { term: "ChargeFlow", def: "Third-party dispute management SaaS. Sync via Mac mini Chrome CDP." },
  { term: "Cloudflared", def: "Cloudflare Tunnel daemon. Exposes Mac mini web app, Supabase, and selected services without public IP." },
  { term: "Colima", def: "Container runtime (Docker VM) cho macOS. Replaces Docker Desktop on Mac mini." },
  { term: "COGS", def: "Cost of Goods Sold. PATI's authoritative source là Lark Base, không phải Shopify." },
  { term: "Custom App", def: "Shopify app installed per-store (one-tenant). Lark Integration is the main one." },
  { term: "EDC", def: "Second store onboarded (placeholder; not active production yet)." },
  { term: "FO", def: "Fulfillment Order. Shopify can split 1 order → N FOs across locations." },
  { term: "com.pati.web", def: "launchd LaunchAgent chạy Next.js production server trên Mac mini tại 127.0.0.1:3000." },
  { term: "Flexport", def: "Logistics partner. NS3 warehouse uses Flexport Logistics API." },
  { term: "CS Dashboard", def: "3-panel CS view tự host tại /cs-dashboard. Trước đây dùng Gorgias, đã thay thế." },
  { term: "Klaviyo", def: "Email/SMS marketing platform. Drives Email Sent / Click / Attributed cards." },
  { term: "Lark", def: "Feishu Singapore version. PATI's collaboration platform — Base, Mail, Bot, OAuth." },
  { term: "Mac mini", def: "M4/16GB at Phong's home. Hosts Next.js web, Supabase Docker, Chrome CDP, and cron jobs." },
  { term: "master_app", def: "Postgres schema where all PATI tables live (renamed from 'public' on 2026-05-14)." },
  { term: "Matview", def: "Materialised view. v_stvf, mv_summary_daily, etc. Refreshed nightly." },
  { term: "Mer", def: "Marketing Efficiency Ratio = Total Sales / Total Ad Spend." },
  { term: "Meta Ads", def: "Facebook + Instagram. Hourly sync via meta_ads_hourly.yml." },
  { term: "NCPA", def: "New Customer Profit / Acquisition. North-star revenue metric." },
  { term: "NS1 / NS2 / NS3", def: "North Stars: Processing time, OTIF (On-Time-In-Full), Stock Cover." },
  { term: "OAuth", def: "Shopify Public App OAuth (scaffolded but not yet live). Lark OAuth is live." },
  { term: "OTIF", def: "On-Time-In-Full. NS2." },
  { term: "Parity", def: "Card-by-card match between PATI dashboard và TripleWhale dashboard." },
  { term: "PATI", def: "Holding company. Multiple Shopify stores (WN, EDC, ...) under one org." },
  { term: "PostgREST", def: "Postgres → REST auto-API. Part of Supabase stack. Has schema cache lag (~6-15 min)." },
  { term: "RDP", def: "Remote Desktop Protocol. KHÔNG dùng ở đây — đọc Chrome DevTools Protocol (CDP)." },
  { term: "Recharge", def: "Subscription billing SaaS for Shopify. Authoritative source for subscription metrics." },
  { term: "RLS", def: "Postgres Row-Level Security. Self-host tables có RLS=ON, không policies = anon returns []." },
  { term: "RPC", def: "Postgres function callable via PostgREST hoặc supabase-js .rpc(). Returns JSON." },
  { term: "Schema", def: "Postgres namespace. master_app vs public." },
  { term: "Service-role key", def: "Supabase JWT bypass RLS. Server-only — never expose client-side." },
  { term: "shop_id", def: "myshopify.com domain dùng làm primary multi-store discriminator." },
  { term: "Sidecar", def: "Sidekick term cho auxiliary process (ví dụ Flask bulk-update server next to Next.js)." },
  { term: "SoT", def: "Source of Truth. Shopify = SoT for orders. Lark = SoT for COGS." },
  { term: "Supabase", def: "Self-hosted Postgres + REST + Auth + Realtime + Storage stack on Mac mini." },
  { term: "Tailscale", def: "Mesh VPN. Dùng cho SSH riêng tư + WireGuard private IPs (100.94.x.x)." },
  { term: "TimCook", def: "Mac mini SSH username (joke). Có admin sudo." },
  { term: "TripleWhale (TW)", def: "Legacy P&L SaaS. PATI lấy số trực tiếp từ provider (first-party SoT); TW chỉ là sanity reference, không phải target." },
  { term: "VNH", def: "Vương Nguyên Hảo — đối tác fulfillment chính (3PL warehouse network)." },
  { term: "v_stvf", def: "Single-Table View Function. Core matview cho summary cards (raw_orders → aggregates, không phải để khớp TW)." },
  { term: "WN", def: "WellnessNest — primary store. Domain: e49d78-3.myshopify.com." },
];

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Reference"
        title="Glossary"
        description="Vocab & acronyms PATI dùng. Search dưới để tra nhanh."
      />

      <GlossaryBrowser terms={terms} />

      <PageNav href="/docs/glossary" />
    </>
  );
}
