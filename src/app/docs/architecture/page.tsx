import {
  Boxes,
  Cable,
  Cloud,
  Code2,
  Cog,
  Database,
  Globe,
  Network,
  ShoppingBag,
  Truck,
  Workflow,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import {
  FlowNode,
  FlowRow,
  LayerStack,
  Terminal,
  type LayerItem,
} from "@/components/docs/visuals";

export const metadata = { title: "System Overview — PATI Handover" };

const layers: LayerItem[] = [
  {
    name: "Upstream sources",
    description: "External APIs trả raw data — không control được, chỉ pull",
    icon: Globe,
    tone: "sky",
    host: "internet",
    items: [
      "Shopify (orders, products)",
      "Flexport NS3",
      "Lark Base (42 tables)",
      "PayPal / Recharge",
      "Meta / Google / Klaviyo",
    ],
  },
  {
    name: "Python sync workers",
    description: "Read upstream → clean → batch upsert vào Supabase. WRITE-only.",
    icon: Workflow,
    tone: "emerald",
    host: "Mac mini launchd cron + GitHub Actions",
    items: [
      "sync/run.py",
      "modules/pipeline.py",
      "modules/supabase_pusher.py",
      "report_sync/pipeline.py",
      "custom_table_syncer.py",
    ],
  },
  {
    name: "Supabase (Postgres)",
    description: "Source of truth — schema master_app trên Mac mini Docker stack",
    icon: Database,
    tone: "pink",
    host: "Mac mini · self-host",
    items: [
      "shopify_orders (SoT)",
      "raw_orders / raw_refunds / raw_ad_spend",
      "v_stvf · mv_summary_daily",
      "cogs_full_catalog",
      "75 actions / 9 policies (IAM)",
    ],
  },
  {
    name: "Next.js dashboard + API",
    description: "Web UI + /api/* — read DB, ghi mutation, nhận webhook/OAuth",
    icon: Code2,
    tone: "violet",
    host: "Mac mini · launchd com.pati.web · Node 24",
    items: [
      "App Router (src/app)",
      "/api/* ≈ 80 routes",
      "React Query + shadcn",
      "Bulk-update proxy → Flask",
    ],
  },
  {
    name: "Orchestration",
    description: "Lịch trình + trigger cho mọi pipeline",
    icon: Zap,
    tone: "orange",
    host: "Mac mini launchd · GitHub Actions",
    items: [
      "16 Mac mini cron jobs",
      "GH Actions deploy + selected workflows",
      "ChargeFlow Chrome CDP",
      "Cloudflared tunnel",
    ],
  },
];

const frontendClusters = [
  { name: "App", count: 21, purpose: "Next.js App Router pages + root layout" },
  { name: "Components", count: 24, purpose: "AppLayout, ImportMappingModal, SortableColumnList…" },
  { name: "Orders", count: 15, purpose: "Order listing + CSV import" },
  { name: "Sync", count: 11, purpose: "Sync trigger, preview, status" },
  { name: "Users / IAM", count: 10, purpose: "User CRUD, role/policy assignment" },
  { name: "Custom [slug]", count: 6, purpose: "Dynamic custom-table viewer" },
  { name: "Bulk [...path]", count: 7, purpose: "Proxy routes → Python Flask server" },
];

const backendModules: { path: string; purpose: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { path: "sync/run.py", purpose: "Main entry point cho daily sync", icon: Workflow },
  { path: "sync/cron_sync.py", purpose: "Scheduler wrapper (multi-pipeline)", icon: Cog },
  { path: "modules/pipeline.py", purpose: "Shopify order sync pipeline", icon: ShoppingBag },
  { path: "modules/shopify_fetcher.py", purpose: "Shopify REST pagination + rate limit", icon: ShoppingBag },
  { path: "modules/supabase_pusher.py", purpose: "Batch upsert (hot path)", icon: Database },
  { path: "modules/lark_pusher.py", purpose: "Lark bitable writer", icon: Cable },
  { path: "modules/custom_table_syncer.py", purpose: "Sync custom tables (API + Playwright)", icon: Boxes },
  { path: "modules/credential_manager.py", purpose: "Fernet encrypt/decrypt", icon: Cloud },
  { path: "modules/data_cleaner.py", purpose: "Dedup + null-key filter", icon: Cog },
  { path: "report_sync/pipeline.py", purpose: "Flexport shipment sync", icon: Truck },
  { path: "bulk_update/server.py", purpose: "Flask HTTP server (fulfillment)", icon: Network },
];

const flows = [
  {
    title: "Shopify Order Sync → Supabase",
    chain: ["run", "push_shopify_orders", "_batch_upsert", "_get_client"],
    where: "sync/run.py → supabase_pusher.py",
  },
  {
    title: "Flexport Report Sync → Supabase",
    chain: ["main", "run", "push_flexport_shipments", "_batch_upsert"],
    where: "sync/run.py → report_sync/pipeline.py",
  },
  {
    title: "Custom Table — API path",
    chain: ["sync_custom_table", "sync_via_api", "_resolve_auth_header", "decrypt"],
    where: "custom_table_syncer.py → credential_manager.py",
  },
  {
    title: "Custom Table — Playwright fallback",
    chain: ["sync_custom_table", "sync_via_playwright", "_download_and_parse", "_parse_excel_file"],
    where: "custom_table_syncer.py",
  },
  {
    title: "Bulk Fulfillment",
    chain: ["run_fulfill", "fulfill_order", "lookup_order", "_shopify_request"],
    where: "bulk_update/modules/fulfill_pipeline.py",
  },
];

const userLayers = [
  "Nguồn ngoài: Shopify, Lark, Flexport, ads, payment providers.",
  "Worker tự động: Mac mini chạy lịch để kéo dữ liệu về.",
  "Database: Supabase/Postgres là nơi lưu số liệu chuẩn.",
  "Dashboard: nơi đọc số liệu và thao tác trên web.",
  "Orchestration: lịch chạy, deploy, tunnel và healthcheck giữ hệ thống sống.",
];

const userFlows = [
  "Shopify orders: lấy đơn hàng từ Shopify rồi đưa vào dashboard.",
  "Flexport shipments: lấy tracking/fulfillment để theo dõi vận hành.",
  "Custom tables: đồng bộ các bảng Lark/Excel/CSV đang dùng.",
  "Bulk fulfillment: nhận file input rồi gửi fulfillment sang Shopify/Flexport.",
  "Analytics: gom doanh thu, refund, ads, COGS thành báo cáo P&L.",
];

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Architecture"
        title="System Overview"
        description="5 tầng cấu trúc hệ thống: nguồn ngoài → worker → database → dashboard → orchestration."
      />

      {/* ─────────── USER MODE ─────────── */}
      <section data-user-detail>
        <h2 id="user-what">5 tầng — nhìn nhanh</h2>
        <ol>
          <li><strong>Nguồn ngoài</strong>: Shopify, Lark, Flexport, ads, payment providers.</li>
          <li><strong>Worker tự động</strong>: Mac mini chạy lịch để kéo dữ liệu về.</li>
          <li><strong>Database</strong>: Supabase / Postgres là nơi lưu số liệu chuẩn.</li>
          <li><strong>Dashboard</strong>: nơi đọc số liệu và thao tác trên web.</li>
          <li><strong>Orchestration</strong>: lịch chạy, deploy, tunnel và healthcheck giữ hệ thống sống.</li>
        </ol>
        <h2 id="user-when-call">Khi nào báo dev</h2>
        <ul>
          <li>Cần hiểu vì sao một số liệu sai để biết &ldquo;lỗi ở tầng nào&rdquo; — dev sẽ tra.</li>
        </ul>
      </section>

      {/* ─────────── DEV MODE ─────────── */}
      <section data-dev-detail>
      <h2 id="layers">5 layer — Data đi từ trên xuống dưới</h2>
      <div data-user-detail className="not-prose my-5 rounded-xl border bg-card p-4">
        <p className="m-0 text-sm leading-6 text-foreground/80">
          Đọc trang này từ trên xuống: dữ liệu đi từ hệ thống bên ngoài, qua job tự động,
          vào database, rồi dashboard đọc từ database để hiển thị.
        </p>
        <ol className="mt-4 space-y-2 text-sm leading-6 text-foreground/85">
          {userLayers.map((item, i) => (
            <li key={item} className="flex gap-2">
              <span className="font-semibold tabular-nums">{i + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </div>
      <div data-dev-detail>
        <LayerStack layers={layers} />
      </div>

      <Callout variant="info" title="Quy tắc bóc tách">
        Python <strong>WRITE-only</strong>, Next.js <strong>READ/WRITE</strong>. KHÔNG có
        shared library, KHÔNG có HTTP call trực tiếp giữa Python ↔ Next.js. Mọi giao tiếp đi
        qua Postgres. Cron orchestration và web process đều nằm trên Mac mini; GitHub Actions
        chủ yếu dùng để deploy và trigger một số workflow phụ.
      </Callout>

      <h2 id="two-binaries">Hai binary, một database</h2>
      <div data-user-detail className="not-prose my-5 rounded-xl border bg-card p-4">
        <p className="m-0 text-sm leading-6 text-foreground/85">
          Hệ thống có hai chương trình chính: dashboard web để người dùng thao tác và worker
          nền để kéo dữ liệu. Cả hai cùng đọc/ghi vào một database trung tâm để không lệch số.
        </p>
      </div>
      <div data-dev-detail className="not-prose my-6 grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl border-2 border-violet-500/40 bg-violet-500/[0.04] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Code2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            <div className="text-[11px] uppercase tracking-widest font-semibold text-violet-700 dark:text-violet-300">
              Web binary
            </div>
          </div>
          <div className="font-mono text-[12.5px] text-foreground/85 space-y-1.5">
            <div>
              <span className="text-muted-foreground">Path:</span>{" "}
              <code className="text-[12px]">src/</code>
            </div>
            <div>
              <span className="text-muted-foreground">Runtime:</span> Next.js 16 · Node 24
            </div>
            <div>
              <span className="text-muted-foreground">Host:</span> Mac mini launchd (com.pati.web)
            </div>
            <div>
              <span className="text-muted-foreground">Build:</span>{" "}
              <code className="text-[12px]">bun run build</code>
            </div>
          </div>
        </div>
        <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-500/[0.04] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Workflow className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <div className="text-[11px] uppercase tracking-widest font-semibold text-emerald-700 dark:text-emerald-300">
              Worker binary
            </div>
          </div>
          <div className="font-mono text-[12.5px] text-foreground/85 space-y-1.5">
            <div>
              <span className="text-muted-foreground">Path:</span>{" "}
              <code className="text-[12px]">sync/</code>
            </div>
            <div>
              <span className="text-muted-foreground">Runtime:</span> Python 3.12 · venv
            </div>
            <div>
              <span className="text-muted-foreground">Host:</span> Mac mini launchd cron + GH Actions
            </div>
            <div>
              <span className="text-muted-foreground">Run:</span>{" "}
              <code className="text-[12px]">python sync/run.py</code>
            </div>
          </div>
        </div>
      </div>

      <h2 id="frontend">Frontend — 7 cluster</h2>
      <div data-user-detail className="not-prose my-5 rounded-xl border bg-card p-4">
        <p className="m-0 text-sm leading-6 text-foreground/85">
          Frontend là các màn hình dashboard: xem đơn hàng, đồng bộ dữ liệu, quản lý user/quyền,
          xem bảng custom và thao tác bulk fulfillment. Khi một màn hình lỗi, dev sẽ map nó về
          cluster tương ứng để tìm file sửa.
        </p>
      </div>
      <div data-dev-detail className="not-prose my-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {frontendClusters.map((c) => (
          <div key={c.name} className="rounded-lg border bg-card p-3.5">
            <div className="flex items-baseline justify-between mb-1">
              <div className="font-semibold text-[14px]">{c.name}</div>
              <div className="text-[11px] font-mono text-muted-foreground">
                {c.count}+ symbols
              </div>
            </div>
            <div className="text-[12.5px] text-muted-foreground leading-5">{c.purpose}</div>
          </div>
        ))}
      </div>

      <h2 id="backend">Backend — modules Python</h2>
      <div data-user-detail className="not-prose my-5 rounded-xl border bg-card p-4">
        <p className="m-0 text-sm leading-6 text-foreground/85">
          Backend Python là phần chạy nền. Nó lấy dữ liệu từ Shopify/Lark/Flexport, làm sạch,
          loại trùng, rồi ghi vào database. User thường không thao tác trực tiếp phần này; chỉ
          cần biết khi số liệu không cập nhật thì dev sẽ kiểm tra các worker này.
        </p>
      </div>
      <div data-dev-detail className="not-prose my-5 rounded-xl border bg-card overflow-hidden">
        {backendModules.map((m, i) => (
          <div
            key={m.path}
            className={`flex items-start gap-3 px-4 py-2.5 ${i > 0 ? "border-t" : ""}`}
          >
            <div className="h-7 w-7 rounded-md bg-muted grid place-items-center shrink-0 mt-0.5">
              <m.icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <code className="font-mono text-[12.5px] font-semibold text-foreground/90 break-all">
                {m.path}
              </code>
              <div className="text-[12.5px] text-muted-foreground mt-0.5 leading-5">
                {m.purpose}
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 id="five-flows">5 execution flow chính</h2>
      <p>
        Đây là 5 path chính bạn sẽ debug 90% thời gian. Đọc theo thứ tự call chain → biết file
        nào edit.
      </p>
      <div data-user-detail className="not-prose my-5 rounded-xl border bg-card p-4">
        <p className="m-0 text-sm leading-6 text-foreground/85">
          Nếu có sự cố, 90% sẽ rơi vào một trong năm luồng này:
        </p>
        <ol className="mt-4 space-y-2 text-sm leading-6 text-foreground/85">
          {userFlows.map((item, i) => (
            <li key={item} className="flex gap-2">
              <span className="font-semibold tabular-nums">{i + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </div>
      <div data-dev-detail className="not-prose my-6 space-y-4">
        {flows.map((f, i) => (
          <div key={f.title} className="rounded-xl border bg-card overflow-hidden">
            <div className="px-4 py-2.5 border-b bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="grid place-items-center h-6 w-6 rounded-full bg-foreground text-background text-[11px] font-bold tabular-nums">
                  {i + 1}
                </span>
                <div className="font-semibold text-[14px]">{f.title}</div>
              </div>
              <div className="text-[11px] font-mono text-muted-foreground hidden sm:block">
                {f.where}
              </div>
            </div>
            <div className="px-4 py-3">
              <FlowRow arrows="right">
                {f.chain.map((c, j) => (
                  <FlowNode
                    key={j}
                    label={c}
                    tone={j === 0 ? "violet" : j === f.chain.length - 1 ? "emerald" : "neutral"}
                  />
                ))}
              </FlowRow>
              <div className="text-[11px] font-mono text-muted-foreground sm:hidden mt-2">
                {f.where}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Callout variant="tip" title="GitNexus — search call chains">
        Repo pati-master-app đã được index bằng{" "}
        <a href="https://github.com/Anthropic" target="_blank" rel="noreferrer">
          GitNexus
        </a>
        . Mở terminal trong repo đó và chạy:
        <Terminal
          host="you@laptop"
          cwd="~/Coding/pati-master-app"
          lines={[
            { prompt: "$", cmd: "npx gitnexus query \"shopify refund timezone\"" },
            { divider: true, label: "output" },
            { out: "→ process-grouped results", tone: "ok" },
            { out: "→ dẫn về đúng module liên quan", tone: "ok" },
          ]}
        />
        <strong>Dùng nó trước khi sửa</strong> để impact-analysis những module liên quan.
      </Callout>

      <h2 id="invariants">Invariants — nguyên tắc bất biến</h2>
      <div className="not-prose my-5 space-y-2">
        <Invariant
          rule="Shopify là source-of-truth cho shopify_orders"
          why="Backfill TZ đã chạy 1 lần 2026-05-07. Re-run sẽ override với data sai."
        />
        <Invariant
          rule="Lark là source-of-truth cho COGS per-PO"
          why="Bảng master_app.cogs_full_catalog. Đừng dùng raw_variants.cost (Shopify variant cost) cho analytics."
        />
        <Invariant
          rule="Mỗi supabase-js client phải set db.schema = master_app"
          why="Default Accept-Profile: public → đọc empty schema → trả [] giống empty thật."
        />
        <Invariant
          rule="PostgREST cap 1000 rows — dùng pageAll() khi aggregate"
          why="Bare .select() silent-truncate. Đã từng làm refund-rate hiển thị sai 6× (34% vs 5.5%)."
        />
        <Invariant
          rule="NEXT_PUBLIC_* phải rebuild + restart web service sau khi đổi env"
          why="Inline vào client bundle ở build time; Mac mini runtime đọc .env rồi next start lại qua launchd."
        />
      </div>

      </section>

      <PageNav href="/docs/architecture" />
    </>
  );
}

function Invariant({ rule, why }: { rule: string; why: string }) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3 flex items-start gap-3">
      <div className="text-[10px] uppercase tracking-widest font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 rounded-md px-1.5 py-0.5 shrink-0">
        rule
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[14px] leading-snug">{rule}</div>
        <div className="text-[12.5px] text-muted-foreground mt-1 leading-5">
          <span className="font-medium text-foreground/70">Tại sao:</span> {why}
        </div>
      </div>
    </div>
  );
}
