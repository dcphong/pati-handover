import {
  Activity,
  BarChart3,
  Cable,
  Database,
  KeyRound,
  Mail,
  Repeat,
  Shield,
  ShoppingBag,
  Truck,
  Webhook,
} from "lucide-react";
import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import {
  EnvCategory,
  EnvCategoryCard,
  EnvLegend,
  Terminal,
  TerminalInline,
} from "@/components/docs/visuals";

export const metadata = { title: "Environment Variables — PATI Handover" };

const categories: EnvCategory[] = [
  {
    title: "Shopify",
    icon: ShoppingBag,
    description: "Custom-app credentials (KHÔNG public app). Webhook HMAC dùng API_SECRET.",
    rows: [
      {
        name: "SHOPIFY_DOMAIN",
        status: "required",
        desc: (
          <>
            Primary store domain. Production ={" "}
            <TerminalInline>e49d78-3.myshopify.com</TerminalInline> (WellnessNest).
          </>
        ),
      },
      {
        name: "SHOPIFY_API_VERSION",
        status: "required",
        desc: (
          <>
            Pin <TerminalInline>2025-01</TerminalInline>.
          </>
        ),
      },
      {
        name: "SHOPIFY_ACCESS_TOKEN",
        status: "required",
        desc: "Custom-app token (Lark Integration app — không phải public).",
      },
      {
        name: "SHOPIFY_API_KEY",
        status: "required",
        desc: "Public key cho Lark Integration custom app.",
      },
      {
        name: "SHOPIFY_API_SECRET",
        status: "required",
        desc: (
          <>
            Webhook HMAC secret. <strong>Phải</strong> match Lark Integration app&apos;s secret
            hiển thị 1 lần ở <em>Develop apps → API credentials → Reveal</em>.
          </>
        ),
      },
    ],
  },
  {
    title: "Supabase (self-host)",
    icon: Database,
    description: "Self-host Mac mini, expose qua Cloudflared. Schema master_app.",
    rows: [
      {
        name: "NEXT_PUBLIC_SUPABASE_URL",
        status: "required",
        desc: "https://supabase.patiagency.com (Cloudflared tunnel → Mac mini).",
      },
      {
        name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        status: "required",
        desc: "Public anon role JWT.",
      },
      {
        name: "SUPABASE_URL",
        status: "required",
        desc: "Cùng giá trị NEXT_PUBLIC_SUPABASE_URL, dùng server-side.",
      },
      {
        name: "SUPABASE_SERVICE_KEY",
        status: "required",
        desc: (
          <>
            service_role JWT — <strong>bypass RLS</strong>. Tuyệt đối không expose client.
          </>
        ),
      },
    ],
  },
  {
    title: "Lark / Feishu",
    icon: Cable,
    description: "PATI Sync Hub Lark custom app. Domain SG/Intl (KHÔNG feishu.cn).",
    rows: [
      { name: "LARK_APP_ID", status: "required", desc: "PATI Sync Hub Lark custom app ID." },
      { name: "LARK_APP_SECRET", status: "required", desc: "Lark app secret." },
      {
        name: "LARK_DOMAIN",
        status: "required",
        desc: (
          <>
            <TerminalInline>open.larksuite.com</TerminalInline> — không phải feishu.cn.
          </>
        ),
      },
      {
        name: "LARK_MAIL_APP_ID",
        status: "optional",
        desc: "Separate Lark app dành riêng cho Mail API (nếu tách).",
      },
      { name: "LARK_MAIL_APP_SECRET", status: "optional", desc: "Same." },
      {
        name: "LARK_MAIL_TARGET_USER",
        status: "optional",
        desc: "Email user dùng để query Lark Mail.",
      },
      {
        name: "LARK_OAUTH_REDIRECT_URI",
        status: "optional",
        desc: "Lark OAuth callback (cho Sign-in-with-Lark).",
      },
    ],
  },
  {
    title: "Flexport",
    icon: Truck,
    description: "Logistics API (NS3). Legacy scraper vẫn fallback.",
    rows: [
      {
        name: "FLEXPORT_API_TOKEN",
        status: "required",
        desc: (
          <>
            Logistics API token (<TerminalInline>shltm_...</TerminalInline>). Single token,
            per-warehouse stock via <TerminalInline>POST /products/warehouse</TerminalInline>.
          </>
        ),
      },
      {
        name: "FLEXPORT_EMAIL / FLEXPORT_PASSWORD",
        status: "legacy",
        desc: "Login cho Playwright scraper. Replaced by API 2026-05-20, vẫn giữ làm fallback.",
      },
    ],
  },
  {
    title: "Auth & runtime",
    icon: KeyRound,
    description: "JWT custom + cookie. Cron secret cho Mac mini gọi endpoint nội bộ.",
    rows: [
      {
        name: "JWT_SECRET",
        status: "required",
        desc: "256-bit random. Sign session cookie.",
      },
      {
        name: "APP_BASE_URL",
        status: "required",
        desc: (
          <>
            <TerminalInline>https://pnl.patigroup.com</TerminalInline> — dùng trong webhook URL,
            redirect.
          </>
        ),
      },
      {
        name: "CRON_SECRET",
        status: "required",
        desc: (
          <>
            Bearer token Mac mini cron dùng để call{" "}
            <TerminalInline>/api/cron/*</TerminalInline>.
          </>
        ),
      },
      {
        name: "MIGRATION_SECRET",
        status: "one-off",
        desc: (
          <>
            Required cho <TerminalInline>/api/auth/migrate-passwords</TerminalInline>.
          </>
        ),
      },
      {
        name: "ADMIN_SECRET",
        status: "optional",
        desc: "Một số admin-only endpoint.",
      },
      {
        name: "SYNC_ENCRYPTION_KEY",
        status: "required",
        desc: (
          <>
            Fernet base64 — encrypt credentials lưu trong{" "}
            <TerminalInline>custom_table_sync_credentials</TerminalInline>.
          </>
        ),
      },
    ],
  },
  {
    title: "Analytics providers",
    icon: BarChart3,
    description: "Mỗi provider 1-2 token. PayPal Transaction Search scope enabled 2026-05-21.",
    rows: [
      {
        name: "PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET",
        status: "required",
        desc: "PayPal app credentials (analytics).",
      },
      {
        name: "PAYPAL_MODE",
        status: "required",
        desc: (
          <>
            <TerminalInline>live</TerminalInline> | <TerminalInline>sandbox</TerminalInline>.
          </>
        ),
      },
      {
        name: "RECHARGE_STOREFONT_TOKEN",
        status: "required",
        desc: (
          <>
            <TerminalInline>sk_2x2_...</TerminalInline> cho WellnessNest store.
          </>
        ),
      },
      {
        name: "RECHARGE_TIMCOOK_TOKEN",
        status: "optional",
        desc: "Recharge token cho store thứ 2.",
      },
      {
        name: "GOOGLE_ADS_DEVELOPER_TOKEN",
        status: "required",
        desc: "Dev token approved 2026-05-19.",
      },
      {
        name: "GG_ADS_CUSTOMER_ID",
        status: "required",
        desc: (
          <>
            Account ID. Manager ID = <TerminalInline>944-854-0582</TerminalInline>.
          </>
        ),
      },
      {
        name: "MICROSOFT_ADS_DEVELOPER_TOKEN",
        status: "optional",
        desc: "Bing Ads — chỉ cần nếu onboarded.",
      },
    ],
  },
  {
    title: "ChargeFlow",
    icon: Shield,
    description: "Cookie-based UI sync chính. HMAC fallback.",
    rows: [
      {
        name: "CHARGEFLOW_ACCESS_KEY / CHARGEFLOW_SECRET_KEY",
        status: "required",
        desc: "Public API fallback path.",
      },
      {
        name: "CHARGEFLOW_USE_HMAC",
        status: "optional",
        desc: (
          <>
            Default <TerminalInline>false</TerminalInline>. UI-API path dùng cookie.
          </>
        ),
      },
      {
        name: "CHARGEFLOW_UI_COOKIE",
        status: "prod-only",
        desc: "Set trong Mac mini runtime env từ Chrome CDP. Source-of-truth dispute sync.",
      },
      {
        name: "CHARGEFLOW_UI_STATUS_PARAM",
        status: "optional",
        desc: "URL query cho status filter.",
      },
    ],
  },
  {
    title: "CJ / Dispute providers",
    icon: Webhook,
    description: "CJ Dropshipping webhook secret + Stripe read-only.",
    rows: [
      { name: "CJ_QPS", status: "optional", desc: "Rate limit cho CJ Dropshipping." },
      {
        name: "CJ_WEBHOOK_SECRET",
        status: "required",
        desc: "Verify CJ webhook signature.",
      },
      {
        name: "STRIPE_RESTRICTED_API_KEY",
        status: "optional",
        desc: "Read-only Stripe key cho dispute provider.",
      },
    ],
  },
  {
    title: "Lark Mail / CS Dashboard",
    icon: Mail,
    description: "IMAP fallback nếu Lark Mail API down. Gmail app password legacy.",
    rows: [
      {
        name: "LARK_MAIL_USER / LARK_MAIL_APP_PASSWORD",
        status: "optional",
        desc: "IMAP fallback nếu Lark Mail API down.",
      },
      {
        name: "WELLNEST_HELLO_IMAP_USER / _PASSWORD",
        status: "optional",
        desc: (
          <>
            <TerminalInline>hello@wellnestness.co</TerminalInline> IMAP.
          </>
        ),
      },
      {
        name: "GMAIL_APP_PASSWORD_WELLNESSNEST",
        status: "legacy",
        desc: "Gmail app password (legacy fallback).",
      },
      {
        name: "CS_DASHBOARD_LARK_START_DATE",
        status: "optional",
        desc: 'Override "today" anchor cho CS Dashboard testing.',
      },
    ],
  },
  {
    title: "GitHub Actions",
    icon: Webhook,
    description: "Dùng cho GitHub Actions deploy Mac mini và workflow_dispatch phụ.",
    rows: [
      {
        name: "GITHUB_TOKEN",
        status: "required",
        desc: "GitHub Actions token/PAT dùng khi deploy-web.sh fetch repo hoặc trigger workflow phụ.",
      },
      {
        name: "GITHUB_REPO",
        status: "required",
        desc: (
          <>
            <TerminalInline>Hoaibaodata/shopify-lark-sync</TerminalInline>.
          </>
        ),
      },
    ],
  },
  {
    title: "Recharge bucketing — special",
    icon: Repeat,
    description: "Fix bug Node parse naive ISO thành local-PDT làm subs undercount.",
    rows: [
      {
        name: "RECHARGE_BUCKET_TZ",
        status: "required",
        desc: (
          <>
            <strong>Phải là</strong> <TerminalInline>&quot;+00:00&quot;</TerminalInline>. Lý do: Recharge
            trả naive ISO, Node parse thành local-PDT → shifted theo shop tz →
            cancelled_subs undercount. Memo: <TerminalInline>reference_recharge_tz_bug</TerminalInline>.
          </>
        ),
      },
    ],
  },
];

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Getting Started"
        title="Environment Variables"
        description="Full catalog mọi env vars app và workers cần. Nhóm theo provider, có status badge."
      />

      <Callout variant="warning" title="Never commit .env">
        File <TerminalInline>.env</TerminalInline> đã có trong{" "}
        <TerminalInline>.gitignore</TerminalInline>. Production hiện đọc env từ Mac mini repo{" "}
        <TerminalInline>.env</TerminalInline> và override tại{" "}
        <TerminalInline>~/pati-supabase/cron/.env.web</TerminalInline>. Xem{" "}
        <a href="/docs/deploy-vercel" className="underline">
          Deploy
        </a>{" "}
        để biết deploy script restart web service sau khi đổi env.
      </Callout>

      <h2 id="legend">Status legend</h2>
      <EnvLegend />
      <div className="not-prose my-3 text-[12.5px] text-muted-foreground space-y-1">
        <div><strong>Bắt buộc</strong>: thiếu là crash app khi start.</div>
        <div><strong>Tuỳ chọn</strong>: feature liên quan sẽ disable nếu thiếu.</div>
        <div><strong>Legacy</strong>: dùng cho fallback, có cái mới thay thế.</div>
        <div><strong>1-lần</strong>: chỉ dùng cho migration/backfill, có thể xoá sau.</div>
        <div><strong>Prod-only</strong>: chỉ set trên Mac mini runtime, không cần cho dev.</div>
      </div>

      <h2 id="catalog">Catalog — phân theo provider</h2>
      {categories.map((cat) => (
        <EnvCategoryCard key={cat.title} cat={cat} />
      ))}

      <h2 id="macmini-env">Đồng bộ env từ Mac mini về local</h2>
      <p>Nguồn production hiện là Mac mini, không phải Vercel env. Nếu bạn có quyền SSH:</p>
      <Terminal
        host="you@laptop"
        cwd="~/Coding/shopify-lark-sync"
        lines={[
          { prompt: "$", cmd: "ssh timcook@100.94.220.128" },
          { prompt: "timcook@mini $", cmd: "cd ~/Coding_workspace/PATI/shopify-lark-sync" },
          { prompt: "timcook@mini $", cmd: "cp .env .env.local.backup.$(date +%F)" },
          { divider: true, label: "kết quả" },
          { out: "Dùng .env hiện tại làm source để đối chiếu local; không commit file này.", tone: "ok" },
        ]}
      />
      <Callout variant="warning" title="Không paste secret lung tung">
        Copy env qua kênh riêng an toàn. Không paste nguyên file vào chat, ticket, hoặc docs.
        Khi đổi env production, chạy lại <TerminalInline>deploy-web.sh --force</TerminalInline>{" "}
        hoặc push main để GitHub Actions rebuild + restart Mac mini web.
      </Callout>

      <h2 id="gotchas">2 gotcha thường gặp</h2>
      <div className="not-prose my-5 grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl border-2 border-amber-500/40 bg-amber-500/[0.04] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <div className="font-semibold text-[14px]">NEXT_PUBLIC_* phải rebuild + restart</div>
          </div>
          <div className="text-[13px] leading-6 text-foreground/85">
            Vars có prefix <TerminalInline>NEXT_PUBLIC_</TerminalInline> được inline vào client
            bundle ở build time. Sửa env xong phải build lại và restart{" "}
            <TerminalInline>com.pati.web</TerminalInline> qua deploy Mac mini.
          </div>
        </div>
        <div className="rounded-xl border-2 border-red-500/40 bg-red-500/[0.04] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-red-600 dark:text-red-400" />
            <div className="font-semibold text-[14px]">Đổi env phải có backup</div>
          </div>
          <div className="text-[13px] leading-6 text-foreground/85">
            Trước khi sửa env trên Mac mini, backup file hiện tại rồi dùng editor/secret store.
            Sau đó force deploy để process đọc lại env:
            <Terminal
              host="you@laptop"
              cwd="~"
              lines={[
                { prompt: "timcook@mini $", cmd: "cp .env .env.backup.$(date +%F-%H%M)" },
                { prompt: "timcook@mini $", cmd: "DEPLOY_BRANCH=main bash scripts/macmini-stack/deploy-web.sh --force" },
              ]}
            />
          </div>
        </div>
      </div>

      <PageNav href="/docs/env" />
    </>
  );
}
