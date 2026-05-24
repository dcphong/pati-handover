import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export const metadata = { title: "Shopify Sync — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Core Features"
        title="Shopify Sync"
        description="Hai pipeline song song, webhooks HMAC, refunds nuance."
      />

      <h2 id="apps">Apps & credentials</h2>
      <p>Có 2 Shopify app cùng tồn tại trên primary store WellnessNest:</p>
      <ul>
        <li>
          <strong>Lark Integration (custom app)</strong> — <code>gid:286968840193</code>,{" "}
          <code>api_key 9a7886...1a6c</code>. ÔWN tất cả webhook chính + read tokens.
        </li>
        <li>
          <strong>Public app (OAuth)</strong> — đang scaffolded chưa land. Sẽ thay multi-store onboarding qua{" "}
          <a href="/docs/feature-multistore">Multi-Store</a>.
        </li>
      </ul>

      <Callout variant="danger" title="Webhook HMAC = Lark Integration app's secret">
        <code>SHOPIFY_API_SECRET</code> env phải match secret của Lark Integration app, không
        phải của Public app. Sếp/đồng nghiệp grab từ Admin → Develop apps → Lark Integration →
        API credentials → Reveal token once. Nếu mismatch → 100% webhook HMAC fail silently.
        Memo: <code>reference_shopify_api_secret_lark_integration</code>.
      </Callout>

      <h2 id="dual-pipeline">Dual pipeline — đừng nhầm</h2>
      <table>
        <thead>
          <tr>
            <th>Pipeline</th>
            <th>/api/sync (Python)</th>
            <th>/api/analytics/sync/shopify (TS)</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Runtime</td><td>Python 3.12</td><td>TypeScript on Vercel Functions</td></tr>
          <tr><td>Strategy</td><td>Date-window (re-fetch ranges)</td><td>updated_at cursor (incremental)</td></tr>
          <tr><td>Cron</td><td>Mac mini 2× daily</td><td>Hourly / on-demand</td></tr>
          <tr><td>Target</td><td><code>shopify_orders</code> (SoT)</td><td><code>raw_orders</code> (analytics proj.)</td></tr>
          <tr><td>Re-run safe?</td><td>Idempotent upsert</td><td>Cursor-based, idempotent</td></tr>
        </tbody>
      </table>

      <h2 id="orders-flow">Order sync flow</h2>
      <CodeBlock language="text">
{`Shopify Admin REST API
  │
  │  GET /admin/api/2025-01/orders.json?status=any&updated_at_min=...
  ▼
shopify_fetcher.py — paginated, rate-limit aware (40 req/s burst, 2 req/s sustained)
  │
  ▼
data_cleaner.py — dedup, null-key filter
  │
  ▼
supabase_pusher.py — _batch_upsert in chunks of 500
  │
  ▼
master_app.shopify_orders (upsert on shopify_order_id + shop_id)`}
      </CodeBlock>

      <h2 id="refunds">Refunds — bộ phẫn liệt nhất</h2>
      <Callout variant="warning" title="Refund amount vs subtotal trap">
        TW &quot;Total Sales&quot; trừ <strong>line-item subtotal</strong>, không phải transaction
        money. Restock refunds có thể có <code>amount=0</code> (52% trong 30-day mẫu). Bulk-parse
        path đã từng overwrite correct values. Fix vĩnh viễn: DB trigger preserve non-zero amount
        + backfill script. Đừng đổ lỗi 0.5–2% drift cho &quot;FX noise&quot; cho đến khi check raw_refunds
        amount=0 count.
      </Callout>

      <CodeBlock language="sql">
{`-- Find suspicious zero-amount refunds
SELECT COUNT(*) FROM master_app.raw_refunds
WHERE created_at >= NOW() - INTERVAL '30 days'
  AND amount = 0;
-- > 5% threshold = investigate`}
      </CodeBlock>

      <h2 id="webhooks">Webhooks</h2>
      <p>
        Endpoint: <code>POST /api/webhooks/shopify/refunds</code>. HMAC verify ngay đầu handler.
        Khi HMAC fail → 401, ghi vào <code>sync_logs</code> với status=&apos;failed&apos;. Test
        webhook qua <code>shopify webhook test</code> CLI.
      </p>

      <h2 id="fulfillment-orders">Fulfillment orders (FO) — auto-submit</h2>
      <p>
        Khi Shopify split allocation, một số FO có thể stuck ở <code>UNSUBMITTED</code> tại
        Flexport. Hourly cron click button &quot;Request fulfillment&quot;:
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

      <h2 id="tz-backfill">2026-05-07 TZ backfill — đừng re-run</h2>
      <Callout variant="info">
        Backfill <code>created_at_local</code> theo shop tz đã chạy 1 lần ngày 2026-05-07. Đừng
        re-run — Shopify là SoT cho <code>shopify_orders</code>, double-backfill có thể skew
        downstream metrics.
      </Callout>

      <h2 id="add-store">Onboard store mới</h2>
      <ol>
        <li>Tạo Custom App trên Shopify Admin → grant scopes (<code>docs/shopify-add-scopes-guide.md</code> trong repo cũ).</li>
        <li>Add hàng vào <code>master_app.shopify_stores</code> (id, domain, timezone, default).</li>
        <li>Set <code>SHOPIFY_ACCESS_TOKEN_&lt;SHOP&gt;</code> Vercel env (sẽ pickup qua <code>shopify-creds.ts</code>).</li>
        <li>Activate store qua StoreSwitcher (xem <a href="/docs/feature-multistore">Multi-Store</a>).</li>
      </ol>

      <PageNav href="/docs/feature-shopify-sync" />
    </>
  );
}
