import {
  Cable,
  Database,
  DollarSign,
  Package,
  ShoppingBag,
} from "lucide-react";
import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { ExternalLinkCard } from "@/components/docs/external-link-card";
import {
  FlowNode,
  FlowRow,
  Terminal,
  TerminalInline,
} from "@/components/docs/visuals";
import { LARK } from "@/lib/external-links";

export const metadata = { title: "COGS Catalog — PATI Handover" };

const breakdownChips = [
  { label: "Production unit", desc: "Cost từ supplier" },
  { label: "Barcode", desc: "Phí gắn mã" },
  { label: "Lab fee", desc: "Test mẫu / chứng nhận" },
  { label: "Transport", desc: "Vận chuyển PO → kho" },
  { label: "Designer", desc: "Phí thiết kế / artwork" },
  { label: "Fulfillment", desc: "Phí pick/pack" },
];

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="COGS Catalog"
        description="Giá vốn sản phẩm gom từ Lark Base, làm nền cho mọi báo cáo lợi nhuận. Sai ở đây thì P&L sai theo."
      />

      <div className="my-5">
        <ExternalLinkCard
          href={LARK.cogs}
          title="Mở COGS Lark Base — nguồn ops nhập giá vốn"
          pathHint="wiki/JhiDwNmtwizHQ6kTV8slDMJZgOr?table=tblSsTpnEZoAnqEu"
          desc="Per-shipment COGS catalog — ops nhập 6 chi phí (production, barcode, lab, transport, designer, fulfillment). Sync về master_app.cogs_full_catalog mỗi ngày 06:30 ICT."
          icon={Database}
        />
      </div>

      {/* ─────────── USER MODE ─────────── */}
      <section data-user-detail>
        <h2 id="user-overview">Đại ý</h2>
        <p>
          Giá vốn một sản phẩm gồm 6 khoản: <strong>sản xuất, barcode, lab, vận chuyển PO,
          designer, fulfillment</strong>. Ops nhập đầy đủ trên Lark Base; hệ thống đọc về và
          dùng cho mọi báo cáo lợi nhuận trên dashboard.
        </p>
        <div className="not-prose my-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {breakdownChips.map((c) => (
            <div key={c.label} className="rounded-lg border bg-card p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <DollarSign className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <div className="font-semibold text-[13px]">{c.label}</div>
              </div>
              <div className="text-[12px] text-muted-foreground leading-5">{c.desc}</div>
            </div>
          ))}
        </div>

        <h2 id="user-trust">Tin số nào, đừng tin số nào</h2>
        <Callout variant="warning" title="Số trên Shopify Admin (cost field) chỉ là 1 phần">
          Shopify chỉ lưu cost sản xuất (production). Báo cáo lợi nhuận nếu chỉ đọc Shopify sẽ
          ăn gian cost ~70%. Số đúng <strong>luôn lấy từ Lark Base per-PO</strong>, vì có đủ 6
          khoản.
        </Callout>

        <h2 id="user-update">Khi cần sửa giá vốn</h2>
        <ul>
          <li>
            Sửa hàng (PO) trên{" "}
            <a href={LARK.cogs} target="_blank" rel="noreferrer" className="underline">
              COGS Lark Base
            </a>{" "}
            (<TerminalInline>tblSsTpnEZoAnqEu</TerminalInline>). Đây là nguồn duy nhất được dashboard tin.
          </li>
          <li>
            Hệ thống đồng bộ lại mỗi ngày một lần. Cần cập nhật ngay → bấm{" "}
            <em>Refresh Catalog</em> trên trang <code>/analytics/cost-settings</code> (tab COGS).
          </li>
          <li>
            Sau khi đổi, mở trang lợi nhuận đối chiếu lại — nếu vẫn lệch &gt; 24 h thì báo dev.
          </li>
        </ul>

        <h2 id="user-troubleshoot">Khi nào cần báo dev</h2>
        <ul>
          <li>Trang lợi nhuận lệch số mà giá vốn trên Lark đã đúng.</li>
          <li>Một SKU không khớp PO nào — dashboard sẽ rớt khỏi báo cáo.</li>
          <li>Cron sync lỗi quá 2 ngày liên tiếp.</li>
        </ul>
      </section>

      {/* ─────────── DEV MODE ─────────── */}
      <section data-dev-detail>
        <h2 id="two-sources">2 source COGS — biết chọn cái nào</h2>
        <div className="not-prose my-6 grid sm:grid-cols-2 gap-3">
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
                Shopify Admin
              </div>
            </div>
            <code className="block font-mono text-[12.5px] font-semibold mb-2">
              raw_variants.cost
            </code>
            <div className="text-[13px] text-foreground/85 leading-6">
              Field <TerminalInline>variants.inventory_item.cost</TerminalInline> từ Shopify.{" "}
              <strong>Partial coverage</strong> — bỏ qua mọi chi phí ngoài production unit.
            </div>
            <div className="mt-2 inline-block text-[10px] uppercase tracking-wider font-semibold rounded border border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300 px-1.5 py-0.5">
              ĐỪNG dùng cho analytics
            </div>
          </div>
          <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-500/[0.04] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Cable className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <div className="text-[11px] uppercase tracking-widest text-emerald-700 dark:text-emerald-300 font-semibold">
                Lark Base per-PO
              </div>
            </div>
            <code className="block font-mono text-[12.5px] font-semibold mb-2 text-emerald-700 dark:text-emerald-300">
              master_app.cogs_full_catalog
            </code>
            <div className="text-[13px] text-foreground/85 leading-6">
              Per-PO breakdown 6 chi phí. Sync từ Lark Base table &quot;COGS rollup&quot;.
            </div>
            <div className="mt-2 inline-block text-[10px] uppercase tracking-wider font-semibold rounded border border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5">
              Source of Truth
            </div>
          </div>
        </div>

        <Callout variant="danger" title="Bỏ qua Lark = undercount ~70%">
          Analytics queries MUST join{" "}
          <TerminalInline>cogs_full_catalog</TerminalInline>. Nếu chỉ join{" "}
          <TerminalInline>raw_variants.cost</TerminalInline> → undercount ~70% vì Shopify cost
          field bỏ qua: barcode, lab, transport, designer, fulfillment. Memo:{" "}
          <TerminalInline>project_cogs_catalog_pipeline</TerminalInline>.
        </Callout>

        <h2 id="breakdown">6 chi phí trong cogs_full_catalog</h2>
        <div className="not-prose my-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {breakdownChips.map((c) => (
            <div key={c.label} className="rounded-lg border bg-card p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <DollarSign className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <div className="font-semibold text-[13px]">{c.label}</div>
              </div>
              <div className="text-[12px] text-muted-foreground leading-5">{c.desc}</div>
            </div>
          ))}
        </div>

        <h2 id="schema">Schema</h2>
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

        <h2 id="pipeline">Sync pipeline</h2>
        <div className="not-prose my-6 rounded-xl border bg-card p-4 sm:p-5">
          <FlowRow arrows="right">
            {[
              <FlowNode
                key="lark"
                icon={Cable}
                label="Lark Base"
                sub="PO Management → COGS rollup"
                tone="violet"
              />,
              <FlowNode
                key="reader"
                icon={Cable}
                label="lark_reader.py"
                sub="daily cron"
                tone="sky"
              />,
              <FlowNode
                key="script"
                icon={Package}
                label="cogs-full-catalog-sync.py"
                sub="upsert + effective_from logic"
                tone="amber"
              />,
              <FlowNode
                key="db"
                icon={Database}
                label="cogs_full_catalog"
                sub="master_app schema"
                tone="emerald"
              />,
            ]}
          </FlowRow>
          <div className="text-[12px] text-muted-foreground mt-3 leading-5">
            Khi ops update Lark Base row, next daily sync (≤ 24h) sẽ pickup. Cần ngay → manual
            refresh bên dưới.
          </div>
        </div>

        <h2 id="join">Cách join đúng (LATERAL với effective date)</h2>
        <CodeBlock language="sql">
{`-- Join orders → effective COGS tại order date
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

        <h2 id="manual">Manual refresh sau khi ops update Lark</h2>
        <Terminal
          host="you@laptop"
          cwd="~/Coding/pati-master-app"
          lines={[
            { prompt: "$", cmd: "bun run cogs:sync" },
            { divider: true, label: "hoặc trực tiếp" },
            { prompt: "$", cmd: "python sync/scripts/cogs_full_catalog_sync.py \\" },
            { prompt: "", cmd: "  --shop-id e49d78-3.myshopify.com" },
            { divider: true, label: "expected" },
            { out: "→ Read 247 rows from Lark Base", tone: "muted" },
            { out: "→ Upsert into master_app.cogs_full_catalog", tone: "muted" },
            { out: "✓ 247 rows processed, 12 new, 235 updated", tone: "ok" },
          ]}
        />

        <h2 id="ui">UI — /analytics/cost-settings (COGS tab)</h2>
        <p>
          Trang <TerminalInline>/analytics/cost-settings</TerminalInline> (tab COGS) hiển thị
          per-variant unified view với breakdown chips (Production / Barcode / Lab / Transport /
          Designer / Fulfillment). Sort + filter theo SKU, PO, date range.
        </p>
      </section>

      <PageNav href="/docs/feature-cogs" />
    </>
  );
}
