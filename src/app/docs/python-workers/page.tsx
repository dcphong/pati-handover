import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export const metadata = { title: "Python Workers — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Reference"
        title="Python Workers"
        description="Layout, setup, key modules, debugging."
      />

      <h2 id="layout">Layout</h2>
      <CodeBlock language="text" filename="sync/">
{`sync/
├── run.py                         # Main entry — daily Shopify pipeline
├── cron_sync.py                   # Multi-pipeline scheduler wrapper
├── modules/
│   ├── pipeline.py                # Shopify order sync orchestration
│   ├── shopify_fetcher.py         # Shopify REST pagination + rate limit
│   ├── supabase_pusher.py         # Batch upsert
│   ├── lark_pusher.py             # Lark bitable writer
│   ├── custom_table_syncer.py     # API + Playwright paths
│   ├── credential_manager.py      # Fernet encrypt/decrypt
│   ├── data_cleaner.py            # Dedup + null-key filter
│   └── github_actions.py          # workflow_dispatch trigger
├── report_sync/
│   ├── pipeline.py                # Flexport shipment sync
│   ├── scraper.py                 # Playwright/HTTP scraper
│   └── reports.py                 # Report parsing + normalisation
├── bulk_update/
│   ├── server.py                  # Flask HTTP server
│   └── modules/
│       ├── fulfill_pipeline.py    # Fulfillment orchestrator
│       ├── shopify_fulfiller.py   # Shopify fulfillment REST
│       ├── lark_reader.py         # Lark bitable reader
│       ├── excel_reader.py        # XLSX/CSV parser
│       └── paypal_syncer.py       # PayPal txn sync (legacy)
└── scripts/                       # One-off jobs (backfills, COGS sync, etc.)`}
      </CodeBlock>

      <h2 id="setup">Setup</h2>
      <p>
        <code>postinstall</code> tự tạo venv qua <code>scripts/setup-python.mjs</code>. Nếu
        cần manual:
      </p>
      <CodeBlock language="bash">
{`# Windows
python -m venv .venv-windows
.venv-windows\\Scripts\\activate
pip install -r sync/requirements.txt

# Linux / Mac
python3 -m venv .venv-linux
source .venv-linux/bin/activate
pip install -r sync/requirements.txt`}
      </CodeBlock>

      <h2 id="run">Run a pipeline</h2>
      <CodeBlock language="bash">
{`# Full daily sync
python sync/run.py

# Specific pipeline
python -m sync.modules.pipeline --shop e49d78-3.myshopify.com --since 2026-05-01

# Flexport
python sync/report_sync/pipeline.py

# Custom table
python -m sync.modules.custom_table_syncer --slug warehouses`}
      </CodeBlock>

      <h2 id="creds">Credential encryption</h2>
      <Callout variant="info">
        Custom table credentials lưu encrypted trong DB (<code>custom_table_sync_credentials</code>).
        Key Fernet: <code>SYNC_ENCRYPTION_KEY</code>. <strong>Nếu mất key</strong>, encrypted
        rows trở thành unrecoverable — phải re-enter credentials.
      </Callout>

      <CodeBlock language="python">
{`from sync.modules.credential_manager import encrypt, decrypt

cipher = encrypt({"api_key": "sk_...", "secret": "..."})
# -> base64 string, store in DB

plain = decrypt(cipher)
# -> dict back`}
      </CodeBlock>

      <h2 id="logging">Logging</h2>
      <p>
        Mọi pipeline write vào <code>sync_logs</code>: started_at, completed_at, rows_processed,
        status, error. Tail logs:
      </p>
      <CodeBlock language="sql">
{`SELECT pipeline, shop_id, status, rows_processed, error, started_at
FROM master_app.sync_logs
WHERE started_at > NOW() - INTERVAL '1 day'
ORDER BY started_at DESC;`}
      </CodeBlock>

      <h2 id="rate-limits">Rate limits — Shopify</h2>
      <ul>
        <li>Burst 40 req/s, sustained 2 req/s (Plus plan: 4/s).</li>
        <li><code>shopify_fetcher</code> respects <code>X-Shopify-Shop-Api-Call-Limit</code> header và back off khi {`>`} 30/40.</li>
        <li>GraphQL cost limit 1000 points/s. Single FO query ~5 points.</li>
      </ul>

      <h2 id="idempotency">Idempotency</h2>
      <p>
        <code>_batch_upsert</code> dùng ON CONFLICT DO UPDATE. Tất cả pipeline có thể re-run an
        toàn miễn là cùng date window. Append-only pipelines (e.g., Lark Mail Mac mini cron)
        cần dedup logic ở DB layer trigger.
      </p>

      <PageNav href="/docs/python-workers" />
    </>
  );
}
