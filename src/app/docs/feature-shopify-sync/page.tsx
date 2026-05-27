import {
  Database,
  KeyRound,
  RefreshCw,
  ShoppingBag,
  Webhook,
} from "lucide-react";
import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { ExternalLinkRow } from "@/components/docs/external-link-card";
import {
  FlowNode,
  FlowRow,
  Step,
  Steps,
  StepCheck,
  StepWarn,
  Terminal,
  TerminalInline,
} from "@/components/docs/visuals";
import { SHOPIFY } from "@/lib/external-links";

export const metadata = { title: "Shopify Sync — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Core Features"
        title="Shopify Sync"
        description="Đơn hàng, refund và sản phẩm từ Shopify được đồng bộ về dashboard nhiều lần mỗi ngày."
      />

      <ExternalLinkRow
        links={[
          {
            href: SHOPIFY.wnAdmin,
            title: "WellnessNest Shopify Admin",
            pathHint: "admin.shopify.com/store/e49d78-3",
            desc: "Store chính (e49d78-3). Orders / refunds / fulfillments / webhooks setup ở đây.",
            icon: ShoppingBag,
            tone: "emerald",
          },
          {
            href: SHOPIFY.wnCustomAppLark,
            title: "Custom App 'Lark Integration'",
            pathHint: "admin.shopify.com/.../apps/development",
            desc: "App sở hữu webhook chính + read tokens. SHOPIFY_API_SECRET trỏ về đây. Reveal token một lần khi rotate.",
            icon: KeyRound,
            tone: "violet",
          },
        ]}
      />

      {/* ─────────── USER MODE ─────────── */}
      <section data-user-detail>
        <h2 id="user-what">Pipeline này làm gì</h2>
        <p>
          Mỗi đơn hàng, refund, hoặc sản phẩm mới được tạo trên Shopify đều được đồng bộ về
          dashboard hằng giờ. Có 2 pipeline song song để đảm bảo không sót đơn — một chạy
          incremental (mới), một chạy date-window (kiểm tra ngược lại). Refund đặc biệt cần webhook
          live để hiện ngay.
        </p>

        <h2 id="user-when-call">Khi nào báo dev</h2>
        <ul>
          <li>Đơn mới trên Shopify Admin nhưng &gt; 30 phút chưa hiện trên dashboard.</li>
          <li>Refund hiện trên Shopify nhưng dashboard chưa trừ (webhook lỗi).</li>
          <li>Sản phẩm mới chưa có trong portfolio sau lần đồng bộ kế tiếp.</li>
          <li>Bị duplicate đơn (cùng order ID xuất hiện 2 lần).</li>
        </ul>
      </section>

      {/* ─────────── DEV MODE ─────────── */}
      <section data-dev-detail>
      <h2 id="apps">2 Shopify app trên store</h2>
      <div className="not-prose my-5 grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-500/[0.04] p-4">
          <div className="flex items-center gap-2 mb-2">
            <KeyRound className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <div className="text-[11px] uppercase tracking-widest font-semibold text-emerald-700 dark:text-emerald-300">
              Lark Integration (custom)
            </div>
          </div>
          <div className="space-y-1.5 text-[13px] leading-6">
            <div className="font-mono text-[12px]">gid:286968840193</div>
            <div className="font-mono text-[12px]">api_key 9a7886…1a6c</div>
            <div className="text-foreground/85 mt-2">
              <strong>Sở hữu</strong> tất cả webhook chính + read tokens. Đây là app{" "}
              <TerminalInline>SHOPIFY_API_SECRET</TerminalInline> trỏ về.
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <KeyRound className="h-4 w-4 text-muted-foreground" />
            <div className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground">
              Public app (OAuth)
            </div>
          </div>
          <div className="text-[13px] leading-6 text-muted-foreground">
            Đang scaffolded chưa land. Sẽ thay multi-store onboarding qua{" "}
            <a href="/docs/feature-multistore" className="underline">
              Multi-Store
            </a>{" "}
            khi xong.
          </div>
        </div>
      </div>

      <Callout variant="danger" title="HMAC secret = Lark Integration app, KHÔNG phải Public">
        <TerminalInline>SHOPIFY_API_SECRET</TerminalInline> env phải match secret của{" "}
        <strong>Lark Integration custom app</strong>. Grab từ Admin → <em>Develop apps</em> →{" "}
        <em>Lark Integration</em> → <em>API credentials</em> → <em>Reveal token once</em>. Nếu
        mismatch → 100% webhook HMAC fail silently. Memo:{" "}
        <TerminalInline>reference_shopify_api_secret_lark_integration</TerminalInline>.
      </Callout>

      <h2 id="dual-pipeline">3+ pipeline song song — đừng nhầm</h2>
      <p>
        Có nhiều route đồng thời pull Shopify, ghi vào <strong>các table khác nhau</strong>{" "}
        tuỳ pipeline. Khi debug &ldquo;đơn không thấy trong DB&rdquo; phải xác định pipeline
        nào chạy gần nhất.
      </p>
      <div className="not-prose my-6 grid sm:grid-cols-2 gap-3">
        <PipelineCard
          tone="emerald"
          name="Python — legacy line-item-flat"
          runtime="sync/run.py + sync/modules/pipeline.py"
          strategy="created_at_min/max (date-window) — re-fetch ranges"
          cron="Mac mini com.pati.sync-shopify-legacy 4×/h (:00/:15/:30/:45)"
          target="shopify_orders (1 row / line item) · log → sync_logs"
        />
        <PipelineCard
          tone="violet"
          name="TS v2 — Bulk Operations"
          runtime="/api/analytics/sync/shopify/v2 — Shopify bulkOperationRunQuery"
          strategy="updated_at:>=<since> qua bulk op (1 GraphQL call cho toàn bộ orders + line_items + transactions + fulfillments + refunds)"
          cron="Mac mini com.pati.sync-shopify 4×/h (:00/:15/:30/:45) + on-demand Refresh"
          target="raw_orders, raw_order_line_items, raw_payment_transactions, raw_fulfillments, raw_refunds, raw_refund_line_items · log → sync_log"
        />
        <PipelineCard
          tone="sky"
          name="Webhooks (instant)"
          runtime="/api/webhooks/shopify/orders — HMAC-verified"
          strategy="Real-time push từ Shopify mỗi khi order create/update/cancel/refund"
          cron="KHÔNG cron — fire khi Shopify gọi (cần Lark Integration app secret)"
          target="raw_orders + related raw_* tables"
        />
        <PipelineCard
          tone="orange"
          name="Lark Base APPEND (Python)"
          runtime="sync/modules/lark_pusher chain"
          strategy="2× ngày VN, APPEND-only (re-run = duplicate)"
          cron="Mac mini com.pati.sync-shopify-larkbase 05:00 + 13:00 VN"
          target="Lark Base — DTC table (không phải Postgres)"
        />
      </div>
      <Callout variant="warning" title="raw_orders vs shopify_orders — bảng nào là SoT?">
        <p className="mt-1">
          <strong>Cùng tồn tại, mục đích khác nhau:</strong>
        </p>
        <ul className="ml-5 mt-1 list-disc space-y-1">
          <li>
            <TerminalInline>raw_orders</TerminalInline> (~86k row 2026-05-28) — TW-parity-friendly
            shape, 1 row / order, các <TerminalInline>raw_*</TerminalInline> table khác chứa
            line_items / transactions / fulfillments / refunds tách riêng. Đây là SoT cho{" "}
            <strong>analytics summary cards</strong> (qua <TerminalInline>v_stvf</TerminalInline>{" "}
            +{" "}
            <TerminalInline>summary_metrics</TerminalInline> RPC).
          </li>
          <li>
            <TerminalInline>shopify_orders</TerminalInline> (~169k row) — legacy line-item-flat
            (1 row / line item, nhiều row hơn). SoT cho <strong>orders dashboard /
              shopify-orders</strong>, CS customer panel, Lark Mail reconcile join.
          </li>
        </ul>
        <p className="mt-2">
          2 bảng KHÔNG sync nhau tự động — nếu 1 pipeline lỗi → bảng đó stale, bảng khác vẫn
          fresh. <TerminalInline>health/cron-watchdog</TerminalInline> đọc{" "}
          <TerminalInline>raw_orders.synced_at</TerminalInline> để alert.
        </p>
      </Callout>

      <h2 id="orders-flow">Order sync — đường data đi</h2>
      <div className="not-prose my-6 rounded-xl border bg-card p-4 sm:p-5">
        <FlowRow arrows="down">
          {[
            <FlowNode
              key="api"
              icon={ShoppingBag}
              label="Shopify Admin REST"
              sub="GET /orders.json?status=any&updated_at_min=…"
              tone="sky"
            />,
            <FlowNode
              key="fetch"
              icon={RefreshCw}
              label="shopify_fetcher.py"
              sub="paginated · 40 req/s burst · 2/s sustained"
              tone="violet"
            />,
            <FlowNode
              key="clean"
              icon={RefreshCw}
              label="data_cleaner.py"
              sub="dedup · null-key filter"
              tone="amber"
            />,
            <FlowNode
              key="push"
              icon={Database}
              label="supabase_pusher.py"
              sub="_batch_upsert chunks of 500"
              tone="emerald"
            />,
            <FlowNode
              key="db"
              icon={Database}
              label="master_app.shopify_orders"
              sub="upsert on (shopify_order_id, shop_id)"
              tone="pink"
            />,
          ]}
        </FlowRow>
      </div>

      <h2 id="refunds">Refunds — bộ phẫn liệt nhất</h2>
      <Callout variant="warning" title="Refund amount vs subtotal trap">
        TW &quot;Total Sales&quot; trừ <strong>line-item subtotal</strong>, không phải
        transaction money. Restock refunds có thể có <TerminalInline>amount=0</TerminalInline>{" "}
        (52% trong 30-day mẫu). Bulk-parse path đã từng overwrite correct values. Fix vĩnh
        viễn: DB trigger preserve non-zero amount + backfill script. Đừng đổ lỗi 0.5–2% drift
        cho &quot;FX noise&quot; cho đến khi check{" "}
        <TerminalInline>raw_refunds amount=0</TerminalInline> count.
      </Callout>

      <Terminal
        host="postgres"
        cwd="psql"
        title="Quick check: zero-amount refund ratio"
        lines={[
          { prompt: "psql>", cmd: "SELECT COUNT(*) FROM master_app.raw_refunds" },
          { prompt: "", cmd: "WHERE created_at >= NOW() - INTERVAL '30 days'" },
          { prompt: "", cmd: "  AND amount = 0;" },
          { divider: true, label: "diễn giải" },
          { out: "≤ 5%   →  bình thường", tone: "ok" },
          { out: ">  5%   →  có thể có overwrite bug — đào sâu", tone: "warn" },
        ]}
      />

      <h2 id="webhooks">Webhooks</h2>
      <div className="not-prose my-5 rounded-xl border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
          <Webhook className="h-4 w-4 text-foreground/80" />
          <code className="font-mono text-[12.5px] font-semibold">
            POST /api/webhooks/shopify/refunds
          </code>
        </div>
        <div className="px-4 py-3 text-[13px] leading-6 space-y-1.5">
          <div>
            <strong>1.</strong> HMAC verify đầu tiên — đọc header{" "}
            <TerminalInline>X-Shopify-Hmac-Sha256</TerminalInline> + raw body + compute với{" "}
            <TerminalInline>SHOPIFY_API_SECRET</TerminalInline>.
          </div>
          <div>
            <strong>2.</strong> HMAC fail → return <TerminalInline>401</TerminalInline>, ghi{" "}
            <TerminalInline>sync_logs</TerminalInline> status=&apos;failed&apos;.
          </div>
          <div>
            <strong>3.</strong> HMAC ok → parse refund payload → upsert{" "}
            <TerminalInline>raw_refunds</TerminalInline>.
          </div>
          <div>
            <strong>4.</strong> Test bằng:{" "}
            <TerminalInline>shopify webhook test refunds/create</TerminalInline>.
          </div>
        </div>
      </div>

      <h2 id="fulfillment-orders">Fulfillment orders auto-submit (hourly)</h2>
      <p>
        Khi Shopify split allocation, một số FO stuck ở{" "}
        <TerminalInline>UNSUBMITTED</TerminalInline> tại Flexport. Hourly cron click button
        &quot;Request fulfillment&quot;:
      </p>
      <CodeBlock language="ts">
{`// REQUEST_FULFILLMENT là Action enum, NOT một mutation name
await admin.graphql(\`
  mutation FOAction($id: ID!) {
    fulfillmentOrderSubmitFulfillmentRequest(id: $id, message: "auto-submit") {
      submittedFulfillmentOrder { id status }
      userErrors { field message }
    }
  }
\`, { variables: { id: foGid } });`}
      </CodeBlock>

      <h2 id="tz-backfill">2026-05-07 TZ backfill — KHÔNG re-run</h2>
      <Callout variant="danger" title="Locked — destructive nếu chạy lại">
        Backfill <TerminalInline>created_at_local</TerminalInline> theo shop tz đã chạy 1 lần
        ngày 2026-05-07. Shopify là SoT cho{" "}
        <TerminalInline>shopify_orders</TerminalInline> — double-backfill sẽ skew downstream
        metrics. Nếu cần fix gì đó liên quan tz, hỏi Phong trước.
      </Callout>

      <h2 id="add-store">Onboard store mới — 4 bước</h2>
      <Steps>
        <Step n={1} title="Tạo Custom App trên Shopify Admin">
          <p>
            Shopify Admin → <strong>Develop apps</strong> → <strong>Create app</strong> →
            grant scopes (xem <TerminalInline>docs/shopify-add-scopes-guide.md</TerminalInline>{" "}
            trong repo cũ cho danh sách).
          </p>
          <StepWarn title="Quan trọng">
            Bật cả Admin API + Storefront API. Không bật Public app form — dùng Custom app.
          </StepWarn>
        </Step>
        <Step n={2} title="Add row vào master_app.shopify_stores">
          <Terminal
            host="postgres"
            cwd="psql"
            lines={[
              { prompt: "psql>", cmd: "INSERT INTO master_app.shopify_stores" },
              { prompt: "", cmd: "  (id, domain, timezone, is_default)" },
              { prompt: "", cmd: "VALUES ('new-store-id', 'new-store.myshopify.com'," },
              { prompt: "", cmd: "        'Asia/Ho_Chi_Minh', false);" },
            ]}
          />
        </Step>
        <Step n={3} title="Set per-store access token trên Mac mini">
          <Terminal
            host="you@laptop"
            cwd="~"
            lines={[
              { prompt: "$", cmd: "ssh timcook@100.94.220.128" },
              { prompt: "timcook@mini $", cmd: "cd ~/Coding_workspace/PATI/pati-master-app" },
              { prompt: "timcook@mini $", cmd: "nano .env   # add SHOPIFY_ACCESS_TOKEN_NEWSTORE=shpat_xxx" },
              { prompt: "timcook@mini $", cmd: "bash scripts/macmini-stack/deploy-web.sh --force" },
            ]}
          />
          <p className="text-[12.5px] text-muted-foreground mt-1">
            File <TerminalInline>shopify-creds.ts</TerminalInline> sẽ tự pickup token theo{" "}
            shop_id slug.
          </p>
        </Step>
        <Step n={4} title="Activate qua StoreSwitcher">
          <p>
            Login dashboard → click avatar góc trên → <em>Switch store</em> → chọn store mới.
            Mọi /api/* sẽ scope theo active store. Xem{" "}
            <a href="/docs/feature-multistore" className="underline">
              Multi-Store
            </a>{" "}
            cho chi tiết.
          </p>
          <StepCheck>
            Dashboard hiển thị data của store mới — orders, refunds, ad spend all scoped.
          </StepCheck>
        </Step>
      </Steps>

      </section>

      <PageNav href="/docs/feature-shopify-sync" />
    </>
  );
}

function PipelineCard({
  tone,
  name,
  runtime,
  strategy,
  cron,
  target,
}: {
  tone: "emerald" | "violet" | "sky" | "orange";
  name: string;
  runtime: string;
  strategy: string;
  cron: string;
  target: string;
}) {
  const styles = {
    emerald: "border-emerald-500/40 bg-emerald-500/[0.04]",
    violet: "border-violet-500/40 bg-violet-500/[0.04]",
    sky:     "border-sky-500/40 bg-sky-500/[0.04]",
    orange:  "border-orange-500/40 bg-orange-500/[0.04]",
  } as const;
  const text = {
    emerald: "text-emerald-700 dark:text-emerald-300",
    violet:  "text-violet-700 dark:text-violet-300",
    sky:     "text-sky-700 dark:text-sky-300",
    orange:  "text-orange-700 dark:text-orange-300",
  } as const;
  return (
    <div className={`rounded-xl border-2 p-4 ${styles[tone]}`}>
      <code className={`block font-mono text-[12.5px] font-semibold mb-2.5 ${text[tone]}`}>
        {name}
      </code>
      <div className="space-y-1 text-[13px] leading-6">
        <FactRow label="Runtime" value={runtime} />
        <FactRow label="Strategy" value={strategy} />
        <FactRow label="Lịch" value={cron} />
        <FactRow label="Target" value={target} />
      </div>
    </div>
  );
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[10.5px] uppercase tracking-wider text-muted-foreground w-16 shrink-0">
        {label}
      </span>
      <span className="text-foreground/90 font-mono text-[12px]">{value}</span>
    </div>
  );
}
