import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export const metadata = { title: "Deploy to Vercel — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Deployment"
        title="Vercel Deploy"
        description="Production host = pnl.patigroup.com. CLI-driven, hybrid sync model."
      />

      <h2 id="strategy">Strategy</h2>
      <p>
        Hybrid deploy (locked 2026-05-10): <strong>Vercel hosts UI + OAuth + summary HTTP
        endpoints</strong>. Sync workers nặng (Shopify date-window, Lark Base ingest, ChargeFlow
        CDP) <strong>vẫn chạy local trên Mac mini</strong> vì:
      </p>
      <ul>
        <li>Vercel function timeout 300s không đủ cho 10k-order backfill.</li>
        <li>Playwright/Chrome CDP cần persistent browser session (ChargeFlow cookie).</li>
        <li>Cron Mac mini có Tailscale → giảm cold start vs Vercel cron.</li>
      </ul>

      <h2 id="first-time">First-time setup</h2>
      <CodeBlock language="bash" filename="terminal">
{`# 1. Install Vercel CLI globally (Vercel hint nhắc rồi)
npm i -g vercel

# 2. Login với account đã có quyền vào project
vercel login

# 3. Link repo
cd shopify-lark-sync
vercel link
# -> chọn scope: dcphong / patigroup-team
# -> link existing project: shopify-lark-sync (production)

# 4. Pull env vars (names only — secrets show as "")
vercel env pull .env.local`}
      </CodeBlock>

      <h2 id="deploy-cmd">Deploy commands</h2>
      <CodeBlock language="bash">
{`# Preview deployment (branch PR or manual)
vercel

# Production
vercel --prod --yes

# Force-redeploy current branch (no code change)
vercel --prod --force --yes`}
      </CodeBlock>

      <Callout variant="warning" title="Auto-deploy unreliable">
        Push lên GitHub đôi khi không trigger build mới (đã memo lại ở{" "}
        <code>reference_vercel_deploy_traps</code>). Thói quen tốt: deploy bằng tay với{" "}
        <code>vercel --prod --yes</code> sau mỗi push quan trọng.
      </Callout>

      <h2 id="domains">Domains</h2>
      <ul>
        <li><code>pnl.patigroup.com</code> — current production (đã point từ 2026-05-20).</li>
        <li>
          <code>chanphong.site</code> / <code>www.chanphong.site</code> — legacy, redirect
          permanent → pnl.patigroup.com (xem <code>vercel.json</code> redirects).
        </li>
        <li>
          <code>pnl.patiagency.com</code> — đã removed 2026-05-20.
        </li>
      </ul>

      <Callout variant="info" title="patigroup.com DNS constraint">
        Domain GoDaddy share với nhiều PATI apps. <strong>Additive-only</strong>: thêm CNAME
        subdomain mới OK, nhưng đừng động vào root/MX/TXT/existing records, đừng move
        nameservers.
      </Callout>

      <h2 id="env-flow">Env var workflow</h2>
      <CodeBlock language="bash">
{`# Add encrypted (sensitive)
vercel env add MY_SECRET production < secret.txt

# Add public
echo "value" | vercel env add NEXT_PUBLIC_FEATURE_FLAG production

# Remove
vercel env rm MY_SECRET production

# List
vercel env ls`}
      </CodeBlock>

      <Callout variant="danger" title="echo | env add lưu empty string">
        <code>echo &quot;v&quot; | vercel env add NAME prod</code> sometimes silently stores empty.
        Dùng <code>&lt; file.txt</code> redirect cho encrypted vars.
      </Callout>

      <Callout variant="warning" title="NEXT_PUBLIC_* requires redeploy">
        Add <code>NEXT_PUBLIC_X</code> không tự re-build. Phải{" "}
        <code>vercel --prod</code> sau khi add. Server-side vars hot reload bình thường.
      </Callout>

      <h2 id="build-config">Build config</h2>
      <CodeBlock language="json" filename="vercel.json">
{`{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "installCommand": "bun install",
  "buildCommand": "bun run build",
  "redirects": [
    {
      "source": "/:path*",
      "has": [{ "type": "host", "value": "chanphong.site" }],
      "destination": "https://pnl.patigroup.com/:path*",
      "permanent": true
    }
  ]
}`}
      </CodeBlock>

      <h2 id="build-drift">Build drift trap</h2>
      <Callout variant="danger" title="Working-tree drift = Vercel 404">
        Mỗi file <code>M</code> (modified-but-untracked) ở local mà HEAD code reference sẽ làm
        Vercel build fail (missing export) hoặc trang 404. Trước khi push:
      </Callout>
      <CodeBlock language="bash">
{`# 1. Verify working tree clean
git status --porcelain

# 2. If any M files referenced by HEAD, commit them OR revert

# 3. Typecheck local
bun run typecheck

# 4. Push
git push origin main

# 5. Deploy explicitly (don't rely on auto-deploy)
vercel --prod --yes`}
      </CodeBlock>

      <h2 id="vercelignore">.vercelignore trap</h2>
      <Callout variant="warning">
        Đã từng <code>.vercelignore</code> recursive-match silently drop tất cả{" "}
        <code>/api/analytics/sync/*</code> routes. Đừng dùng catch-all glob. Mỗi pattern phải
        có lý do và verify build artifact sau khi đổi.
      </Callout>

      <h2 id="rollback">Rollback</h2>
      <CodeBlock language="bash">
{`# List recent prod deployments
vercel ls --prod

# Promote một deployment cũ thành current
vercel promote <deployment-url>

# Hoặc dùng "Rolling Releases" trong Vercel dashboard (GA từ 2025-06)`}
      </CodeBlock>

      <h2 id="logs">Inspect logs</h2>
      <CodeBlock language="bash">
{`# Tail prod logs
vercel logs https://pnl.patigroup.com --follow

# Specific function
vercel logs --output stream | grep "/api/analytics/summary"`}
      </CodeBlock>

      <PageNav href="/docs/deploy-vercel" />
    </>
  );
}
