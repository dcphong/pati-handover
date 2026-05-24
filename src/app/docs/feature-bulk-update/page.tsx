import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export const metadata = { title: "Bulk Update — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Bulk Update Server"
        description="Flask backend cho /api/bulk/* proxy. Input: Lark, Excel, CSV."
      />

      <h2 id="why">Why a separate Flask server</h2>
      <p>
        Bulk fulfillment thường &gt; 60s (Shopify 25 mutations/sec, 1000 orders = ~40s + Lark
        read time). Vercel function limit 300s (Fluid Compute) đủ, nhưng:
      </p>
      <ul>
        <li>Cần persistent Playwright session (legacy paths).</li>
        <li>Cần parallel batch với progress streaming back qua SSE.</li>
        <li>Cần direct write Excel file ra disk cho audit.</li>
      </ul>
      <p>
        → Tách Flask <code>sync/bulk_update/server.py</code> chạy trên Mac mini, expose via
        Cloudflare tunnel hoặc Tailscale.
      </p>

      <h2 id="proxy">Proxy from Next.js</h2>
      <CodeBlock language="ts" filename="src/app/api/bulk/[...path]/route.ts">
{`export async function POST(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const url = \`\${process.env.BULK_SERVER_URL}/\${path.join("/")}\`;
  const body = await req.text();
  const response = await fetch(url, { method: "POST", body, headers: req.headers });
  return new Response(response.body, response);
}`}
      </CodeBlock>

      <h2 id="modules">Modules</h2>
      <ul>
        <li><code>fulfill_pipeline.py</code> — orchestrator</li>
        <li><code>shopify_fulfiller.py</code> — Shopify REST fulfillment</li>
        <li><code>lark_reader.py</code> — Lark Base reads</li>
        <li><code>excel_reader.py</code> — XLSX/CSV parser</li>
        <li><code>paypal_syncer.py</code> — PayPal transaction sync (legacy)</li>
      </ul>

      <h2 id="run-local">Run local</h2>
      <CodeBlock language="bash">
{`# In one terminal
bun run dev:full
# → Spawns Next dev + Flask via scripts/start-bulk.mjs

# Manually
python sync/bulk_update/server.py
# Listens on :5000`}
      </CodeBlock>

      <Callout variant="warning" title="Production runs on Mac mini">
        Vercel KHÔNG host Flask server. Production <code>BULK_SERVER_URL</code> trỏ về{" "}
        <code>https://bulk.patiagency.com</code> (Cloudflared tunnel → Mac mini port 5000).
      </Callout>

      <h2 id="ui">UI</h2>
      <p>
        <code>/bulk-update</code> — paste link Lark Base hoặc upload Excel. Server stream progress
        line-by-line. Errors show inline với link tới Shopify order admin URL.
      </p>

      <PageNav href="/docs/feature-bulk-update" />
    </>
  );
}
