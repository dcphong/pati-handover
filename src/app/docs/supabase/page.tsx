import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export const metadata = { title: "Supabase Connection — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Getting Started"
        title="Supabase Connection"
        description="Self-host trên Mac mini, schema master_app, RLS gotchas."
      />

      <h2 id="what">What you're connecting to</h2>
      <p>
        Production Supabase <strong>không phải</strong> Supabase Cloud. Stack chạy bằng Docker
        Compose trên Mac mini ở nhà (M4/16GB, từ 2026-05-10), expose ra internet qua Cloudflared
        tunnel:
      </p>
      <table>
        <tbody>
          <tr>
            <td>
              <strong>Public URL</strong>
            </td>
            <td>
              <code>https://supabase.patiagency.com</code>
            </td>
          </tr>
          <tr>
            <td>
              <strong>Tailscale IP</strong>
            </td>
            <td>
              <code>100.94.220.128</code> (intra-team only)
            </td>
          </tr>
          <tr>
            <td>
              <strong>SSH user</strong>
            </td>
            <td>
              <code>timcook</code>
            </td>
          </tr>
          <tr>
            <td>
              <strong>Docker engine</strong>
            </td>
            <td>Colima VM</td>
          </tr>
        </tbody>
      </table>

      <Callout variant="warning" title="Colima KHÔNG auto-start sau reboot">
        Nếu Mac mini bị restart, Colima VM phải khởi động lại bằng tay (
        <code>colima start</code>). Triệu chứng: 502 tunnel, supabase.patiagency.com unreachable.
        SSH vào Mac mini và chạy <code>colima start</code> để cứu.
      </Callout>

      <h2 id="schema">Schema layout — master_app</h2>
      <p>
        Self-host này host nhiều project. PATI sống trong schema riêng:{" "}
        <code>master_app</code> (rename từ <code>public</code> ngày 2026-05-14). Các project
        khác như <code>lark_email</code> dùng schema khác cùng instance.
      </p>
      <CodeBlock language="ts" filename="src/lib/supabase.ts">
{`import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    // CRITICAL — supabase-js mặc định Accept-Profile: public
    db: { schema: "master_app" },
  }
);`}
      </CodeBlock>

      <Callout variant="danger" title="The Accept-Profile gotcha">
        Mỗi <code>createClient</code> phải pass <code>db.schema = &quot;master_app&quot;</code>{" "}
        explicitly. Nếu quên, supabase-js gửi <code>Accept-Profile: public</code> → PostgREST
        đọc schema <code>public</code> (empty placeholder) → return <code>[]</code> trông y hệt
        như table empty. Đã có memory <code>reference_supabase_js_schema_default</code>.
      </Callout>

      <h2 id="anon-vs-service">Anon vs Service-role keys</h2>
      <table>
        <thead>
          <tr>
            <th>Key</th>
            <th>Used by</th>
            <th>RLS</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
            </td>
            <td>Client-side hooks, react-query</td>
            <td>Enforced</td>
          </tr>
          <tr>
            <td>
              <code>SUPABASE_SERVICE_KEY</code>
            </td>
            <td>Server-side API routes, Python workers, cron</td>
            <td>Bypassed</td>
          </tr>
        </tbody>
      </table>

      <Callout variant="warning" title="RLS anon-trap">
        Tables trong <code>master_app</code> có RLS = ON nhưng <strong>không có policy</strong>.
        Anon reads sẽ return <code>[]</code> giống y hệt table empty thật. Khi debug, xác nhận
        bằng service-role key hoặc <code>docker exec psql</code> trước khi kết luận &quot;broken&quot;.
      </Callout>

      <h2 id="postgrest-cache">PostgREST schema cache lag</h2>
      <p>
        Self-host PostgREST có thể lag 6–15 phút sau khi thêm column hoặc constraint mới.{" "}
        <code>NOTIFY pgrst, &apos;reload schema&apos;</code> không phải lúc nào cũng force được. Workaround:
      </p>
      <ul>
        <li>
          DROP + CREATE constraint thay vì ALTER. Cho nullable conflict targets, dùng{" "}
          <code>UNIQUE NULLS NOT DISTINCT</code>.
        </li>
        <li>
          Restart PostgREST container:{" "}
          <code>docker restart supabase-rest</code> trên Mac mini.
        </li>
        <li>
          Fallback: gọi RPC trực tiếp. Ví dụ <code>upsert_ad_spend_batch</code> đã tồn tại làm
          fallback nếu PostgREST chưa nhận column mới.
        </li>
      </ul>

      <h2 id="row-cap">1000-row silent cap</h2>
      <p>
        <code>PGRST_DB_MAX_ROWS = 1000</code> trên self-host. Bare <code>.select()</code> SILENT
        TRUNCATE ở 1000 rows. Bug nổi tiếng: CS Dashboard refund-rate đã show 34.3% vs true
        5.56% vì query refunds bị cap. Luôn dùng <code>pageAll()</code> helper khi aggregate:
      </p>
      <CodeBlock language="ts">
{`import { pageAll } from "@/lib/supabase";

const refunds = await pageAll(supabase
  .from("raw_refunds")
  .select("id, amount, created_at")
  .gte("created_at", startISO));`}
      </CodeBlock>

      <h2 id="direct-pg">Direct Postgres (psql / pg-direct MCP)</h2>
      <p>
        Khi cần SQL trực tiếp (DDL, một-off backfill, view debug), connect qua connection
        pooler. Sếp đã host pati-supabase MCP cho Claude. Còn nếu dùng psql:
      </p>
      <CodeBlock language="bash">
{`# SSH tunnel via Tailscale
ssh timcook@100.94.220.128
docker exec -it supabase-db psql -U postgres

# Inside psql
SET search_path TO master_app, public;
\\dt   -- list tables`}
      </CodeBlock>

      <h2 id="key-tables">Key tables (quick map)</h2>
      <p>
        Full schema ở <a href="/docs/database">Database Schema</a>. Mấy table quan trọng nhất:
      </p>
      <ul>
        <li>
          <code>shopify_orders</code> — SoT cho orders. <code>shop_id</code> column scope
          multi-store.
        </li>
        <li>
          <code>shopify_orders.variant_sku</code> — blank SKUs dùng sentinel{" "}
          <code>__no_sku__:{`{line_item_id}`}</code>; filter{" "}
          <code>NOT LIKE &apos;__no_sku__:%&apos;</code> cho real-SKU queries.
        </li>
        <li>
          <code>raw_orders</code>, <code>raw_refunds</code>, <code>raw_ad_spend</code> —
          analytics base tables.
        </li>
        <li>
          <code>v_stvf</code> — Single-Table View Function (materialised) cho TW parity.
        </li>
        <li>
          <code>cogs_full_catalog</code> — Lark per-PO COGS (AUTHORITATIVE).
        </li>
        <li>
          <code>bestfulfill_shipping_rates</code> — Best fulfillment rate card.
        </li>
        <li>
          <code>customer_profiles</code> — CS note + customer_type tag.
        </li>
      </ul>

      <PageNav href="/docs/supabase" />
    </>
  );
}
