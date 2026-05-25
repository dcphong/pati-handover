import { Globe, History, Rocket, Workflow } from "lucide-react";
import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import {
  Step,
  Steps,
  StepCheck,
  StepWarn,
  Terminal,
  TerminalInline,
} from "@/components/docs/visuals";

export const metadata = { title: "Deploy to Vercel — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Deployment"
        title="Vercel Deploy"
        description="Production = pnl.patigroup.com. CLI-driven, hybrid sync — Vercel host UI, sync workers vẫn chạy local Mac mini."
      />

      <h2 id="strategy">Hybrid strategy (locked 2026-05-10)</h2>
      <div className="not-prose my-6 grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl border-2 border-violet-500/40 bg-violet-500/[0.04] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            <div className="text-[11px] uppercase tracking-widest font-semibold text-violet-700 dark:text-violet-300">
              Vercel hosts
            </div>
          </div>
          <ul className="list-disc ml-4 text-[13px] leading-6 text-foreground/85">
            <li>Web UI (Next.js dashboard)</li>
            <li>OAuth callbacks</li>
            <li>Summary HTTP endpoints (analytics, CS)</li>
            <li>Webhook receivers (Shopify refunds, CJ)</li>
            <li>Lightweight cron endpoints (gọi từ Mac mini với secret)</li>
          </ul>
        </div>
        <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-500/[0.04] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Workflow className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <div className="text-[11px] uppercase tracking-widest font-semibold text-emerald-700 dark:text-emerald-300">
              Mac mini hosts
            </div>
          </div>
          <ul className="list-disc ml-4 text-[13px] leading-6 text-foreground/85">
            <li>Shopify date-window sync (Python — 10k+ orders)</li>
            <li>Lark Base ingest (42 tables)</li>
            <li>ChargeFlow Chrome CDP (persistent cookie)</li>
            <li>Lark Mail polling</li>
            <li>Supabase Docker stack</li>
          </ul>
        </div>
      </div>
      <Callout variant="info" title="Vì sao không all-in Vercel?">
        Vercel function timeout 300s không đủ cho 10k-order backfill. Playwright/Chrome CDP cần
        persistent browser session. Mac mini có Tailscale → giảm cold start vs Vercel cron.
      </Callout>

      <h2 id="first-time">Setup lần đầu — 4 bước</h2>
      <Steps>
        <Step n={1} title="Install Vercel CLI">
          <Terminal
            host="you@laptop"
            cwd="~"
            lines={[
              { prompt: "$", cmd: "npm i -g vercel" },
              { prompt: "$", cmd: "vercel --version" },
              { out: "Vercel CLI 41.x.x", tone: "ok" },
            ]}
          />
          <StepCheck>
            <TerminalInline>vercel</TerminalInline> command có sẵn ở terminal.
          </StepCheck>
        </Step>
        <Step n={2} title="Login Vercel account">
          <Terminal
            host="you@laptop"
            cwd="~"
            lines={[
              { prompt: "$", cmd: "vercel login" },
              { divider: true, label: "trình duyệt sẽ mở" },
              { out: "→ Vercel mở browser cho bạn login OAuth", tone: "muted" },
              { out: "→ Quay lại terminal sau khi authorize", tone: "muted" },
            ]}
          />
          <StepWarn title="Phải dùng account có quyền vào project">
            Nếu chưa có quyền, xin Phong (hoặc Vercel team admin) invite vào team{" "}
            <TerminalInline>patigroup-team</TerminalInline>.
          </StepWarn>
        </Step>
        <Step n={3} title="Link repo về project trên Vercel">
          <Terminal
            host="you@laptop"
            cwd="~/Coding/shopify-lark-sync"
            lines={[
              { prompt: "$", cmd: "cd shopify-lark-sync" },
              { prompt: "$", cmd: "vercel link" },
              { divider: true, label: "interactive — chọn:" },
              { out: "? Set up \"…/shopify-lark-sync\"? yes", tone: "ok" },
              { out: "? Which scope should contain your project? patigroup-team", tone: "ok" },
              { out: "? Link to existing project? yes", tone: "ok" },
              { out: "? What's the name of your existing project? shopify-lark-sync", tone: "ok" },
              { out: "✓ Linked to patigroup-team/shopify-lark-sync", tone: "ok" },
            ]}
          />
          <StepCheck>
            File <TerminalInline>.vercel/project.json</TerminalInline> được tạo (gitignored).
          </StepCheck>
        </Step>
        <Step n={4} title="Pull env vars về local">
          <Terminal
            host="you@laptop"
            cwd="~/Coding/shopify-lark-sync"
            lines={[
              { prompt: "$", cmd: "vercel env pull .env.local" },
              { divider: true, label: "expected" },
              { out: "Downloading Development environment variables for project shopify-lark-sync...", tone: "muted" },
              { out: "✓ Created .env.local", tone: "ok" },
            ]}
          />
          <StepWarn title="Lưu ý: pull KHÔNG decrypt secrets">
            Encrypted vars hiển thị <TerminalInline>NAME=&quot;&quot;</TerminalInline> bất kể
            giá trị thực. Bạn vẫn phải nhập tay những giá trị nhạy cảm. <em>Pull chỉ giúp đồng
            bộ tên biến</em>.
          </StepWarn>
        </Step>
      </Steps>

      <h2 id="daily">Deploy hằng ngày — 3 lệnh</h2>
      <div className="not-prose my-6 grid sm:grid-cols-3 gap-3">
        <DeployCard
          title="Preview"
          subtitle="branch / PR"
          tone="sky"
          cmd="vercel"
          desc="Deploy với URL unique. Dùng khi muốn test trước khi up prod."
        />
        <DeployCard
          title="Production"
          subtitle="pnl.patigroup.com"
          tone="emerald"
          cmd="vercel --prod --yes"
          desc="Push lên production. Lấy code mới nhất từ HEAD."
        />
        <DeployCard
          title="Force re-deploy"
          subtitle="cùng commit"
          tone="amber"
          cmd="vercel --prod --force --yes"
          desc="Re-build mà không cần commit mới (vd để pick up env var change)."
        />
      </div>

      <Callout variant="warning" title="Đừng phụ thuộc auto-deploy">
        Push lên GitHub đôi khi không trigger build mới (memo:{" "}
        <TerminalInline>reference_vercel_deploy_traps</TerminalInline>). Thói quen tốt: chạy{" "}
        <TerminalInline>vercel --prod --yes</TerminalInline> bằng tay sau mỗi push quan trọng.
      </Callout>

      <h2 id="domains">Domain mapping</h2>
      <div className="not-prose my-5 rounded-xl border bg-card overflow-hidden">
        <DomainRow
          icon={Globe}
          domain="pnl.patigroup.com"
          status="active"
          note="Production — đã point từ 2026-05-20"
        />
        <DomainRow
          icon={History}
          domain="chanphong.site / www.chanphong.site"
          status="redirect"
          note="Permanent redirect → pnl.patigroup.com (xem vercel.json)"
        />
        <DomainRow
          icon={History}
          domain="pnl.patiagency.com"
          status="removed"
          note="Đã removed 2026-05-20"
        />
      </div>
      <Callout variant="info" title="patigroup.com DNS — additive only">
        Domain GoDaddy này share với nhiều PATI app khác. <strong>Chỉ thêm CNAME subdomain mới</strong>{" "}
        — đừng động vào root/MX/TXT/existing records, đừng move nameservers.
      </Callout>

      <h2 id="env-flow">Quản lý env var qua CLI</h2>
      <Steps>
        <Step n={1} title="Thêm encrypted var (sensitive)">
          <p>
            <strong>QUAN TRỌNG:</strong> dùng redirect file, không dùng echo|pipe (sẽ bị empty).
          </p>
          <Terminal
            host="you@laptop"
            cwd="~"
            lines={[
              { prompt: "$", cmd: "echo \"shpat_xxxxx\" > /tmp/secret.txt" },
              { prompt: "$", cmd: "vercel env add SHOPIFY_ACCESS_TOKEN production < /tmp/secret.txt" },
              { prompt: "$", cmd: "rm /tmp/secret.txt   # cleanup" },
            ]}
          />
        </Step>
        <Step n={2} title="Thêm public flag (server-side, không sensitive)">
          <Terminal
            host="you@laptop"
            cwd="~"
            lines={[
              { prompt: "$", cmd: "echo \"true\" | vercel env add FEATURE_X_ENABLED production" },
            ]}
          />
        </Step>
        <Step n={3} title="Thêm NEXT_PUBLIC_* (inline vào client bundle)">
          <Terminal
            host="you@laptop"
            cwd="~"
            lines={[
              { prompt: "$", cmd: "echo \"https://api.example.com\" | vercel env add NEXT_PUBLIC_API_URL production" },
              { prompt: "$", cmd: "vercel --prod --yes   # MUST redeploy để client thấy giá trị mới" },
            ]}
          />
          <StepWarn title="NEXT_PUBLIC_* không hot-reload">
            Vì được inline vào client bundle ở build time → phải redeploy. Server-side var
            (không có prefix) thì OK, hot-reload bình thường.
          </StepWarn>
        </Step>
        <Step n={4} title="List / remove">
          <Terminal
            host="you@laptop"
            cwd="~"
            lines={[
              { prompt: "$", cmd: "vercel env ls           # list" },
              { prompt: "$", cmd: "vercel env rm MY_VAR production   # remove" },
            ]}
          />
        </Step>
      </Steps>

      <h2 id="build-config">Build config — vercel.json</h2>
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

      <h2 id="build-drift">Cảnh báo: build drift</h2>
      <Callout variant="danger" title="File M (modified-but-untracked) sẽ làm Vercel build fail">
        Nếu file ở local có sửa nhưng chưa commit, và HEAD code đang reference nó → Vercel build
        từ HEAD sẽ thấy export missing → fail hoặc 404. <strong>Checklist trước khi push:</strong>
      </Callout>
      <Terminal
        host="you@laptop"
        cwd="~/Coding/shopify-lark-sync"
        lines={[
          { prompt: "$", cmd: "git status --porcelain      # phải sạch hoặc chỉ unrelated" },
          { prompt: "$", cmd: "bun run typecheck            # phải xanh" },
          { prompt: "$", cmd: "git push origin main" },
          { prompt: "$", cmd: "vercel --prod --yes          # explicit, đừng đợi auto" },
        ]}
      />

      <h2 id="vercelignore">.vercelignore — đừng catch-all</h2>
      <Callout variant="warning">
        Đã từng <TerminalInline>.vercelignore</TerminalInline> recursive glob silently drop{" "}
        <TerminalInline>/api/analytics/sync/*</TerminalInline> routes. <strong>Quy tắc:</strong>{" "}
        đừng dùng catch-all <TerminalInline>**</TerminalInline>. Mỗi pattern phải có lý do +
        verify bằng <TerminalInline>vercel build</TerminalInline> local sau khi đổi.
      </Callout>

      <h2 id="rollback">Rollback khi production hỏng</h2>
      <Steps>
        <Step n={1} title="Liệt kê deployments gần đây">
          <Terminal
            host="you@laptop"
            cwd="~"
            lines={[
              { prompt: "$", cmd: "vercel ls --prod" },
              { divider: true, label: "ví dụ" },
              { out: "https://shopify-lark-sync-abc.vercel.app   Ready   2h ago", tone: "muted" },
              { out: "https://shopify-lark-sync-xyz.vercel.app   Ready   5h ago   ← OK", tone: "ok" },
              { out: "https://shopify-lark-sync-def.vercel.app   Ready   1d ago", tone: "muted" },
            ]}
          />
        </Step>
        <Step n={2} title="Promote 1 deployment cũ thành production">
          <Terminal
            host="you@laptop"
            cwd="~"
            lines={[
              { prompt: "$", cmd: "vercel promote https://shopify-lark-sync-xyz.vercel.app" },
              { divider: true, label: "expected" },
              { out: "✓ Promoted to production: pnl.patigroup.com", tone: "ok" },
            ]}
          />
        </Step>
        <Step n={3} title="(Tuỳ chọn) Dùng Rolling Releases">
          <p>
            Vercel Rolling Releases (GA 2025-06) cho phép canary rollout từ UI dashboard. Tốt
            cho release quan trọng — chia traffic theo %, rollback 1 click.
          </p>
        </Step>
      </Steps>

      <h2 id="logs">Inspect logs</h2>
      <Terminal
        host="you@laptop"
        cwd="~"
        lines={[
          { prompt: "$", cmd: "vercel logs https://pnl.patigroup.com --follow" },
          { divider: true, label: "lọc 1 endpoint" },
          { prompt: "$", cmd: "vercel logs --output stream | grep \"/api/analytics/summary\"" },
        ]}
      />

      <PageNav href="/docs/deploy-vercel" />
    </>
  );
}

function DeployCard({
  title,
  subtitle,
  cmd,
  desc,
  tone,
}: {
  title: string;
  subtitle: string;
  cmd: string;
  desc: string;
  tone: "sky" | "emerald" | "amber";
}) {
  const styles = {
    sky: "border-sky-500/40 bg-sky-500/[0.04]",
    emerald: "border-emerald-500/40 bg-emerald-500/[0.04]",
    amber: "border-amber-500/40 bg-amber-500/[0.04]",
  } as const;
  const text = {
    sky: "text-sky-700 dark:text-sky-300",
    emerald: "text-emerald-700 dark:text-emerald-300",
    amber: "text-amber-700 dark:text-amber-300",
  } as const;
  return (
    <div className={`rounded-xl border-2 p-4 ${styles[tone]}`}>
      <div className={`text-[10px] uppercase tracking-widest font-semibold ${text[tone]}`}>
        {title}
      </div>
      <div className="text-[11.5px] text-muted-foreground mb-2.5">{subtitle}</div>
      <code className="block font-mono text-[12px] bg-zinc-950 text-zinc-100 rounded px-2 py-1.5 mb-2 border border-zinc-800">
        {cmd}
      </code>
      <div className="text-[12.5px] text-foreground/85 leading-5">{desc}</div>
    </div>
  );
}

function DomainRow({
  icon: Icon,
  domain,
  status,
  note,
}: {
  icon: React.ComponentType<{ className?: string }>;
  domain: string;
  status: "active" | "redirect" | "removed";
  note: string;
}) {
  const map = {
    active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40",
    redirect: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/40",
    removed: "bg-muted text-muted-foreground border-border",
  } as const;
  const label = { active: "Active", redirect: "Redirect", removed: "Removed" }[status];
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0">
      <Icon className="h-4 w-4 text-foreground/70 shrink-0" />
      <code className="font-mono text-[12.5px] font-semibold flex-1 min-w-0 break-all">
        {domain}
      </code>
      <span
        className={`text-[10px] uppercase tracking-wider font-semibold rounded border px-1.5 py-0.5 shrink-0 ${map[status]}`}
      >
        {label}
      </span>
      <div className="text-[11.5px] text-muted-foreground hidden sm:block max-w-[280px] text-right">
        {note}
      </div>
    </div>
  );
}
