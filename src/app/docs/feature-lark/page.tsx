import {
  ArrowLeftRight,
  Cable,
  Database,
  KeyRound,
  Mail,
  Package,
} from "lucide-react";
import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import {
  FlowNode,
  FlowRow,
  TerminalInline,
} from "@/components/docs/visuals";

export const metadata = { title: "Lark Base Sync — PATI Handover" };

const tableCategories = [
  {
    name: "Purchase Order Management",
    desc: "POs, suppliers, lab tests, transport, designer fees",
    count: 12,
    tone: "violet" as const,
  },
  {
    name: "COGS Catalog",
    desc: "Per-PO cost breakdown — AUTHORITATIVE",
    count: 3,
    tone: "emerald" as const,
    flag: true,
  },
  {
    name: "Fulfillment routing",
    desc: "VNH/NS3 mapping",
    count: 6,
    tone: "amber" as const,
  },
  {
    name: "Shipping rate cards",
    desc: "Best fulfillment rate card source",
    count: 5,
    tone: "sky" as const,
  },
  {
    name: "Inventory snapshots",
    desc: "Daily inventory levels per warehouse",
    count: 4,
    tone: "pink" as const,
  },
  {
    name: "CS templates & SOPs",
    desc: "Response templates, escalation procedures",
    count: 12,
    tone: "orange" as const,
  },
];

