import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export const metadata = { title: "COGS Catalog — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="COGS Catalog"
        description="Two tables. Lark per-PO is authoritative. Analytics MUST join it."
      />

      <h2 id="two-sources">Two COGS sources</h2>
      <table>
        <thead><tr><th>Source</th><th>Table</th><th>Authority</th></tr></thead>
        <tbody>
          <tr>
            <td>Shopify Admin variants.inventory_item.cost</td>
            <td><code>raw_variants.cost</code></td>
            <td>Partial — production only</td>
          </tr>
          <tr>
            <td>Lark Base per-PO breakdown</td>
            <td><code>cogs_full_catalog</code></td>
            <td><strong>AUTHORITATIVE</strong></td>
          </tr>
        </tbody>
      </table>

      <Callout variant="danger" title="Join Lark, not Shopify">
        Analytics queries MUST join <code>cogs_full_catalog</code>. Nếu chỉ join{" "}
        <code>raw_variants.cost</code> → undercount ~70% vì Shopify cost field bỏ qua: barcode
        fees, lab fees, transport, designer fees, fulfillment fees. Memo:{" "}
        <code>project_cogs_catalog_pipeline</code>.
      </Callout>

      <h2 id="schema">cogs_full_catalog schema</h2>
      <CodeBlock language="sql">
{`master_app.cogs_full_catalog (
  variant_sku       TEXT,
  po_number         TEXT,
  unit_cost         NUMERIC,       -- production unit cost
  barcode_cost      NUMERIC,
  lab_cost          NUMERIC,
  transport_cost    NUMERIC,
  designer_cost     NUMERIC,
  fulfillment_cost  NUMERIC,
  effective_from    DATE,
  effective_to      DATE NULL,     -- NULL = active
  source            TEXT,          -- 'lark_base'
  PRIMARY KEY (variant_sku, po_number, effective_from)
)`}
      </CodeBlock>

      <h2 id="join">Correct join</h2>
      <CodeBlock language="sql">
{`-- Join orders → effective COGS at order date
SELECT
  o.id,
  o.variant_sku,
  (c.unit_cost + c.barcode_cost + c.lab_cost
    + c.transport_cost + c.designer_cost + c.fulfillment_cost) AS true_cogs
FROM master_app.raw_orders o
LEFT JOIN LATERAL (
  SELECT *
  FROM master_app.cogs_full_catalog c
  WHERE c.variant_sku = o.variant_sku
    AND c.effective_from <= o.created_at::date
    AND (c.effective_to IS NULL OR c.effective_to > o.created_at::date)
  ORDER BY c.effective_from DESC
  LIMIT 1
) c ON TRUE
WHERE o.shop_id = 'e49d78-3.myshopify.com';`}
      </CodeBlock>

      <h2 id="sync">Sync</h2>
      <p>
        Daily cron pulls Lark Base table (PO Management → COGS rollup) qua{" "}
        <code>lark_reader.py</code>, upsert qua <code>scripts/cogs-full-catalog-sync.py</code>.
        Khi sếp / ops update Lark Base row, next sync (≤ 24h) pickup.
      </p>

      <h2 id="manual">Manual refresh sau khi ops update</h2>
      <CodeBlock language="bash">
{`# From repo root
bun run cogs:sync

# Or directly
python sync/scripts/cogs_full_catalog_sync.py --shop-id e49d78-3.myshopify.com`}
      </CodeBlock>

      <h2 id="ui">UI</h2>
      <p>
        <code>/portfolio/cogs</code> shows per-variant unified view với breakdown chips
        (Production / Barcode / Lab / Transport / Designer / Fulfillment). Sort + filter by SKU,
        PO, date range.
      </p>

      <PageNav href="/docs/feature-cogs" />
    </>
  );
}
