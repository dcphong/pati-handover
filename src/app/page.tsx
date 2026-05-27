import Link from "next/link";
import { HomeGuideTour, HomeGuideTourButton } from "@/components/docs/home-guide-tour";
import {
  detectIntegrations,
  IntegrationBadges,
  IntegrationLogo,
} from "@/components/docs/integration-logo";
import {
  ArrowRight,
  Boxes,
  Cable,
  CircuitBoard,
  Cloud,
  Cog,
  ClipboardList,
  Compass,
  Database,
  Gauge,
  GitBranch,
  GraduationCap,
  KeyRound,
  Package,
  Rocket,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Wrench,
} from "lucide-react";

const quickStart = [
  {
    title: "Local Setup",
    description: "Bun install, env vars, run dev server",
    userDescription: "Cài dự án trên máy cá nhân để dev có thể chạy thử dashboard.",
    href: "/docs/setup",
    Icon: Cog,
  },
  {
    title: "Supabase Connection",
    description: "Self-host on Mac mini, master_app schema",
    userDescription: "Nơi lưu dữ liệu trung tâm mà dashboard đang đọc và cập nhật.",
    href: "/docs/supabase",
    Icon: Database,
  },
  {
    title: "Mac mini Deploy",
    description: "GH Actions → Tailscale SSH → launchd next start",
    userDescription: "Quy trình đưa bản mới của dashboard lên Mac mini production.",
    href: "/docs/deploy-vercel",
    Icon: Rocket,
  },
  {
    title: "Troubleshooting",
    description: "Tunnel 502, PostgREST cache lag, build drift",
    userDescription: "Bắt đầu từ đây khi dashboard lỗi, dữ liệu trống hoặc số liệu lạ.",
    href: "/docs/troubleshooting",
    Icon: Wrench,
  },
];

const featureCards = [
  {
    title: "Shopify Sync",
    description:
      "Dual-pipeline (Python date-window + TS incremental) for orders, products, balance. Webhooks via HMAC.",
    userDescription: "Đưa đơn hàng, sản phẩm và hoàn tiền từ Shopify vào dashboard.",
    href: "/docs/feature-shopify-sync",
    Icon: ShoppingBag,
    tags: ["python", "next-api", "supabase"],
  },
  {
    title: "Analytics (First-party SoT)",
    description:
      "Provider Source-of-Truth analytics. raw_orders, raw_refunds, raw_ad_spend, v_stvf, summary_metrics RPC. TW chỉ là sanity check.",
    userDescription: "Báo cáo doanh thu, chi phí, hoàn tiền và lợi nhuận phục vụ business.",
    href: "/docs/feature-analytics",
    Icon: Gauge,
    tags: ["ad-spend", "klaviyo", "recharge", "meta"],
  },
  {
    title: "Multi-Store",
    description:
      "Active-store-context, shop_id scoping on all reads/writes. Phase 3 landed 2026-05-16.",
    userDescription: "Tách dữ liệu theo từng store để tránh xem nhầm số liệu.",
    href: "/docs/feature-multistore",
    Icon: Boxes,
    tags: ["scoping"],
  },
  {
    title: "IAM",
    description: "AWS-style policies, 75 actions, audit log. /iam page.",
    userDescription: "Quản lý ai được xem hoặc thao tác từng phần trong dashboard.",
    href: "/docs/feature-iam",
    Icon: KeyRound,
    tags: ["policies"],
  },
  {
    title: "COGS Catalog",
    description:
      "Lark per-PO authoritative source. master_app.cogs_full_catalog overrides raw_variants.cost.",
    userDescription: "Nguồn giá vốn sản phẩm dùng để tính lợi nhuận chính xác.",
    href: "/docs/feature-cogs",
    Icon: Package,
    tags: ["cost-of-goods"],
  },
  {
    title: "ChargeFlow Disputes",
    description:
      "5-min cron via Mac mini Chrome CDP. Auto evidence collection + upload.",
    userDescription: "Theo dõi tranh chấp thanh toán và bằng chứng cần xử lý.",
    href: "/docs/feature-chargeflow",
    Icon: ShieldCheck,
    tags: ["chargebacks", "cdp"],
  },
  {
    title: "CS Dashboard",
    description: "3-panel CS dashboard tự host + Lark Mail reconcile. customer_profiles join.",
    userDescription: "Màn hình hỗ trợ CS xem khách hàng, đơn hàng, email và ghi chú.",
    href: "/docs/feature-cs",
    Icon: Compass,
    tags: ["customer-service"],
  },
  {
    title: "CS & OF",
    description:
      "Shipping cost payment-request workflow: batch cost, export CSV, validate output, submit form.",
    userDescription: "Quy trình chốt shipping cost và nộp payment request cho CS & OF.",
    href: "/docs/feature-cs-of",
    Icon: ClipboardList,
    tags: ["shipping-cost", "payment-request"],
  },
  {
    title: "Best Fulfillment",
    description: "CSV import for Lark shipping rate card → bestfulfill_shipping_rates.",
    userDescription: "So sánh chi phí vận chuyển để chọn phương án fulfillment phù hợp.",
    href: "/docs/feature-bestfulfill",
    Icon: Truck,
    tags: ["shipping"],
  },
  {
    title: "VNH / NS3 Fulfillment",
    description:
      "Flexport REST API. Auto-submit stuck Shopify FOs (REQUEST_FULFILLMENT).",
    userDescription: "Luồng gửi đơn sang đơn vị fulfillment và xử lý đơn bị kẹt.",
    href: "/docs/feature-fulfillment",
    Icon: Truck,
    tags: ["flexport"],
  },
  {
    title: "Cron Jobs",
    description: "16 cron jobs on Mac mini + GH Actions. North Stars daily, Meta ads hourly.",
    userDescription: "Các lịch tự động cập nhật dữ liệu cho dashboard.",
    href: "/docs/cron-jobs",
    Icon: GitBranch,
    tags: ["scheduling"],
  },
  {
    title: "Timcook",
    description: "Openclaw training handover, agenda, checklist, and follow-up ownership.",
    userDescription: "Phần training Openclaw mà bạn phụ trách cho Timcook.",
    href: "/docs/timcook",
    Icon: GraduationCap,
    tags: ["training", "handover"],
  },
  {
    title: "Mac mini Self-Host",
    description: "M4/16GB at the PATI office. Tailscale + Cloudflared. Supabase Docker stack.",
    userDescription: "Máy chủ nội bộ đang chạy database và một số dịch vụ nền.",
    href: "/docs/mac-mini",
    Icon: Cloud,
    tags: ["infra"],
  },
  {
    title: "Tailscale Access",
    description: "Install Tailscale, SSH/VNC into Mac mini via private IP.",
    userDescription: "Cách cài Tailscale và remote vào Mac mini an toàn.",
    href: "/docs/tailscale",
    Icon: KeyRound,
    tags: ["access", "mac-mini"],
  },
];

