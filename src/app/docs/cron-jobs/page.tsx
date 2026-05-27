import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import {
  CronJob,
  RunnerLegend,
  ScheduleGrid,
  Terminal,
  TerminalInline,
} from "@/components/docs/visuals";

export const metadata = { title: "Cron Jobs — PATI Handover" };

// ── Ground truth pulled from Mac mini 2026-05-27 ─────────────────────────────
// Source: `bash scripts/dump-cron-schedules.sh` on Mac mini reads each
// `~/Library/LaunchAgents/com.pati.*.plist` and prints StartInterval /
// StartCalendarInterval. 31 cron-like agents + 2 KeepAlive persistent services
// (chargeflow-trigger-server, web) — the persistent ones are listed separately
// since the schedule grid only makes sense for things that fire on a clock.

const macMiniJobs: CronJob[] = [
  // ── Frequent — interval-based ──────────────────────────────────────────────
  {
    name: "sync-shopify",
    hours: Array.from({ length: 24 }, (_, i) => i),
    every: 15,
    runner: "macmini",
    what: "/api/analytics/sync/shopify/v2 (Bulk Op) → raw_orders + 5 raw_* tables",
  },
  {
    name: "sync-shopify-legacy",
    hours: Array.from({ length: 24 }, (_, i) => i),
    every: 15,
    runner: "macmini",
    what: "Python date-window → shopify_orders (line-item-flat)",
  },
  {
    name: "sync-providers",
    hours: Array.from({ length: 24 }, (_, i) => i),
    every: 15,
    runner: "macmini",
    what: "Ads spend Meta/Google/TikTok/Amazon/PayPal (4×/h)",
  },
  {
    name: "sync-payments",
    hours: Array.from({ length: 24 }, (_, i) => i),
    every: 30,
    runner: "macmini",
    what: "Recharge subs + balance_transactions (2×/h, :05/:35)",
  },
  {
    name: "sync-tracking-timeline",
    hours: Array.from({ length: 24 }, (_, i) => i),
    every: 30,
    runner: "macmini",
    what: "Tracking timeline matview (every 30 min)",
  },
  {
    name: "sync-custom-tables",
    hours: Array.from({ length: 24 }, (_, i) => i),
    every: 30,
    runner: "macmini",
    what: "Custom table sync (every 30 min)",
  },
  {
    name: "sync-lark-mail",
    hours: Array.from({ length: 24 }, (_, i) => i),
    every: 5,
    runner: "macmini",
    what: "Lark Mail messages reconcile (every 5 min — NOT 2×/ngày)",
  },
  {
    name: "sync-chargeflow-ui",
    hours: Array.from({ length: 24 }, (_, i) => i),
    every: 5,
    runner: "macmini",
    what: "ChargeFlow UI parity (every 5 min, CDP Chrome)",
  },
  {
    name: "sync-chargeflow-disputes",
    hours: Array.from({ length: 24 }, (_, i) => i),
    every: 15,
    runner: "macmini",
    what: "ChargeFlow disputes pull (every 15 min)",
  },
  {
    name: "sync-disputes-first-party",
    hours: Array.from({ length: 24 }, (_, i) => i),
    every: 5,
    runner: "macmini",
    what: "First-party disputes (every 5 min)",
  },
  {
    name: "chargeflow-evidence-collect",
    hours: Array.from({ length: 24 }, (_, i) => i),
    every: 15,
    runner: "macmini",
    what: "Evidence auto-collect + upload (every 15 min, openclaw script)",
  },
  {
    name: "session-warmer",
    hours: Array.from({ length: 24 }, (_, i) => i),
    every: 20,
    runner: "macmini",
    what: "Keep Chrome CDP cookies alive (every 20 min, openclaw)",
  },
  {
    name: "submit-stuck-fulfillments",
    hours: Array.from({ length: 24 }, (_, i) => i),
    every: 60,
    runner: "macmini",
    what: "Auto-submit Shopify FOs left UNSUBMITTED (hourly)",
  },
  {
    name: "reroute-us-vnh",
    hours: Array.from({ length: 24 }, (_, i) => i),
    every: 60,
    runner: "macmini",
    what: "Move US-bound mis-routed FOs off VNH (hourly)",
  },
  {
    name: "cron-watchdog",
    hours: Array.from({ length: 24 }, (_, i) => i),
    every: 10,
    runner: "macmini",
    what: "Health-check + alert if any cron stale (every 10 min)",
  },
  {
    name: "probe-tunnel",
    hours: Array.from({ length: 24 }, (_, i) => i),
    every: 5,
    runner: "macmini",
    what: "Cloudflared tunnel health probe (every 5 min)",
  },

  // ── Daily — calendar-based ────────────────────────────────────────────────
  {
    name: "pgbackup",
    hours: [3],
    runner: "macmini",
    what: "pg_dump → ~/pati-supabase/backups/ (03:00 VN)",
  },
  {
    name: "sync-refund-backfill",
    hours: [2],
    runner: "macmini",
    what: "Refund history backfill (02:00 VN)",
  },
  {
    name: "sync-fulfillment",
    hours: [5],
    runner: "macmini",
    what: "Shopify fulfillment + tracking pull (05:00 VN)",
  },
  {
    name: "sync-processing",
    hours: [5],
    runner: "macmini",
    what: "NS#1 processing matview (05:10 VN)",
  },
  {
    name: "sync-delivery",
    hours: [5],
    runner: "macmini",
    what: "NS#2 OTIF matview (05:20 VN)",
  },
  {
    name: "sync-stock-cover",
    hours: [5],
    runner: "macmini",
    what: "NS#3 stock cover matview (05:30 VN)",
  },
  {
    name: "sync-shopify-products",
    hours: [5],
    runner: "macmini",
    what: "raw_variants + COGS (05:45 VN)",
  },
  {
    name: "vnh-daily-auto",
    hours: [6],
    runner: "macmini",
    what: "VNH scan → classify → push to THG (06:00 VN)",
  },
  {
    name: "sync-cogs-full",
    hours: [6],
    runner: "macmini",
    what: "Lark Base COGS catalog full re-pull (06:30 VN)",
  },
  {
    name: "sync-flexport",
    hours: [6],
    runner: "macmini",
    what: "Flexport inventory + shipments (06:30 VN)",
  },
  {
    name: "vnh-inventory",
    hours: [11],
    runner: "macmini",
    what: "THG inventory snapshot (11:00 VN)",
  },

  // ── Multi-time per day ────────────────────────────────────────────────────
  {
    name: "sync-shopify-larkbase",
    hours: [5, 13],
    runner: "macmini",
    what: "Shopify → Lark Base — APPEND-only (05:00 + 13:00 VN)",
  },
  {
    name: "vnh-tracking-poll",
    hours: [9, 21],
    runner: "macmini",
    what: "Poll THG tracking → fulfill Shopify (09:00 + 21:00 VN)",
  },
  {
    name: "sync-delivery-report",
    hours: [0, 3, 6, 9, 12, 15, 18, 21],
    runner: "macmini",
    what: "Delivery report (every 3h at :10)",
  },
  {
    name: "sync-processing-report",
    hours: [0, 3, 6, 9, 12, 15, 18, 21],
    runner: "macmini",
    what: "Processing report (every 3h at :05)",
  },
];

