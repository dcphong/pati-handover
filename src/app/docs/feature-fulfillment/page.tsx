import {
  Boxes,
  Cable,
  Package,
  RefreshCw,
  Truck,
} from "lucide-react";
import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { Terminal, TerminalInline } from "@/components/docs/visuals";

export const metadata = { title: "VNH / NS3 Fulfillment — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="VNH / NS3 Fulfillment"
        description="Flexport Logistics API + Lark warehouse routing + auto-submit stuck Shopify FOs."
      />

      <h2 id="vocab">Từ vựng cần nhớ</h2>
      <div className="not-prose my-5 grid sm:grid-cols-3 gap-3">
        <Vocab
          term="VNH"
          full="Việt Nam Hà Nội warehouse"
          desc="Flexport partner — kho ở Hà Nội"
        />
        <Vocab
          term="NS3"
          full="North Star #3"
          desc="Stock Cover days — cũng là codename US warehouse routing"
        />
        <Vocab
          term="FO"
          full="Fulfillment Order"
          desc="Shopify split allocation: 1 order → N FOs nếu nhiều warehouse"
        />
      </div>

      <h2 id="flexport-api">Flexport — REST API (2026-05-20)</h2>
      <Callout variant="success" title="Playwright scraper retired 2026-05-20">
        Đã replace bằng Flexport Logistics API REST. Single env var{" "}
        <TerminalInline>FLEXPORT_API_TOKEN</TerminalInline>. Per-warehouse stock via{" "}
        <TerminalInline>POST /products/warehouse</TerminalInline>. NS#3 = 100% healthy sau
        switch. Memo: <TerminalInline>reference_flexport_logistics_api</TerminalInline>.
      </Callout>

      <Terminal
        host="you@laptop"
        cwd="~"
        title="Query stock của 2 SKU ở 1 warehouse"
        lines={[
          { prompt: "$", cmd: "curl https://logistics-api.flexport.com/products/warehouse \\" },
          { prompt: "", cmd: "  -H \"Authorization: Bearer $FLEXPORT_API_TOKEN\" \\" },
          { prompt: "", cmd: "  -H \"Content-Type: application/json\" \\" },
          { prompt: "", cmd: "  -d '{\"warehouse_id\":\"vnh-1\", \"skus\":[\"WN001\",\"WN002\"]}'" },
          { divider: true, label: "response" },
          { out: "{ \"results\": [{ \"sku\": \"WN001\", \"qty\": 1240 }, ...] }", tone: "ok" },
        ]}
      />

      <h2 id="auto-submit">Auto-submit stuck FOs (hourly)</h2>
      <p>
        Khi Shopify split allocation, một số FO có thể stuck ở{" "}
        <TerminalInline>UNSUBMITTED</TerminalInline> tại Flexport. Hourly cron tìm + click
        &quot;Request fulfillment&quot;:
      </p>
      <CodeBlock language="ts">
{`// REQUEST_FULFILLMENT là Action enum, KHÔNG phải mutation name
const mutation = \`
  mutation FOAction($id: ID!) {
    fulfillmentOrderSubmitFulfillmentRequest(id: $id) {
      submittedFulfillmentOrder { id status }
      userErrors { message }
    }
  }
\`;`}
      </CodeBlock>
      <div className="not-prose my-3 rounded-lg border bg-muted/30 px-4 py-3 text-[13px] leading-6">
        <strong>Age gate:</strong> 30 ngày — FO older sẽ không auto-submit nữa (đề phòng
        runaway).<br />
        <strong>Cron:</strong> <TerminalInline>shopify_fulfillment_sync.yml</TerminalInline>{" "}
        hoặc Mac mini crontab entry tương ứng (hourly).
      </div>

      <h2 id="routing">Lark warehouse routing (14k rows)</h2>
      <div className="not-prose my-5 rounded-xl border bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <Cable className="h-4 w-4 text-foreground/70" />
          <div className="font-semibold text-[14px]">
            Lark Base table <TerminalInline>tblNQrmGRQFDkkPu</TerminalInline>
          </div>
        </div>
        <ul className="list-disc ml-5 text-[13px] leading-6 text-foreground/85">
          <li>Authoritative routing — customer email pattern + product SKU → warehouse choice.</li>
          <li>14k rows, refresh khi ops update.</li>
          <li>
            Sync vào <TerminalInline>master_app.warehouse_routing</TerminalInline> daily cron.
          </li>
        </ul>
      </div>

      <h2 id="ui-routes">UI routes</h2>
      <div className="not-prose my-5 rounded-xl border bg-card overflow-hidden">
        <RouteRow icon={Truck} path="/vnh-fulfill" desc="VNH bulk fulfill page" />
        <RouteRow icon={Boxes} path="/portfolio/stock-cover" desc="NS3 dashboard (stock cover days)" />
        <RouteRow icon={Package} path="/inventory" desc="Cross-warehouse inventory snapshot" />
        <RouteRow icon={RefreshCw} path="/workflows/shipmonk" desc="Optional ShipMonk pipeline (infrequent)" />
      </div>

      <h2 id="bulk-fulfill">Bulk fulfillment qua Flask</h2>
      <p>
        <TerminalInline>/api/bulk/[...path]</TerminalInline> proxy về Flask server (Mac mini
        cron-managed). 3 input mode:
      </p>
      <div className="not-prose my-5 grid sm:grid-cols-3 gap-3">
        <InputCard label="Lark Base URL" desc="Read rows từ table cụ thể" />
        <InputCard label="Excel / CSV upload" desc="Parse cột tracking/order/customer" />
        <InputCard label="Order ID list" desc="Plain text 1 ID / line" />
      </div>
      <p className="text-[13px] text-muted-foreground">
        Flask server gọi Shopify Admin GraphQL mutate fulfillments theo batch 25.
      </p>

      <PageNav href="/docs/feature-fulfillment" />
    </>
  );
}

function Vocab({ term, full, desc }: { term: string; full: string; desc: string }) {
  return (
    <div className="rounded-lg border bg-card p-3.5">
      <code className="block font-mono text-[16px] font-bold mb-1">{term}</code>
      <div className="text-[12px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
        {full}
      </div>
      <div className="text-[12.5px] text-foreground/85 leading-5">{desc}</div>
    </div>
  );
}

function RouteRow({
  icon: Icon,
  path,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  desc: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b last:border-b-0">
      <Icon className="h-3.5 w-3.5 text-foreground/70 shrink-0" />
      <code className="font-mono text-[12.5px] font-semibold flex-1 min-w-0 break-all">
        {path}
      </code>
      <div className="text-[12px] text-muted-foreground hidden sm:block">{desc}</div>
    </div>
  );
}

function InputCard({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="rounded-lg border bg-card p-3 text-center">
      <div className="font-semibold text-[13px] mb-1">{label}</div>
      <div className="text-[12px] text-muted-foreground leading-5">{desc}</div>
    </div>
  );
}