export default function Home() {
  return (
    <main className="flex-1">
      <HomeGuideTour />
      <section className="relative border-b overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />
        <div className="relative mx-auto max-w-screen-2xl px-6 py-20 sm:py-28">
          <div className="max-w-3xl" data-tour="home-hero">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 backdrop-blur px-3 py-1 text-xs text-muted-foreground mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Handover — last updated 2026-05-24
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight" style={{ letterSpacing: "-0.035em" }}>
              pati-master-app
              <br />
              <span className="text-muted-foreground">handover docs.</span>
            </h1>
            <p data-user-detail className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-8">
              Tài liệu bàn giao để người mới hiểu dashboard PATI: hệ thống lấy dữ liệu từ đâu,
              ai dùng phần nào, và nên bắt đầu ở trang nào.
            </p>
            <p data-dev-detail className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-8">
              Everything người mới cần để chạy được hệ thống Shopify · Lark · Supabase ·
              Mac mini self-hosted của PATI. Từ kết nối DB, deploy, đến từng feature chi tiết.
            </p>
            <div className="mt-5">
              <IntegrationBadges integrations={["shopify", "lark", "supabase"]} />
            </div>
            <div
              data-user-detail
              className="mt-5 max-w-2xl rounded-lg border border-emerald-500/30 bg-emerald-500/[0.04] px-4 py-3 text-sm leading-6 text-foreground/80"
            >
              Bạn đang ở <strong>User mode</strong>: docs ưu tiên giải thích dễ hiểu cho người vận hành,
              ẩn bớt command/code và thuật ngữ nội bộ. Chuyển sang <strong>Dev</strong> trên thanh
              trên cùng khi cần chi tiết kỹ thuật.
            </div>
            <div
              data-dev-detail
              className="mt-5 max-w-2xl rounded-lg border border-violet-500/30 bg-violet-500/[0.04] px-4 py-3 text-sm leading-6 text-foreground/80"
            >
              Dev mode đang bật: docs hiển thị exact runtime, schema, API route, command và các
              invariant cần giữ khi sửa code.
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/docs/overview"
                data-tour="start-reading"
                className="inline-flex items-center gap-2 rounded-md bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Start reading
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs/setup"
                className="inline-flex items-center gap-2 rounded-md border bg-background px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                <Cog className="h-4 w-4" />
                Setup local
              </Link>
              <Link
                href="/docs/deploy-vercel"
                className="inline-flex items-center gap-2 rounded-md border bg-background px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                <Rocket className="h-4 w-4" />
                Deploy guide
              </Link>
              <HomeGuideTourButton />
            </div>
            <div
              data-user-detail
              className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-px bg-border rounded-lg overflow-hidden border max-w-2xl"
            >
              {[
                { label: "Core guides", value: "12" },
                { label: "Feature pages", value: "15" },
                { label: "Key workflows", value: "5" },
                { label: "Auto updates", value: "16" },
              ].map((s) => (
                <div key={s.label} className="bg-background px-4 py-3">
                  <div className="text-2xl font-bold tracking-tight">{s.value}</div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
            <div
              data-dev-detail
              className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-px bg-border rounded-lg overflow-hidden border max-w-2xl"
            >
              {[
                { label: "Symbols", value: "12,639" },
                { label: "Relationships", value: "19,849" },
                { label: "Execution flows", value: "300" },
                { label: "Cron jobs", value: "16" },
              ].map((s) => (
                <div key={s.label} className="bg-background px-4 py-3">
                  <div className="text-2xl font-bold tracking-tight">{s.value}</div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b" data-tour="quick-start">
        <div className="mx-auto max-w-screen-2xl px-6 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Quick start
              </div>
              <h2 className="text-3xl font-bold tracking-tight" style={{ letterSpacing: "-0.02em" }}>
                Get running in 30 minutes.
              </h2>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickStart.map((q) => {
              const integrations = detectIntegrations(q.title, q.description, q.userDescription);

              return (
                <Link
                  key={q.href}
                  href={q.href}
                  className="group relative rounded-xl border bg-card p-5 hover:border-foreground/30 hover:shadow-sm transition-all"
                >
                  <div className="mb-3 flex h-9 items-center gap-1.5">
                    {integrations.length > 0 ? (
                      integrations.map((integration) => (
                        <IntegrationLogo key={integration} integration={integration} className="h-9 w-9" />
                      ))
                    ) : (
                      <div className="h-9 w-9 rounded-lg bg-muted grid place-items-center group-hover:bg-foreground group-hover:text-background transition-colors">
                        <q.Icon className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="font-semibold mb-1">{q.title}</div>
                  <div className="text-sm text-muted-foreground leading-5">
                    <span data-user-detail>{q.userDescription}</span>
                    <span data-dev-detail>{q.description}</span>
                  </div>
                  <ArrowRight className="absolute top-5 right-5 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b" data-tour="feature-catalog">
        <div className="mx-auto max-w-screen-2xl px-6 py-16">
          <div className="mb-10">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              Feature catalog
            </div>
            <h2 className="text-3xl font-bold tracking-tight" style={{ letterSpacing: "-0.02em" }}>
              Every moving piece, documented.
            </h2>
            <p className="mt-2 text-muted-foreground max-w-2xl">
              <span data-user-detail>
                Mỗi card dẫn tới một trang giải thích mục đích, ai dùng, khi nào cần kiểm tra,
                và khi nào cần gọi dev hỗ trợ.
              </span>
              <span data-dev-detail>
                Each card jumps to a deep-dive page covering data flow, tables touched,
                env vars, known pitfalls, and how to extend it.
              </span>
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featureCards.map((f) => {
              const integrations = detectIntegrations(
                f.title,
                f.description,
                f.userDescription,
                f.tags.join(" "),
              );

              return (
                <Link
                  key={f.href}
                  href={f.href}
                  className="group rounded-xl border bg-card p-6 hover:border-foreground/30 transition-all flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-10 items-center gap-1.5">
                      {integrations.length > 0 ? (
                        integrations.map((integration) => (
                          <IntegrationLogo key={integration} integration={integration} className="h-10 w-10" />
                        ))
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-muted to-muted/40 grid place-items-center border">
                          <f.Icon className="h-[18px] w-[18px]" />
                        </div>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="font-semibold text-base mb-1.5">{f.title}</div>
                  <div className="text-sm text-muted-foreground leading-6 flex-1">
                    <span data-user-detail>{f.userDescription}</span>
                    <span data-dev-detail>{f.description}</span>
                  </div>
                  <div data-dev-detail className="mt-4 flex flex-wrap gap-1.5">
                    {f.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground bg-muted rounded px-1.5 py-0.5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-screen-2xl px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Stack
              </div>
              <h2 className="text-3xl font-bold tracking-tight" style={{ letterSpacing: "-0.02em" }}>
                <span data-user-detail>What powers the dashboard.</span>
                <span data-dev-detail>Tech behind the curtain.</span>
              </h2>
              <p data-user-detail className="mt-3 text-muted-foreground leading-7">
                The dashboard reads data from Shopify, Lark, logistics providers, marketing tools
                and the central database. Most updates happen automatically in the background, so
                users can focus on orders, COGS, CS and finance workflows.
              </p>
              <p data-dev-detail className="mt-3 text-muted-foreground leading-7">
                Next.js 16 App Router (TypeScript) for the dashboard, Python 3.12 for sync
                workers, Supabase and the production web host on Mac mini. Cloudflared exposes
                Supabase and the web app via{" "}
                <code className="px-1 py-0.5 bg-muted rounded text-[12px] font-mono">
                  supabase.patiagency.com
                </code>
                .
              </p>
              <Link
                href="/docs/architecture"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium hover:underline"
              >
                Full architecture diagram
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div data-user-detail className="rounded-xl border bg-card p-5">
              <div className="text-sm font-semibold mb-4">Main data sources</div>
              <div className="space-y-3 text-sm text-muted-foreground leading-6">
                <div className="flex items-center gap-2">
                  <IntegrationLogo integration="shopify" className="h-7 w-7" />
                  <span>Shopify supplies orders, products, refunds and payment status.</span>
                </div>
                <div className="flex items-center gap-2">
                  <IntegrationLogo integration="lark" className="h-7 w-7" />
                  <span>Lark supplies operations data such as COGS, routing and SOP tables.</span>
                </div>
                <div className="flex items-center gap-2">
                  <IntegrationLogo integration="supabase" className="h-7 w-7" />
                  <span>The database stores the cleaned data that dashboard pages read.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cloud className="h-7 w-7 rounded-md border bg-muted p-1.5 text-foreground/70" />
                  <span>Mac mini hosts production services and scheduled background updates.</span>
                </div>
              </div>
            </div>
            <div data-dev-detail className="rounded-xl border bg-card p-1">
              <div className="rounded-lg bg-muted/40 p-5 font-mono text-[13px] leading-7">
                <div className="text-muted-foreground">{`# layers`}</div>
                <div>
                  <span className="text-orange-500">web</span>{" "}
                  <span className="text-muted-foreground">→</span>{" "}
                  Next.js · shadcn · Tailwind v4
                </div>
                <div>
                  <span className="text-violet-500">api</span>{" "}
                  <span className="text-muted-foreground">→</span>{" "}
                  /src/app/api · Node runtime on Mac mini
                </div>
                <div>
                  <span className="text-emerald-500">workers</span>{" "}
                  <span className="text-muted-foreground">→</span>{" "}
                  Python 3.12 · /sync · cron
                </div>
                <div>
                  <span className="text-sky-500">db</span>{" "}
                  <span className="text-muted-foreground">→</span>{" "}
                  Supabase (Postgres) · master_app schema
                </div>
                <div>
                  <span className="text-pink-500">infra</span>{" "}
                  <span className="text-muted-foreground">→</span>{" "}
                  Mac mini · Cloudflared · Tailscale
                </div>
                <div className="mt-3 text-muted-foreground">{`# upstream sources`}</div>
                <div className="text-foreground/70">
                  <span className="inline-flex items-center gap-1.5">
                    <IntegrationLogo integration="shopify" className="h-5 w-5" />
                    Shopify
                  </span>{" "}
                  ·{" "}
                  <span className="inline-flex items-center gap-1.5">
                    <IntegrationLogo integration="lark" className="h-5 w-5" />
                    Lark
                  </span>{" "}
                  · Flexport · PayPal · Klaviyo
                </div>
                <div className="text-foreground/70">
                  Recharge · Meta Ads · Google Ads · ChargeFlow
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto max-w-screen-2xl px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-orange-500 via-pink-500 to-violet-600 grid place-items-center text-white text-xs font-black">
              P
            </div>
            <div className="text-sm">
              <div className="font-medium">PATI Handover</div>
              <div className="text-xs text-muted-foreground">
                Written by Phong · Bàn giao 1-1 cho người tiếp nhận sau 2026-05-24
              </div>
            </div>
          </div>
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <Link href="/docs/overview" className="hover:text-foreground transition-colors">
              Docs
            </Link>
            <Link href="/docs/troubleshooting" className="hover:text-foreground transition-colors">
              Troubleshooting
            </Link>
            <Link href="/docs/glossary" className="hover:text-foreground transition-colors">
              Glossary
            </Link>
            <CircuitBoard className="h-4 w-4" />
          </div>
        </div>
      </footer>
    </main>
  );
}