// GitHub Actions workflows currently enabled with cron triggers.
//
// Note: 10/14 `.github/workflows/*.yml` have their `cron:` lines COMMENTED OUT
// (preserved for `workflow_dispatch` manual trigger only). The 4 below are the
// only ones with active scheduled runs. See `manualOnlyGha` for the rest.
const ghaJobs: CronJob[] = [
  {
    name: "cron_watchdog.yml",
    hours: Array.from({ length: 24 }, (_, i) => i),
    every: 10,
    runner: "gha",
    what: "Health-check + alert (every 10 min)",
  },
  {
    name: "custom_table_sync.yml",
    hours: Array.from({ length: 24 }, (_, i) => i),
    every: 30,
    runner: "gha",
    what: "Custom table sync (every 30 min)",
  },
  {
    name: "lark_mail_sync.yml",
    hours: Array.from({ length: 24 }, (_, i) => i),
    every: 5,
    runner: "gha",
    what: "Lark Mail sync — fallback to Mac mini (every 5 min)",
  },
];

const manualOnlyGha = [
  { name: "analytics_providers_daily.yml", what: "Klaviyo + Google Ads" },
  { name: "daily_sync.yml", what: "Legacy shopify_orders sync (moved to Mac mini)" },
  { name: "deploy-macmini.yml", what: "Deploy hooks for Mac mini" },
  { name: "meta_ads_hourly.yml", what: "Meta Ads spend (now in sync-providers Mac mini)" },
  { name: "north_stars_daily.yml", what: "North Stars + Lark notification" },
  { name: "shopify_fulfillment_sync.yml", what: "Fulfillment sync (replaced by Mac mini)" },
  { name: "shopify_payments_balance_daily.yml", what: "Daily payments balance" },
  { name: "shopify_products_daily.yml", what: "Products + variant cost" },
  { name: "vnh_daily_auto.yml", what: "VNH daily (now Mac mini)" },
  { name: "vnh_inventory_sync.yml", what: "VNH inventory (now Mac mini)" },
  { name: "vnh_tracking_poll.yml", what: "VNH tracking poll (now Mac mini)" },
];

