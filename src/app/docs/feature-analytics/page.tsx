import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export const metadata = { title: "Analytics (TW Parity) — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Core Features"
        title="Analytics — TripleWhale Parity Clone"
        description="50+ cards, 36/44 TW-perfect match, daily ETL từ 9 providers."
      />

      <h2 id="goal">Mục tiêu</h2>
      <p>
        Rebuild TripleWhale Summary dashboard từ first-party data của PATI, ngắt phụ thuộc vào
        TW subscription. Mỗi card phải khớp TW &quot;penny-perfect&quot; (hoặc explain được tại
        sao không khớp).
      </p>

      <h2 id="parity-status">Parity status (snapshot 2026-05-16)</h2>
      <ul>
        <li>Total Sales — 99.81% TW match</li>
        <li>Refunds — accurate sau khi fix amount=0 trap</li>
        <li>New Customer Orders — methodology gap ~3% documented</li>
        <li>Recharge group — penny-perfect (UTC bucketing fixed)</li>
        <li>Klaviyo Email — 95-99% (Klaviyo Reporting API gap deferred)</li>
        <li>Payment Gateways — done sau khi fix v_stvf shipping mode</li>
        <li>Shipping costs — done qua cost_settings_shipping mode</li>
      </ul>

      <h2 id="pipeline">ETL pipeline</h2>
      <CodeBlock language="text">
{`Providers          Hourly/Daily cron          Raw tables
─────────          ─────────────────          ──────────
Shopify orders ─►  /api/analytics/sync ─►    raw_orders
Shopify refunds ─► webhook + nightly  ─►    raw_refunds
Shopify variants ─► daily             ─►    raw_variants
Meta Ads ─────►   hourly             ─►    raw_ad_spend(meta)
Google Ads ───►   daily              ─►    raw_ad_spend(google)
PayPal txns ──►   daily              ─►    raw_ad_spend(paypal_fees)
Klaviyo ──────►   daily              ─►    raw_events_klaviyo
Recharge ─────►   daily              ─►    raw_subscriptions
ChargeFlow ──►    5-min cron         ─►    chargeflow_disputes

                   ┌─ refresh nightly ─┐
                   ▼                   │
                v_stvf (matview)       │
                   │                   │
                   ▼                   │
            summary_metrics(...) RPC  ─┘
                   │
                   ▼
            React dashboard /analytics`}
      </CodeBlock>

      <h2 id="formulas">Key formulas</h2>
      <Callout variant="info" title="TW Total Sales">
        Đạt 0.19% parity bằng cách <strong>không</strong> filter <code>cancelled_at</code> +{" "}
        trừ <code>raw_refunds.amount</code>. Cancelled+refunded orders flow qua refunds — double-trừ
        cancelled+refund → undershoot 5%.
      </Callout>
      <Callout variant="info" title="Net Shipping per-order floor">
        TW formula <code>net_ship = gross - (all_disc - line_disc)</code> sinh ra
        NEGATIVE shipping khi order có order-level discount nhưng $0 shipping. Fix:{" "}
        <code>GREATEST(0, gross - GREATEST(0, all_disc - line_disc))</code> per row, THEN SUM.
      </Callout>

      <h2 id="rpc">summary_metrics RPC</h2>
      <p>
        Single Postgres function returns toàn bộ summary card values. Self-host RPC và cloud RPC
        có thể diverge — Vercel reads self-host, must keep in sync. Memo:{" "}
        <code>project_parity_loop_2026_05_13</code>.
      </p>
      <CodeBlock language="sql">
{`SELECT * FROM master_app.summary_metrics(
  shop_id   := 'e49d78-3.myshopify.com',
  start_ts  := '2026-05-01 00:00:00+07'::timestamptz,
  end_ts    := '2026-05-31 23:59:59+07'::timestamptz
);`}
      </CodeBlock>

      <h2 id="number-traps">4 recurring number-mismatch traps</h2>
      <p>Trước khi nói &quot;card đã fix&quot;, chạy pre-claim checklist:</p>
      <ol>
        <li>
          <strong>Date off-by-one</strong> — calendar onChange phải dùng{" "}
          <code>format(d, &apos;yyyy-MM-dd&apos;)</code> không phải <code>toISOString().slice(0,10)</code>.
        </li>
        <li>
          <strong>RPC 60s timeout</strong> — Vercel function timeout 60s ở plan cũ. Long-range
          queries cần streaming hoặc chunked client-side join.
        </li>
        <li>
          <strong>TZ Date round-trip</strong> — server Date → ISO → client Date có thể shift
          theo browser tz.
        </li>
        <li>
          <strong>Overlay miss</strong> — TW audit overlay JSON từ Playwright dump có thể stale,
          zero-fill các cards (Recharge / COGS / PG / Shipping). Verify
          <code> readTwAuditMetricSums</code> return null nếu no non-zero buckets.
        </li>
      </ol>

      <h2 id="iteration-style">Iteration style</h2>
      <Callout variant="tip" title="Research upstream, don't settle">
        Khi card không match TW, <strong>đi đào</strong> exact data source của TW (TW dev
        portal triplewhale.readme.io, Playwright capture <code>/willy-metrics</code>) trước
        khi nói &quot;best we can do&quot;. Document mỗi gap&apos;s root cause. Memo:{" "}
        <code>feedback_iteration_style</code>.
      </Callout>

      <h2 id="tw-dump">TW dump pipeline (audit fallback)</h2>
      <p>
        <code>scripts/tw-dump/live-audit/&lt;today&gt;_*.json</code> — Playwright capture mỗi
        sáng từ TW dashboard. Dùng làm overlay verification. Phải đảm bảo file dump KHÔNG{" "}
        zero-fill cards mà API thực tế đang non-zero (đã từng silent-zero Recharge group).
      </p>

      <PageNav href="/docs/feature-analytics" />
    </>
  );
}
