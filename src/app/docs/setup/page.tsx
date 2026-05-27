import {
  AlertCircle,
  Box,
  GitBranch,
  KeyRound,
  Lock,
  PackageOpen,
  Play,
  ShieldCheck,
  Terminal as TerminalIcon,
} from "lucide-react";
import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { ExternalLinkRow } from "@/components/docs/external-link-card";
import {
  Steps,
  StepsHeader,
  Step,
  StepCheck,
  StepWarn,
  Terminal,
  TerminalInline,
} from "@/components/docs/visuals";
import { INFRA } from "@/lib/external-links";

export const metadata = { title: "Local Setup — PATI Handover" };

const prereqs = [
  {
    icon: PackageOpen,
    name: "Bun",
    detail: "≥ 1.2.12",
    note: "Repo gate npm/yarn ở preinstall — chỉ bun mới chạy được.",
    install: "https://bun.sh",
  },
  {
    icon: TerminalIcon,
    name: "Node.js",
    detail: "≥ 20",
    note: "Runtime cho Next.js 16 + tsx scripts.",
    install: "https://nodejs.org",
  },
  {
    icon: TerminalIcon,
    name: "Python",
    detail: "3.12",
    note: "Sync workers — venv tự tạo ở postinstall.",
    install: "https://www.python.org/downloads",
  },
  {
    icon: GitBranch,
    name: "Git + GitHub access",
    detail: "dev-pati/pati-master-app",
    note: "Repo private — xin Phong add bạn vào collaborator.",
    install: "https://git-scm.com",
  },
  {
    icon: Box,
    name: "Tailscale",
    detail: "VPN vào Mac mini",
    note: "Cần khi SSH vào Mac mini hoặc verify production self-host.",
    install: "https://tailscale.com/download",
  },
];

