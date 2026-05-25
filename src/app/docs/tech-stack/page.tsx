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
      { concern: "Scheduling", tech: "Mac mini cron + GH Actions + Vercel cron HTTP" },
    ],
  },
  {
    title: "Hosting / Infra",
    icon: Cloud,
    tone: "sky",
    items: [
      { concern: "Web hosting", tech: "Vercel (Fluid Compute)" },
      { concern: "Self-host", tech: "Mac mini Docker (Supabase + Flask + Chrome CDP)" },
      { concern: "Tunnel", tech: "Cloudflared (supabase.patiagency.com)" },
      { concern: "Intra-team VPN", tech: "Tailscale" },
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
        description="Mỗi concern dùng tech gì. 5 nhóm để dễ scan."
      />

      <h2 id="catalog">Stack theo nhóm</h2>
      {categories.map((cat) => (
        <section
          key={cat.title}
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
      <div className="not-prose my-5 grid sm:grid-cols-3 gap-3">
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
      <div className="not-prose my-5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12.5px]">
        <VersionPill name="Next.js" version="16.2.6" />
        <VersionPill name="React" version="19.2.4" />
        <VersionPill name="Tailwind" version="v4" />
        <VersionPill name="Node" version="20+" />
        <VersionPill name="Bun" version="≥ 1.2.12" />
        <VersionPill name="Python" version="3.12" />
        <VersionPill name="Postgres" version="15+" />
        <VersionPill name="TypeScript" version="5" />
      </div>

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
