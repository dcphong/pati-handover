import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export const metadata = { title: "VNH / NS3 Fulfillment — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="VNH / NS3 Fulfillment"
        description="Flexport Logistics API + Lark warehouse routing + auto-submit stuck FOs."
      />

      <h2 id="vocab">Vocab</h2>
      <ul>
        <li><strong>VNH</strong> — Việt Nam Hà Nội warehouse (Flexport partner).</li>
        <li><strong>NS3</strong> — North Star #3 (Stock Cover). Cũng là codename cho US warehouse routing.</li>
        <li><strong>FO</strong> — Shopify Fulfillment Order (1 order → N FOs nếu split allocation).</li>
      </ul>

      <h2 id="flexport-api">Flexport — REST API only</h2>
      <Callout variant="success" title="2026-05-20: Playwright scraper retired">
        Replaced với Flexport Logistics API REST. Single env var <code>FLEXPORT_API_TOKEN</code>.
        Per-warehouse stock via <code>POST /products/warehouse</code>. NS#3 = 100% healthy sau switch.
        Memo: <code>reference_flexport_logistics_api</code>.
      </Callout>

      <CodeBlock language="bash">
{`curl https://logistics-api.flexport.com/products/warehouse \\
  -H "Authorization: Bearer $FLEXPORT_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"warehouse_id":"...", "skus":["WN001", "WN002"]}'`}
      </CodeBlock>

      <h2 id="auto-submit">Auto-submit stuck FOs</h2>
      <p>
        Khi Shopify split allocation, một số FO có thể stuck ở <code>UNSUBMITTED</code> tại
        Flexport. Hourly cron tìm + click &quot;Request fulfillment&quot;:
      </p>
      <CodeBlock language="ts">
{`// Action enum = REQUEST_FULFILLMENT (KHÔNG phải mutation name)
const mutation = \`
  mutation FOAction($id: ID!) {
    fulfillmentOrderSubmitFulfillmentRequest(id: $id) {
      submittedFulfillmentOrder { id status }
      userErrors { message }
    }
  }
\`;`}
      </CodeBlock>

      <p>
        Default age gate: 30 ngày. Cron: <code>shopify_fulfillment_sync.yml</code> hoặc Mac mini
        cron entry tương ứng.
      </p>

      <h2 id="routing">Lark warehouse routing</h2>
      <p>
        Authoritative routing table sống ở Lark Base <code>tblNQrmGRQFDkkPu</code> (14k rows).
        Mapping: customer email pattern + product SKU → warehouse choice. Sync vào{" "}
        <code>master_app.warehouse_routing</code> daily.
      </p>

      <h2 id="ui-routes">UI routes</h2>
      <ul>
        <li><code>/vnh-fulfill</code> — VNH bulk fulfill page</li>
        <li><code>/portfolio/stock-cover</code> — NS3 dashboard</li>
        <li><code>/inventory</code> — Cross-warehouse inventory snapshot</li>
        <li><code>/workflows/shipmonk</code> — Optional ShipMonk pipeline (kept, infrequent use)</li>
      </ul>

      <h2 id="bulk-fulfill">Bulk fulfillment via Flask</h2>
      <p>
        <code>/api/bulk/[...path]</code> proxy về Flask server (Mac mini cron-managed). Accept:
      </p>
      <ul>
        <li>Lark Base table URL — read rows</li>
        <li>Excel/CSV upload — parse cột tracking/order/customer</li>
        <li>Direct order ID list</li>
      </ul>
      <p>Flask server gọi Shopify Admin GraphQL mutate fulfillments theo batch 25.</p>

      <PageNav href="/docs/feature-fulfillment" />
    </>
  );
}