const toneMap = {
  violet: "border-violet-500/30 bg-violet-500/[0.04] text-violet-700 dark:text-violet-300",
  emerald: "border-emerald-500/30 bg-emerald-500/[0.04] text-emerald-700 dark:text-emerald-300",
  amber: "border-amber-500/30 bg-amber-500/[0.04] text-amber-700 dark:text-amber-300",
  sky: "border-sky-500/30 bg-sky-500/[0.04] text-sky-700 dark:text-sky-300",
  pink: "border-pink-500/30 bg-pink-500/[0.04] text-pink-700 dark:text-pink-300",
  orange: "border-orange-500/30 bg-orange-500/[0.04] text-orange-700 dark:text-orange-300",
} as const;

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Core Features"
        title="Lark Base Sync"
        description="Bidirectional bitable I/O · 42 tables · COGS authoritative source. Đường ống nối Lark ↔ Supabase."
      />

      <h2 id="apps">2 Lark app riêng</h2>
      <div className="not-prose my-5 grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-500/[0.04] p-4">
          <div className="flex items-center gap-2 mb-2">
            <KeyRound className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <div className="text-[11px] uppercase tracking-widest font-semibold text-emerald-700 dark:text-emerald-300">
              PATI Sync Hub (primary)
            </div>
          </div>
          <code className="block font-mono text-[12px] mb-2">LARK_APP_ID</code>
          <div className="text-[13px] text-foreground/85 leading-6">
            Permission cho bitable read/write + drive read. ÔWN tất cả sync chính.
          </div>
        </div>
        <div className="rounded-xl border-2 border-violet-500/40 bg-violet-500/[0.04] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            <div className="text-[11px] uppercase tracking-widest font-semibold text-violet-700 dark:text-violet-300">
              Lark Mail bot
            </div>
          </div>
          <code className="block font-mono text-[12px] mb-2">LARK_MAIL_APP_ID</code>
          <div className="text-[13px] text-foreground/85 leading-6">
            Tách riêng vì mail API cần scope khác và chạy như background user.
          </div>
        </div>
      </div>

      <Callout variant="danger" title="Domain = open.larksuite.com (KHÔNG feishu.cn)">
        PATI dùng Lark version Singapore/International. Domain là{" "}
        <TerminalInline>open.larksuite.com</TerminalInline>, KHÔNG phải{" "}
        <TerminalInline>open.feishu.cn</TerminalInline>. Đặt sai → 404 mọi API.
      </Callout>

      <h2 id="base">Lark Base — primary token</h2>
      <div className="not-prose my-5 rounded-xl border bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <Database className="h-4 w-4 text-foreground/70" />
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            App token (Lark Base primary)
          </div>
        </div>
        <code className="font-mono text-[12.5px] font-semibold">
          F6Srwr8GFiAeikktdBeldixpgNg
        </code>
      </div>

      <h2 id="categories">42 tables — 6 nhóm chức năng</h2>
      <div className="not-prose my-5 grid sm:grid-cols-2 gap-3">
        {tableCategories.map((c) => (
          <div key={c.name} className={`rounded-xl border-2 p-3.5 ${toneMap[c.tone]}`}>
            <div className="flex items-baseline justify-between mb-1">
              <div className="font-semibold text-[14px]">{c.name}</div>
              <div className="font-mono text-[11px] text-muted-foreground">
                ~{c.count} tables
              </div>
            </div>
            <div className="text-[12.5px] leading-5 text-foreground/85">{c.desc}</div>
            {c.flag && (
              <div className="mt-2 inline-block text-[10px] uppercase tracking-wider font-semibold rounded border border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5">
                Source of Truth
              </div>
            )}
          </div>
        ))}
      </div>

      <h2 id="bidirectional">Hai chiều: Read + Write</h2>
      <div className="not-prose my-6 rounded-xl border bg-card p-4 sm:p-5">
        <FlowRow arrows="right">
          {[
            <FlowNode
              key="reader"
              icon={ArrowLeftRight}
              label="lark_reader.py"
              sub="list_records · page 500"
              tone="sky"
            />,
            <FlowNode
              key="lark"
              icon={Cable}
              label="Lark Bitable API"
              sub="open.larksuite.com"
              tone="violet"
            />,
            <FlowNode
              key="pusher"
              icon={ArrowLeftRight}
              label="lark_pusher.py"
              sub="batch_create / update"
              tone="emerald"
            />,
          ]}
        </FlowRow>
        <div className="text-[12px] text-muted-foreground mt-3 leading-5">
          Token tự refresh sau mỗi 2 tiếng. Pagination qua{" "}
          <TerminalInline>page_token</TerminalInline>.
        </div>
      </div>

      <h2 id="reader">Reader — đọc 1 table</h2>
      <CodeBlock language="python" filename="sync/modules/bulk_update/lark_reader.py">
{`from sync.modules.bulk_update.lark_reader import LarkReader

reader = LarkReader(app_id, app_secret, domain="open.larksuite.com")
rows = reader.read_table(
    app_token="F6Srwr8GFiAeikktdBeldixpgNg",
    table_id="tblNQrmGRQFDkkPu",
    field_names=["Customer Email", "Tracking", "Warehouse"],
)`}
      </CodeBlock>

      <h2 id="writer">Writer — push batch</h2>
      <CodeBlock language="python" filename="sync/modules/lark_pusher.py">
{`from sync.modules.lark_pusher import LarkPusher

pusher = LarkPusher(app_id, app_secret)
pusher.batch_create(
    app_token="...",
    table_id="...",
    records=[{"fields": {...}}, ...],
)`}
      </CodeBlock>

      <h2 id="bulk-import">Bulk import + UI menu placement</h2>
      <Callout variant="warning" title="ĐỪNG dump tables ở sidebar root">
        Khi bulk-import nhiều Lark tables, chúng <strong>phải nest dưới group menu</strong>{" "}
        đúng (ví dụ Purchase Order Management). Phải:
        <ul className="list-disc ml-5 mt-1 space-y-0.5">
          <li>
            Strip prefix Lark&apos;s <TerminalInline>&quot;N.&quot;</TerminalInline> /{" "}
            <TerminalInline>&quot;N.N.&quot;</TerminalInline>
          </li>
          <li>Pick icon phù hợp domain — đừng blanket Database icon cho mọi table</li>
          <li>Không bao giờ dump ở sidebar root</li>
        </ul>
        Memo: <TerminalInline>feedback_lark_menu_placement</TerminalInline>.
      </Callout>

      <h2 id="bitable-app-script">Lark Base AppScript vs Python sync</h2>
      <div className="not-prose my-5 grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-500/[0.04] p-4">
          <div className="text-[10px] uppercase tracking-widest font-semibold text-emerald-700 dark:text-emerald-300 mb-1.5">
            Python lark_pusher
          </div>
          <ul className="list-disc ml-4 text-[13px] leading-6 text-foreground/85">
            <li>Supabase service-role auth</li>
            <li>Ghi vào sync_logs</li>
            <li>Production-grade</li>
            <li>Cron orchestrated</li>
          </ul>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1.5">
            Lark Base App Script
          </div>
          <ul className="list-disc ml-4 text-[13px] leading-6 text-muted-foreground">
            <li>Không có Supabase auth</li>
            <li>Không có sync_logs</li>
            <li>OK cho automation đơn giản trong Lark</li>
            <li>KHÔNG dùng cho production sync</li>
          </ul>
        </div>
      </div>

      <h2 id="cogs-overwrite">COGS — source-of-truth quan trọng</h2>
      <Callout variant="danger" title="cogs_full_catalog wins, không phải raw_variants.cost">
        Shopify Admin có <TerminalInline>variants.inventory_item.cost</TerminalInline> nhưng
        chỉ partial coverage. Lark Base{" "}
        <TerminalInline>cogs_full_catalog</TerminalInline> capture per-PO breakdown + barcode
        + lab + transport + designer + fulfillment. Analytics MUST join Lark version, không
        thì undercount ~70%. Chi tiết:{" "}
        <a href="/docs/feature-cogs" className="underline">
          COGS Catalog
        </a>
        .
      </Callout>

      <h2 id="ui-routes">UI routes liên quan</h2>
      <div className="not-prose my-5 rounded-xl border bg-card overflow-hidden">
        <RouteRow
          icon={Mail}
          path="/lark-mail-reconcile"
          desc="Lark Mail reconcile + CS panel"
        />
        <RouteRow
          icon={Mail}
          path="/lark-mail-reconcile/admin"
          desc="Legacy admin (kept for fallback)"
        />
        <RouteRow
          icon={Package}
          path="/custom/[slug]"
          desc="Bất kỳ Lark table nào được mapped qua custom_menus"
        />
      </div>

      <PageNav href="/docs/feature-lark" />
    </>
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
