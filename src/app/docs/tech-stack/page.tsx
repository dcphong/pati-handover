import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";

export const metadata = { title: "Tech Stack — PATI Handover" };

const stack = [
  ["Frontend framework", "Next.js 16.2 (App Router)"],
  ["UI library", "shadcn/ui + Radix primitives"],
  ["Styling", "Tailwind CSS v4"],
  ["Data fetching", "@tanstack/react-query v5"],
  ["Tables", "@tanstack/react-table v8"],
  ["Charts", "Recharts 3"],
  ["Drag & drop", "@dnd-kit"],
  ["Forms", "react-hook-form + zod"],
  ["Toasts", "sonner"],
  ["Date picker", "react-day-picker + date-fns"],
  ["Auth", "JWT (jose) — custom cookie-based"],
  ["Database", "Supabase (PostgreSQL 15+, self-host)"],
  ["DB client", "@supabase/supabase-js + node-postgres (pg) for direct"],
  ["Sync runtime", "Python 3.12 + uv/pip venv"],
  ["Sync HTTP", "Flask (bulk-update server)"],
  ["Browser automation", "Playwright (custom table + ChargeFlow CDP)"],
  ["Credential encryption", "Fernet (cryptography lib)"],
  ["i18n", "Custom — src/lib/i18n/ (en, vi)"],
  ["Scheduling", "Mac mini cron + GitHub Actions + Vercel cron HTTP"],
  ["Hosting", "Vercel (web) + Mac mini Docker (Supabase, bulk server)"],
  ["Tunnel", "Cloudflared (supabase.patiagency.com)"],
  ["DNS", "GoDaddy — patigroup.com (shared, additive-only)"],
  ["Package manager", "Bun 1.2.12 (preinstall gate)"],
];

export default function Page() {
  return (
    <>
      <PageHeader eyebrow="Architecture" title="Tech Stack" description="Mỗi concern dùng tech gì." />

      <h2 id="table">Stack at a glance</h2>
      <table>
        <thead>
          <tr>
            <th style={{ width: "35%" }}>Concern</th>
            <th>Technology</th>
          </tr>
        </thead>
        <tbody>
          {stack.map(([k, v]) => (
            <tr key={k}>
              <td className="font-medium">{k}</td>
              <td>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 id="why-bun">Why Bun?</h2>
      <p>
        Bun-only repo (gate ở <code>preinstall: only-allow bun</code>). Lý do: install time 4×
        nhanh hơn npm và lockfile binary nhỏ. Trade-off: một số native deps đôi khi cần fallback
        node-gyp.
      </p>

      <h2 id="why-shadcn">Why shadcn over a component library?</h2>
      <p>
        Trước đây dự án dùng Ant Design. Đã migrate dần sang shadcn/ui (Radix + Tailwind) để
        control 100% styling, ship ít CSS hơn, và đồng nhất design language với DTC Backend
        v2 mà sếp đang lock contract.
      </p>

      <h2 id="cohabitation">Why Python + Next.js cohabit?</h2>
      <p>
        Sync workers viết bằng Python vì các SDK provider (Shopify Python SDK, Recharge,
        Klaviyo, Google Ads) đều mature hơn ở Python. Dashboard ở Next.js vì cần SSR / nhanh
        ship UI. Hai layer connect qua Supabase (single SoT), không có gRPC/HTTP nội bộ. Quy
        ước: <strong>không bao giờ</strong> import Python từ TS hoặc ngược lại.
      </p>

      <PageNav href="/docs/tech-stack" />
    </>
  );
}
