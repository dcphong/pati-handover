import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export const metadata = { title: "System Overview — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Architecture"
        title="System Overview"
        description="Hai layer (Next.js + Python), năm flow chính, mỗi layer chạy ở đâu."
      />

      <h2 id="two-layers">Two layers, one database</h2>
      <p>
        Dashboard (Next.js) và sync workers (Python) là 2 binary tách rời, share state qua
        Supabase Postgres. Không có shared library, không có direct HTTP call giữa hai layer
        — Python WRITE only, Next.js READ/WRITE. Cron orchestration nằm ngoài (Mac mini
        + GitHub Actions).
      </p>

      <h2 id="diagram">High-level diagram</h2>
      <CodeBlock language="text" filename="data-flow.txt">
{`+-----------+    +-----------+    +-----------+    +-----------+
| Shopify   |    | Flexport  |    | Lark Base |    | PayPal /  |
| (orders,  |    | (NS3)     |    | (42 tbls) |    | Recharge /|
|  products)|    |           |    |           |    | Meta/Goog |
+-----+-----+    +-----+-----+    +-----+-----+    +-----+-----+
      |                |                |                |
      |    REST API    |    REST API    |    Bitable     |
      v                v                v                v
+----------------------------------------------------------+
|              Python Sync Workers (/sync)                 |
|  pipeline.py · report_sync · custom_table_syncer.py      |
|  Scheduled by Mac mini cron + GitHub Actions             |
+----------------------------+-----------------------------+
                             |
                  batch upsert via REST
                             v
+----------------------------------------------------------+
|         Supabase (Postgres) — Mac mini self-host         |
|         schema: master_app                               |
|   Tables · Views · Materialised views · RPCs · Triggers  |
+----------------------------+-----------------------------+
                             ^
              service-role   |   anon (RLS)
                             |
+----------------------------+-----------------------------+
|         Next.js Dashboard (src/) — Vercel                |
|  /api/* REST routes · React 19 · shadcn/ui · TanStack    |
|  ChargeFlow UI sync · Lark Mail · CS Dashboard           |
+-----+---------------------+--------------------------+---+
      |                     |                          |
      |       /api/bulk     |  Vercel Cron (HTTP)      |
      v                     v                          v
+-----------+    +---------------------+    +-------------------+
| Bulk-     |    | GitHub Actions      |    | Mac mini cron     |
| update    |    | workflow_dispatch   |    | (16 jobs)         |
| Flask     |    | (Python sync)       |    |                   |
+-----------+    +---------------------+    +-------------------+`}
      </CodeBlock>

      <h2 id="frontend">Frontend cluster map</h2>
      <table>
        <thead>
          <tr>
            <th>Cluster</th>
            <th>Symbols</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>App</td><td>21</td><td>Next.js App Router pages + root layout</td></tr>
          <tr><td>Components</td><td>24</td><td>AppLayout, ImportMappingModal, SortableColumnList…</td></tr>
          <tr><td>Orders</td><td>15</td><td>Order listing + CSV import</td></tr>
          <tr><td>Sync</td><td>11</td><td>Sync trigger, preview, status</td></tr>
          <tr><td>Users / IAM</td><td>10+</td><td>User CRUD, role/policy assignment</td></tr>
          <tr><td>Custom [slug]</td><td>6</td><td>Dynamic custom-table viewer /custom/[slug]</td></tr>
          <tr><td>Bulk [...path]</td><td>7</td><td>Proxy routes → Python Flask server</td></tr>
        </tbody>
      </table>

      <h2 id="backend">Backend cluster map</h2>
      <table>
        <thead>
          <tr>
            <th>Module</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>sync/run.py</code></td><td>Main entry point cho daily sync</td></tr>
          <tr><td><code>sync/cron_sync.py</code></td><td>Scheduler wrapper (multi-pipeline)</td></tr>
          <tr><td><code>modules/pipeline.py</code></td><td>Shopify order sync pipeline</td></tr>
          <tr><td><code>modules/shopify_fetcher.py</code></td><td>Shopify REST API pagination</td></tr>
          <tr><td><code>modules/supabase_pusher.py</code></td><td>Batch upsert (the hot path)</td></tr>
          <tr><td><code>modules/lark_pusher.py</code></td><td>Lark bitable writer</td></tr>
          <tr><td><code>modules/custom_table_syncer.py</code></td><td>Sync custom tables (API + Playwright)</td></tr>
          <tr><td><code>modules/credential_manager.py</code></td><td>Fernet encrypt/decrypt</td></tr>
          <tr><td><code>modules/data_cleaner.py</code></td><td>Dedup + null-key filter</td></tr>
          <tr><td><code>report_sync/pipeline.py</code></td><td>Flexport shipment sync</td></tr>
          <tr><td><code>bulk_update/server.py</code></td><td>Flask HTTP server (fulfillment)</td></tr>
        </tbody>
      </table>

      <h2 id="five-flows">Five canonical execution flows</h2>
      <h3 id="flow-1">1. Shopify Order Sync → Supabase</h3>
      <CodeBlock language="text">
{`run (sync/run.py)
  └─ push_shopify_orders (supabase_pusher.py)
       └─ _batch_upsert
            └─ _get_client`}
      </CodeBlock>

      <h3 id="flow-2">2. Flexport Report Sync → Supabase</h3>
      <CodeBlock language="text">
{`main (sync/run.py)
  └─ run (report_sync/pipeline.py)
       └─ push_flexport_shipments (supabase_pusher.py)
            └─ _batch_upsert`}
      </CodeBlock>

      <h3 id="flow-3">3. Custom Table Sync — API path</h3>
      <CodeBlock language="text">
{`sync_custom_table (custom_table_syncer.py)
  └─ sync_via_api
       └─ _resolve_auth_header
            └─ decrypt (credential_manager.py)
                 └─ _get_fernet`}
      </CodeBlock>

      <h3 id="flow-4">4. Custom Table Sync — Playwright fallback</h3>
      <CodeBlock language="text">
{`sync_custom_table (custom_table_syncer.py)
  └─ sync_via_playwright
       └─ _download_and_parse
            └─ _parse_excel_file / _parse_csv_file`}
      </CodeBlock>

      <h3 id="flow-5">5. Shopify Order Fulfillment (Bulk Update)</h3>
      <CodeBlock language="text">
{`run_fulfill (bulk_update/modules/fulfill_pipeline.py)
  └─ fulfill_order (shopify_fulfiller.py)
       └─ lookup_order
            └─ _shopify_request`}
      </CodeBlock>

      <Callout variant="tip" title="GitNexus is your friend">
        Project được index bằng <a href="https://github.com/Anthropic" target="_blank" rel="noreferrer">GitNexus</a>. Mở terminal trong repo cũ và chạy
        {" "}
        <code>npx gitnexus query &quot;your concept&quot;</code> để get process-grouped results.
        CLAUDE.md đã hướng dẫn dùng nó cho impact analysis trước khi sửa.
      </Callout>

      <PageNav href="/docs/architecture" />
    </>
  );
}
