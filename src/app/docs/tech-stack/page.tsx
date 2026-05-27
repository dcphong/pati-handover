import {
  Box,
  Cable,
  Cloud,
  Cog,
  LayoutDashboard,
  Palette,
  Server,
} from "lucide-react";
import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { TerminalInline } from "@/components/docs/visuals";

export const metadata = { title: "Tech Stack — PATI Handover" };

type Category = {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "violet" | "emerald" | "amber" | "sky" | "pink" | "orange";
  items: { concern: string; tech: string }[];
};

const categories: Category[] = [
  {
    title: "Frontend",
    icon: LayoutDashboard,
    tone: "violet",
    items: [
      { concern: "Framework", tech: "Next.js 16.2 (App Router)" },
      { concern: "UI library", tech: "shadcn/ui + Radix primitives" },
      { concern: "Styling", tech: "Tailwind CSS v4" },
      { concern: "Data fetching", tech: "@tanstack/react-query v5" },
      { concern: "Tables", tech: "@tanstack/react-table v8" },
      { concern: "Charts", tech: "Recharts 3" },
      { concern: "Drag & drop", tech: "@dnd-kit" },
      { concern: "Forms", tech: "react-hook-form + zod" },
      { concern: "Toasts", tech: "sonner" },
      { concern: "Date picker", tech: "react-day-picker + date-fns" },
      { concern: "i18n", tech: "Custom — src/lib/i18n/ (en, vi)" },
    ],
  },
  {
    title: "Backend / API",
    icon: Server,
    tone: "emerald",
    items: [
      { concern: "Auth", tech: "JWT (jose) — custom cookie-based" },
      { concern: "Database", tech: "Supabase (PostgreSQL 15+, self-host)" },
      { concern: "DB client", tech: "@supabase/supabase-js + pg cho direct" },
      { concern: "Credential encrypt", tech: "Fernet (cryptography lib)" },
    ],
  },
  {
    title: "Sync workers",
    icon: Cog,
    tone: "amber",
    items: [
      { concern: "Runtime", tech: "Python 3.12 + uv/pip venv" },
      { concern: "HTTP server (Bulk)", tech: "Flask" },
      { concern: "Browser automation", tech: "Playwright (CDP)" },
      { concern: "Scheduling", tech: "Mac mini launchd cron + GH Actions" },
    ],
  },
  {
    title: "Hosting / Infra",
    icon: Cloud,
    tone: "sky",
    items: [
      { concern: "Web hosting", tech: "Mac mini launchd com.pati.web → next start :3000" },
      { concern: "Self-host", tech: "Mac mini Docker (Supabase + Flask + Chrome CDP) + web" },
      { concern: "Tunnel", tech: "Cloudflared (pnl.patigroup.com + supabase.patiagency.com)" },
      { concern: "Private VPN access", tech: "Tailscale" },
      { concern: "DNS", tech: "GoDaddy — patigroup.com (additive-only)" },
    ],
  },
  {
    title: "Dev tooling",
    icon: Box,
    tone: "orange",
    items: [
      { concern: "Package manager", tech: "Bun 1.2.12 (preinstall gate)" },
      { concern: "Type system", tech: "TypeScript 5" },
      { concern: "Lint", tech: "ESLint 9 (eslint-config-next)" },
    ],
  },
];

const userStackGroups = [
  "Dashboard: Next.js + React là phần dùng trên trình duyệt.",
  "Database: Supabase/Postgres là nơi giữ dữ liệu chuẩn.",
  "Worker nền: Python kéo dữ liệu từ Shopify, Lark, Flexport và provider quảng cáo.",
  "Hạ tầng: Mac mini chạy web, database, cron; Cloudflared đưa service ra domain public.",
  "Truy cập nội bộ: Tailscale dùng để SSH/remote vào Mac mini an toàn.",
];

