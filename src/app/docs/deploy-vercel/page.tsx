import { Cloud, GitBranch, HardDrive, RotateCcw, Server, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import {
  FlowNode,
  FlowRow,
  HealthCheckGrid,
  Step,
  Steps,
  StepWarn,
  Terminal,
  TerminalInline,
} from "@/components/docs/visuals";

export const metadata = { title: "Mac mini Web Deploy — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Deployment"
        title="Mac mini Web Deploy"
        description="Production không còn host trên Vercel. Web Next.js chạy trên Mac mini, auto-deploy qua GitHub Actions, public qua Cloudflare Tunnel tại pnl.patigroup.com."
      />

      <h2 id="current-state">Trạng thái hiện tại</h2>
      <Callout variant="success" title="Production path mới">
        Push lên <TerminalInline>main</TerminalInline> sẽ chạy GitHub Actions{" "}
        <TerminalInline>deploy-macmini.yml</TerminalInline>, SSH vào Mac mini qua Tailscale,
        chạy <TerminalInline>scripts/macmini-stack/deploy-web.sh</TerminalInline>, rồi restart{" "}
        <TerminalInline>com.pati.web</TerminalInline>. Vercel chỉ còn là cold rollback / legacy
        reference trong giai đoạn chuyển đổi, không phải hosting layer chính.
      </Callout>

      <div className="not-prose my-6 rounded-xl border bg-card p-4 sm:p-5">
        <FlowRow arrows="right">
          {[
            <FlowNode key="push" icon={GitBranch} label="git push main" sub="GitHub repo" tone="sky" />,
            <FlowNode key="gha" icon={ShieldCheck} label="GitHub Actions" sub="deploy-macmini.yml" tone="violet" />,
            <FlowNode key="ssh" icon={Server} label="Tailscale SSH" sub="timcook@Mac mini" tone="emerald" />,
            <FlowNode key="deploy" icon={HardDrive} label="deploy-web.sh" sub="pull, build, restart" tone="orange" />,
            <FlowNode key="public" icon={Cloud} label="Cloudflare Tunnel" sub="pnl.patigroup.com" tone="pink" />,
          ]}
        </FlowRow>
      </div>

      <h2 id="runtime">Runtime trên Mac mini</h2>
      <div className="not-prose my-5 rounded-xl border bg-card overflow-hidden">
        <Fact label="App process" value="Next.js production server via `bun run next start`" />
        <Fact label="Bind" value="127.0.0.1:3000 only; không mở LAN/public port trực tiếp" />
        <Fact label="Supervisor" value="launchd LaunchAgent `com.pati.web`, KeepAlive=true" />
        <Fact label="Runner script" value="~/pati-supabase/cron/sync-web.sh" />
        <Fact label="Deploy script" value="scripts/macmini-stack/deploy-web.sh" />
        <Fact label="Public ingress" value="cloudflared tunnel → pnl.patigroup.com" />
        <Fact label="Healthcheck" value="http://127.0.0.1:3000/api/health + public URL probe" />
      </div>

      <h2 id="daily">Deploy hằng ngày</h2>
      <Steps>
        <Step n={1} title="Commit + push lên main">
          <Terminal
            host="you@laptop"
            cwd="~/Coding_workspace/PATI/shopify-lark-sync"
            lines={[
              { prompt: "$", cmd: "git status --short" },
              { prompt: "$", cmd: "bun run typecheck" },
              { prompt: "$", cmd: "bun run build" },
              { prompt: "$", cmd: "git push origin main" },
            ]}
          />
          <StepWarn title="Không deploy từ working tree bẩn">
            Mac mini deploy bằng <TerminalInline>git fetch</TerminalInline> +{" "}
            <TerminalInline>git merge --ff-only origin/main</TerminalInline>. File local chưa commit
            không bao giờ lên production.
          </StepWarn>
        </Step>

        <Step n={2} title="Theo dõi GitHub Actions">
          <Terminal
            host="browser"
            cwd="GitHub"
            lines={[
              { out: "Actions → Deploy to Mac mini → latest run", tone: "muted" },
              { out: "Connect to Tailscale → Probe SSH → Trigger deploy → Verify public endpoint", tone: "ok" },
            ]}
          />
          <p>
            Workflow dùng Tailscale OAuth node tạm thời, SSH key trong repo secret, rồi stream log
            từ Mac mini về GitHub Actions để debug build fail ngay trên GitHub.
          </p>
        </Step>

        <Step n={3} title="Smoke check public URL">
          <Terminal
            host="you@laptop"
            cwd="~"
            lines={[
              { prompt: "$", cmd: "curl -sf https://pnl.patigroup.com/api/health" },
              { prompt: "$", cmd: "open https://pnl.patigroup.com/login" },
            ]}
          />
        </Step>
      </Steps>

      <h2 id="manual-deploy">Manual deploy trên Mac mini</h2>
      <p>Dùng khi GitHub Actions lỗi hoặc cần deploy branch bất thường.</p>
      <Terminal
        host="you@laptop"
        cwd="~"
        lines={[
          { prompt: "$", cmd: "ssh timcook@100.94.220.128" },
          { prompt: "timcook@mini $", cmd: "cd ~/Coding_workspace/PATI/shopify-lark-sync" },
          { prompt: "timcook@mini $", cmd: "DEPLOY_BRANCH=main bash scripts/macmini-stack/deploy-web.sh --force" },
        ]}
      />

      <h2 id="what-script-does">deploy-web.sh làm gì</h2>
      <CodeBlock language="text" filename="scripts/macmini-stack/deploy-web.sh">
{`1. git fetch origin main
2. merge --ff-only origin/main
3. bun install --frozen-lockfile nếu bun.lock đổi
4. bun run build
5. launchctl kickstart -k gui/$(id -u)/com.pati.web
6. poll http://127.0.0.1:3000/api/health`}
      </CodeBlock>
      <Callout variant="info" title="Không dùng standalone mode">
        Source hiện cố ý dùng <TerminalInline>next start</TerminalInline> từ repo clone dài hạn trên
        Mac mini. Không bật <TerminalInline>output: &apos;standalone&apos;</TerminalInline> vì không
        đóng Docker image/Lambda artifact, standalone copy chỉ thêm thời gian build.
      </Callout>

      <h2 id="rollback">Rollback</h2>
      <div className="not-prose my-5 grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl border bg-card p-4">
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <RotateCcw className="h-4 w-4" />
            Rollback chuẩn
          </div>
          <p className="text-[13px] leading-6 text-muted-foreground">
            Revert commit xấu rồi push main. GitHub Actions sẽ auto-deploy revert như một deploy
            bình thường.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <Server className="h-4 w-4" />
            Rollback khẩn trên Mac mini
          </div>
          <p className="text-[13px] leading-6 text-muted-foreground">
            SSH vào Mac mini, checkout/reset về SHA tốt, chạy{" "}
            <TerminalInline>deploy-web.sh --force</TerminalInline>. Chỉ dùng khi Actions không vào được.
          </p>
        </div>
      </div>
      <Terminal
        host="timcook@mini"
        cwd="~/Coding_workspace/PATI/shopify-lark-sync"
        lines={[
          { prompt: "$", cmd: "git reset --hard <last-good-sha>" },
          { prompt: "$", cmd: "bash scripts/macmini-stack/deploy-web.sh --force" },
        ]}
      />

      <h2 id="health">Health checks</h2>
      <HealthCheckGrid
        title="Check nhanh sau deploy"
        probes={[
          {
            label: "Local app alive",
            cmd: "ssh timcook@100.94.220.128 'curl -sf http://127.0.0.1:3000/api/health'",
            expect: "JSON ok",
            badResult: "connection refused / timeout",
            badMeans: "com.pati.web chưa chạy hoặc build artifact lỗi",
          },
          {
            label: "launchd service",
            cmd: "ssh timcook@100.94.220.128 'launchctl print gui/$(id -u)/com.pati.web | grep -E \"state|last exit\"'",
            expect: "running, last exit code = 0",
            badResult: "frequent respawn / non-zero exit",
            badMeans: "env thiếu, port bận, hoặc .next missing",
          },
          {
            label: "Public ingress",
            cmd: "curl -sf https://pnl.patigroup.com/api/health",
            expect: "2xx",
            badResult: "502",
            badMeans: "Cloudflared/DNS/tunnel route lỗi",
          },
        ]}
      />

      <h2 id="failure-modes">Failure modes</h2>
      <div className="not-prose my-5 rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-[13px]">
          <thead className="bg-muted/40 border-b">
            <tr>
              <th className="px-3 py-2 text-left text-[11px] uppercase tracking-wider">Triệu chứng</th>
              <th className="px-3 py-2 text-left text-[11px] uppercase tracking-wider">Nguyên nhân hay gặp</th>
              <th className="px-3 py-2 text-left text-[11px] uppercase tracking-wider">Hướng xử lý</th>
            </tr>
          </thead>
          <tbody>
            <Row a="Action fail ở Probe SSH" b="Tailscale ACL / secret MACMINI_HOST sai" c="Check Tailscale ACL tag:ci → tag:server:22 và repo secrets." />
            <Row a="Build OK nhưng public 502" b="Cloudflared config chưa reload hoặc tunnel route sai" c="Restart cloudflared, kiểm tra cloudflared ingress." />
            <Row a="com.pati.web respawn liên tục" b="Thiếu env, port 3000 bận, .next missing" c="Xem web.log/web.err.log và launchctl print." />
            <Row a="App OOM rồi tự bật lại" b="Node heap vượt mức trên Mac mini 16GB" c="Profile route nặng, cân nhắc chỉnh NODE_OPTIONS trong sync-web.sh." />
          </tbody>
        </table>
      </div>

      <Callout variant="warning" title="Vercel legacy">
        Không cập nhật secret production bằng <TerminalInline>vercel env add</TerminalInline> nữa cho
        deploy chính. Runtime Mac mini đọc <TerminalInline>.env</TerminalInline> trong repo clone và
        override từ <TerminalInline>~/pati-supabase/cron/.env.web</TerminalInline>. Vercel artifacts
        cũ chỉ dùng làm rollback lạnh trong giai đoạn chuyển đổi DNS.
      </Callout>

      <PageNav href="/docs/deploy-vercel" />
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-t px-4 py-3 first:border-t-0 sm:grid-cols-[180px_1fr]">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="font-mono text-[12.5px] text-foreground/85">{value}</div>
    </div>
  );
}

function Row({ a, b, c }: { a: string; b: string; c: string }) {
  return (
    <tr className="border-t">
      <td className="px-3 py-2 align-top font-medium">{a}</td>
      <td className="px-3 py-2 align-top text-muted-foreground">{b}</td>
      <td className="px-3 py-2 align-top text-muted-foreground">{c}</td>
    </tr>
  );
}
