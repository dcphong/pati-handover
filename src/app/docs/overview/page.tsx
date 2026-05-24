import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";

export const metadata = { title: "Project Overview — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Getting Started"
        title="Project Overview"
        description="What shopify-lark-sync is, who uses it, and how the pieces fit together."
      />

      <h2 id="what-it-is">What it is</h2>
      <p>
        <strong>shopify-lark-sync</strong> là full-stack operations dashboard cho PATI Group.
        Nó đồng bộ data giữa <strong>Shopify</strong>, <strong>Lark (Feishu) Base</strong>,{" "}
        <strong>Flexport</strong>, các analytics provider (Meta/Google/Klaviyo/Recharge/PayPal),
        và lưu vào <strong>Supabase Postgres</strong> self-host trên Mac mini ở nhà.
      </p>
      <p>
        UI là dashboard Next.js (
        <a href="https://pnl.patigroup.com" target="_blank" rel="noreferrer">
          pnl.patigroup.com
        </a>
        ) phục vụ team Operations, CS, Analytics. Sync workers Python chạy trên cron để pull
        data từ external sources và push vào Supabase.
      </p>

      <h2 id="who-uses-it">Who uses it</h2>
      <ul>
        <li>
          <strong>Operations team</strong> — bulk fulfillment, COGS catalog, VNH/NS3 routing,
          shipping rate cards.
        </li>
        <li>
          <strong>Customer Service</strong> — CS Dashboard (Gorgias 3-panel rebuild), Lark Mail
          reconcile, customer profile notes.
        </li>
        <li>
          <strong>Analytics / Finance</strong> — TripleWhale-parity P&amp;L dashboard, North
          Stars (Processing, OTIF, Stock Cover).
        </li>
        <li>
          <strong>Engineering / Phong (until handover)</strong> — IAM, cron health, schema
          migrations, troubleshooting.
        </li>
      </ul>

      <h2 id="two-layers">Two layers</h2>
      <p>The codebase splits cleanly into two runtimes:</p>
      <table>
        <thead>
          <tr>
            <th>Layer</th>
            <th>Runtime</th>
            <th>Location</th>
            <th>Hosted on</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Web dashboard</strong>
            </td>
            <td>Next.js 15 (TypeScript)</td>
            <td>
              <code>src/</code>
            </td>
            <td>Vercel</td>
          </tr>
          <tr>
            <td>
              <strong>Sync workers</strong>
            </td>
            <td>Python 3.12</td>
            <td>
              <code>sync/</code>
            </td>
            <td>Mac mini + GitHub Actions</td>
          </tr>
        </tbody>
      </table>
      <p>
        Bridge giữa hai layer là Supabase. Python workers WRITE-only vào DB; Next.js READ/WRITE
        qua REST API. Cron jobs trên Mac mini gọi cả Python scripts lẫn HTTP endpoints của
        Vercel.
      </p>

      <Callout variant="info" title="Source-of-truth rule">
        Shopify là <strong>source of truth</strong> cho <code>shopify_orders</code>. Đừng
        re-run date backfill — đã chạy 1 lần 2026-05-07 và lock. Lark Base là source of truth
        cho COGS per-PO (<code>master_app.cogs_full_catalog</code>), không phải{" "}
        <code>raw_variants.cost</code>.
      </Callout>

      <h2 id="key-flows">Key execution flows</h2>
      <p>Có 5 flow chính mà bạn cần hiểu để work với hệ thống:</p>
      <ol>
        <li>
          <strong>Shopify Order Sync → Supabase</strong> — pipeline.py fetch paginated, batch
          upsert.
        </li>
        <li>
          <strong>Flexport Report Sync → Supabase</strong> — scraper + REST API (Flexport
          Logistics API).
        </li>
        <li>
          <strong>Custom Table Sync</strong> — Lark Base bitable + Excel/CSV fallback +
          Playwright path.
        </li>
        <li>
          <strong>Shopify Order Fulfillment</strong> — bulk-update Flask server (input từ Lark
          hoặc Excel).
        </li>
        <li>
          <strong>Analytics ETL</strong> — daily/hourly sync raw_orders, raw_refunds,
          raw_ad_spend từ Meta/Google/Klaviyo/Recharge → v_stvf view → summary_metrics RPC.
        </li>
      </ol>

      <h2 id="next">Next steps</h2>
      <p>
        Đi tiếp theo thứ tự sidebar bên trái. Bắt đầu với{" "}
        <a href="/docs/setup">Local Setup</a> để clone repo, install deps, run dev. Sau đó{" "}
        <a href="/docs/supabase">Supabase Connection</a> để hiểu DB tự host và schema{" "}
        <code>master_app</code>.
      </p>

      <PageNav href="/docs/overview" />
    </>
  );
}
