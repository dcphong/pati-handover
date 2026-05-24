import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export const metadata = { title: "Best Fulfillment — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Best Fulfillment Shipping"
        description="CSV → DB. No Lark API at runtime — ops exports manually."
      />

      <h2 id="flow">Manual export, scripted import</h2>
      <p>
        Best (Việt Nam) cập nhật rate card trên Lark Base. Quy trình:
      </p>
      <ol>
        <li>Ops mở Lark Base table &quot;Shipping Rate Card&quot;.</li>
        <li>
          Export CSV → save về <code>docs/fulfillment/bestfulfill/BEST_SHIPPING_COST.csv</code>
          trong repo.
        </li>
        <li>
          Run <code>python scripts/import-best-shipping-rates.py</code> để upsert vào DB.
        </li>
      </ol>

      <h2 id="script">Import script</h2>
      <CodeBlock language="bash">
{`# Run from repo root
python scripts/import-best-shipping-rates.py \\
  --csv docs/fulfillment/bestfulfill/BEST_SHIPPING_COST.csv \\
  --shop-id e49d78-3.myshopify.com`}
      </CodeBlock>

      <h2 id="schema">Schema</h2>
      <CodeBlock language="sql">
{`master_app.bestfulfill_shipping_rates (
  destination_country  TEXT,
  service_level        TEXT,             -- 'standard', 'express', 'economy'
  weight_min_g         INT,
  weight_max_g         INT,
  rate_usd             NUMERIC,
  effective_from       DATE,
  effective_to         DATE NULL,
  source_csv           TEXT,             -- file hash for audit
  PRIMARY KEY (destination_country, service_level, weight_min_g, effective_from)
)`}
      </CodeBlock>

      <Callout variant="info" title="No live Lark API call">
        Vì rate card đổi không thường xuyên (~1× tháng) và schema messy (merged cells trong
        Lark), pipeline live API tốn effort không xứng đáng. CSV manual + import script là
        trade-off đúng. Memo: <code>reference_best_fulfillment_shipping_lark</code>.
      </Callout>

      <h2 id="usage">Where DB is read</h2>
      <p>
        <code>raw_orders</code> shipping_cost lookup join table này via <code>(country,
        service_level, weight)</code>. Dùng trong P&amp;L card &quot;Shipping Costs&quot;.
      </p>

      <PageNav href="/docs/feature-bestfulfill" />
    </>
  );
}
