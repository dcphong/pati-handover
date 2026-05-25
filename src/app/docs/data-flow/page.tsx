import {
  Activity,
  ArrowRight,
  Bell,
  BookOpen,
  Cable,
  CalendarClock,
  Code2,
  Database,
  DollarSign,
  FileSpreadsheet,
  Globe,
  Mail,
  Megaphone,
  Repeat,
  Shield,
  ShoppingBag,
  Truck,
  Users,
  Webhook,
} from "lucide-react";
import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { FlowNode, FlowRow, TerminalInline } from "@/components/docs/visuals";

export const metadata = { title: "Data Flow — PATI Handover" };

type Trigger = "cron" | "webhook" | "manual" | "incremental";

const triggerStyle: Record<Trigger, { label: string; bg: string }> = {
  cron: { label: "Cron", bg: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/40" },
  webhook: { label: "Webhook", bg: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40" },
  manual: { label: "Manual", bg: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/40" },
  incremental: { label: "On-demand", bg: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/40" },
};

type Ingest = {
  source: string;
  icon: React.ComponentType<{ className?: string }>;
  trigger: Trigger;
  triggerDetail: string;
  worker: string;
  target: string;
};

const ingests: Ingest[] = [
  {
    source: "Shopify orders (Python)",
    icon: ShoppingBag,
    trigger: "cron",
    triggerDetail: "Mac mini 2× ngày — date-window",
    worker: "sync/run.py",
    target: "shopify_orders",
  },
  {
    source: "Shopify orders (TS)",
    icon: ShoppingBag,
    trigger: "incremental",
    triggerDetail: "updated_at cursor",
    worker: "/api/analytics/sync/shopify",
    target: "raw_orders",
  },
  {
    source: "Shopify refunds",
    icon: ShoppingBag,
    trigger: "webhook",
    triggerDetail: "+ nightly backfill",
    worker: "/api/webhooks/shopify/refunds",
    target: "raw_refunds",
  },
  {
    source: "Shopify products",
    icon: ShoppingBag,
    trigger: "cron",
    triggerDetail: "Daily",
    worker: "scripts/shopify-products-sync.py",
    target: "raw_variants",
  },
  {
    source: "Shopify Payments Balance",
    icon: DollarSign,
    trigger: "cron",
    triggerDetail: "Daily",
    worker: "shopify_payments_balance_daily.yml",
    target: "shopify_payments_balance",
  },
  {
    source: "Flexport NS3",
    icon: Truck,
    trigger: "cron",
    triggerDetail: "2× ngày (Mac mini)",
    worker: "POST /products/warehouse",
    target: "flexport_stock",
  },
  {
    source: "Lark Base COGS",
    icon: Cable,
    trigger: "cron",
    triggerDetail: "Daily + manual",
    worker: "lark_pusher + cogs-full-catalog script",
    target: "cogs_full_catalog",
  },
  {
    source: "Lark Best shipping rates",
    icon: FileSpreadsheet,
    trigger: "manual",
    triggerDetail: "CSV import",
    worker: "scripts/import-best-shipping-rates.py",
    target: "bestfulfill_shipping_rates",
  },
  {
    source: "Lark Mail",
    icon: Mail,
    trigger: "cron",
    triggerDetail: "2× ngày",
    worker: "lark_mail_sync.yml",
    target: "lark_mail_messages",
  },
  {
    source: "PayPal txns",
    icon: DollarSign,
    trigger: "cron",
    triggerDetail: "Daily",
    worker: "/api/analytics/sync/paypal",
    target: "raw_ad_spend (paypal_fees)",
  },
  {
    source: "Recharge",
    icon: Repeat,
    trigger: "cron",
    triggerDetail: "Daily",
    worker: "/api/analytics/sync/recharge",
    target: "raw_subscriptions / raw_orders",
  },
  {
    source: "Meta Ads",
    icon: Megaphone,
    trigger: "cron",
    triggerDetail: "Hourly",
    worker: "meta_ads_hourly.yml",
    target: "raw_ad_spend (meta)",
  },
  {
    source: "Google Ads",
    icon: Megaphone,
    trigger: "cron",
    triggerDetail: "Daily",
    worker: "analytics_providers_daily.yml",
    target: "raw_ad_spend (google)",
  },
  {
    source: "Klaviyo",
    icon: Bell,
    trigger: "cron",
    triggerDetail: "Daily",
    worker: "analytics_providers_daily.yml",
    target: "raw_events_klaviyo",
  },
  {
    source: "ChargeFlow disputes",
    icon: Shield,
    trigger: "cron",
    triggerDetail: "Every 5 min — Mac mini Chrome CDP",
    worker: "/api/cron/chargeflow-sync-ui",
    target: "chargeflow_disputes",
  },
];

const matviews = [
  { name: "v_stvf", purpose: "Single-Table View Function — TW parity base" },
  { name: "mv_summary_daily", purpose: "Daily aggregates per shop" },
  { name: "mv_north_stars_processing", purpose: "NS1 — order → fulfillment hours" },
  { name: "mv_north_stars_otif", purpose: "NS2 — On-Time-In-Full" },
  { name: "mv_north_stars_stock", purpose: "NS3 — stock cover days" },
];

const rpcs = [
  {
    name: "summary_metrics(...)",
    caller: "Analytics dashboard summary cards",
    returns: "TW-parity metric struct",
  },
  {
    name: "upsert_ad_spend_batch(...)",
    caller: "analytics-sync-handlers.ts",
    returns: "Bulk upsert (PostgREST cache fallback)",
  },
  {
    name: "cs_dashboard_aggregate(...)",
    caller: "/api/cs-dashboard",
    returns: "CS daily counters",
  },
];

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Architecture"
        title="Data Flow"
        description="15 nguồn data đi vào Supabase. Mỗi nguồn có 1 trigger + 1 worker + 1 target table. Đọc hết là biết data ở đâu ra."
      />

      <h2 id="ingest">15 ingest path — từ ngoài vào Supabase</h2>
      <div className="not-prose my-6 rounded-xl border bg-card overflow-hidden">
        <div className="px-4 py-2 border-b bg-muted/30 text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
          Mỗi hàng = 1 nguồn data
        </div>
        {ingests.map((ing, i) => (
          <div
            key={i}
            className="px-4 py-3 grid grid-cols-12 gap-3 items-center border-t first:border-t-0"
          >
            <div className="col-span-12 sm:col-span-4 flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-md bg-muted grid place-items-center shrink-0">
                <ing.icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-[13px] leading-tight">
                  {ing.source}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {ing.triggerDetail}
                </div>
              </div>
            </div>
            <div className="col-span-12 sm:col-span-2">
              <span
                className={`text-[10px] uppercase tracking-wider font-semibold rounded border px-1.5 py-0.5 ${triggerStyle[ing.trigger].bg}`}
              >
                {triggerStyle[ing.trigger].label}
              </span>
            </div>
            <div className="col-span-12 sm:col-span-3 font-mono text-[11.5px] text-foreground/80 break-all">
              {ing.worker}
            </div>
            <div className="col-span-12 sm:col-span-3 flex items-center gap-1.5">
              <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0 hidden sm:block" />
              <code className="font-mono text-[11.5px] font-semibold text-pink-700 dark:text-pink-300 break-all">
                {ing.target}
              </code>
            </div>
          </div>
        ))}
      </div>

      <h2 id="two-shopify-pipelines">Đừng nhầm — 2 Shopify pipeline song song</h2>
      <p>
        Đây là 1 trong những điểm dễ nhầm. <strong>Cả 2 đang chạy đồng thời</strong>, mục đích khác nhau:
      </p>
      <div className="not-prose my-6 grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-500/[0.04] p-4">
          <div className="text-[10px] uppercase tracking-widest font-semibold text-emerald-700 dark:text-emerald-300 mb-1.5">
            Python / Mac mini
          </div>
          <code className="font-mono text-[12.5px] font-semibold block mb-2">/api/sync</code>
          <ul className="text-[13px] text-foreground/85 space-y-1.5 list-disc ml-4">
            <li>
              Worker: <code className="text-[12px]">sync/run.py</code>
            </li>
            <li>Mode: date-window (re-fetch full ranges)</li>
            <li>
              Writes:{" "}
              <code className="text-[12px] text-pink-700 dark:text-pink-300">
                shopify_orders
              </code>
            </li>
            <li>Lịch: Mac mini cron 2× ngày</li>
          </ul>
        </div>
        <div className="rounded-xl border-2 border-violet-500/40 bg-violet-500/[0.04] p-4">
          <div className="text-[10px] uppercase tracking-widest font-semibold text-violet-700 dark:text-violet-300 mb-1.5">
            TypeScript / Vercel
          </div>
          <code className="font-mono text-[12.5px] font-semibold block mb-2">
            /api/analytics/sync/shopify
          </code>
          <ul className="text-[13px] text-foreground/85 space-y-1.5 list-disc ml-4">
            <li>Worker: Vercel Function</li>
            <li>
              Mode: <code className="text-[12px]">updated_at</code> incremental cursor
            </li>
            <li>
              Writes:{" "}
              <code className="text-[12px] text-pink-700 dark:text-pink-300">raw_orders</code>
            </li>
            <li>Lịch: hourly / on-demand</li>
          </ul>
        </div>
      </div>
      <Callout variant="info" title="Source of truth">
        <strong>Shopify là SoT</strong> cho <TerminalInline>shopify_orders</TerminalInline>.
        Backfill TZ đã chạy 2026-05-07 — <strong>đừng re-run</strong>.{" "}
        <TerminalInline>raw_orders</TerminalInline> là analytics-shaped projection — có thể
        re-sync.
      </Callout>

      <h2 id="materialised-views">5 mat view chạy analytics</h2>
      <p>Tất cả scope theo <TerminalInline>shop_id</TerminalInline>:</p>
      <div className="not-prose my-5 grid sm:grid-cols-2 gap-3">
        {matviews.map((m) => (
          <div key={m.name} className="rounded-lg border bg-card p-3.5">
            <code className="font-mono text-[12.5px] font-semibold text-pink-700 dark:text-pink-300">
              {m.name}
            </code>
            <div className="text-[12.5px] text-muted-foreground mt-1 leading-5">
              {m.purpose}
            </div>
          </div>
        ))}
      </div>
      <CodeBlock language="sql" filename="refresh-matviews.sql">
{`-- Chạy nightly qua north_stars_daily.yml — KHÔNG cần manual
REFRESH MATERIALIZED VIEW CONCURRENTLY master_app.v_stvf;
REFRESH MATERIALIZED VIEW CONCURRENTLY master_app.mv_summary_daily;
REFRESH MATERIALIZED VIEW CONCURRENTLY master_app.mv_north_stars_processing;
REFRESH MATERIALIZED VIEW CONCURRENTLY master_app.mv_north_stars_otif;
REFRESH MATERIALIZED VIEW CONCURRENTLY master_app.mv_north_stars_stock;`}
      </CodeBlock>

      <h2 id="rpc">3 RPC quan trọng</h2>
      <div className="not-prose my-5 rounded-xl border bg-card overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-2 bg-muted/40 text-[11px] uppercase tracking-widest text-muted-foreground font-semibold border-b">
          <div className="col-span-4">RPC</div>
          <div className="col-span-4">Caller</div>
          <div className="col-span-4">Returns</div>
        </div>
        {rpcs.map((r, i) => (
          <div
            key={r.name}
            className={`grid grid-cols-12 gap-2 px-4 py-2.5 ${i > 0 ? "border-t" : ""}`}
          >
            <div className="col-span-12 sm:col-span-4">
              <code className="font-mono text-[12px] font-semibold text-pink-700 dark:text-pink-300 break-all">
                {r.name}
              </code>
            </div>
            <div className="col-span-12 sm:col-span-4 text-[12.5px] text-foreground/85">
              {r.caller}
            </div>
            <div className="col-span-12 sm:col-span-4 text-[12.5px] text-muted-foreground">
              {r.returns}
            </div>
          </div>
        ))}
      </div>

      <h2 id="read-path">Read path — dashboard nhìn data thế nào</h2>
      <p>Khi user mở dashboard, mỗi card trải qua chuỗi sau:</p>
      <div className="not-prose my-6 rounded-xl border bg-card p-4 sm:p-5">
        <FlowRow arrows="down">
          {[
            <FlowNode
              key="browser"
              icon={Globe}
              label="Browser"
              sub="user click date range"
              tone="sky"
            />,
            <FlowNode
              key="api"
              icon={Code2}
              label="Vercel Function"
              sub="GET /api/analytics/summary?from=…&to=…"
              tone="violet"
            />,
            <FlowNode
              key="rpc"
              icon={Activity}
              label="supabase.rpc()"
              sub='"summary_metrics", { from, to, shop_id }'
              tone="emerald"
            />,
            <FlowNode
              key="pg"
              icon={Database}
              label="PostgREST → Postgres"
              sub="CALL master_app.summary_metrics(…)"
              tone="pink"
            />,
            <FlowNode
              key="cache"
              icon={Users}
              label="React Query cache"
              sub="60s stale → SummaryCards"
              tone="orange"
            />,
          ]}
        </FlowRow>
        <div className="text-[11.5px] text-muted-foreground mt-3 leading-5">
          Mỗi card có thể cache 60s nên click qua lại không refetch. Đổi date range = invalidate
          query key.
        </div>
      </div>

      <h2 id="legend">Legend</h2>
      <div className="not-prose my-5 flex flex-wrap gap-2 text-[11px]">
        <LegendItem icon={Webhook} label="Webhook" />
        <LegendItem icon={CalendarClock} label="Cron" />
        <LegendItem icon={BookOpen} label="Manual import" />
        <LegendItem icon={Database} label="Postgres table" />
      </div>

      <PageNav href="/docs/data-flow" />
    </>
  );
}

function LegendItem({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 border rounded px-2 py-1 bg-card">
      <Icon className="h-3 w-3 text-muted-foreground" />
      {label}
    </span>
  );
}