const persistentServices = [
  {
    name: "com.pati.web",
    what: "Next.js production server (KeepAlive, port 3000 → cloudflared tunnel → pnl.patigroup.com)",
  },
  {
    name: "com.pati.chargeflow-trigger-server",
    what: "HTTP server for 'Sync now' button (KeepAlive, port 9876 → chargeflow-trigger.patiagency.com)",
  },
];

const allJobs = [...macMiniJobs, ...ghaJobs];

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Deployment"
        title="Cron Jobs"
        description="Lịch chạy thực tế của hệ thống — pulled từ Mac mini launchd plists + GitHub Actions ngày 2026-05-27. 31 cron Mac mini + 3 GH Actions cron + 2 persistent services."
      />

      {/* ─────────── USER MODE ─────────── */}
      <section data-user-detail>
        <h2 id="user-what">Cron jobs làm gì</h2>
        <p>
          Đây là các tác vụ tự động đồng bộ dữ liệu định kỳ. Mỗi job kéo dữ liệu từ một nguồn
          (Shopify, Lark, Flexport, ads provider, …) hoặc cập nhật báo cáo. Khi số trên dashboard
          chưa mới, thường là một job đang trễ chứ không phải lỗi.
        </p>
        <h2 id="user-when-call">Khi nào báo dev</h2>
        <ul>
          <li>Một loại số liệu cũ &gt; 24 giờ.</li>
          <li>Cần job mới (thêm provider mới, đổi lịch) — qua dev.</li>
          <li>Job báo đỏ liên tục trên trang Sync Health.</li>
        </ul>
      </section>

      {/* ─────────── DEV MODE ─────────── */}
      <section data-dev-detail>
      <h2 id="who-runs-what">Ai chạy job nào — nguyên tắc phân chia</h2>
      <RunnerLegend />
      <Callout variant="info" title="Quy tắc">
        Job có Playwright / browser session → <strong>Mac mini</strong>. Job &gt; 5 phút →
        <strong>Mac mini</strong>. Mọi cron production hiện đã rời GH Actions, GH Actions chủ yếu
        chỉ còn workflow_dispatch (manual) như backup.
      </Callout>

      <h2 id="schedule">Schedule grid (Asia/Ho_Chi_Minh)</h2>
      <p>
        Mỗi ô vuông = job chạy ở giờ đó. Chấm tròn nhỏ = sub-hour (vd <em>every 5/15/30 min</em>) — dot xuất hiện ở mọi giờ.
        Số lượng job khá nhiều — scroll xuống cuối bảng.
      </p>
      <ScheduleGrid jobs={allJobs} />

      <Callout variant="warning" title="3 chỗ bảng cũ sai vs thực tế">
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <TerminalInline>sync-lark-mail</TerminalInline> chạy <strong>mỗi 5 phút</strong>{" "}
            (StartInterval=300s), KHÔNG phải 2× ngày.
          </li>
          <li>
            Plist Chargeflow thực tế là <TerminalInline>sync-chargeflow-ui</TerminalInline>
            {" + "}<TerminalInline>sync-chargeflow-disputes</TerminalInline>
            {" + "}<TerminalInline>chargeflow-evidence-collect</TerminalInline>
            {" + "}<TerminalInline>chargeflow-trigger-server</TerminalInline> — không phải
            chỉ 1 plist tên <TerminalInline>chargeflow-sync-ui</TerminalInline>.
          </li>
          <li>
            <TerminalInline>com.pati.sync-shopify</TerminalInline> thật ra gọi{" "}
            <TerminalInline>/api/analytics/sync/shopify/v2</TerminalInline> (Bulk Operations) →
            ghi 6 raw_* table: <TerminalInline>raw_orders</TerminalInline>,{" "}
            <TerminalInline>raw_order_line_items</TerminalInline>,{" "}
            <TerminalInline>raw_payment_transactions</TerminalInline>,{" "}
            <TerminalInline>raw_fulfillments</TerminalInline>,{" "}
            <TerminalInline>raw_refunds</TerminalInline>,{" "}
            <TerminalInline>raw_refund_line_items</TerminalInline>. Pipeline legacy Python
            (<TerminalInline>sync-shopify-legacy</TerminalInline>) mới là cái ghi{" "}
            <TerminalInline>shopify_orders</TerminalInline>. Xem{" "}
            <a href="/docs/feature-shopify-sync#dual-pipeline" className="underline">
              feature-shopify-sync
            </a>.
          </li>
        </ul>
      </Callout>

      <h2 id="persistent">Persistent services (KeepAlive)</h2>
      <p>
        Không phải cron — launchd boot lên rồi giữ chạy 24/7. Restart tự động nếu process exit.
      </p>
      <div className="not-prose my-4 rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left px-3 py-2 font-semibold w-[320px]">Plist</th>
              <th className="text-left px-3 py-2 font-semibold">Mô tả</th>
            </tr>
          </thead>
          <tbody>
            {persistentServices.map((s) => (
              <tr key={s.name} className="border-t">
                <td className="px-3 py-2 font-mono text-[12px]">{s.name}</td>
                <td className="px-3 py-2 text-muted-foreground">{s.what}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 id="manual-only">GitHub Actions workflows — manual only</h2>
      <p>
        File yml tồn tại nhưng <TerminalInline>cron:</TerminalInline> dòng đã được comment ra.
        Chỉ chạy khi user trigger qua <TerminalInline>workflow_dispatch</TerminalInline>.
      </p>
      <div className="not-prose my-4 rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left px-3 py-2 font-semibold w-[320px]">Workflow</th>
              <th className="text-left px-3 py-2 font-semibold">Mô tả</th>
            </tr>
          </thead>
          <tbody>
            {manualOnlyGha.map((w) => (
              <tr key={w.name} className="border-t">
                <td className="px-3 py-2 font-mono text-[12px]">{w.name}</td>
                <td className="px-3 py-2 text-muted-foreground">{w.what}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 id="trigger">Trigger từ UI / dashboard</h2>
      <p>
        Trang <TerminalInline>/sync-dashboard</TerminalInline> gọi{" "}
        <TerminalInline>POST /api/cron</TerminalInline> → backend dùng{" "}
        <TerminalInline>GITHUB_TOKEN</TerminalInline> để{" "}
        <TerminalInline>workflow_dispatch</TerminalInline>. Header bắt buộc:
      </p>
      <Terminal
        host="you@laptop"
        cwd="~"
        lines={[
          { prompt: "$", cmd: "curl -X POST https://pnl.patigroup.com/api/cron \\" },
          { prompt: "", cmd: "  -H \"x-cron-secret: $CRON_SECRET\" \\" },
          { prompt: "", cmd: "  -H \"content-type: application/json\" \\" },
          { prompt: "", cmd: "  -d '{\"workflow\":\"meta_ads_hourly.yml\",\"ref\":\"main\"}'" },
          { divider: true, label: "expected" },
          { out: "{ \"ok\": true, \"workflow\": \"meta_ads_hourly.yml\", \"run_id\": 12345 }", tone: "ok" },
        ]}
      />

      <h2 id="macmini-cron">Xem launchd jobs trên Mac mini</h2>
      <Terminal
        host="you@laptop"
        cwd="~"
        lines={[
          { prompt: "$", cmd: "ssh timcook@100.94.220.128" },
          { prompt: "timcook@mini $", cmd: "launchctl list | grep com.pati. | wc -l" },
          { divider: true, label: "expected ≈ 33" },
          { out: "33", tone: "ok" },
          { prompt: "timcook@mini $", cmd: "# Schedule chi tiết của 1 plist:" },
          { prompt: "timcook@mini $", cmd: "/usr/libexec/PlistBuddy -c 'Print :StartInterval' \\" },
          { prompt: "", cmd: "  ~/Library/LaunchAgents/com.pati.sync-lark-mail.plist" },
          { divider: true, label: "expected" },
          { out: "300", tone: "ok" },
          { prompt: "timcook@mini $", cmd: "# Dump toàn bộ schedule:" },
          { prompt: "timcook@mini $", cmd: "bash ~/Coding_workspace/PATI/shopify-lark-sync/scripts/dump-cron-schedules.sh" },
        ]}
      />
      <Callout variant="warning" title="Job daily_sync đã move (2026-05-20)">
        Trước đây <TerminalInline>daily_sync.yml</TerminalInline> chạy trên GH Actions. Đã move
        sang Mac mini cron 2× ngày (05h + 13h VN) qua{" "}
        <TerminalInline>com.pati.sync-shopify-larkbase</TerminalInline>.{" "}
        <strong>APPEND-only</strong> — re-run sẽ tạo duplicate rows. Memo:{" "}
        <TerminalInline>project_shopify_larkbase_macmini_cron</TerminalInline>.
      </Callout>

      <h2 id="alerts">Stale-cron alerts</h2>
      <p>
        Cron watchdog chạy mỗi 10 phút (<TerminalInline>com.pati.cron-watchdog</TerminalInline> +
        backup <TerminalInline>cron_watchdog.yml</TerminalInline> GH Actions). Đọc{" "}
        <TerminalInline>sync_logs</TerminalInline> latest{" "}
        <TerminalInline>completed_at</TerminalInline> per pipeline. Nếu {">"} 25h từ last
        success → ping Lark webhook.
      </p>
      <div className="not-prose my-5 rounded-xl border bg-card p-4">
        <div className="font-semibold text-[14px] mb-2">Alert flow</div>
        <ol className="ml-5 list-decimal text-[13px] leading-6 space-y-1">
          <li>
            <code className="text-[12px]">cron_watchdog</code> query{" "}
            <code className="text-[12px]">sync_logs</code>.
          </li>
          <li>
            Cho mỗi pipeline có{" "}
            <code className="text-[12px]">NOW() - completed_at &gt; 25h</code> → push.
          </li>
          <li>
            HTTP POST tới{" "}
            <code className="text-[12px]">LARK_WEBHOOK_URL</code> với payload Markdown.
          </li>
          <li>
            Tin nhắn vào group Lark <em>&quot;PATI alerts&quot;</em>.
          </li>
        </ol>
      </div>

      <h2 id="schema-of-sync-logs">sync_logs schema</h2>
      <p>Mọi pipeline đều ghi vào bảng này khi start + complete:</p>
      <CodeBlock language="sql">
{`master_app.sync_logs (
  id BIGSERIAL PRIMARY KEY,
  pipeline TEXT,             -- 'shopify_orders', 'lark_mail', 'meta_ads', ...
  shop_id TEXT,
  status TEXT,               -- 'started', 'completed', 'failed'
  rows_processed INT,
  error TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
)`}
      </CodeBlock>
      <Terminal
        host="postgres"
        cwd="psql"
        title="Query gần đây nhất khi debug"
        lines={[
          { prompt: "psql>", cmd: "SELECT pipeline, status, rows_processed, error," },
          { prompt: "", cmd: "       started_at, completed_at" },
          { prompt: "", cmd: "FROM master_app.sync_logs" },
          { prompt: "", cmd: "WHERE started_at > NOW() - INTERVAL '1 day'" },
          { prompt: "", cmd: "ORDER BY started_at DESC;" },
        ]}
      />

      </section>

      <PageNav href="/docs/cron-jobs" />
    </>
  );
}
