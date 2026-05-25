import {
  ArrowRight,
  BarChart3,
  Boxes,
  Code2,
  Cog,
  Database,
  Headphones,
  ShoppingBag,
  Truck,
  UserCog,
  Workflow,
} from "lucide-react";
import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { FlowNode, FlowRow, TerminalInline } from "@/components/docs/visuals";

export const metadata = { title: "Project Overview — PATI Handover" };

const personas = [
  {
    icon: Truck,
    role: "Operations",
    uses: "Bulk fulfillment, COGS catalog, VNH/NS3 routing, shipping rate cards",
  },
  {
    icon: Headphones,
    role: "Customer Service",
    uses: "CS Dashboard (Gorgias 3-panel), Lark Mail reconcile, customer notes",
  },
  {
    icon: BarChart3,
    role: "Analytics / Finance",
    uses: "TripleWhale parity P&L, North Stars (Processing / OTIF / Stock Cover)",
  },
  {
    icon: UserCog,
    role: "Engineering",
    uses: "IAM, cron health, schema migrations, troubleshooting",
  },
];

const flows = [
  {
    title: "Shopify Order Sync → Supabase",
    desc: "pipeline.py fetch paginated, batch upsert.",
    chain: ["run", "pipeline.py", "_batch_upsert"],
  },
  {
    title: "Flexport Report Sync → Supabase",
    desc: "Flexport Logistics API (REST) — 2× ngày.",
    chain: ["main", "report_sync.pipeline", "_batch_upsert"],
  },
  {
    title: "Custom Table Sync",
    desc: "Lark Base bitable + Excel/CSV + Playwright path.",
    chain: ["sync_custom_table", "via_api / via_playwright", "upsert"],
  },
  {
    title: "Shopify Order Fulfillment",
    desc: "bulk-update Flask server (input Lark/Excel).",
    chain: ["run_fulfill", "shopify_fulfiller", "_shopify_request"],
  },
  {
    title: "Analytics ETL",
    desc: "raw_orders / raw_refunds / raw_ad_spend → v_stvf → summary_metrics RPC.",
    chain: ["provider sync", "raw_*", "v_stvf", "summary_metrics"],
  },
];

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Getting Started"
        title="Project Overview"
        description="Cái gì là shopify-lark-sync, ai dùng, các phần ráp với nhau ra sao."
      />

      <h2 id="what-it-is">Sản phẩm là gì</h2>
      <p>
        <strong>shopify-lark-sync</strong> là full-stack operations dashboard cho PATI Group. Nó
        đồng bộ data giữa <strong>Shopify · Lark (Feishu) Base · Flexport</strong> và các
        analytics provider (Meta / Google / Klaviyo / Recharge / PayPal), lưu vào{" "}
        <strong>Supabase Postgres</strong> self-host trên Mac mini ở nhà.
      </p>
      <p>
        UI là dashboard Next.js (
        <a href="https://pnl.patigroup.com" target="_blank" rel="noreferrer">
          pnl.patigroup.com
        </a>
        ) phục vụ team Operations / CS / Analytics. Sync workers Python chạy trên cron để pull
        data từ external và push vào Supabase.
      </p>

      <h2 id="who-uses-it">Ai dùng dashboard</h2>
      <div className="not-prose my-5 grid sm:grid-cols-2 gap-3">
        {personas.map((p) => (
          <div key={p.role} className="rounded-lg border bg-card p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="h-7 w-7 rounded-md bg-muted grid place-items-center">
                <p.icon className="h-3.5 w-3.5" />
              </div>
              <div className="font-semibold text-[14px]">{p.role}</div>
            </div>
            <div className="text-[12.5px] text-muted-foreground leading-5">{p.uses}</div>
          </div>
        ))}
      </div>

      <h2 id="two-layers">2 layer — split rạch ròi theo runtime</h2>
      <div className="not-prose my-6 grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl border-2 border-violet-500/40 bg-violet-500/[0.04] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Code2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            <div className="text-[11px] uppercase tracking-widest font-semibold text-violet-700 dark:text-violet-300">
              Layer 1 — Web dashboard
            </div>
          </div>
          <div className="space-y-1 text-[13px] leading-6">
            <Fact label="Runtime" value="Next.js 16 (TypeScript) · Node 24" />
            <Fact label="Code path" value="src/" />
            <Fact label="Host" value="Vercel (Fluid Compute)" />
            <Fact label="Reads + writes" value="Supabase qua REST + RPC" />
          </div>
        </div>
        <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-500/[0.04] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Workflow className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <div className="text-[11px] uppercase tracking-widest font-semibold text-emerald-700 dark:text-emerald-300">
              Layer 2 — Sync workers
            </div>
          </div>
          <div className="space-y-1 text-[13px] leading-6">
            <Fact label="Runtime" value="Python 3.12 · venv" />
            <Fact label="Code path" value="sync/" />
            <Fact label="Host" value="Mac mini cron + GitHub Actions" />
            <Fact label="WRITE-only" value="batch upsert vào Supabase" />
          </div>
        </div>
      </div>

      <p>Hai layer KHÔNG nói chuyện trực tiếp — chỉ giao tiếp qua Postgres:</p>
      <div className="not-prose my-5 rounded-xl border bg-card p-4">
        <FlowRow arrows="right">
          {[
            <FlowNode
              key="workers"
              icon={Workflow}
              label="Python workers"
              sub="WRITE batch upsert"
              tone="emerald"
            />,
            <FlowNode
              key="db"
              icon={Database}
              label="Supabase Postgres"
              sub="master_app schema"
              tone="pink"
            />,
            <FlowNode
              key="web"
              icon={Code2}
              label="Next.js dashboard"
              sub="READ + mutation"
              tone="violet"
            />,
          ]}
        </FlowRow>
      </div>

      <Callout variant="info" title="Source-of-truth rule">
        <strong>Shopify</strong> là source-of-truth cho{" "}
        <TerminalInline>shopify_orders</TerminalInline>. Date backfill đã chạy 1 lần 2026-05-07
        và lock — đừng re-run.<br />
        <strong>Lark Base</strong> là source-of-truth cho COGS per-PO (
        <TerminalInline>master_app.cogs_full_catalog</TerminalInline>), KHÔNG phải{" "}
        <TerminalInline>raw_variants.cost</TerminalInline>.
      </Callout>

      <h2 id="key-flows">5 execution flow chính</h2>
      <p>
        Hiểu được 5 flow này = hiểu 90% hệ thống. Mỗi flow tương ứng 1 trang chi tiết.
      </p>
      <div className="not-prose my-6 space-y-3">
        {flows.map((f, i) => (
          <div key={f.title} className="rounded-xl border bg-card overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-2.5 border-b bg-muted/30">
              <span className="grid place-items-center h-6 w-6 rounded-full bg-foreground text-background text-[11px] font-bold tabular-nums">
                {i + 1}
              </span>
              <div className="font-semibold text-[14px] flex-1">{f.title}</div>
            </div>
            <div className="px-4 py-3">
              <div className="text-[12.5px] text-muted-foreground mb-2 leading-5">{f.desc}</div>
              <FlowRow arrows="right">
                {f.chain.map((c, j) => (
                  <FlowNode
                    key={j}
                    label={c}
                    tone={j === 0 ? "violet" : j === f.chain.length - 1 ? "emerald" : "neutral"}
                  />
                ))}
              </FlowRow>
            </div>
          </div>
        ))}
      </div>

      <h2 id="next">Bước tiếp theo</h2>
      <div className="not-prose my-5 grid sm:grid-cols-2 gap-3">
        <NextCard
          href="/docs/setup"
          icon={Cog}
          title="Local Setup"
          desc="Clone, install, env, run dev — 6 bước hand-holding."
        />
        <NextCard
          href="/docs/supabase"
          icon={Database}
          title="Supabase Connection"
          desc="Self-host master_app, 4 trap RLS / cache / row-cap."
        />
        <NextCard
          href="/docs/architecture"
          icon={Boxes}
          title="Architecture"
          desc="5 layer, cluster maps, invariants không được phá."
        />
        <NextCard
          href="/docs/troubleshooting"
          icon={ShoppingBag}
          title="Troubleshooting"
          desc="Decision tree: triệu chứng → cause → fix."
        />
      </div>

      <PageNav href="/docs/overview" />
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground w-24 shrink-0">
        {label}
      </span>
      <code className="font-mono text-[12px] text-foreground/90">{value}</code>
    </div>
  );
}

function NextCard({
  href,
  icon: Icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <a
      href={href}
      className="group rounded-lg border bg-card p-3.5 hover:border-foreground/30 transition-all"
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-foreground/80" />
          <div className="font-semibold text-[14px]">{title}</div>
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
      </div>
      <div className="text-[12.5px] text-muted-foreground leading-5">{desc}</div>
    </a>
  );
}
