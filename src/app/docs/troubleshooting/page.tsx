import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export const metadata = { title: "Troubleshooting — PATI Handover" };

const items = [
  {
    title: "Dashboard cards show $0 / blank sections",
    cause: "99% chance là Cloudflared tunnel down (home ISP NAT timeout) hoặc Colima Docker VM chưa start sau reboot.",
    fix: `1. curl -I https://supabase.patiagency.com/rest/v1/ → nếu 502, tunnel down.
2. SSH timcook@100.94.220.128
3. colima start  (nếu Docker chưa chạy)
4. pkill cloudflared && cloudflared tunnel run pati-supabase &
5. Verify config có edge-ip-version: "4" + tcpKeepAlive: 30s + retries: 10`,
  },
  {
    title: "Cards show stale numbers, refresh doesn't help",
    cause: "PostgREST schema cache lag (self-host can take 6-15+ min sau column/constraint adds). Hoặc RQ stale-time chưa expire.",
    fix: `1. docker restart supabase-rest trên Mac mini.
2. Hoặc fallback gọi RPC trực tiếp (e.g., upsert_ad_spend_batch).
3. React Query: invalidate query key thủ công.`,
  },
  {
    title: "supabase-js returns [] giống empty table",
    cause: "Quên pass db: { schema: 'master_app' }. supabase-js default Accept-Profile: public → đọc placeholder schema. OR table có RLS=ON, không có policy → anon reads return [].",
    fix: `1. Verify createClient có db.schema set.
2. Test bằng service-role key — nếu vẫn [] thì là data thật. Nếu có data thì là RLS trap.
3. Add policy: CREATE POLICY ... ON master_app.table FOR SELECT TO anon USING (true);`,
  },
  {
    title: "Refund-rate hoặc bất kỳ aggregate nào bất thường (e.g., 34% vs 5%)",
    cause: "PostgREST silent 1000-row cap (PGRST_DB_MAX_ROWS=1000). Bare .select() truncates without warning.",
    fix: `Dùng pageAll() helper trong /src/lib/supabase.ts. Hoặc add .range(0, 9999).`,
  },
  {
    title: "Shopify webhook 401 / HMAC fail",
    cause: "SHOPIFY_API_SECRET không match Lark Integration app's secret (NOT public app).",
    fix: `Shopify Admin → Develop apps → Lark Integration → API credentials → Reveal token once → copy → vercel env add SHOPIFY_API_SECRET production.`,
  },
  {
    title: "Vercel build fail / 404 sau khi push",
    cause: "Working tree drift — M (modified-but-untracked) files referenced bởi HEAD code.",
    fix: `1. git status --porcelain — verify clean.
2. bun run typecheck local.
3. Re-deploy explicit: vercel --prod --yes.`,
  },
  {
    title: ".vercelignore drop routes",
    cause: "Recursive glob silently match nhiều hơn intended.",
    fix: `Đừng dùng catch-all glob. Mỗi line phải narrow + verify bằng vercel build local sau khi đổi.`,
  },
  {
    title: "NEXT_PUBLIC_X không update sau khi add env",
    cause: "Build-time inline. vercel env add không trigger redeploy.",
    fix: `vercel --prod --yes sau khi add NEXT_PUBLIC_*. Server-side vars hot reload bình thường.`,
  },
  {
    title: "vercel env add nhận empty string",
    cause: "echo \"v\" | vercel env add sometimes stores empty.",
    fix: `Dùng < file.txt redirect: vercel env add MY_SECRET production < secret.txt.`,
  },
  {
    title: "Calendar onChange picks wrong day",
    cause: "toISOString().slice(0,10) shifts UTC. Click 18 ở UTC+7 stores 17.",
    fix: `Replace với format(d, 'yyyy-MM-dd') từ date-fns.`,
  },
  {
    title: "Recharge subscription metrics off by a few",
    cause: "Recharge naive ISO timestamps parsed as local-PDT by Node → shifted by shop tz.",
    fix: `Set RECHARGE_BUCKET_TZ="+00:00" cho all Recharge handler bucketing.`,
  },
  {
    title: "Analytics card $0 cho Recharge / PG / COGS / Shipping",
    cause: "Stale tw-dump/live-audit/<today>_*.json captured pre-dawn override live data via setAuditedMetric.",
    fix: `Check readTwAuditMetricSums returns null nếu no non-zero buckets. Commit 978e02b đã fix.`,
  },
  {
    title: "Refund amount = 0 cho restock refunds (drift 0.5-2%)",
    cause: "Bulk-parse path overwrote correct values. Restock refunds amount=0 (~52% of 30-day).",
    fix: `DB trigger preserving non-zero amount + backfill script. Đừng blame "FX noise" trước khi check raw_refunds amount=0 count.`,
  },
  {
    title: "Auto-deploy GitHub→Vercel không trigger",
    cause: "Webhook lúc bị miss.",
    fix: `vercel --prod --yes thủ công sau push quan trọng.`,
  },
  {
    title: "ChargeFlow sync bắt đầu 401",
    cause: "Session cookie expired (~30 ngày).",
    fix: `Mac mini Chrome → manual login → copy __session cookie → vercel env rm + add CHARGEFLOW_UI_COOKIE → vercel --prod.`,
  },
  {
    title: "Mac mini reboot rồi không sync nữa",
    cause: "Colima Docker VM không auto-start.",
    fix: `ssh timcook@... && colima start. Hardening (launchd plist) đang pending.`,
  },
];

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Reference"
        title="Troubleshooting"
        description="Common issues, root causes, and the exact fix Phong used."
      />

      <Callout variant="tip" title="Probe tunnel FIRST">
        Khi gặp bug ở dashboard, luôn run <code>curl -I https://supabase.patiagency.com/rest/v1/</code>{" "}
        TRƯỚC. 502 = tunnel down, fix điều đó trước khi đi đào schema/auth/RLS.
      </Callout>

      {items.map((it, i) => (
        <section key={i}>
          <h3 id={`issue-${i + 1}`}>
            {i + 1}. {it.title}
          </h3>
          <p>
            <strong>Cause</strong> — {it.cause}
          </p>
          <p>
            <strong>Fix</strong>
          </p>
          <CodeBlock language="text">{it.fix}</CodeBlock>
        </section>
      ))}

      <h2 id="ask">Khi tất cả fail</h2>
      <ol>
        <li>
          Check <code>master_app.sync_logs</code> latest entries — error message thường tự khai
          gốc.
        </li>
        <li>
          Run <code>npx gitnexus query &quot;your concept&quot;</code> trong repo cũ — process-grouped
          results dẫn đến đúng module.
        </li>
        <li>
          Liên hệ Phong (handover period). Sau handover: check git log + commit messages — Phong
          viết kỹ.
        </li>
      </ol>

      <PageNav href="/docs/troubleshooting" />
    </>
  );
}