const userDecisions = [
  "Bun được dùng để cài package/build nhanh và thống nhất môi trường dev.",
  "shadcn/ui giúp UI nhẹ, dễ chỉnh và không bị phụ thuộc style nặng của Ant Design.",
  "Python và Next.js tách vai trò: Python lo đồng bộ dữ liệu, Next.js lo dashboard.",
];

const userVersions = [
  "Next.js/React: nền của dashboard web.",
  "Bun: tool cài package và build.",
  "Python: chạy các worker đồng bộ dữ liệu.",
  "Postgres/Supabase: database production.",
];

const toneMap = {
  violet: "border-violet-500/40 bg-violet-500/[0.04]",
  emerald: "border-emerald-500/40 bg-emerald-500/[0.04]",
  amber: "border-amber-500/40 bg-amber-500/[0.04]",
  sky: "border-sky-500/40 bg-sky-500/[0.04]",
  pink: "border-pink-500/40 bg-pink-500/[0.04]",
  orange: "border-orange-500/40 bg-orange-500/[0.04]",
} as const;
const toneText = {
  violet: "text-violet-700 dark:text-violet-300",
  emerald: "text-emerald-700 dark:text-emerald-300",
  amber: "text-amber-700 dark:text-amber-300",
  sky: "text-sky-700 dark:text-sky-300",
  pink: "text-pink-700 dark:text-pink-300",
  orange: "text-orange-700 dark:text-orange-300",
} as const;

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Architecture"
        title="Tech Stack"
        description="Mỗi phần của hệ thống đang dùng công nghệ gì. Hữu ích khi cần biết ai/ai phụ trách phần nào."
      />

      {/* ─────────── USER MODE ─────────── */}
      <section data-user-detail>
        <h2 id="user-what">Stack rút gọn</h2>
        <ul>
          <li><strong>Dashboard</strong>: Next.js + React (phần dùng trên trình duyệt).</li>
          <li><strong>Database</strong>: Supabase / Postgres (nơi giữ dữ liệu chuẩn).</li>
          <li><strong>Worker nền</strong>: Python (kéo dữ liệu từ Shopify, Lark, Flexport, ads).</li>
          <li><strong>Hạ tầng</strong>: Mac mini chạy web + DB + cron; Cloudflared đưa service ra domain public.</li>
          <li><strong>Truy cập nội bộ</strong>: Tailscale để SSH vào Mac mini an toàn.</li>
        </ul>
        <h2 id="user-when-call">Khi nào báo dev</h2>
        <ul>
          <li>Cần biết một lỗi cụ thể thuộc phần nào — dev đối chiếu stack rồi xử.</li>
        </ul>
      </section>

      {/* ─────────── DEV MODE ─────────── */}
      <section data-dev-detail>
      <h2 id="catalog">Stack theo nhóm</h2>
      <div data-user-detail className="not-prose my-5 rounded-xl border bg-card p-4">
        <p className="m-0 text-sm leading-6 text-foreground/85">
          Trang này trả lời câu hỏi: mỗi phần của hệ thống đang dùng công nghệ gì và phần đó
          chịu trách nhiệm cho việc nào.
        </p>
        <ul className="mt-4 space-y-2 text-sm leading-6 text-foreground/85">
          {userStackGroups.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      {categories.map((cat) => (
        <section
          key={cat.title}
          data-dev-detail
          className={`not-prose my-6 rounded-xl border-2 ${toneMap[cat.tone]} overflow-hidden`}
        >
          <div className="px-4 py-3 border-b bg-card/60 flex items-center gap-2">
            <cat.icon className={`h-4 w-4 ${toneText[cat.tone]}`} />
            <div className={`font-semibold text-[14.5px] ${toneText[cat.tone]}`}>
              {cat.title}
            </div>
            <div className="ml-auto text-[11px] text-muted-foreground font-mono">
              {cat.items.length} items
            </div>
          </div>
          <div>
            {cat.items.map((it, i) => (
              <div
                key={it.concern}
                className={`grid grid-cols-12 gap-3 px-4 py-2 ${i > 0 ? "border-t" : ""} bg-card/40`}
              >
                <div className="col-span-5 sm:col-span-4 text-[12.5px] text-muted-foreground font-medium">
                  {it.concern}
                </div>
                <code className="col-span-7 sm:col-span-8 font-mono text-[12.5px] font-semibold text-foreground/90 break-all">
                  {it.tech}
                </code>
              </div>
            ))}
          </div>
        </section>
      ))}

      <h2 id="rationale">3 quyết định tech chính — vì sao</h2>
      <div data-user-detail className="not-prose my-5 rounded-xl border bg-card p-4">
        <p className="m-0 text-sm leading-6 text-foreground/85">
          Ba quyết định này giúp hệ thống dễ maintain: build nhanh, UI dễ kiểm soát, và phần
          đồng bộ dữ liệu không trộn lẫn với phần dashboard.
        </p>
        <ul className="mt-4 space-y-2 text-sm leading-6 text-foreground/85">
          {userDecisions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div data-dev-detail className="not-prose my-5 grid sm:grid-cols-3 gap-3">
        <Rationale
          icon={Box}
          title="Bun-only"
          body={
            <>
              Install 4× nhanh hơn npm, lockfile binary nhỏ. Gate{" "}
              <TerminalInline>only-allow bun</TerminalInline> ở preinstall. Trade-off: 1 số
              native deps cần fallback node-gyp.
            </>
          }
        />
        <Rationale
          icon={Palette}
          title="shadcn/ui over Ant"
          body="Migrate khỏi Ant Design để control 100% styling, ship ít CSS, đồng nhất design language với DTC Backend v2 (sếp lock contract)."
        />
        <Rationale
          icon={Cable}
          title="Python + Next.js cohabit"
          body="Python có SDK provider mature (Shopify / Recharge / Klaviyo / Google Ads). Next.js cho UI nhanh. 2 layer connect qua Supabase — KHÔNG bao giờ import qua nhau."
        />
      </div>

      <Callout variant="info" title="Quy ước về cohabitation">
        2 layer hoàn toàn tách biệt. Python <strong>WRITE-only</strong> vào Supabase. Next.js{" "}
        <strong>READ/WRITE</strong>. KHÔNG bao giờ gọi HTTP nội bộ giữa 2 layer; mọi thứ qua
        Postgres. Cron orchestration nằm ngoài cả 2.
      </Callout>

      <h2 id="version-table">Version pin nhanh</h2>
      <div data-user-detail className="not-prose my-5 rounded-xl border bg-card p-4">
        <p className="m-0 text-sm leading-6 text-foreground/85">
          Version pin là danh sách phiên bản chính để dev cài đúng môi trường. User không cần nhớ
          số version; chỉ cần biết khi nâng cấp các phần này thì phải test lại dashboard và sync.
        </p>
        <ul className="mt-4 space-y-2 text-sm leading-6 text-foreground/85">
          {userVersions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div data-dev-detail className="not-prose my-5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12.5px]">
        <VersionPill name="Next.js" version="16.2.6" />
        <VersionPill name="React" version="19.2.4" />
        <VersionPill name="Tailwind" version="v4" />
        <VersionPill name="Node" version="20+" />
        <VersionPill name="Bun" version="≥ 1.2.12" />
        <VersionPill name="Python" version="3.12" />
        <VersionPill name="Postgres" version="15+" />
        <VersionPill name="TypeScript" version="5" />
      </div>

      </section>

      <PageNav href="/docs/tech-stack" />
    </>
  );
}

function Rationale({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card p-3.5">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="h-3.5 w-3.5 text-foreground/70" />
        <div className="font-semibold text-[14px]">{title}</div>
      </div>
      <div className="text-[12.5px] text-foreground/85 leading-5">{body}</div>
    </div>
  );
}

function VersionPill({ name, version }: { name: string; version: string }) {
  return (
    <div className="rounded-lg border bg-card p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {name}
      </div>
      <code className="block font-mono text-[14px] font-bold mt-0.5">{version}</code>
    </div>
  );
}
