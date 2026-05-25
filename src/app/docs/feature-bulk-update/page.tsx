import {
  Cable,
  Cloud,
  Database,
  FileSpreadsheet,
  Network,
  Server,
} from "lucide-react";
import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { FlowNode, FlowRow, Terminal, TerminalInline } from "@/components/docs/visuals";

export const metadata = { title: "Bulk Update — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Bulk Update Server"
        description="Flask backend cho /api/bulk/* — chạy trên Mac mini, accept Lark/Excel/CSV input, batch fulfillment."
      />

      <h2 id="why">Vì sao tách Flask khỏi Next.js?</h2>
      <div className="not-prose my-5 rounded-xl border bg-card p-4">
        <div className="font-semibold text-[14px] mb-2">3 lý do:</div>
        <ul className="space-y-2 text-[13px] leading-6">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-0.5">1.</span>
            <div>
              Bulk fulfillment thường <strong>&gt; 60s</strong> (Shopify 25 mutations/sec, 1000
              orders = ~40s + Lark read). Chạy qua Flask service riêng ổn định hơn Next.js route
              handler cho job dài và progress streaming.
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-0.5">2.</span>
            <div>Cần persistent Playwright session cho legacy paths.</div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-0.5">3.</span>
            <div>
              Cần parallel batch với progress streaming back qua SSE + direct write Excel file
              ra disk cho audit.
            </div>
          </li>
        </ul>
        <div className="mt-3 text-[13px] text-foreground/85">
          → Tách Flask <TerminalInline>sync/bulk_update/server.py</TerminalInline> chạy trên
          Mac mini, expose via Cloudflare tunnel hoặc Tailscale.
        </div>
      </div>

      <h2 id="topology">Topology — request đi đâu</h2>
      <div className="not-prose my-6 rounded-xl border bg-card p-4 sm:p-5">
        <FlowRow arrows="right">
          {[
            <FlowNode
              key="ui"
              icon={FileSpreadsheet}
              label="UI /bulk-update"
              sub="paste Lark / upload Excel"
              tone="sky"
            />,
            <FlowNode
              key="next"
              icon={Network}
              label="Next.js /api/bulk/[...path]"
              sub="proxy route"
              tone="violet"
            />,
            <FlowNode
              key="tunnel"
              icon={Cloud}
              label="Cloudflared tunnel"
              sub="bulk.patiagency.com"
              tone="amber"
            />,
            <FlowNode
              key="flask"
              icon={Server}
              label="Flask :5000"
              sub="Mac mini server.py"
              tone="emerald"
            />,
            <FlowNode
              key="db"
              icon={Database}
              label="Shopify Admin GraphQL"
              sub="batch 25 mutations"
              tone="pink"
            />,
          ]}
        </FlowRow>
      </div>

      <h2 id="proxy">Proxy code (Next.js side)</h2>
      <CodeBlock language="ts" filename="src/app/api/bulk/[...path]/route.ts">
{`export async function POST(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const url = \`\${process.env.BULK_SERVER_URL}/\${path.join("/")}\`;
  const body = await req.text();
  const response = await fetch(url, {
    method: "POST",
    body,
    headers: req.headers,
  });
  return new Response(response.body, response);
}`}
      </CodeBlock>

      <h2 id="modules">Flask modules</h2>
      <div className="not-prose my-5 rounded-xl border bg-card overflow-hidden">
        <ModuleRow
          name="fulfill_pipeline.py"
          purpose="Orchestrator — đọc input, dispatch sang shopify_fulfiller"
        />
        <ModuleRow name="shopify_fulfiller.py" purpose="Shopify REST fulfillment API calls" />
        <ModuleRow name="lark_reader.py" purpose="Lark Base reads — list_records pagination" />
        <ModuleRow name="excel_reader.py" purpose="XLSX/CSV parser (pandas)" />
        <ModuleRow name="paypal_syncer.py" purpose="PayPal transaction sync (legacy)" />
      </div>

      <h2 id="run-local">Run local</h2>
      <Terminal
        host="you@laptop"
        cwd="~/Coding/shopify-lark-sync"
        title="Một lệnh — Next dev + Flask cùng lúc"
        lines={[
          { prompt: "$", cmd: "bun run dev:full" },
          { divider: true, label: "expected" },
          { out: "[next] http://localhost:3000  ✓", tone: "ok" },
          { out: "[flask] http://localhost:5000 ✓", tone: "ok" },
        ]}
      />
      <Terminal
        host="you@laptop"
        cwd="~/Coding/shopify-lark-sync"
        title="Hoặc chạy thủ công"
        lines={[
          { prompt: "$", cmd: "python sync/bulk_update/server.py" },
          { divider: true, label: "listen" },
          { out: " * Running on http://127.0.0.1:5000", tone: "ok" },
        ]}
      />

      <Callout variant="warning" title="Production runs on Mac mini">
        Next.js web service KHÔNG host Flask server. Production{" "}
        <TerminalInline>BULK_SERVER_URL</TerminalInline> trỏ về{" "}
        <TerminalInline>https://bulk.patiagency.com</TerminalInline> (Cloudflared tunnel → Mac
        mini port 5000).
      </Callout>

      <h2 id="ui">UI — /bulk-update</h2>
      <div className="not-prose my-5 rounded-xl border bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <FileSpreadsheet className="h-4 w-4 text-foreground/70" />
          <div className="font-semibold text-[14px]">3 input mode</div>
        </div>
        <div className="grid sm:grid-cols-3 gap-2 text-[12.5px] mt-2">
          <div className="rounded border p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Cable className="h-3 w-3" />
              <div className="font-semibold">Lark Base URL</div>
            </div>
            <div className="text-muted-foreground">Paste link bảng Lark</div>
          </div>
          <div className="rounded border p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <FileSpreadsheet className="h-3 w-3" />
              <div className="font-semibold">Excel / CSV</div>
            </div>
            <div className="text-muted-foreground">Upload file</div>
          </div>
          <div className="rounded border p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Database className="h-3 w-3" />
              <div className="font-semibold">Order ID list</div>
            </div>
            <div className="text-muted-foreground">Plain text, 1 ID/dòng</div>
          </div>
        </div>
        <div className="mt-3 text-[13px] text-foreground/85 leading-6">
          Server stream progress line-by-line qua SSE. Errors show inline + link Shopify
          order admin URL.
        </div>
      </div>

      <PageNav href="/docs/feature-bulk-update" />
    </>
  );
}

function ModuleRow({ name, purpose }: { name: string; purpose: string }) {
  return (
    <div className="flex items-start gap-3 px-4 py-2.5 border-b last:border-b-0">
      <Cable className="h-3.5 w-3.5 text-foreground/70 shrink-0 mt-1" />
      <code className="font-mono text-[12.5px] font-semibold w-[200px] shrink-0">{name}</code>
      <div className="text-[12.5px] text-foreground/85">{purpose}</div>
    </div>
  );
}
