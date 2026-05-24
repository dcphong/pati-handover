import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export const metadata = { title: "Cron Jobs — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Deployment"
        title="Cron Jobs"
        description="16 cron jobs across Mac mini, GitHub Actions, and Vercel cron HTTP."
      />

      <h2 id="overview">Where each cron lives</h2>
      <table>
        <thead><tr><th>Runner</th><th>What</th><th>Why there</th></tr></thead>
        <tbody>
          <tr>
            <td>Mac mini cron</td>
            <td>16 jobs — Shopify Lark Base sync, ChargeFlow CDP, Lark Mail, North Stars matview refresh</td>
            <td>Cần Playwright + persistent browser, Tailscale, không bị Vercel timeout 300s</td>
          </tr>
          <tr>
            <td>GitHub Actions</td>
            <td>13 workflow_dispatch (analytics_providers_daily, north_stars_daily, shopify_payments_balance_daily, meta_ads_hourly...)</td>
            <td>Cần triggerable manually từ UI + scheduled fallback</td>
          </tr>
          <tr>
            <td>Vercel Cron (HTTP)</td>
            <td>Một số endpoint /api/cron/* được call từ Mac mini cron (HTTP curl + CRON_SECRET)</td>
            <td>Function nhẹ, Vercel cold start chấp nhận được</td>
          </tr>
        </tbody>
      </table>

      <h2 id="github-actions">GitHub Actions workflows</h2>
      <ul>
        <li><code>analytics_providers_daily.yml</code> — Klaviyo + Google Ads daily</li>
        <li><code>cron_watchdog.yml</code> — Health-check + alert nếu cron stale</li>
        <li><code>custom_table_sync.yml</code> — Sync custom-table credentials</li>
        <li><code>daily_sync.yml</code> — Legacy Shopify daily (đã move sang Mac mini 2026-05-20, kept as fallback)</li>
        <li><code>lark_mail_sync.yml</code> — Lark Mail message sync</li>
        <li><code>meta_ads_hourly.yml</code> — Meta Ads spend (hourly)</li>
        <li><code>north_stars_daily.yml</code> — Refresh matviews + Lark notification</li>
        <li><code>shopify_fulfillment_sync.yml</code> — Auto-submit stuck FOs</li>
        <li><code>shopify_payments_balance_daily.yml</code> — Daily Payments Balance</li>
        <li><code>shopify_products_daily.yml</code> — Products + variant cost</li>
        <li><code>vnh_daily_auto.yml</code> — VNH (Vietnam Hanoi warehouse) daily</li>
        <li><code>vnh_inventory_sync.yml</code> — VNH inventory snapshot</li>
        <li><code>vnh_tracking_poll.yml</code> — VNH tracking poller</li>
      </ul>

      <h2 id="trigger">Triggering from app</h2>
      <p>
        UI ở <code>/sync-dashboard</code> gọi <code>POST /api/cron</code> → dùng GITHUB_TOKEN
        để <code>workflow_dispatch</code>. Header <code>x-cron-secret: $CRON_SECRET</code>{" "}
        bắt buộc:
      </p>
      <CodeBlock language="bash">
{`curl -X POST https://pnl.patigroup.com/api/cron \\
  -H "x-cron-secret: $CRON_SECRET" \\
  -H "content-type: application/json" \\
  -d '{"workflow":"daily_sync.yml","ref":"main"}'`}
      </CodeBlock>

      <h2 id="macmini-cron">Mac mini cron jobs</h2>
      <Callout variant="info" title="2026-05-20 migration">
        <code>daily_sync.yml</code> đã được move khỏi GitHub Actions sang Mac mini cron, chạy 2×
        ngày (05h + 13h VN). APPEND-only — beware re-runs creating duplicate rows. Đã memo
        ở <code>project_shopify_larkbase_macmini_cron</code>.
      </Callout>
      <p>SSH vào Mac mini xem cron list:</p>
      <CodeBlock language="bash">
{`ssh timcook@100.94.220.128
crontab -l`}
      </CodeBlock>

      <h2 id="alerts">Stale-cron alerts</h2>
      <p>
        <code>cron_watchdog.yml</code> chạy 1×/giờ, đọc <code>sync_logs</code> latest{" "}
        <code>completed_at</code> per pipeline. Nếu &gt; 25h từ last successful run → ping Lark
        webhook (<code>LARK_WEBHOOK_URL</code>).
      </p>

      <h2 id="schema-of-sync-logs">sync_logs schema</h2>
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

      <PageNav href="/docs/cron-jobs" />
    </>
  );
}
