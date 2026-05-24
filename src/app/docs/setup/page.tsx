import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export const metadata = { title: "Local Setup — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Getting Started"
        title="Local Setup"
        description="Clone, install, configure env, run dev server."
      />

      <h2 id="prereqs">Prerequisites</h2>
      <ul>
        <li>
          <strong>Bun ≥ 1.2.12</strong> — package manager. Repo gates với{" "}
          <code>only-allow bun</code>; npm/yarn sẽ bị reject ở preinstall.
        </li>
        <li>
          <strong>Node 20+</strong> — runtime support cho Next.js 16 + tsx scripts.
        </li>
        <li>
          <strong>Python 3.12</strong> — sync workers.
        </li>
        <li>
          <strong>Git</strong> + access vào{" "}
          <a href="https://github.com/Hoaibaodata/shopify-lark-sync" target="_blank" rel="noreferrer">
            Hoaibaodata/shopify-lark-sync
          </a>{" "}
          (private).
        </li>
        <li>
          <strong>Vercel CLI</strong> (<code>npm i -g vercel</code>) + login với account đã có
          quyền vào project.
        </li>
      </ul>

      <h2 id="clone">1. Clone &amp; install</h2>
      <CodeBlock language="bash" filename="terminal">
{`git clone https://github.com/Hoaibaodata/shopify-lark-sync.git
cd shopify-lark-sync

# bun install will run preinstall (gate) and postinstall (python venv setup)
bun install`}
      </CodeBlock>
      <p>
        <code>postinstall</code> script chạy <code>scripts/setup-python.mjs</code> để tạo Python
        venv ở <code>.venv-windows/</code> hoặc <code>.venv-linux/</code> và install
        requirements.
      </p>

      <Callout variant="warning" title="Bun-only repo">
        Nếu lỡ chạy <code>npm install</code> hoặc <code>yarn</code>, preinstall hook sẽ exit 1.
        Đó là intentional — đừng comment ra. Xoá <code>node_modules</code> rồi chạy lại{" "}
        <code>bun install</code>.
      </Callout>

      <h2 id="env">2. Environment variables</h2>
      <p>
        Tạo file <code>.env</code> ở root. File này không push lên GitHub (đã có trong{" "}
        <code>.gitignore</code>). Hỏi Phong (hoặc người successor) để lấy bản đầy đủ — phần này
        chỉ là template các key bắt buộc:
      </p>
      <CodeBlock language="bash" filename=".env">
{`# --- Shopify (Lark Integration custom app) ---
SHOPIFY_DOMAIN=e49d78-3.myshopify.com
SHOPIFY_API_VERSION=2025-01
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxx
SHOPIFY_API_KEY=xxxxxxxxxxxxxxxxxxxx
SHOPIFY_API_SECRET=shpss_xxxxxxxxxxxxxxxxxxxx   # webhook HMAC

# --- Supabase (self-host on Mac mini, exposed via Cloudflared) ---
NEXT_PUBLIC_SUPABASE_URL=https://supabase.patiagency.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...anon...
SUPABASE_URL=https://supabase.patiagency.com
SUPABASE_SERVICE_KEY=eyJ...service_role...

# --- Lark / Feishu ---
LARK_APP_ID=cli_xxxxxxxxxxxxxxxxxx
LARK_APP_SECRET=xxxxxxxxxxxxxxxxxxxx
LARK_DOMAIN=open.larksuite.com

# --- Flexport (Logistics API) ---
FLEXPORT_API_TOKEN=shltm_xxxxxxxxxxxxxxxxxx

# --- Auth ---
JWT_SECRET=<random 256-bit string>
APP_BASE_URL=https://pnl.patigroup.com
CRON_SECRET=<random string>

# --- Sync ---
SYNC_ENCRYPTION_KEY=<Fernet base64 key>
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_REPO=Hoaibaodata/shopify-lark-sync

# --- Analytics providers (optional in dev) ---
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=live
RECHARGE_STOREFONT_TOKEN=sk_2x2_...
RECHARGE_TIMCOOK_TOKEN=sk_2x2_...

# --- ChargeFlow ---
CHARGEFLOW_ACCESS_KEY=...
CHARGEFLOW_SECRET_KEY=...
CHARGEFLOW_USE_HMAC=false
CHARGEFLOW_UI_COOKIE=<set on production from Mac mini Chrome CDP>`}
      </CodeBlock>
      <p>
        Xem full list ở <a href="/docs/env">Environment Variables</a>.
      </p>

      <h2 id="run-dev">3. Run the dev server</h2>
      <CodeBlock language="bash" filename="terminal">
{`# Next.js only (webpack — stable)
bun run dev

# Next.js + bulk-update Flask server (full stack)
bun run dev:full

# Or with Turbopack (faster, occasionally flaky)
bun run dev:turbo`}
      </CodeBlock>
      <p>
        Mặc định dashboard chạy ở <code>http://localhost:3000</code>. Bulk-update Flask server
        chạy ở <code>http://localhost:5000</code> và Next.js proxy qua{" "}
        <code>/api/bulk/[...path]</code>.
      </p>

      <Callout variant="tip" title="Khi gặp 502 ở local">
        Nếu dashboard load nhưng số liệu trống / cards $0, kiểm tra:
        <ol>
          <li>Cloudflared tunnel ở Mac mini có alive không (<code>supabase.patiagency.com</code>).</li>
          <li>Mac mini có online + Colima Docker đang chạy?</li>
        </ol>
        Chi tiết ở <a href="/docs/troubleshooting">Troubleshooting</a>.
      </Callout>

      <h2 id="login">4. Log in</h2>
      <p>
        UI dùng JWT custom (stored in cookies). Email đầu tiên Phong dùng:{" "}
        <code>chanphong@patigroup.com</code>. Sau khi handover, người mới phải:
      </p>
      <ol>
        <li>
          Vào <code>/iam</code> với superadmin role để tạo user mới (xem{" "}
          <a href="/docs/feature-iam">IAM</a>).
        </li>
        <li>Gán managed policy phù hợp (Admin / Operations / CS / Analytics).</li>
        <li>
          Set password qua <code>/api/auth/migrate-passwords</code> (cần{" "}
          <code>MIGRATION_SECRET</code> env var).
        </li>
      </ol>

      <h2 id="lint">5. Lint &amp; typecheck</h2>
      <CodeBlock language="bash">{`bun run lint
bun run typecheck`}</CodeBlock>
      <p>
        CI Vercel sẽ chạy <code>bun run build</code> — nếu typecheck fail, build fail. Đừng
        push nếu local typecheck đang đỏ.
      </p>

      <PageNav href="/docs/setup" />
    </>
  );
}
