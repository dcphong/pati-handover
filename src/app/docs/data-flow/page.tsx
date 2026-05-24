import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export const metadata = { title: "Data Flow — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Architecture"
        title="Data Flow"
        description="Từng path data đi từ source → Supabase → dashboard."
      />

      <h2 id="ingest">Ingest paths</h2>
      <table>
        <thead>
          <tr>
            <th>Source</th>
            <th>Trigger</th>
            <th>Worker</th>
            <th>Target table</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Shopify orders (Python)</td><td>Date-window via cron</td><td>sync/run.py</td><td>shopify_orders</td></tr>
          <tr><td>Shopify orders (TS)</td><td>updated_at incremental</td><td>/api/analytics/sync/shopify</td><td>raw_orders</td></tr>
          <tr><td>Shopify refunds</td><td>Webhook + nightly backfill</td><td>/api/webhooks/shopify/refunds</td><td>raw_refunds</td></tr>
          <tr><td>Shopify products</td><td>Daily cron</td><td>scripts/shopify-products-sync.py</td><td>raw_variants</td></tr>
          <tr><td>Shopify Payments Balance</td><td>Daily cron</td><td>shopify_payments_balance_daily.yml</td><td>shopify_payments_balance</td></tr>
          <tr><td>Flexport NS3</td><td>2× daily (Mac mini)</td><td>POST /products/warehouse</td><td>flexport_stock</td></tr>
          <tr><td>Lark Base COGS</td><td>Daily cron + manual</td><td>lark_pusher + scripts/cogs-full-catalog</td><td>cogs_full_catalog</td></tr>
          <tr><td>Lark Best shipping</td><td>Manual CSV import</td><td>scripts/import-best-shipping-rates.py</td><td>bestfulfill_shipping_rates</td></tr>
          <tr><td>Lark Mail</td><td>Cron (2 nights/day)</td><td>lark_mail_sync.yml</td><td>lark_mail_messages</td></tr>
          <tr><td>PayPal txns</td><td>Cron</td><td>/api/analytics/sync/paypal</td><td>raw_ad_spend(provider=paypal_fees)</td></tr>
          <tr><td>Recharge</td><td>Cron</td><td>/api/analytics/sync/recharge</td><td>raw_subscriptions, raw_orders(recharge)</td></tr>
          <tr><td>Meta Ads</td><td>Hourly</td><td>meta_ads_hourly.yml</td><td>raw_ad_spend(provider=meta)</td></tr>
          <tr><td>Google Ads</td><td>Daily</td><td>analytics_providers_daily.yml</td><td>raw_ad_spend(provider=google)</td></tr>
          <tr><td>Klaviyo</td><td>Daily</td><td>analytics_providers_daily.yml</td><td>raw_events_klaviyo</td></tr>
          <tr><td>ChargeFlow disputes</td><td>5-min cron (Mac mini Chrome CDP)</td><td>/api/cron/chargeflow-sync-ui</td><td>chargeflow_disputes</td></tr>
        </tbody>
      </table>

      <h2 id="two-shopify-pipelines">Two Shopify pipelines — đừng nhầm</h2>
      <p>
        Có <strong>2 pipeline song song</strong> đồng bộ Shopify, mục đích khác nhau:
      </p>
      <table>
        <thead>
          <tr>
            <th>/api/sync</th>
            <th>/api/analytics/sync/shopify</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Python (sync/run.py)</td>
            <td>TypeScript (Vercel Functions)</td>
          </tr>
          <tr>
            <td>Date-window (re-fetch full ranges)</td>
            <td>updated_at incremental cursor</td>
          </tr>
          <tr>
            <td>Writes <code>shopify_orders</code></td>
            <td>Writes <code>raw_orders</code></td>
          </tr>
          <tr>
            <td>Mac mini cron 2× daily</td>
            <td>Hourly / on-demand</td>
          </tr>
        </tbody>
      </table>

      <Callout variant="info" title="Source of truth">
        <strong>Shopify is SoT</strong> cho <code>shopify_orders</code>. Backfill TZ đã chạy
        2026-05-07, đừng re-run. <code>raw_orders</code> là analytics-shaped projection — re-syncable.
      </Callout>

      <h2 id="materialised-views">Materialised views</h2>
      <p>5 mat views drive analytics dashboard. Tất cả scope theo <code>shop_id</code>:</p>
      <ul>
        <li><code>v_stvf</code> — Single-Table View Function (TW parity base)</li>
        <li><code>mv_summary_daily</code> — Daily aggregates per shop</li>
        <li><code>mv_north_stars_processing</code> — NS1: order → fulfillment hours</li>
        <li><code>mv_north_stars_otif</code> — NS2: On-Time-In-Full</li>
        <li><code>mv_north_stars_stock</code> — NS3: stock cover days</li>
      </ul>
      <CodeBlock language="sql" filename="refresh-matviews.sql">
{`-- Refresh all mat views (run nightly via north_stars_daily.yml)
REFRESH MATERIALIZED VIEW CONCURRENTLY master_app.v_stvf;
REFRESH MATERIALIZED VIEW CONCURRENTLY master_app.mv_summary_daily;
REFRESH MATERIALIZED VIEW CONCURRENTLY master_app.mv_north_stars_processing;
REFRESH MATERIALIZED VIEW CONCURRENTLY master_app.mv_north_stars_otif;
REFRESH MATERIALIZED VIEW CONCURRENTLY master_app.mv_north_stars_stock;`}
      </CodeBlock>

      <h2 id="rpc">Important RPCs</h2>
      <table>
        <thead>
          <tr><th>RPC</th><th>Caller</th><th>Returns</th></tr>
        </thead>
        <tbody>
          <tr><td><code>summary_metrics(...)</code></td><td>Analytics dashboard summary cards</td><td>TW-parity metric struct</td></tr>
          <tr><td><code>upsert_ad_spend_batch(...)</code></td><td>analytics-sync-handlers.ts</td><td>Bulk upsert ad spend rows (PostgREST cache fallback)</td></tr>
          <tr><td><code>cs_dashboard_aggregate(...)</code></td><td>/api/cs-dashboard</td><td>CS daily counts</td></tr>
        </tbody>
      </table>

      <h2 id="read-path">Read path (dashboard → user)</h2>
      <CodeBlock language="text">
{`Browser
  │
  │  /api/analytics/summary?from=...&to=...&shop_id=...
  ▼
Vercel Function (Fluid Compute, Node 24)
  │
  │  supabase.rpc("summary_metrics", { ... })
  ▼
PostgREST (Mac mini, behind Cloudflared)
  │
  │  CALL master_app.summary_metrics(...)
  ▼
Postgres → returns aggregated JSON
  ▼
React Query cache (60s stale) → SummaryCards`}
      </CodeBlock>

      <PageNav href="/docs/data-flow" />
    </>
  );
}
