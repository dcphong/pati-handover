import {
  Cable,
  Database,
  FileSpreadsheet,
  Package,
  Upload,
} from "lucide-react";
import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import {
  Step,
  Steps,
  StepCheck,
  Terminal,
  TerminalInline,
} from "@/components/docs/visuals";

export const metadata = { title: "Best Fulfillment — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Best Fulfillment Shipping"
        description="Best (VN) rate card đổi ~1× tháng. CSV manual export + scripted import — không live API."
      />

      <Callout variant="info" title="Vì sao manual CSV thay vì live API?">
        Rate card đổi không thường xuyên (~1× tháng). Schema messy (merged cells Lark). Live
        API tốn effort không xứng đáng. CSV manual + import script là trade-off đúng. Memo:{" "}
        <TerminalInline>reference_best_fulfillment_shipping_lark</TerminalInline>.
      </Callout>

      <h2 id="flow">Quy trình refresh — 3 bước</h2>
      <Steps>
        <Step n={1} title="Ops export CSV từ Lark Base">
          <p>
            Ops mở Lark Base table <strong>&quot;Shipping Rate Card&quot;</strong> → export
            CSV.
          </p>
          <div className="rounded-lg border bg-muted/30 px-4 py-2.5 text-[12.5px] leading-6 flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
            <span>
              Save về{" "}
              <TerminalInline>
                docs/fulfillment/bestfulfill/BEST_SHIPPING_COST.csv
              </TerminalInline>{" "}
              trong repo.
            </span>
          </div>
        </Step>
        <Step n={2} title="Run import script">
          <Terminal
            host="you@laptop"
            cwd="~/Coding/shopify-lark-sync"
            lines={[
              { prompt: "$", cmd: "python scripts/import-best-shipping-rates.py \\" },
              { prompt: "", cmd: "  --csv docs/fulfillment/bestfulfill/BEST_SHIPPING_COST.csv \\" },
              { prompt: "", cmd: "  --shop-id e49d78-3.myshopify.com" },
              { divider: true, label: "expected" },
              { out: "→ Parsed 247 rows from CSV", tone: "muted" },
              { out: "→ Upsert into master_app.bestfulfill_shipping_rates", tone: "muted" },
              { out: "✓ 247 rows: 12 new, 235 updated, 0 errors", tone: "ok" },
            ]}
          />
          <StepCheck>
            Script in <TerminalInline>0 errors</TerminalInline> và tổng row count khớp với CSV.
          </StepCheck>
        </Step>
        <Step n={3} title="(Tuỳ chọn) Commit CSV để audit">
          <Terminal
            host="you@laptop"
            cwd="~/Coding/shopify-lark-sync"
            lines={[
              { prompt: "$", cmd: "git add docs/fulfillment/bestfulfill/BEST_SHIPPING_COST.csv" },
              { prompt: "$", cmd: "git commit -m \"chore: refresh best fulfillment rates 2026-XX-XX\"" },
              { prompt: "$", cmd: "git push" },
            ]}
          />
          <p className="text-[12.5px] text-muted-foreground mt-1">
            CSV được track trong repo → audit ai cập nhật khi nào, dễ rollback.
          </p>
        </Step>
      </Steps>

      <h2 id="schema">Schema</h2>
      <CodeBlock language="sql">
{`master_app.bestfulfill_shipping_rates (
  destination_country  TEXT,
  service_level        TEXT,             -- 'standard' | 'express' | 'economy'
  weight_min_g         INT,
  weight_max_g         INT,
  rate_usd             NUMERIC,
  effective_from       DATE,
  effective_to         DATE NULL,
  source_csv           TEXT,             -- file hash cho audit
  PRIMARY KEY (destination_country, service_level, weight_min_g, effective_from)
)`}
      </CodeBlock>

      <h2 id="usage">Sử dụng ở đâu</h2>
      <div className="not-prose my-5 rounded-xl border bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <Database className="h-4 w-4 text-foreground/70" />
          <div className="font-semibold text-[14px]">Join trong shipping cost lookup</div>
        </div>
        <div className="text-[13px] leading-6">
          <TerminalInline>raw_orders</TerminalInline> shipping_cost lookup join table này via{" "}
          <TerminalInline>(country, service_level, weight)</TerminalInline>. Dùng trong P&amp;L
          card <strong>&quot;Shipping Costs&quot;</strong>.
        </div>
      </div>

      <h2 id="trigger">Khi nào cần refresh?</h2>
      <div className="not-prose my-5 grid sm:grid-cols-2 gap-3">
        <TriggerCard
          icon={Package}
          when="Best báo email tăng/giảm rate"
          action="Ops export CSV mới → run script"
        />
        <TriggerCard
          icon={Cable}
          when="Ops thấy shipping cost trên dashboard lệch"
          action="So Lark Base mới nhất vs DB → nếu khác, re-import"
        />
        <TriggerCard
          icon={Upload}
          when="Thêm country mới"
          action="Ops add row vào Lark Base → export → import (script auto-detect)"
        />
        <TriggerCard
          icon={FileSpreadsheet}
          when="Service level mới (vd thêm 'overnight')"
          action="Cần update script + schema constraint trước"
        />
      </div>

      <PageNav href="/docs/feature-bestfulfill" />
    </>
  );
}

function TriggerCard({
  icon: Icon,
  when,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  when: string;
  action: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-3.5">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="h-3.5 w-3.5 text-foreground/70" />
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
          Khi nào
        </div>
      </div>
      <div className="font-semibold text-[13px] mb-1.5">{when}</div>
      <div className="text-[12.5px] text-foreground/85 leading-5">→ {action}</div>
    </div>
  );
}
