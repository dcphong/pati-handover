import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Bot,
  GraduationCap,
  Headphones,
  Mail,
  ShieldAlert,
} from "lucide-react";
import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";

export const metadata = { title: "CS & OF — PATI Handover" };

type SubpageStatus = "ready" | "draft";

type Subpage = {
  href: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  status: SubpageStatus;
  badge?: string;
};

const subpages: Subpage[] = [
  {
    href: "/docs/cs-of/payment-request",
    title: "Payment Request — Shipping Cost",
    desc: "Workflow tạo payment request cho shipping cost: gom cost từ Lark Base, export CSV, kiểm tra output rồi submit form.",
    icon: Banknote,
    status: "ready",
  },
  {
    href: "/docs/timcook",
    title: "Timcook — Training Openclaw",
    desc: "Phần Phong giữ: scope, agenda, checklist và follow-up khi training cho người mới về Openclaw.",
    icon: GraduationCap,
    status: "ready",
  },
  {
    href: "/docs/timcook-agent",
    title: "Timcook Agent — Skill + Workflow",
    desc: "Ảnh chụp live AI agent timcook chạy trên Mac mini: persona, 19 skill, 20 cron pipeline, 33 LaunchAgent, canvas trực quan.",
    icon: Bot,
    status: "ready",
    badge: "new",
  },
];

const upcoming = [
  {
    icon: Mail,
    title: "Inbox triage & SLA",
    desc: "Quy trình xử inbox CS hàng ngày: phân loại, SLA, escalate. (chưa viết)",
  },
  {
    icon: ShieldAlert,
    title: "Dispute / chargeback playbook",
    desc: "Cách chuẩn bị evidence khi ChargeFlow báo dispute mới. (chưa viết)",
  },
  {
    icon: Headphones,
    title: "Customer escalation runbook",
    desc: "Khi nào leo lên sếp / legal, template phản hồi cho khách phẫn nộ. (chưa viết)",
  },
];

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="CS & OF"
        title="Customer Support & Order Fulfillment"
        description="Section gom mọi workflow + tài liệu liên quan tới CS và OF. Bao gồm payment request, training Openclaw, agent timcook, và các quy trình xử case hàng ngày."
      />

      <Callout variant="info" title="Section này dành cho ai">
        <p>
          Mọi thứ liên quan đến đội CS &amp; OF — quy trình ops Phong từng giữ tay, agent tự hành
          timcook đang chạy thay, và training cho người mới. Trang nào cũng có thể đọc độc lập.
        </p>
      </Callout>

      <h2 id="subpages">Trong section này</h2>
      <div className="not-prose my-5 grid gap-3 md:grid-cols-2">
        {subpages.map((p) => (
          <SubpageCard key={p.href} {...p} />
        ))}
      </div>

      <h2 id="upcoming">Còn thiếu / để dành sau</h2>
      <p>
        Những workflow CS &amp; OF khác chưa được tài liệu hoá. Khi rảnh thì viết tiếp vào section
        này, đặt theo URL <code>/docs/cs-of/&lt;slug&gt;</code> và thêm entry vào{" "}
        <code>src/lib/nav.ts</code>.
      </p>
      <div className="not-prose my-5 grid gap-3 md:grid-cols-3">
        {upcoming.map((u) => (
          <div key={u.title} className="rounded-xl border border-dashed bg-card/40 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <u.icon className="h-4 w-4 text-muted-foreground" />
              <div className="font-semibold text-[14px] text-foreground/80">{u.title}</div>
            </div>
            <div className="text-[13px] leading-6 text-muted-foreground">{u.desc}</div>
          </div>
        ))}
      </div>

      <PageNav href="/docs/cs-of" />
    </>
  );
}

function SubpageCard({ href, title, desc, icon: Icon, badge }: Subpage) {
  return (
    <Link
      href={href}
      className="group rounded-xl border bg-card p-4 hover:border-foreground/40 hover:bg-muted/30 transition-colors"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-muted grid place-items-center">
            <Icon className="h-4 w-4 text-foreground/80" />
          </div>
          <div className="font-semibold text-[14.5px] leading-tight">{title}</div>
        </div>
        {badge && (
          <span className="text-[10px] uppercase tracking-widest font-semibold rounded bg-muted text-muted-foreground px-1.5 py-0.5">
            {badge}
          </span>
        )}
      </div>
      <div className="text-[13px] leading-6 text-foreground/80">{desc}</div>
      <div className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-foreground/70 group-hover:text-foreground">
        Mở trang
        <ArrowRight className="h-3 w-3" />
      </div>
    </Link>
  );
}
