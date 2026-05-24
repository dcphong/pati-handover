import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export const metadata = { title: "Database Schema — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Architecture"
        title="Database Schema"
        description="master_app schema — tables, views, RPCs, conventions."
      />

      <Callout variant="info" title="Schema = master_app">
        Mọi table production sống trong <code>master_app</code>. Schema <code>public</code> chỉ
        là placeholder empty. Migration files trong <code>supabase/migrations/</code> phải
        prefix bằng schema.
      </Callout>

      <h2 id="orders">Orders & Fulfillment</h2>
      <table>
        <thead><tr><th>Table</th><th>Purpose</th><th>Key columns</th></tr></thead>
        <tbody>
          <tr><td><code>shopify_orders</code></td><td>SoT cho orders</td><td>id, name, shop_id, financial_status, fulfillment_status, total_price, currency, created_at_local, processed_at, variant_sku</td></tr>
          <tr><td><code>shopify_fulfillment_orders</code></td><td>Tracking per-FO</td><td>id, order_id, location_id, status (UNSUBMITTED, SUBMITTED…)</td></tr>
          <tr><td><code>shopify_tracking</code></td><td>Tracking numbers</td><td>order_id, tracking_number, tracking_company, carrier, shop_id</td></tr>
          <tr><td><code>chargeflow_disputes</code></td><td>Dispute pipeline</td><td>shopify_order_id, status, reason, evidence_uploaded_at</td></tr>
        </tbody>
      </table>

      <h2 id="analytics">Analytics base tables</h2>
      <table>
        <thead><tr><th>Table</th><th>Purpose</th></tr></thead>
        <tbody>
          <tr><td><code>raw_orders</code></td><td>Analytics-shaped projection of Shopify orders</td></tr>
          <tr><td><code>raw_refunds</code></td><td>Refunds with line-item subtotal + transaction amount</td></tr>
          <tr><td><code>raw_ad_spend</code></td><td>Daily spend per provider (meta/google/paypal_fees/...)</td></tr>
          <tr><td><code>raw_variants</code></td><td>Shopify variant catalog (cost từ Shopify Admin)</td></tr>
          <tr><td><code>raw_subscriptions</code></td><td>Recharge subscriptions snapshot</td></tr>
          <tr><td><code>raw_events_klaviyo</code></td><td>Klaviyo events (sent, opened, clicked, attributed)</td></tr>
          <tr><td><code>shopify_payments_balance</code></td><td>Daily payouts + fees</td></tr>
          <tr><td><code>cogs_full_catalog</code></td><td>Lark per-PO COGS — AUTHORITATIVE</td></tr>
          <tr><td><code>bestfulfill_shipping_rates</code></td><td>Best fulfillment rate card</td></tr>
        </tbody>
      </table>

      <h2 id="views">Views & matviews</h2>
      <ul>
        <li><code>v_stvf</code> — single-table-view-function, drives TW parity</li>
        <li><code>mv_summary_daily</code> — daily aggregates</li>
        <li><code>mv_north_stars_processing</code> — NS1</li>
        <li><code>mv_north_stars_otif</code> — NS2</li>
        <li><code>mv_north_stars_stock</code> — NS3</li>
        <li><code>v_cs_dashboard</code> — CS daily aggregate view</li>
      </ul>

      <h2 id="iam">IAM tables</h2>
      <table>
        <thead><tr><th>Table</th><th>Purpose</th></tr></thead>
        <tbody>
          <tr><td><code>users</code></td><td>Login accounts (email, password_hash, role)</td></tr>
          <tr><td><code>roles</code></td><td>Legacy roles (Admin, Operations, CS, Analytics)</td></tr>
          <tr><td><code>permissions</code></td><td>Legacy permission strings</td></tr>
          <tr><td><code>iam_actions</code></td><td>75-action AWS-style catalog (service:Action)</td></tr>
          <tr><td><code>iam_policies</code></td><td>9 managed policies (JSON document)</td></tr>
          <tr><td><code>iam_user_policies</code></td><td>User ↔ policy attachment</td></tr>
          <tr><td><code>iam_audit_log</code></td><td>Every permission change recorded</td></tr>
        </tbody>
      </table>

      <h2 id="cs">CS Dashboard tables</h2>
      <table>
        <thead><tr><th>Table</th><th>Purpose</th></tr></thead>
        <tbody>
          <tr><td><code>customer_profiles</code></td><td>CS note + customer_type tag (1 row / customer)</td></tr>
          <tr><td><code>lark_mail_messages</code></td><td>Lark Mail synced messages</td></tr>
          <tr><td><code>lark_mail_threads</code></td><td>Thread aggregation</td></tr>
        </tbody>
      </table>

      <h2 id="multistore">Multi-store</h2>
      <p>
        Phase 3 (2026-05-16) thêm <code>shop_id</code> vào hầu hết tables:
        <code> shopify_orders</code>, <code>shopify_tracking</code>,{" "}
        <code>chargeflow_disputes</code>, <code>stock_cover</code>, và 5 matviews.
      </p>
      <CodeBlock language="sql">
{`-- DEFAULT 'WN domain' ở migration là safety net cho legacy writers.
-- Phase 4 (cron rewrite) chưa land — đừng remove DEFAULT yet.
ALTER TABLE master_app.shopify_orders
  ADD COLUMN shop_id TEXT NOT NULL DEFAULT 'e49d78-3.myshopify.com';`}
      </CodeBlock>

      <Callout variant="warning" title="Blank SKU sentinel">
        Khi Shopify line item không có SKU, app set{" "}
        <code>variant_sku = &apos;__no_sku__:{`{line_item_id}`}&apos;</code> để giữ uniqueness.
        Khi query real SKUs phải filter <code>WHERE variant_sku NOT LIKE &apos;__no_sku__:%&apos;</code>.
      </Callout>

      <h2 id="conventions">Conventions</h2>
      <ul>
        <li>Tất cả timestamps lưu UTC. Bucketing dùng <code>created_at_local</code> theo shop timezone (Asia/Ho_Chi_Minh cho WN).</li>
        <li>Money columns float8 (chấp nhận 0.5% drift). Cents columns dùng bigint.</li>
        <li>RPCs return JSON cho TW-parity-style cards.</li>
        <li>Soft delete: cột <code>deleted_at TIMESTAMPTZ</code>. Hard delete chỉ cho audit log + sync_logs cũ.</li>
      </ul>

      <PageNav href="/docs/database" />
    </>
  );
}
