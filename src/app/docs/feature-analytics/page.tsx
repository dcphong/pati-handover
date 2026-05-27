import {
  Activity,
  BarChart3,
  CalendarClock,
  Check,
  Database,
  DollarSign,
  Megaphone,
  Repeat,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import {
  FlowNode,
  FlowRow,
  Terminal,
  TerminalInline,
} from "@/components/docs/visuals";

export const metadata = { title: "Analytics (TW Parity) — PATI Handover" };

const parityStatus = [
  { card: "Total Sales", match: "99.81%", status: "perfect" as const, note: "TW match penny-perfect" },
  { card: "Refunds", match: "99.5%+", status: "perfect" as const, note: "Sau khi fix amount=0 trap" },
  { card: "New Customer Orders", match: "~97%", status: "gap" as const, note: "Methodology gap ~3% documented" },
  { card: "Recharge group", match: "100%", status: "perfect" as const, note: "Penny-perfect — UTC bucketing fixed" },
  { card: "Klaviyo Email", match: "95-99%", status: "gap" as const, note: "Klaviyo Reporting API gap deferred" },
  { card: "Payment Gateways", match: "100%", status: "perfect" as const, note: "Done sau khi fix v_stvf shipping mode" },
  { card: "Shipping costs", match: "100%", status: "perfect" as const, note: "Qua cost_settings_shipping mode" },
];

type Source = {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  trigger: string;
  table: string;
};

const sources: Source[] = [
  { name: "Shopify orders", icon: ShoppingBag, trigger: "incremental + nightly", table: "raw_orders" },
  { name: "Shopify refunds", icon: ShoppingBag, trigger: "webhook + nightly", table: "raw_refunds" },
  { name: "Shopify variants", icon: ShoppingBag, trigger: "daily", table: "raw_variants" },
  { name: "Meta Ads", icon: Megaphone, trigger: "hourly", table: "raw_ad_spend(meta)" },
  { name: "Google Ads", icon: Megaphone, trigger: "daily", table: "raw_ad_spend(google)" },
  { name: "PayPal txns", icon: DollarSign, trigger: "daily", table: "raw_ad_spend(paypal_fees)" },
  { name: "Klaviyo events", icon: Activity, trigger: "daily", table: "raw_events_klaviyo" },
  { name: "Recharge", icon: Repeat, trigger: "daily", table: "raw_subscriptions" },
  { name: "ChargeFlow", icon: Activity, trigger: "5-min cron", table: "chargeflow_disputes" },
];

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Core Features"
        title="Analytics — First-party SoT"
        description="50+ card báo cáo doanh thu, chi phí, ads, lợi nhuận. Lấy thẳng từ Source of Truth của từng provider (Shopify, Klaviyo, Recharge, Meta, Google, PayPal…) — TW chỉ là một sanity check."
      />

      {/* ─────────── USER MODE ─────────── */}
      <section data-user-detail>
        <h2 id="user-what">Trang analytics dùng để làm gì</h2>
        <p>
          Đây là báo cáo &ldquo;summary&rdquo; chính: doanh thu, hoàn tiền, chi phí quảng cáo,
          giá vốn, lợi nhuận. <strong>Mục tiêu là số đúng từ nguồn gốc</strong> — Shopify Admin
          API trả về bao nhiêu thì card hiện bấy nhiêu, không cộng/trừ thêm để khớp TW. Việc
          TW khớp hay không là kết quả phụ, không phải mục tiêu.
        </p>

        <h2 id="user-when-call">Khi nào báo dev</h2>
        <ul>
          <li>Một card hiện $0 trong khi rõ ràng có doanh thu hôm nay.</li>
          <li>Card lệch &gt; 5 % với báo cáo Shopify Admin (sau khi đã trừ refund / discount).</li>
          <li>Spend ads (Meta/Google/TikTok) không cập nhật &gt; 12 giờ.</li>
          <li>Lợi nhuận âm bất thường (thường do thiếu COGS hoặc thiếu ad-spend).</li>
        </ul>
      </section>

      {/* ─────────── DEV MODE ─────────── */}
      <section data-dev-detail>
      <h2 id="goal">Mục tiêu — Source of Truth, không phải parity TW</h2>
      <p>
        Mỗi card phải khớp <strong>provider Source of Truth</strong> (Shopify Admin order
        report, Klaviyo Reporting API, Recharge subscription list, Meta Ads Insights API,
        Google Ads <TerminalInline>customer_client</TerminalInline> spend, PayPal Transaction
        Search, OANDA FX window-avg, v.v.). Khi nghi ngờ → đào tận provider doc / dev portal /
        official API response, sửa pipeline PATI khớp với upstream.
      </p>
      <p>
        TripleWhale (TW) chỉ là <em>third-party renderer</em> của cùng các provider trên.{" "}
        <strong>TW khớp là kết quả phụ.</strong> Khi PATI ≠ TW, khả năng cao TW sai (TW có
        lúc serve stale cache, có lúc filter ngầm, đôi khi connector của TW gãy). Validate{" "}
        PATI vs <em>provider thật</em>, không phải PATI vs TW.
      </p>
      <Callout variant="info" title="Bao giờ vẫn dùng TW làm tham chiếu?">
        TW vẫn hữu ích để spot regression nhanh (đã sống cùng số liệu này nhiều năm). Khi
        PATI và TW lệch lớn bất ngờ → check cả hai phía <strong>cùng vs provider gốc</strong>,
        không chỉ điều chỉnh PATI cho khớp TW. Memory{" "}
        <TerminalInline>feedback_iteration_style</TerminalInline> + dump TW dev portal{" "}
        <a href="https://triplewhale.readme.io" target="_blank" rel="noreferrer" className="underline">
          triplewhale.readme.io
        </a>{" "}
        cho biết TW lấy số ở field nào — dùng để verify, không để mimic.
      </Callout>

      <h2 id="parity-status">TW comparison snapshot (informational, 2026-05-16)</h2>
      <p className="text-[13px] text-muted-foreground">
        Bảng dưới so PATI với TW tại 1 thời điểm. Mục đích: phát hiện regression sớm. Lệch
        không phải lỗi tự động — nếu PATI khớp provider, lệch TW là vấn đề của TW.
      </p>
      <div className="not-prose my-6 rounded-xl border bg-card overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-2 bg-muted/40 text-[11px] uppercase tracking-widest text-muted-foreground font-semibold border-b">
          <div className="col-span-1"></div>
          <div className="col-span-3">Card</div>
          <div className="col-span-2">Match</div>
          <div className="col-span-6">Ghi chú</div>
        </div>
        {parityStatus.map((p) => (
          <div
            key={p.card}
            className="grid grid-cols-12 gap-2 px-4 py-2.5 border-t items-center"
          >
            <div className="col-span-1">
              {p.status === "perfect" ? (
                <span className="grid place-items-center h-6 w-6 rounded-full bg-emerald-500/15 border border-emerald-500/40">
                  <Check className="h-3 w-3 text-emerald-700 dark:text-emerald-300" />
                </span>
              ) : (
                <span className="grid place-items-center h-6 w-6 rounded-full bg-amber-500/15 border border-amber-500/40">
                  <X className="h-3 w-3 text-amber-700 dark:text-amber-300" />
                </span>
              )}
            </div>
            <div className="col-span-3 font-semibold text-[13px]">{p.card}</div>
            <div className="col-span-2 font-mono text-[12px] text-foreground/90">
              {p.match}
            </div>
            <div className="col-span-6 text-[12.5px] text-muted-foreground leading-5">
              {p.note}
            </div>
          </div>
        ))}
      </div>

      <h2 id="pipeline">ETL pipeline — provider → matview → card</h2>
      <div className="not-prose my-6 rounded-xl border bg-card overflow-hidden">
        <div className="px-4 py-2 border-b bg-muted/30 text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
          Tầng 1 · Providers → raw_* tables
        </div>
        {sources.map((s, i) => (
          <div
            key={s.name}
            className={`px-4 py-2.5 grid grid-cols-12 gap-3 items-center ${i > 0 ? "border-t" : ""}`}
          >
            <div className="col-span-12 sm:col-span-5 flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-md bg-muted grid place-items-center shrink-0">
                <s.icon className="h-3.5 w-3.5" />
              </div>
              <div className="font-semibold text-[13px]">{s.name}</div>
            </div>
            <div className="col-span-6 sm:col-span-3">
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <CalendarClock className="h-3 w-3" />
                {s.trigger}
              </span>
            </div>
            <div className="col-span-6 sm:col-span-4 font-mono text-[11.5px] font-semibold text-pink-700 dark:text-pink-300 break-all">
              → {s.table}
            </div>
          </div>
        ))}
      </div>

      <div className="not-prose my-6 rounded-xl border bg-card p-4 sm:p-5">
        <div className="px-2 py-1 text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">
          Tầng 2 · raw_* → matview → RPC → dashboard
        </div>
        <FlowRow arrows="down">
          {[
            <FlowNode
              key="raw"
              icon={Database}
              label="raw_orders / raw_refunds / raw_ad_spend / ..."
              sub="9 raw tables, scope theo shop_id"
              tone="pink"
            />,
            <FlowNode
              key="mv"
              icon={Activity}
              label="v_stvf (matview)"
              sub="single-table view function · refresh nightly"
              tone="violet"
            />,
            <FlowNode
              key="rpc"
              icon={Activity}
              label="summary_metrics(...) RPC"
              sub="returns TW-parity metric struct"
              tone="emerald"
            />,
            <FlowNode
              key="ui"
              icon={BarChart3}
              label="React dashboard /analytics"
              sub="50+ summary cards, React Query 60s stale"
              tone="sky"
            />,
          ]}
        </FlowRow>
      </div>

      <h2 id="formulas">Công thức quan trọng</h2>
      <Callout variant="info" title="TW Total Sales — bí quyết 0.19% parity">
        <strong>KHÔNG</strong> filter <TerminalInline>cancelled_at</TerminalInline> + trừ{" "}
        <TerminalInline>raw_refunds.amount</TerminalInline>. Cancelled+refunded orders flow qua
        refunds rồi — double-trừ cancelled+refund sẽ undershoot 5%.
      </Callout>
      <Callout variant="info" title="Net Shipping per-order floor">
        TW formula <TerminalInline>net_ship = gross - (all_disc - line_disc)</TerminalInline>{" "}
        sinh ra NEGATIVE shipping khi order có order-level discount nhưng $0 shipping. Fix:
        clamp per row trước khi SUM:
        <Terminal
          host="postgres"
          cwd="psql"
          lines={[
            { out: "GREATEST(0, gross - GREATEST(0, all_disc - line_disc))", tone: "ok" },
            { out: "-- per row, THEN SUM", tone: "muted" },
          ]}
        />
      </Callout>

      <h2 id="rpc">summary_metrics RPC — single source for dashboard</h2>
      <p>
        Single Postgres function trả toàn bộ summary card values. Web API chạy trên Mac mini đọc
        self-host Postgres qua Supabase/PostgREST; khi đổi function/view phải refresh schema cache
        và smoke-test dashboard. Memo:{" "}
        <TerminalInline>project_parity_loop_2026_05_13</TerminalInline>.
      </p>
      <CodeBlock language="sql">
{`SELECT * FROM master_app.summary_metrics(
  shop_id   := 'e49d78-3.myshopify.com',
  start_ts  := '2026-05-01 00:00:00+07'::timestamptz,
  end_ts    := '2026-05-31 23:59:59+07'::timestamptz
);`}
      </CodeBlock>

      <h2 id="number-traps">4 trap recurring khi card lệch</h2>
      <p>
        Trước khi nói <em>&quot;card này fix rồi&quot;</em>, chạy pre-claim checklist:
      </p>
      <div className="not-prose my-5 space-y-2">
        <TrapRow
          n={1}
          title="Date off-by-one"
          why="toISOString().slice(0,10) shift UTC. Chọn 18 ở UTC+7 → lưu 17."
          fix={
            <>
              Dùng <TerminalInline>format(d, &apos;yyyy-MM-dd&apos;)</TerminalInline> từ
              date-fns (respect local tz).
            </>
          }
        />
        <TrapRow
          n={2}
          title="RPC query quá nặng"
          why="Long-range queries vẫn có thể làm Next.js API chậm/OOM trên Mac mini, dù không còn serverless timeout."
          fix="Stream / chunked client-side join, cache matview, hoặc giới hạn range trước khi query raw tables."
        />
        <TrapRow
          n={3}
          title="TZ Date round-trip"
          why="Server Date → JSON ISO → client Date — JavaScript có thể shift theo browser tz."
          fix={
            <>
              Lưu time-bucketed key (ngày <TerminalInline>YYYY-MM-DD</TerminalInline>) thay vì
              full ISO. Client format display tại browser.
            </>
          }
        />
        <TrapRow
          n={4}
          title="Overlay miss / silent-zero"
          why="TW audit overlay JSON từ Playwright dump có thể stale, zero-fill các cards (Recharge / COGS / PG / Shipping)."
          fix={
            <>
              Verify <TerminalInline>readTwAuditMetricSums</TerminalInline> return{" "}
              <TerminalInline>null</TerminalInline> nếu no non-zero bucket. Commit{" "}
              <TerminalInline>978e02b</TerminalInline> đã fix.
            </>
          }
        />
      </div>

      <Callout variant="tip" title="Debug pipeline against provider SoT, not TW">
        Khi card lệch: kéo response thật từ <strong>provider gốc</strong> (Shopify Admin API,
        Klaviyo Reporting, Meta Insights, etc.) bằng curl hoặc Playwright, so với row trong{" "}
        <TerminalInline>raw_*</TerminalInline> table của PATI. Lệch ở đâu thì pipeline sai
        ở đó. <em>Không</em> đảo ngược logic để cố khớp TW — TW có thể đang sai. Memo:{" "}
        <TerminalInline>feedback_iteration_style</TerminalInline>.
      </Callout>

      <h2 id="tw-dump">TW dump pipeline (sanity overlay, optional)</h2>
      <div className="not-prose my-5 rounded-xl border bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <Search className="h-4 w-4 text-foreground/70" />
          <div className="font-semibold text-[14px]">
            scripts/tw-dump/live-audit/&lt;today&gt;_*.json
          </div>
        </div>
        <div className="text-[13px] leading-6 text-foreground/85">
          Playwright capture mỗi sáng từ TW dashboard. Dùng làm <em>second-opinion</em> để
          spot regression, KHÔNG phải target. Validator (
          <TerminalInline>readTwAuditMetricSums</TerminalInline>) trả{" "}
          <TerminalInline>null</TerminalInline> khi TW dump không có non-zero bucket — tránh
          để overlay zero-fill đè lên live data. Memo:{" "}
          <TerminalInline>reference_tw_audit_overlay_zero_trap</TerminalInline>.
        </div>
      </div>

      </section>

      <PageNav href="/docs/feature-analytics" />
    </>
  );
}

function TrapRow({
  n,
  title,
  why,
  fix,
}: {
  n: number;
  title: string;
  why: string;
  fix: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border-2 border-amber-500/40 bg-amber-500/[0.04] p-3.5">
      <div className="flex items-baseline gap-2 mb-1.5">
        <span className="grid place-items-center h-6 w-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-700 dark:text-amber-300 text-[11px] font-bold tabular-nums">
          {n}
        </span>
        <div className="font-semibold text-[14px]">{title}</div>
      </div>
      <div className="ml-8 text-[13px] leading-6 text-foreground/85">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            Vì sao
          </span>{" "}
          — {why}
        </div>
        <div className="mt-1">
          <span className="text-[10px] uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold">
            Fix
          </span>{" "}
          — {fix}
        </div>
      </div>
    </div>
  );
}
