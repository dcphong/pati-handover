import {
  Cable,
  Database,
  DollarSign,
  Headphones,
  Package,
  Shield,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";
import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { Terminal, TerminalInline } from "@/components/docs/visuals";

export const metadata = { title: "Database Schema — PATI Handover" };

type TableDef = {
  name: string;
  purpose: string;
  cols?: string;
  flag?: "sot" | "auth" | "audit";
};

type Group = {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "sky" | "emerald" | "pink" | "violet" | "amber" | "orange";
  tables: TableDef[];
};

const groups: Group[] = [
  {
    title: "Orders & Fulfillment",
    icon: ShoppingBag,
    tone: "emerald",
    tables: [
      {
        name: "shopify_orders",
        purpose: "Source-of-truth cho orders",
        cols: "id, name, shop_id, financial_status, fulfillment_status, total_price, currency, created_at_local, processed_at, variant_sku",
        flag: "sot",
      },
      {
        name: "shopify_fulfillment_orders",
        purpose: "Tracking per-FO",
        cols: "id, order_id, location_id, status (UNSUBMITTED, SUBMITTED, …)",
      },
      {
        name: "shopify_tracking",
        purpose: "Tracking numbers",
        cols: "order_id, tracking_number, tracking_company, carrier, shop_id",
      },
      {
        name: "chargeflow_disputes",
        purpose: "Dispute pipeline (ChargeFlow CDP sync)",
        cols: "shopify_order_id, status, reason, evidence_uploaded_at",
      },
    ],
  },
  {
    title: "Analytics base",
    icon: Database,
    tone: "pink",
    tables: [
      {
        name: "raw_orders",
        purpose: "Analytics-shaped projection của Shopify orders",
      },
      {
        name: "raw_refunds",
        purpose: "Refunds với line-item subtotal + transaction amount",
      },
      {
        name: "raw_ad_spend",
        purpose: "Daily spend per provider (meta / google / paypal_fees / klaviyo / …)",
      },
      {
        name: "raw_variants",
        purpose: "Shopify variant catalog (cost từ Shopify Admin — KHÔNG dùng cho COGS)",
      },
      {
        name: "raw_subscriptions",
        purpose: "Recharge subscriptions snapshot",
      },
      {
        name: "raw_events_klaviyo",
        purpose: "Klaviyo events (sent, opened, clicked, attributed)",
      },
      {
        name: "shopify_payments_balance",
        purpose: "Daily payouts + fees",
      },
      {
        name: "cogs_full_catalog",
        purpose: "Lark per-PO COGS",
        flag: "sot",
      },
      {
        name: "bestfulfill_shipping_rates",
        purpose: "Best fulfillment rate card",
      },
    ],
  },
  {
    title: "Views & matviews",
    icon: Star,
    tone: "violet",
    tables: [
      { name: "v_stvf", purpose: "Single-table-view-function — drives TW parity" },
      { name: "mv_summary_daily", purpose: "Daily aggregates per shop" },
      { name: "mv_north_stars_processing", purpose: "NS1 — order → fulfillment hours" },
      { name: "mv_north_stars_otif", purpose: "NS2 — On-Time-In-Full" },
      { name: "mv_north_stars_stock", purpose: "NS3 — stock cover days" },
      { name: "v_cs_dashboard", purpose: "CS daily aggregate view" },
    ],
  },
  {
    title: "IAM (AWS-style)",
    icon: Shield,
    tone: "amber",
    tables: [
      { name: "users", purpose: "Login accounts", cols: "email, password_hash, role", flag: "auth" },
      { name: "roles", purpose: "Legacy roles (Admin, Operations, CS, Analytics)" },
      { name: "permissions", purpose: "Legacy permission strings" },
      { name: "iam_actions", purpose: "75-action AWS-style catalog (service:Action)" },
      { name: "iam_policies", purpose: "9 managed policies (JSON document)" },
      { name: "iam_user_policies", purpose: "User ↔ policy attachment" },
      { name: "iam_audit_log", purpose: "Every permission change recorded", flag: "audit" },
    ],
  },
  {
    title: "CS Dashboard",
    icon: Headphones,
    tone: "sky",
    tables: [
      {
        name: "customer_profiles",
        purpose: "CS note + customer_type tag (1 row / customer)",
      },
      { name: "lark_mail_messages", purpose: "Lark Mail synced messages" },
      { name: "lark_mail_threads", purpose: "Thread aggregation" },
    ],
  },
  {
    title: "Sync metadata",
    icon: Cable,
    tone: "orange",
    tables: [
      {
        name: "sync_logs",
        purpose: "Mọi pipeline ghi vào — debug đầu tiên xem cái này",
      },
      {
        name: "custom_table_sync_credentials",
        purpose: "Fernet-encrypted credentials cho custom-table sync",
      },
      { name: "shopify_stores", purpose: "Multi-store registry — id, domain, timezone, default" },
    ],
  },
];

const toneRing: Record<Group["tone"], string> = {
  sky: "border-sky-500/30",
  emerald: "border-emerald-500/30",
  pink: "border-pink-500/30",
  violet: "border-violet-500/30",
  amber: "border-amber-500/30",
  orange: "border-orange-500/30",
};
const toneText: Record<Group["tone"], string> = {
  sky: "text-sky-700 dark:text-sky-300",
  emerald: "text-emerald-700 dark:text-emerald-300",
  pink: "text-pink-700 dark:text-pink-300",
  violet: "text-violet-700 dark:text-violet-300",
  amber: "text-amber-700 dark:text-amber-300",
  orange: "text-orange-700 dark:text-orange-300",
};
const toneBg: Record<Group["tone"], string> = {
  sky: "bg-sky-500/[0.04]",
  emerald: "bg-emerald-500/[0.04]",
  pink: "bg-pink-500/[0.04]",
  violet: "bg-violet-500/[0.04]",
  amber: "bg-amber-500/[0.04]",
  orange: "bg-orange-500/[0.04]",
};

const flagLabel = {
  sot: "Source of Truth",
  auth: "Auth",
  audit: "Audit",
} as const;
const flagStyle = {
  sot: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40",
  auth: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/40",
  audit: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40",
} as const;

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Architecture"
        title="Database Schema"
        description="Schema master_app — tables, views, matview, RPC. Catalog scannable theo cluster."
      />

      <Callout variant="info" title="Schema = master_app">
        Mọi production table sống trong <TerminalInline>master_app</TerminalInline>. Schema{" "}
        <TerminalInline>public</TerminalInline> chỉ là placeholder empty. Migration files
        trong <TerminalInline>supabase/migrations/</TerminalInline> phải prefix bằng schema.
      </Callout>

      <h2 id="catalog">Catalog — phân theo cluster</h2>
      {groups.map((g) => (
        <section key={g.title} className={`not-prose my-6 rounded-xl border-2 ${toneRing[g.tone]} ${toneBg[g.tone]} overflow-hidden`}>
          <div className="px-4 py-3 border-b bg-card/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <g.icon className={`h-4 w-4 ${toneText[g.tone]}`} />
              <div className={`font-semibold text-[14.5px] ${toneText[g.tone]}`}>
                {g.title}
              </div>
            </div>
            <div className="text-[11px] text-muted-foreground font-mono">
              {g.tables.length} {g.tables.length === 1 ? "table" : "tables"}
            </div>
          </div>
          <div>
            {g.tables.map((t, i) => (
              <div
                key={t.name}
                className={`px-4 py-3 ${i > 0 ? "border-t" : ""} bg-card/40`}
              >
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <code className="font-mono text-[12.5px] font-semibold text-pink-700 dark:text-pink-300">
                    {t.name}
                  </code>
                  {t.flag && (
                    <span
                      className={`text-[10px] uppercase tracking-wider font-semibold rounded border px-1.5 py-0.5 ${flagStyle[t.flag]}`}
                    >
                      {flagLabel[t.flag]}
                    </span>
                  )}
                </div>
                <div className="text-[13px] text-foreground/85 leading-6">{t.purpose}</div>
                {t.cols && (
                  <div className="mt-1.5 font-mono text-[11.5px] text-muted-foreground break-all">
                    Key cols: {t.cols}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      <h2 id="multistore">Multi-store shop_id column (Phase 3)</h2>
      <p>
        Phase 3 (2026-05-16) thêm <TerminalInline>shop_id</TerminalInline> vào hầu hết tables:{" "}
        <TerminalInline>shopify_orders</TerminalInline>,{" "}
        <TerminalInline>shopify_tracking</TerminalInline>,{" "}
        <TerminalInline>chargeflow_disputes</TerminalInline>,{" "}
        <TerminalInline>stock_cover</TerminalInline>, và 5 matviews.
      </p>
      <Terminal
        host="postgres"
        cwd="psql"
        title="DEFAULT là safety net cho legacy writers — đừng remove Phase 4 chưa land"
        lines={[
          { prompt: "psql>", cmd: "ALTER TABLE master_app.shopify_orders" },
          { prompt: "", cmd: "  ADD COLUMN shop_id TEXT NOT NULL" },
          { prompt: "", cmd: "  DEFAULT 'e49d78-3.myshopify.com';" },
        ]}
      />

      <Callout variant="warning" title="Blank SKU sentinel">
        Khi Shopify line item không có SKU, app set{" "}
        <TerminalInline>variant_sku = &apos;__no_sku__:&#123;line_item_id&#125;&apos;</TerminalInline>{" "}
        để giữ uniqueness. Query real SKUs phải filter{" "}
        <TerminalInline>WHERE variant_sku NOT LIKE &apos;__no_sku__:%&apos;</TerminalInline>.
      </Callout>

      <h2 id="conventions">Conventions</h2>
      <div className="not-prose my-5 grid sm:grid-cols-2 gap-3">
        <ConventionCard
          icon={Database}
          title="Timestamps"
          body={
            <>
              Lưu UTC. Bucketing dùng <TerminalInline>created_at_local</TerminalInline> theo
              shop timezone (Asia/Ho_Chi_Minh cho WN).
            </>
          }
        />
        <ConventionCard
          icon={DollarSign}
          title="Money columns"
          body={
            <>
              <TerminalInline>float8</TerminalInline> (chấp nhận 0.5% drift).{" "}
              <TerminalInline>cents</TerminalInline> columns dùng{" "}
              <TerminalInline>bigint</TerminalInline>.
            </>
          }
        />
        <ConventionCard
          icon={Package}
          title="RPC return shape"
          body="JSON cho TW-parity-style cards. summary_metrics returns array of metric objects."
        />
        <ConventionCard
          icon={Truck}
          title="Soft delete"
          body={
            <>
              Cột <TerminalInline>deleted_at TIMESTAMPTZ</TerminalInline>. Hard delete chỉ cho
              audit log + sync_logs cũ.
            </>
          }
        />
      </div>

      <PageNav href="/docs/database" />
    </>
  );
}

function ConventionCard({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card p-3.5">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="h-3.5 w-3.5 text-foreground/70" />
        <div className="font-semibold text-[14px]">{title}</div>
      </div>
      <div className="text-[12.5px] text-muted-foreground leading-5">{body}</div>
    </div>
  );
}
