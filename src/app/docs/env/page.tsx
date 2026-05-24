import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export const metadata = { title: "Environment Variables — PATI Handover" };

const groups = [
  {
    title: "Shopify",
    rows: [
      ["SHOPIFY_DOMAIN", "Required", "Primary store domain. Production = e49d78-3.myshopify.com (WellnessNest)."],
      ["SHOPIFY_API_VERSION", "Required", "Pin to 2025-01."],
      ["SHOPIFY_ACCESS_TOKEN", "Required", "Custom-app token (Lark Integration app)."],
      ["SHOPIFY_API_KEY", "Required", "Public key cho Lark Integration custom app."],
      ["SHOPIFY_API_SECRET", "Required", "Webhook HMAC secret. Phải match Lark Integration app's secret hiển thị 1 lần ở Develop apps → API credentials → Reveal."],
    ],
  },
  {
    title: "Supabase (self-host)",
    rows: [
      ["NEXT_PUBLIC_SUPABASE_URL", "Required", "https://supabase.patiagency.com (Cloudflared tunnel → Mac mini)."],
      ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "Required", "Public anon role JWT."],
      ["SUPABASE_URL", "Required", "Same as NEXT_PUBLIC_SUPABASE_URL but for server-side."],
      ["SUPABASE_SERVICE_KEY", "Required", "service_role JWT — bypass RLS. Never expose to client."],
    ],
  },
  {
    title: "Lark / Feishu",
    rows: [
      ["LARK_APP_ID", "Required", "PATI Sync Hub Lark custom app ID."],
      ["LARK_APP_SECRET", "Required", "Lark app secret."],
      ["LARK_DOMAIN", "Required", "open.larksuite.com (SG/Intl) — không phải feishu.cn."],
      ["LARK_MAIL_APP_ID", "Optional", "Separate Lark app dành riêng cho mail API (nếu tách)."],
      ["LARK_MAIL_APP_SECRET", "Optional", "Same."],
      ["LARK_MAIL_TARGET_USER", "Optional", "Email user dùng để query Lark Mail."],
      ["LARK_OAUTH_REDIRECT_URI", "Optional", "Lark OAuth callback (cho Sign-in-with-Lark)."],
    ],
  },
  {
    title: "Flexport",
    rows: [
      ["FLEXPORT_API_TOKEN", "Required (NS3)", "Logistics API token (shltm_...). Single token, per-warehouse stock via POST /products/warehouse."],
      ["FLEXPORT_EMAIL / FLEXPORT_PASSWORD", "Legacy", "Login cho Playwright scraper. Replaced by API 2026-05-20, kept as fallback."],
    ],
  },
  {
    title: "Auth & runtime",
    rows: [
      ["JWT_SECRET", "Required", "256-bit random. Used to sign session cookies."],
      ["APP_BASE_URL", "Required", "https://pnl.patigroup.com — used in webhook URLs, redirects."],
      ["CRON_SECRET", "Required", "Bearer token Mac mini cron uses to call Vercel /api/cron/*."],
      ["MIGRATION_SECRET", "One-off", "Required cho /api/auth/migrate-passwords."],
      ["ADMIN_SECRET", "Optional", "Một số admin-only endpoint."],
      ["SYNC_ENCRYPTION_KEY", "Required", "Fernet base64 — encrypt credentials lưu trong custom_table_sync_credentials."],
    ],
  },
  {
    title: "Analytics providers",
    rows: [
      ["PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET", "Required (analytics)", "PayPal app. Transaction Search scope enabled 2026-05-21."],
      ["PAYPAL_MODE", "Required (analytics)", "live | sandbox."],
      ["RECHARGE_STOREFONT_TOKEN", "Required (recharge)", "sk_2x2_... cho WN."],
      ["RECHARGE_TIMCOOK_TOKEN", "Optional", "Recharge token cho store thứ 2."],
      ["GOOGLE_ADS_DEVELOPER_TOKEN", "Required (google)", "Dev token approved 2026-05-19."],
      ["GG_ADS_CUSTOMER_ID", "Required (google)", "Account ID. Manager ID = 944-854-0582."],
      ["MICROSOFT_ADS_DEVELOPER_TOKEN", "Optional", "Bing Ads if onboarded."],
    ],
  },
  {
    title: "ChargeFlow",
    rows: [
      ["CHARGEFLOW_ACCESS_KEY / CHARGEFLOW_SECRET_KEY", "Required", "Public API fallback."],
      ["CHARGEFLOW_USE_HMAC", "Optional", "Default false. UI-API path uses cookie."],
      ["CHARGEFLOW_UI_COOKIE", "Required (prod)", "Set on Vercel from Mac mini Chrome CDP. Source-of-truth dispute sync."],
      ["CHARGEFLOW_UI_STATUS_PARAM", "Optional", "URL query for status filter."],
    ],
  },
  {
    title: "CJ / Dispute Providers",
    rows: [
      ["CJ_QPS", "Optional", "Rate limit cho CJ Dropshipping."],
      ["CJ_WEBHOOK_SECRET", "Required (CJ)", "Verify CJ webhook signature."],
      ["STRIPE_RESTRICTED_API_KEY", "Optional", "Read-only Stripe key cho dispute provider."],
    ],
  },
  {
    title: "Lark Mail / CS",
    rows: [
      ["LARK_MAIL_USER / LARK_MAIL_APP_PASSWORD", "Optional", "IMAP fallback nếu Lark Mail API down."],
      ["WELLNEST_HELLO_IMAP_USER / _PASSWORD", "Optional", "hello@wellnestness.co IMAP."],
      ["GMAIL_APP_PASSWORD_WELLNESSNEST", "Optional", "Gmail app password (legacy)."],
      ["CS_DASHBOARD_LARK_START_DATE", "Optional", "Override 'today' anchor cho CS Dashboard testing."],
    ],
  },
  {
    title: "GitHub Actions",
    rows: [
      ["GITHUB_TOKEN", "Required", "PAT to trigger workflow_dispatch from Vercel."],
      ["GITHUB_REPO", "Required", "Hoaibaodata/shopify-lark-sync."],
    ],
  },
  {
    title: "Recharge bucketing",
    rows: [
      ["RECHARGE_BUCKET_TZ", "Required (analytics parity)", "Phải là \"+00:00\". Lý do: Recharge naive ISO parsed as local-PDT by Node → shifted by shop tz → cancelled_subs undercounted. Xem reference."],
    ],
  },
];

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Getting Started"
        title="Environment Variables"
        description="Full catalog of every env var the app and workers expect."
      />

      <Callout variant="warning" title="Never commit .env">
        File <code>.env</code> đã có trong <code>.gitignore</code>. Tất cả secrets dùng cho
        production phải set qua{" "}
        <code>vercel env add</code>. Xem <a href="/docs/deploy-vercel">Deploy</a>.
      </Callout>

      {groups.map((g) => (
        <section key={g.title}>
          <h2 id={g.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}>{g.title}</h2>
          <table>
            <thead>
              <tr>
                <th style={{ width: "30%" }}>Variable</th>
                <th style={{ width: "15%" }}>Status</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {g.rows.map((r) => (
                <tr key={r[0]}>
                  <td>
                    <code className="text-[12px]">{r[0]}</code>
                  </td>
                  <td className="text-muted-foreground text-[13px]">{r[1]}</td>
                  <td className="text-[14px]">{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      <h2 id="vercel-pull">Pull env vars from Vercel</h2>
      <p>Sau khi link Vercel project, kéo env vars về máy local:</p>
      <CodeBlock language="bash">{`vercel link  # one-time
vercel env pull .env.local`}</CodeBlock>
      <Callout variant="warning" title="vercel env pull doesn't decrypt secrets">
        Các encrypted vars sẽ show <code>NAME=&quot;&quot;</code> bất kể giá trị thực. Bạn vẫn
        phải nhập tay những giá trị nhạy cảm — pull chỉ giúp đồng bộ <em>tên</em> biến.
      </Callout>

      <h2 id="next-public-redeploy">NEXT_PUBLIC_* requires redeploy</h2>
      <p>
        Vars bắt đầu bằng <code>NEXT_PUBLIC_</code> được inline vào client bundle ở build time.
        <code> vercel env add NEXT_PUBLIC_X</code> alone won't propagate — phải{" "}
        <code>vercel --prod</code> after.
      </p>

      <h2 id="env-add-stdin-trap">Stdin trap khi add env</h2>
      <p>
        <code>echo &quot;v&quot; | vercel env add NAME prod</code> lưu EMPTY string. Phải dùng
        redirect:
      </p>
      <CodeBlock language="bash">{`vercel env add MY_SECRET production < my-secret.txt`}</CodeBlock>

      <PageNav href="/docs/env" />
    </>
  );
}
