import {
  AlertOctagon,
  Headphones,
  Mail,
  Search,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { TerminalInline } from "@/components/docs/visuals";

export const metadata = { title: "CS Dashboard — PATI Handover" };

const apis = [
  { method: "GET", path: "/api/cs-dashboard", purpose: "Aggregate daily counters (tickets, resolved, refund-rate)" },
  { method: "GET", path: "/api/cs-dashboard/orders", purpose: "Orders cho active store, paginated" },
  { method: "GET", path: "/api/cs/customers/[id]", purpose: "Unified customer: Shopify + Recharge + profile note" },
  { method: "PUT", path: "/api/cs/customers/[id]/profile", purpose: "Save CS note + customer_type tag" },
  { method: "POST", path: "/api/lark-mail-sync", purpose: "Manual Lark Mail re-sync" },
];

const methodColor = {
  GET: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/40",
  POST: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40",
  PUT: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40",
  DELETE: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/40",
} as const;

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="CS Dashboard"
        description="Dashboard CS 3-panel tự host: thread email từ Lark Mail + customer profile tự nạp đơn Shopify và sub Recharge."
      />

      {/* ─────────── USER MODE ─────────── */}
      <section data-user-detail>
        <h2 id="user-overview">CS Dashboard là gì</h2>
        <p>
          Đây là chỗ chính để CS xử ticket. Một màn hình chia 3 cột:
        </p>
        <ul>
          <li><strong>Panel trái</strong>: app sidebar — đổi store, mở menu khác.</li>
          <li><strong>Panel giữa</strong>: danh sách thread email + nội dung từng thread.</li>
          <li><strong>Panel phải</strong>: profile khách — đơn Shopify gần đây, sub Recharge, ghi chú CS đã lưu.</li>
        </ul>
        <p>
          Email vào dashboard qua Lark Mail (đồng bộ tự động). Mỗi khách có một note nội bộ + tag
          (vip / risk / partner) để cả nhóm cùng thấy.
        </p>

        <h2 id="user-workflow">Quy trình hằng ngày</h2>
        <ol>
          <li>Mở <code>/cs-dashboard</code> — mặc định landing là inbox.</li>
          <li>Click một thread → đọc nội dung ở giữa, profile khách hiện bên phải.</li>
          <li>Cần ghi chú → mở panel phải, lưu note + tag. Lần sau tự hiện lại.</li>
          <li>Email chưa map customer → vào <code>/lark-mail-reconcile</code>, pick khách trong dropdown để match.</li>
        </ol>

        <h2 id="user-troubleshoot">Khi nào cần báo dev</h2>
        <ul>
          <li>Email mới &gt; 30 phút không thấy hiện trong inbox.</li>
          <li>Refund rate trên dashboard cao bất thường (&gt; 10 %) — đã từng bị bug đo sai.</li>
          <li>Click một nút mà không có gì xảy ra.</li>
          <li>Customer profile bên phải trống trong khi rõ ràng có đơn Shopify.</li>
        </ul>
      </section>

      {/* ─────────── DEV MODE ─────────── */}
      <section data-dev-detail>
        <h2 id="layout">3-panel layout</h2>
        <Callout variant="info" title="Sidebar app counts as panel 1">
          Đừng add second left rail. App sidebar (StoreSwitcher + nav) đã là panel 1. Sửa CS
          view qua <TerminalInline>&lt;ViewDropdown&gt;</TerminalInline> ở middle header, KHÔNG
          thêm column trái thứ 2. Memo:{" "}
          <TerminalInline>feedback_three_panel_count</TerminalInline>.
        </Callout>

        <div className="not-prose my-6 rounded-xl border-2 bg-card overflow-hidden">
          <div className="grid grid-cols-12 min-h-[260px]">
            <div className="col-span-2 border-r bg-muted/40 p-3 text-[11px]">
              <div className="font-semibold text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                Panel 1
              </div>
              <div className="font-semibold mb-1">App sidebar</div>
              <div className="text-muted-foreground space-y-1 mt-2">
                <div>· StoreSwitcher</div>
                <div>· Nav</div>
                <div>· IAM badge</div>
              </div>
            </div>
            <div className="col-span-6 border-r bg-background p-3 text-[11px]">
              <div className="font-semibold text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                Panel 2 — Middle
              </div>
              <div className="font-semibold mb-1">Thread list / detail</div>
              <div className="text-muted-foreground space-y-1 mt-2">
                <div>Tabs: Inbox · Sent · Tagged</div>
                <div>+ &lt;ViewDropdown&gt; sửa view</div>
              </div>
            </div>
            <div className="col-span-4 bg-muted/30 p-3 text-[11px]">
              <div className="font-semibold text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                Panel 3 — Right
              </div>
              <div className="font-semibold mb-1">Customer side-panel</div>
              <div className="text-muted-foreground space-y-1 mt-2">
                <div>· Shopify orders</div>
                <div>· Recharge subscriptions</div>
                <div>· CS profile note</div>
              </div>
            </div>
          </div>
        </div>

        <h2 id="routes">Routes</h2>
        <div className="not-prose my-5 rounded-xl border bg-card overflow-hidden">
          <RouteRow icon={Headphones} path="/cs-dashboard" desc="Main view (default landing cho CS users)" />
          <RouteRow icon={Users} path="/cs-dashboard/customer/[id]" desc="Deep link cho customer" />
          <RouteRow icon={Mail} path="/lark-mail-reconcile" desc="Reconcile loose emails với Shopify customer" />
          <RouteRow icon={Mail} path="/lark-mail-reconcile/admin" desc="Legacy admin (kept)" />
        </div>

        <h2 id="api">Key APIs</h2>
        <div className="not-prose my-5 rounded-xl border bg-card overflow-hidden">
          {apis.map((a, i) => (
            <div
              key={a.path}
              className={`flex items-start gap-3 px-3 py-2.5 ${i > 0 ? "border-t" : ""}`}
            >
              <span
                className={`text-[10px] uppercase tracking-wider font-bold rounded border px-1.5 py-0.5 shrink-0 w-[50px] text-center ${methodColor[a.method as keyof typeof methodColor]}`}
              >
                {a.method}
              </span>
              <div className="min-w-0 flex-1">
                <code className="font-mono text-[12.5px] font-semibold break-all">{a.path}</code>
                <div className="text-[12.5px] text-muted-foreground leading-5">{a.purpose}</div>
              </div>
            </div>
          ))}
        </div>

        <h2 id="customer-profiles">customer_profiles schema</h2>
        <CodeBlock language="sql">
{`master_app.customer_profiles (
  customer_email   TEXT PRIMARY KEY,
  shop_id          TEXT NOT NULL,
  customer_type    TEXT,          -- 'vip' | 'risk' | 'partner' | NULL
  cs_note          TEXT,
  updated_by       TEXT,
  updated_at       TIMESTAMPTZ DEFAULT NOW()
)`}
        </CodeBlock>

        <Callout variant="danger" title="PostgREST row cap đã từng đốt nóng">
          CS Dashboard refund-rate đã show 34.3% vs sự thật 5.56% vì query refunds bị cap ở 1000
          rows. Fix: dùng <TerminalInline>pageAll()</TerminalInline> helper khi aggregate. Memo:{" "}
          <TerminalInline>reference_postgrest_row_cap</TerminalInline>.
        </Callout>

        <h2 id="tz">&quot;Today&quot; semantics</h2>
        <Callout variant="warning" title="Asia/Ho_Chi_Minh anchor">
          Mọi &quot;today&quot; ở CS Dashboard anchor về{" "}
          <TerminalInline>Asia/Ho_Chi_Minh</TerminalInline>. Date picker component phải dùng{" "}
          <TerminalInline>format(d, &apos;yyyy-MM-dd&apos;)</TerminalInline>, KHÔNG{" "}
          <TerminalInline>toISOString().slice(0,10)</TerminalInline> (shift UTC).
        </Callout>

        <h2 id="no-stub">No stub UI affordances</h2>
        <div className="not-prose my-5 rounded-xl border-2 border-red-500/40 bg-red-500/[0.04] p-4">
          <div className="flex items-start gap-2">
            <AlertOctagon className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-[14px] text-red-700 dark:text-red-300 mb-1">
                Mọi button / checkbox / link PHẢI trigger real backend action
              </div>
              <div className="text-[13px] leading-6 text-foreground/85">
                Đừng leave placeholder UI / dead clicks. Người dùng CS sẽ click thử và mất niềm tin.
                Memo: <TerminalInline>feedback_no_stub_ui</TerminalInline>.
              </div>
            </div>
          </div>
        </div>

        <h2 id="reconcile">Lark Mail reconcile workflow</h2>
        <div className="not-prose my-5 rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Search className="h-4 w-4 text-foreground/70" />
            <div className="font-semibold text-[14px]">
              Match Lark Mail message ↔ Shopify customer
            </div>
          </div>
          <ol className="ml-5 list-decimal text-[13px] leading-6 space-y-1">
            <li>Cron sync Lark Mail → lark_mail_messages (every 12h).</li>
            <li>UI hiển thị message chưa match (customer_email empty).</li>
            <li>CS pick customer trong dropdown → match → save customer_profiles row.</li>
            <li>Next sync sẽ auto-match dựa trên email mapping đã save.</li>
          </ol>
        </div>
      </section>

      <PageNav href="/docs/feature-cs" />
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
