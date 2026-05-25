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

const macMiniJobs: CronJob[] = [
  {
    name: "shopify-larkbase-sync",
    hours: [5, 13],
    runner: "macmini",
    what: "Shopify orders → Lark Base (2× ngày VN)",
  },
  {
    name: "chargeflow-sync-ui",
    hours: Array.from({ length: 24 }, (_, i) => i),
    every: 5,
    runner: "macmini",
    what: "ChargeFlow CDP — every 5 min",
  },
  {
    name: "lark-mail-sync",
    hours: [6, 18],
    runner: "macmini",
    what: "Lark Mail messages — 2× ngày",
  },
  {
    name: "shopify-fulfillment",
    hours: Array.from({ length: 24 }, (_, i) => i),
    runner: "macmini",
    what: "Auto-submit stuck FOs — hourly",
  },
  {
    name: "north-stars-refresh",
    hours: [23],
    runner: "macmini",
    what: "Refresh 5 matviews (nightly)",
  },
];

const ghaJobs: CronJob[] = [
  {
    name: "analytics_providers_daily.yml",
    hours: [3],
    runner: "gha",
    what: "Klaviyo + Google Ads",
  },
  {
    name: "meta_ads_hourly.yml",
    hours: Array.from({ length: 24 }, (_, i) => i),
    runner: "gha",
    what: "Meta Ads spend — hourly",
  },
  {
    name: "shopify_payments_balance_daily.yml",
    hours: [4],
    runner: "gha",
    what: "Daily payments balance snapshot",
  },
  {
    name: "shopify_products_daily.yml",
    hours: [2],
    runner: "gha",
    what: "Products + variant cost",
  },
  {
    name: "lark_mail_sync.yml",
    hours: [7, 19],
    runner: "gha",
    what: "Backup Lark Mail sync (fallback)",
  },
  {
    name: "north_stars_daily.yml",
    hours: [23],
    runner: "gha",
    what: "Lark notification + matview refresh trigger",
  },
  {
    name: "cron_watchdog.yml",
    hours: Array.from({ length: 24 }, (_, i) => i),
    runner: "gha",
    what: "Health-check + alert nếu cron stale",
  },
  {
    name: "vnh_daily_auto.yml",
    hours: [5],
    runner: "gha",
    what: "VNH (Vietnam Hanoi) daily",
  },
];

const allJobs = [...macMiniJobs, ...ghaJobs];

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Deployment"
        title="Cron Jobs"
        description="16 cron jobs trên Mac mini + 13 GitHub Actions workflows. Visual grid theo giờ ngày để bạn biết khi nào chạy gì."
      />

      <h2 id="who-runs-what">Ai chạy job nào — nguyên tắc phân chia</h2>
      <RunnerLegend />
      <Callout variant="info" title="Quy tắc">
        Job có Playwright / browser session → <strong>Mac mini</strong>. Job &gt; 5 phút →
        <strong>Mac mini</strong>. Job hourly nhẹ → <strong>GH Actions</strong> hoặc{" "}
        <strong>Vercel HTTP cron</strong>. Mac mini cron <em>gọi vào</em> Vercel{" "}
        <TerminalInline>/api/cron/*</TerminalInline> với <TerminalInline>CRON_SECRET</TerminalInline>{" "}
        header.
      </Callout>

      <h2 id="schedule">Schedule grid (Asia/Ho_Chi_Minh)</h2>
      <p>
        Mỗi ô = 1 lần job chạy trong giờ đó. Chấm tròn nhỏ = job chạy sub-hour (vd every 5 min).
      </p>
      <ScheduleGrid jobs={allJobs} />

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

      <h2 id="macmini-cron">Xem crontab trên Mac mini</h2>
      <Terminal
        host="you@laptop"
        cwd="~"
        lines={[
          { prompt: "$", cmd: "ssh timcook@100.94.220.128" },
          { prompt: "timcook@mini $", cmd: "crontab -l" },
        ]}
      />
      <Callout variant="warning" title="Job daily_sync đã move (2026-05-20)">
        Trước đây <TerminalInline>daily_sync.yml</TerminalInline> chạy trên GH Actions. Đã move
        sang Mac mini cron 2× ngày (05h + 13h VN). <strong>APPEND-only</strong> — re-run sẽ tạo
        duplicate rows. Memo:{" "}
        <TerminalInline>project_shopify_larkbase_macmini_cron</TerminalInline>.
      </Callout>

      <h2 id="alerts">Stale-cron alerts</h2>
      <p>
        <TerminalInline>cron_watchdog.yml</TerminalInline> chạy 1×/giờ. Đọc{" "}
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

      <PageNav href="/docs/cron-jobs" />
    </>
  );
}
