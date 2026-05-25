import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import {
  FileTree,
  type TreeNode,
  Step,
  Steps,
  StepCheck,
  Terminal,
  TerminalInline,
} from "@/components/docs/visuals";

export const metadata = { title: "Python Workers — PATI Handover" };

const tree: TreeNode = {
  name: "sync/",
  kind: "dir",
  children: [
    { name: "run.py", hint: "Main entry — daily Shopify pipeline", highlight: true },
    { name: "cron_sync.py", hint: "Multi-pipeline scheduler wrapper" },
    {
      name: "modules/",
      kind: "dir",
      children: [
        { name: "pipeline.py", hint: "Shopify order sync orchestration", highlight: true },
        { name: "shopify_fetcher.py", hint: "Shopify REST pagination + rate limit" },
        { name: "supabase_pusher.py", hint: "Batch upsert (hot path)", highlight: true },
        { name: "lark_pusher.py", hint: "Lark bitable writer" },
        { name: "custom_table_syncer.py", hint: "API + Playwright paths" },
        { name: "credential_manager.py", hint: "Fernet encrypt/decrypt" },
        { name: "data_cleaner.py", hint: "Dedup + null-key filter" },
        { name: "github_actions.py", hint: "workflow_dispatch trigger" },
      ],
    },
    {
      name: "report_sync/",
      kind: "dir",
      children: [
        { name: "pipeline.py", hint: "Flexport shipment sync" },
        { name: "scraper.py", hint: "Playwright/HTTP scraper" },
        { name: "reports.py", hint: "Report parsing + normalisation" },
      ],
    },
    {
      name: "bulk_update/",
      kind: "dir",
      children: [
        { name: "server.py", hint: "Flask HTTP server" },
        {
          name: "modules/",
          kind: "dir",
          children: [
            { name: "fulfill_pipeline.py", hint: "Fulfillment orchestrator" },
            { name: "shopify_fulfiller.py", hint: "Shopify fulfillment REST" },
            { name: "lark_reader.py", hint: "Lark bitable reader" },
            { name: "excel_reader.py", hint: "XLSX/CSV parser" },
            { name: "paypal_syncer.py", hint: "PayPal txn sync (legacy)" },
          ],
        },
      ],
    },
    { name: "scripts/", kind: "dir", hint: "One-off jobs (backfills, COGS sync, etc.)" },
  ],
};

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Reference"
        title="Python Workers"
        description="Layout sync/, cách setup venv, chạy pipeline, debug. Worker binary tách biệt với Next.js — WRITE-only vào Supabase."
      />

      <h2 id="layout">Cấu trúc folder</h2>
      <p>
        File highlighted vàng là file bạn sẽ touch khi debug 90% trường hợp:
      </p>
      <FileTree root={tree} />

      <h2 id="setup">Setup venv — 1 lần đầu</h2>
      <Callout variant="info" title="Postinstall đã tự làm">
        Sau khi <TerminalInline>bun install</TerminalInline> ở root, script{" "}
        <TerminalInline>scripts/setup-python.mjs</TerminalInline> tự tạo venv. Bước dưới chỉ
        cần khi venv corrupt hoặc thiếu package.
      </Callout>

      <Steps>
        <Step n={1} title="Tạo venv (theo OS)">
          <Terminal
            host="you@laptop"
            cwd="~/Coding/shopify-lark-sync"
            title="Windows"
            lines={[
              { prompt: "$", cmd: "python -m venv .venv-windows" },
              { prompt: "$", cmd: ".venv-windows\\Scripts\\activate" },
            ]}
          />
          <Terminal
            host="you@laptop"
            cwd="~/Coding/shopify-lark-sync"
            title="Mac / Linux"
            lines={[
              { prompt: "$", cmd: "python3 -m venv .venv-linux" },
              { prompt: "$", cmd: "source .venv-linux/bin/activate" },
            ]}
          />
        </Step>
        <Step n={2} title="Install requirements">
          <Terminal
            host="you@laptop"
            cwd="~/Coding/shopify-lark-sync"
            lines={[
              { prompt: "(.venv) $", cmd: "pip install -r sync/requirements.txt" },
              { divider: true, label: "expected" },
              { out: "Installed 47 packages (...)", tone: "ok" },
            ]}
          />
          <StepCheck>
            <TerminalInline>python -c &quot;import requests, supabase&quot;</TerminalInline> chạy
            không error.
          </StepCheck>
        </Step>
      </Steps>

      <h2 id="run">Chạy 1 pipeline</h2>
      <div className="not-prose my-5 space-y-3">
        <RunCard
          title="Full daily sync (toàn bộ)"
          desc="Chạy mọi pipeline tuần tự — như Mac mini cron 2× ngày."
          cmd="python sync/run.py"
        />
        <RunCard
          title="Shopify only — specific shop + since"
          desc="Re-fetch date window. Useful khi backfill."
          cmd="python -m sync.modules.pipeline --shop e49d78-3.myshopify.com --since 2026-05-01"
        />
        <RunCard
          title="Flexport report sync"
          desc="2× ngày bình thường, manual khi cần force."
          cmd="python sync/report_sync/pipeline.py"
        />
        <RunCard
          title="Custom table sync (1 slug)"
          desc="Lark bitable hoặc API path tuỳ slug có credentials."
          cmd="python -m sync.modules.custom_table_syncer --slug warehouses"
        />
      </div>

      <h2 id="creds">Mã hoá credentials</h2>
      <Callout variant="warning" title="Mất key = mất credentials">
        Custom-table credentials lưu encrypted trong DB ({" "}
        <TerminalInline>custom_table_sync_credentials</TerminalInline>). Key Fernet:{" "}
        <TerminalInline>SYNC_ENCRYPTION_KEY</TerminalInline>. <strong>Nếu mất key</strong>,
        encrypted rows trở thành unrecoverable — phải re-enter credentials thủ công.
      </Callout>

      <CodeBlock language="python">
{`from sync.modules.credential_manager import encrypt, decrypt

# Encrypt khi nhập credentials mới
cipher = encrypt({"api_key": "sk_...", "secret": "..."})
# -> base64 string, store in DB

# Decrypt khi sync chạy
plain = decrypt(cipher)
# -> dict back`}
      </CodeBlock>

      <h2 id="logging">Logging — debug đầu tiên xem đây</h2>
      <p>
        Mọi pipeline ghi vào <TerminalInline>master_app.sync_logs</TerminalInline>:{" "}
        started_at, completed_at, rows_processed, status, error. Tail logs gần đây:
      </p>
      <Terminal
        host="postgres"
        cwd="psql"
        lines={[
          { prompt: "psql>", cmd: "SELECT pipeline, shop_id, status, rows_processed," },
          { prompt: "", cmd: "       error, started_at" },
          { prompt: "", cmd: "FROM master_app.sync_logs" },
          { prompt: "", cmd: "WHERE started_at > NOW() - INTERVAL '1 day'" },
          { prompt: "", cmd: "ORDER BY started_at DESC;" },
        ]}
      />

      <h2 id="rate-limits">Rate limit Shopify</h2>
      <div className="not-prose my-5 grid sm:grid-cols-3 gap-3">
        <LimitCard
          metric="40 req/s"
          label="Burst"
          desc="Plus plan: 80/s. Shopify trả 429 nếu vượt."
        />
        <LimitCard
          metric="2 req/s"
          label="Sustained"
          desc="Plus plan: 4/s. shopify_fetcher tự back off khi > 30/40."
        />
        <LimitCard
          metric="1000 pts/s"
          label="GraphQL"
          desc="Cost limit per query. FO query ~5 points."
        />
      </div>

      <h2 id="idempotency">Idempotency — re-run an toàn?</h2>
      <Callout variant="info" title="ON CONFLICT DO UPDATE">
        Tất cả <TerminalInline>_batch_upsert</TerminalInline> dùng{" "}
        <TerminalInline>ON CONFLICT DO UPDATE</TerminalInline>. Mọi pipeline có thể re-run an
        toàn miễn là <strong>cùng date window</strong>. Append-only pipelines (như Lark Mail
        Mac mini cron) cần dedup logic ở DB trigger layer.
      </Callout>

      <PageNav href="/docs/python-workers" />
    </>
  );
}

function RunCard({
  title,
  desc,
  cmd,
}: {
  title: string;
  desc: string;
  cmd: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-3.5">
      <div className="font-semibold text-[14px] mb-0.5">{title}</div>
      <div className="text-[12.5px] text-muted-foreground leading-5 mb-2">{desc}</div>
      <code className="block font-mono text-[12px] bg-zinc-950 text-zinc-100 rounded px-2.5 py-1.5 border border-zinc-800 overflow-x-auto">
        <span className="text-emerald-400 mr-2 select-none">$</span>
        {cmd}
      </code>
    </div>
  );
}

function LimitCard({
  metric,
  label,
  desc,
}: {
  metric: string;
  label: string;
  desc: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-3.5">
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
        {label}
      </div>
      <div className="font-mono text-[20px] font-bold mt-1">{metric}</div>
      <div className="text-[12.5px] text-muted-foreground leading-5 mt-1.5">{desc}</div>
    </div>
  );
}