const setupWalkthroughPrompt = `Bạn là AI technical assistant đang hướng dẫn một user non-tech setup repo PATI trên máy local. Hãy hướng dẫn từng bước nhỏ, hỏi tôi đang dùng Windows/macOS/Linux trước khi đưa command, và không yêu cầu tôi paste token/password/secret/cookie thật vào chat.

Mục tiêu: setup repo pati-master-app chạy được local.

Repo:
https://github.com/dev-pati/pati-master-app

Checklist cần làm:
1. Clone repo về máy, ví dụ trong ~/Coding hoặc C:\\Users\\<tên tôi>\\Coding_workspace\\PATI.
2. cd vào folder pati-master-app và verify có src/, sync/, package.json.
3. Install dependencies bằng Bun, chỉ dùng bun install. Không dùng npm install hoặc yarn.
4. Nếu lỡ chạy npm install, hướng dẫn xóa node_modules rồi chạy lại bun install.
5. Tạo file .env ở root repo với placeholder cho các group Shopify, Supabase, Lark, Auth, Sync. Nhắc tôi xin giá trị thật từ Phong/successor, không paste secret vào AI.
6. Chạy dev server bằng bun run dev và mở http://localhost:3000.
7. Nếu page load nhưng data trống/$0, hướng dẫn check Supabase tunnel bằng curl -I https://supabase.patiagency.com/rest/v1/.
8. Đăng nhập bằng account được cấp; nếu cần user mới thì nhờ admin tạo trong /iam.
9. Chạy bun run lint và bun run typecheck trước khi push.

Hãy format câu trả lời thành:
- Điều kiện cần kiểm tra trước.
- Commands theo đúng OS.
- Expected output sau mỗi bước.
- Cách xử lý lỗi thường gặp.
- Không đưa lệnh destructive hoặc lệnh làm lộ secret.`;

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Getting Started"
        title="Local Setup"
        description="Hướng dẫn dev cài project trên máy cá nhân để chạy thử / debug."
      />

      <ExternalLinkRow
        links={[
          {
            href: INFRA.githubRepo,
            title: "GitHub repo — dev-pati/pati-master-app",
            pathHint: "github.com/dev-pati/pati-master-app",
            desc: "Clone repo từ đây. Cần Phong/admin add bạn làm collaborator.",
            icon: GitBranch,
            tone: "violet",
          },
          {
            href: INFRA.dashboardProd,
            title: "Dashboard production (đối chiếu sau khi cài)",
            pathHint: "pnl.patigroup.com",
            desc: "Verify dashboard production OK trước khi bắt đầu — nếu prod cũng đỏ thì không phải lỗi local.",
            icon: Play,
            tone: "emerald",
          },
        ]}
      />

      <section data-user-detail className="rounded-lg border border-amber-500/30 bg-amber-500/[0.05] p-4 my-6 text-[13px] leading-6">
        <strong className="block text-[14px] mb-1">Trang này dành cho dev / người chạy code trên máy</strong>
        Nếu bạn chỉ dùng dashboard qua trình duyệt thì bỏ qua trang này — vẫn xem được walkthrough
        bên dưới để hiểu setup quy trình ra sao.
      </section>

      <div className="not-prose my-6 rounded-xl border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-foreground/70" />
          <div className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground">
            Trước khi bắt đầu — cài đặt 5 thứ này
          </div>
        </div>
        <div className="divide-y">
          {prereqs.map((p) => (
            <div key={p.name} className="px-4 py-3 flex items-start gap-3">
              <div className="h-9 w-9 rounded-md bg-muted grid place-items-center shrink-0 mt-0.5">
                <p.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <div className="font-semibold text-[14px]">{p.name}</div>
                  <code className="text-[11.5px] font-mono text-muted-foreground bg-muted/60 rounded px-1.5 py-0.5">
                    {p.detail}
                  </code>
                </div>
                <div className="text-[12.5px] text-muted-foreground mt-0.5 leading-5">
                  {p.note}
                </div>
              </div>
              <a
                href={p.install}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-medium underline underline-offset-4 text-muted-foreground hover:text-foreground shrink-0 mt-1"
              >
                Tải về
              </a>
            </div>
          ))}
        </div>
      </div>

      <StepsHeader
        id="walkthrough"
        title="6 bước cài đặt"
        prompt={setupWalkthroughPrompt}
      />

      <Steps>
        <Step n={1} title="Clone repo về máy" hint="≈ 30 giây" aiPrompt={null}>
          <p>Mở terminal ở thư mục bạn muốn để code (ví dụ <TerminalInline>~/Coding</TerminalInline>):</p>
          <Terminal
            host="you@laptop"
            cwd="~/Coding"
            lines={[
              { prompt: "$", cmd: "git clone https://github.com/dev-pati/pati-master-app.git" },
              { prompt: "$", cmd: "cd pati-master-app" },
            ]}
          />
          <StepCheck>
            Folder <TerminalInline>pati-master-app</TerminalInline> xuất hiện, chứa{" "}
            <TerminalInline>src/</TerminalInline>, <TerminalInline>sync/</TerminalInline>,{" "}
            <TerminalInline>package.json</TerminalInline>.
          </StepCheck>
        </Step>

        <Step n={2} title="Install dependencies (bun install)" hint="≈ 2 phút" aiPrompt={null}>
          <p>
            <strong>Chỉ dùng bun</strong> — repo có preinstall gate sẽ exit 1 nếu chạy npm/yarn.
            Lệnh dưới đồng thời tạo Python venv ở postinstall.
          </p>
          <Terminal
            host="you@laptop"
            cwd="~/Coding/pati-master-app"
            lines={[
              { prompt: "$", cmd: "bun install" },
              { divider: true, label: "expected output" },
              { out: "✔ Installed 1247 packages (...)", tone: "ok" },
              { out: "$ node scripts/setup-python.mjs", tone: "muted" },
              { out: "→ Creating .venv-windows/ (or .venv-linux/)", tone: "muted" },
              { out: "→ pip install -r sync/requirements.txt", tone: "muted" },
              { out: "✔ Python deps installed", tone: "ok" },
            ]}
          />
          <StepWarn title="Lỡ tay chạy npm install?">
            Preinstall sẽ exit 1. Xoá <TerminalInline>node_modules/</TerminalInline> rồi chạy lại{" "}
            <TerminalInline>bun install</TerminalInline>. Đừng comment ra preinstall hook —
            nó là intentional.
          </StepWarn>
          <StepCheck>
            <TerminalInline>node_modules/</TerminalInline> và <TerminalInline>.venv-*/</TerminalInline> tồn tại.
          </StepCheck>
        </Step>

        <Step n={3} title="Tạo file .env" hint="phải xin Phong" aiPrompt={null}>
          <p>
            File <TerminalInline>.env</TerminalInline> nằm ở root, đã được{" "}
            <TerminalInline>.gitignore</TerminalInline> — đừng commit. Cách lấy:
          </p>
          <div className="rounded-lg border bg-muted/30 px-4 py-3 text-[13px] leading-6">
            <ol className="list-decimal ml-5 space-y-1.5">
              <li>
                Hỏi Phong (hoặc successor): <em>&quot;cho mình file .env production để dev local&quot;</em>.
              </li>
              <li>
                Hoặc copy từ Mac mini runtime env nếu bạn có quyền SSH:{" "}
                <TerminalInline>~/Coding_workspace/PATI/pati-master-app/.env</TerminalInline>.
              </li>
              <li>
                Đối chiếu full danh sách env vars ở <a href="/docs/env" className="underline">Environment Variables</a>.
              </li>
            </ol>
          </div>
          <Terminal
            host="you@laptop"
            cwd="~/Coding/pati-master-app"
            title=".env (template — ask Phong for real values)"
            lines={[
              { out: "# Shopify (Lark Integration custom app)" },
              { out: "SHOPIFY_DOMAIN=e49d78-3.myshopify.com" },
              { out: "SHOPIFY_ACCESS_TOKEN=shpat_xxx" },
              { out: "SHOPIFY_API_SECRET=shpss_xxx   # webhook HMAC" },
              { divider: true, label: "supabase" },
              { out: "NEXT_PUBLIC_SUPABASE_URL=https://supabase.patiagency.com" },
              { out: "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...anon..." },
              { out: "SUPABASE_SERVICE_KEY=eyJ...service_role...", tone: "warn" },
              { divider: true, label: "auth" },
              { out: "JWT_SECRET=<random 256-bit>" },
              { out: "APP_BASE_URL=https://pnl.patigroup.com" },
              { out: "CRON_SECRET=<random>" },
            ]}
          />
          <StepCheck>
            File <TerminalInline>.env</TerminalInline> chứa ít nhất 5 group: Shopify, Supabase,
            Lark, Auth, Sync.
          </StepCheck>
        </Step>

        <Step n={4} title="Chạy dev server" hint="bun run dev" aiPrompt={null}>
          <p>3 lựa chọn — chọn cái phù hợp tình huống:</p>
          <div className="not-prose my-3 grid sm:grid-cols-3 gap-2 text-[12.5px]">
            <div className="rounded-lg border p-3 bg-emerald-500/[0.04]">
              <div className="font-mono text-[12px] text-emerald-700 dark:text-emerald-300 font-semibold mb-1">
                bun run dev
              </div>
              <div className="text-muted-foreground">
                Next.js only — webpack, ổn định nhất. Default.
              </div>
            </div>
            <div className="rounded-lg border p-3 bg-violet-500/[0.04]">
              <div className="font-mono text-[12px] text-violet-700 dark:text-violet-300 font-semibold mb-1">
                bun run dev:full
              </div>
              <div className="text-muted-foreground">
                Next.js + Flask bulk-update server (port 5000). Cần khi test fulfillment.
              </div>
            </div>
            <div className="rounded-lg border p-3 bg-amber-500/[0.04]">
              <div className="font-mono text-[12px] text-amber-700 dark:text-amber-300 font-semibold mb-1">
                bun run dev:turbo
              </div>
              <div className="text-muted-foreground">
                Turbopack — nhanh hơn nhưng đôi khi flaky.
              </div>
            </div>
          </div>
          <Terminal
            host="you@laptop"
            cwd="~/Coding/pati-master-app"
            lines={[
              { prompt: "$", cmd: "bun run dev" },
              { divider: true, label: "expected" },
              { out: "▲ Next.js 16.2.6", tone: "ok" },
              { out: "  - Local:        http://localhost:3000", tone: "ok" },
              { out: "  - Environments: .env", tone: "muted" },
              { out: "  ✓ Ready in 2.4s", tone: "ok" },
            ]}
          />
          <StepCheck>
            Mở <TerminalInline>http://localhost:3000</TerminalInline> trong Chrome — thấy
            login page.
          </StepCheck>
          <StepWarn title="Trang load nhưng số liệu trống / cards $0?">
            Tunnel Mac mini ở văn phòng PATI có thể down. Chạy{" "}
            <TerminalInline>
              curl -I https://supabase.patiagency.com/rest/v1/
            </TerminalInline>{" "}
            — nếu 502 thì xem <a href="/docs/troubleshooting" className="underline">Troubleshooting</a>.
          </StepWarn>
        </Step>

        <Step n={5} title="Đăng nhập lần đầu" hint="JWT cookie auth" aiPrompt={null}>
          <p>
            UI dùng JWT custom (cookie). Account admin mặc định dùng chung cho mọi người trong
            handover:
          </p>
          <div className="not-prose my-3 rounded-xl border-2 border-emerald-500/40 bg-emerald-500/[0.05] p-4">
            <div className="flex items-center gap-2 mb-2 font-semibold text-[14px] text-emerald-700 dark:text-emerald-300">
              🔑 Default admin (dùng chung)
            </div>
            <div className="grid gap-1.5 text-[13px] font-mono">
              <div><span className="text-muted-foreground">Username:</span> <strong>admin</strong></div>
              <div><span className="text-muted-foreground">Password:</span> <strong>Admin@2025</strong></div>
              <div><span className="text-muted-foreground">Policy:</span> <strong>Admin (wildcard *:*)</strong></div>
            </div>
            <div className="mt-3 text-[12px] text-muted-foreground">
              Ai trong handover cũng login được trực tiếp bằng cặp này. Nếu cần user riêng (vd phân
              quyền theo vai trò CS/Operations/Analytics), vào{" "}
              <TerminalInline>/iam</TerminalInline> tạo thêm — xem{" "}
              <a href="/docs/feature-iam" className="underline">IAM</a>.
            </div>
          </div>
          <StepCheck>
            Login được vào dashboard và thấy data thật (không phải $0).
          </StepCheck>
        </Step>

        <Step n={6} title="Lint + typecheck" hint="trước khi push" aiPrompt={null}>
          <p>
            Mac mini deploy chạy <TerminalInline>bun run build</TerminalInline> — nếu typecheck
            fail, build fail luôn. Trước khi push:
          </p>
          <Terminal
            host="you@laptop"
            cwd="~/Coding/pati-master-app"
            lines={[
              { prompt: "$", cmd: "bun run lint" },
              { prompt: "$", cmd: "bun run typecheck" },
              { divider: true, label: "khi cả 2 cùng xanh" },
              { out: "✓ No ESLint warnings", tone: "ok" },
              { out: "✓ Type check passed", tone: "ok" },
            ]}
          />
          <StepCheck>Cả 2 lệnh đều exit 0, không có lỗi đỏ.</StepCheck>
        </Step>
      </Steps>

      <Callout variant="success" title="Xong setup">
        Bạn đã: clone repo, install deps, có file <TerminalInline>.env</TerminalInline>, chạy
        được dev server, login thành công, lint/typecheck sạch. Bước tiếp theo: đọc{" "}
        <a href="/docs/supabase">Supabase Connection</a> để hiểu DB tự host{" "}
        <TerminalInline>master_app</TerminalInline> hoạt động ra sao.
      </Callout>

      <h2 id="troubleshoot">Gặp lỗi ở step nào?</h2>
      <div className="not-prose my-5 grid sm:grid-cols-2 gap-3">
        <a
          href="/docs/troubleshooting"
          className="rounded-lg border bg-card p-4 hover:border-foreground/30 transition-colors"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <div className="font-semibold text-[14px]">Troubleshooting</div>
          </div>
          <div className="text-[12.5px] text-muted-foreground leading-5">
            Decision tree: triệu chứng → nguyên nhân → cách fix exact.
          </div>
        </a>
        <a
          href="/docs/env"
          className="rounded-lg border bg-card p-4 hover:border-foreground/30 transition-colors"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <KeyRound className="h-4 w-4 text-violet-500" />
            <div className="font-semibold text-[14px]">Env Variables</div>
          </div>
          <div className="text-[12.5px] text-muted-foreground leading-5">
            Đầy đủ env vars cần có — phân loại theo Shopify / Supabase / Lark / …
          </div>
        </a>
        <a
          href="/docs/deploy-vercel"
          className="rounded-lg border bg-card p-4 hover:border-foreground/30 transition-colors"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Play className="h-4 w-4 text-sky-500" />
            <div className="font-semibold text-[14px]">Deploy</div>
          </div>
          <div className="text-[12.5px] text-muted-foreground leading-5">
            Sau khi local chạy được, push code và deploy production lên Mac mini.
          </div>
        </a>
        <a
          href="/docs/supabase"
          className="rounded-lg border bg-card p-4 hover:border-foreground/30 transition-colors"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Lock className="h-4 w-4 text-emerald-500" />
            <div className="font-semibold text-[14px]">Supabase</div>
          </div>
          <div className="text-[12.5px] text-muted-foreground leading-5">
            Self-host trên Mac mini, schema master_app, các cạm bẫy RLS phổ biến.
          </div>
        </a>
      </div>

      <PageNav href="/docs/setup" />
    </>
  );
}
