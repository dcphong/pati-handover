import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export const metadata = { title: "Lark Base Sync — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Core Features"
        title="Lark Base Sync"
        description="Bidirectional bitable I/O. 42 tables. The COGS source of truth lives here."
      />

      <h2 id="apps">Lark apps</h2>
      <p>
        Hai Lark app riêng (đăng ký khác nhau trên Lark Developer console):
      </p>
      <ul>
        <li>
          <strong>PATI Sync Hub</strong> — <code>LARK_APP_ID</code> primary. Permission cho
          bitable read/write, drive read.
        </li>
        <li>
          <strong>Lark Mail bot</strong> — <code>LARK_MAIL_APP_ID</code>. Tách riêng vì mail API
          cần scope khác và chạy như background user.
        </li>
      </ul>

      <Callout variant="info" title="Domain = open.larksuite.com">
        PATI dùng Lark version Singapore/International. Domain là <code>open.larksuite.com</code>,
        không phải <code>open.feishu.cn</code>. Đặt sai sẽ 404 mọi API.
      </Callout>

      <h2 id="base">Lark Base — what we read</h2>
      <p>
        Lark Base token (app token) primary:{" "}
        <code className="text-[12px]">F6Srwr8GFiAeikktdBeldixpgNg</code>. 42 tables, gồm các
        category:
      </p>
      <ul>
        <li>Purchase Order Management — POs, suppliers, lab tests, transport, designer fees</li>
        <li>COGS Catalog — per-PO cost breakdown (AUTHORITATIVE)</li>
        <li>Fulfillment routing — VNH/NS3 mapping</li>
        <li>Shipping rate cards — Best fulfillment</li>
        <li>Inventory snapshots</li>
        <li>CS templates &amp; SOPs</li>
      </ul>

      <h2 id="reader">lark_reader.py</h2>
      <CodeBlock language="python" filename="sync/modules/bulk_update/lark_reader.py">
{`from sync.modules.bulk_update.lark_reader import LarkReader

reader = LarkReader(app_id, app_secret, domain="open.larksuite.com")
rows = reader.read_table(
    app_token="F6Srwr8GFiAeikktdBeldixpgNg",
    table_id="tblNQrmGRQFDkkPu",
    field_names=["Customer Email", "Tracking", "Warehouse"],
)`}
      </CodeBlock>
      <p>
        Token tự refresh sau mỗi 2 tiếng. Bitable API: <code>list_records</code> page size
        500, dùng <code>page_token</code> để paginate.
      </p>

      <h2 id="writer">lark_pusher.py</h2>
      <CodeBlock language="python">
{`from sync.modules.lark_pusher import LarkPusher

pusher = LarkPusher(app_id, app_secret)
pusher.batch_create(
    app_token="...",
    table_id="...",
    records=[{"fields": {...}}, ...],
)`}
      </CodeBlock>

      <h2 id="bulk-import">Bulk import + menu placement</h2>
      <Callout variant="warning" title="Don't dump at sidebar root">
        Khi bulk-import nhiều Lark tables, chúng <strong>phải nest dưới group menu</strong>{" "}
        đúng (e.g., Purchase Order Management). Phải strip prefix Lark&apos;s &quot;N.&quot; /
        &quot;N.N.&quot; và pick icon domain-appropriate. <strong>Never</strong> dump tất cả
        ở sidebar root hoặc dùng Database icon làm blanket. Memo:{" "}
        <code>feedback_lark_menu_placement</code>.
      </Callout>

      <h2 id="bitable-app-script">Sync vs bitable AppScript</h2>
      <p>
        Lark Base có App Script built-in cho automation đơn giản. Nhưng tất cả production
        sync data → DB của PATI <strong>luôn đi qua Python lark_pusher</strong>, không qua App
        Script. Lý do: App Script không có Supabase service-role auth, và không có sync_logs
        observability.
      </p>

      <h2 id="cogs-overwrite">COGS source-of-truth</h2>
      <Callout variant="danger" title="cogs_full_catalog wins, not raw_variants.cost">
        Shopify Admin có <code>variants.inventory_item.cost</code> nhưng chỉ partial coverage.
        Lark Base <code>cogs_full_catalog</code> capture per-PO breakdown + barcode + lab +
        transport + designer + fulfillment. Analytics MUST join Lark version, không thì
        undercount ~70%. Chi tiết: <a href="/docs/feature-cogs">COGS Catalog</a>.
      </Callout>

      <h2 id="ui-routes">UI routes</h2>
      <ul>
        <li><code>/lark-mail-reconcile</code> — Lark Mail reconcile + CS panel</li>
        <li><code>/lark-mail-reconcile/admin</code> — legacy admin (kept for fallback)</li>
        <li><code>/custom/[slug]</code> — bất kỳ Lark table nào được mapped qua <code>custom_menus</code></li>
      </ul>

      <PageNav href="/docs/feature-lark" />
    </>
  );
}
