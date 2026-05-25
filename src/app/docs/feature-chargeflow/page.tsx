import {
  Cookie,
  Database,
  Network,
  Shield,
  Workflow,
} from "lucide-react";
import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import {
  FlowNode,
  FlowRow,
  Step,
  Steps,
  Terminal,
  TerminalInline,
} from "@/components/docs/visuals";

export const metadata = { title: "ChargeFlow Disputes — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="ChargeFlow Disputes"
        description="5-min cron qua Mac mini Chrome CDP. Auto evidence collect + upload. Session cookie refresh ~30 ngày."
      />

      <h2 id="why-cdp">Vì sao CDP thay vì public API?</h2>
      <div className="not-prose my-5 grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl border bg-card p-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1.5">
            ChargeFlow Public API
          </div>
          <ul className="list-disc ml-4 text-[13px] leading-6 text-foreground/85">
            <li>Rate-limited khá thấp</li>
            <li>Không expose internal fields (timeline, fulfillment proof, chat history)</li>
            <li>OK làm fallback nếu CDP path chết</li>
          </ul>
        </div>
        <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-500/[0.04] p-4">
          <div className="text-[10px] uppercase tracking-widest text-emerald-700 dark:text-emerald-300 font-semibold mb-1.5">
            Internal disputes-api qua CDP
          </div>
          <ul className="list-disc ml-4 text-[13px] leading-6 text-foreground/85">
            <li>Full fields cần thiết cho evidence package</li>
            <li>Cần session cookie sống (Playwright + Chrome CDP profile)</li>
            <li>Đây là path chính của production</li>
          </ul>
        </div>
      </div>

      <h2 id="architecture">Architecture — request đi đâu</h2>
      <div className="not-prose my-6 rounded-xl border bg-card p-4 sm:p-5">
        <FlowRow arrows="down">
          {[
            <FlowNode
              key="cron"
              icon={Workflow}
              label="Mac mini crontab"
              sub="*/5 * * * *"
              tone="orange"
            />,
            <FlowNode
              key="endpoint"
              icon={Network}
              label="POST /api/cron/chargeflow-sync-ui"
              sub="Mac mini web API + CRON_SECRET header"
              tone="violet"
            />,
            <FlowNode
              key="tunnel"
              icon={Network}
              label="Cloudflared tunnel"
              sub="chargeflow-cdp.patiagency.com → Mac mini :9222"
              tone="amber"
            />,
            <FlowNode
              key="cdp"
              icon={Cookie}
              label="Chrome (CDP)"
              sub="persistent profile ~/.chargeflow-chrome"
              tone="emerald"
            />,
            <FlowNode
              key="api"
              icon={Shield}
              label="disputes-api/list"
              sub="ChargeFlow internal — cookie auth"
              tone="pink"
            />,
            <FlowNode
              key="db"
              icon={Database}
              label="upsert chargeflow_disputes"
              sub="Supabase master_app"
              tone="sky"
            />,
          ]}
        </FlowRow>
      </div>

      <h2 id="env">Env vars liên quan</h2>
      <div className="not-prose my-5 rounded-xl border bg-card overflow-hidden">
        <EnvRow
          name="CHARGEFLOW_UI_COOKIE"
          status="prod-only"
          desc="Session cookie từ Chrome. Refresh thủ công khi expire (~30 ngày)."
        />
        <EnvRow
          name="CHARGEFLOW_UI_STATUS_PARAM"
          status="optional"
          desc='URL query filter, ví dụ "?status=needs_evidence".'
        />
        <EnvRow
          name="CHARGEFLOW_ACCESS_KEY / SECRET_KEY"
          status="required"
          desc="Public API fallback (hardened, vẫn functional)."
        />
        <EnvRow
          name="CHARGEFLOW_USE_HMAC"
          status="optional"
          desc='Default false. Set "true" khi muốn switch sang HMAC fallback path.'
        />
      </div>

      <h2 id="evidence">Evidence skill — auto collect</h2>
      <p>
        Có superpowers skill <TerminalInline>chargeflow-evidence</TerminalInline> dispatch khi
        user paste case ID hoặc nói &quot;chargeflow collect&quot;. Skill chạy 4 stage tuần
        tự:
      </p>
      <Steps>
        <Step n={1} title="Cookie extraction" hint="từ Chrome profile">
          <p>
            Đọc cookie file từ <TerminalInline>~/.chargeflow-chrome/Cookies</TerminalInline>{" "}
            (SQLite), decrypt theo Chrome version + OS.
          </p>
        </Step>
        <Step n={2} title="Lark Mail screenshot capture">
          <p>
            Tìm chat history của customer theo email → screenshot full conversation. Lưu vào{" "}
            <TerminalInline>evidence/chat-&lt;case-id&gt;.png</TerminalInline>.
          </p>
        </Step>
        <Step n={3} title="Tracking page snapshot">
          <p>
            Open Shopify order page + courier tracking page (USPS / DHL / ...). Capture
            screenshot làm proof of delivery.
          </p>
        </Step>
        <Step n={4} title="Upload back to ChargeFlow">
          <p>
            POST mỗi file với đúng <TerminalInline>evidence_type</TerminalInline> mapping (chat
            = customer_communication, tracking = shipping_documentation, ...).
          </p>
        </Step>
      </Steps>

      <h2 id="cookie-refresh">Refresh cookie khi sync bắt đầu 401</h2>
      <Callout variant="warning" title="Session expire ~30 ngày">
        Khi <TerminalInline>sync_logs</TerminalInline> bắt đầu show{" "}
        <TerminalInline>status=&apos;failed&apos;</TerminalInline> với 401 → cookie hết hạn.
      </Callout>
      <Steps>
        <Step n={1} title="SSH vào Mac mini">
          <Terminal
            host="you@laptop"
            cwd="~"
            lines={[
              { prompt: "$", cmd: "ssh timcook@100.94.220.128" },
              { prompt: "timcook@mini $", cmd: "pkill Chrome   # cleanup process cũ" },
            ]}
          />
        </Step>
        <Step n={2} title="Open Chrome với profile cũ, login manual">
          <Terminal
            host="timcook@mini"
            cwd="~"
            lines={[
              { prompt: "$", cmd: "~/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome \\" },
              { prompt: "", cmd: "  --remote-debugging-port=9222 \\" },
              { prompt: "", cmd: "  --user-data-dir=$HOME/.chargeflow-chrome &" },
              { divider: true, label: "browser sẽ mở" },
              { out: "→ Login ChargeFlow bằng tay (email + 2FA)", tone: "muted" },
            ]}
          />
        </Step>
        <Step n={3} title="Copy session cookie">
          <p>
            DevTools (F12) → Application → Cookies → <TerminalInline>chargeflow.com</TerminalInline>{" "}
            → tìm <TerminalInline>__session</TerminalInline> → copy value.
          </p>
        </Step>
        <Step n={4} title="Update env trên Mac mini + restart web">
          <Terminal
            host="timcook@mini"
            cwd="~/Coding_workspace/PATI/shopify-lark-sync"
            lines={[
              { prompt: "$", cmd: "nano ~/pati-supabase/cron/.env.web   # CHARGEFLOW_UI_COOKIE=<cookie value>" },
              { prompt: "$", cmd: "bash scripts/macmini-stack/deploy-web.sh --force" },
            ]}
          />
          <p className="text-[12.5px] text-muted-foreground mt-1">
            Cron 5-phút tiếp theo sẽ sync OK.
          </p>
        </Step>
      </Steps>

      <h2 id="hardened-fallback">Public API fallback — khi CDP path chết</h2>
      <p>Switch flag để bypass CDP và dùng HMAC API:</p>
      <CodeBlock language="bash">
{`# On Mac mini:
echo "CHARGEFLOW_USE_HMAC=true" >> ~/pati-supabase/cron/.env.web
cd ~/Coding_workspace/PATI/shopify-lark-sync
bash scripts/macmini-stack/deploy-web.sh --force`}
      </CodeBlock>

      <h2 id="tables">Tables touched</h2>
      <div className="not-prose my-5 rounded-xl border bg-card overflow-hidden">
        <TableRow name="chargeflow_disputes" purpose="Main — 1 row per dispute" />
        <TableRow name="chargeflow_evidence_uploads" purpose="Audit log của evidence upload" />
        <TableRow name="sync_logs" purpose="pipeline='chargeflow_ui'" />
      </div>

      <PageNav href="/docs/feature-chargeflow" />
    </>
  );
}

function EnvRow({
  name,
  status,
  desc,
}: {
  name: string;
  status: "required" | "optional" | "prod-only";
  desc: string;
}) {
  const styles = {
    required:
      "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40",
    optional: "bg-muted text-muted-foreground border-border",
    "prod-only":
      "bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/40",
  } as const;
  const label = { required: "Bắt buộc", optional: "Tuỳ chọn", "prod-only": "Prod-only" }[status];
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 px-4 py-2.5 border-b last:border-b-0">
      <div className="flex items-center gap-2 sm:w-[280px] shrink-0">
        <span
          className={`text-[10px] uppercase tracking-wider font-semibold rounded border px-1.5 py-0.5 shrink-0 ${styles[status]}`}
        >
          {label}
        </span>
        <code className="font-mono text-[12px] font-semibold break-all">{name}</code>
      </div>
      <div className="text-[13px] text-foreground/85 leading-6 flex-1">{desc}</div>
    </div>
  );
}

function TableRow({ name, purpose }: { name: string; purpose: string }) {
  return (
    <div className="flex items-start gap-3 px-4 py-2.5 border-b last:border-b-0">
      <Database className="h-3.5 w-3.5 text-foreground/70 shrink-0 mt-1" />
      <code className="font-mono text-[12.5px] font-semibold text-pink-700 dark:text-pink-300 shrink-0">
        {name}
      </code>
      <div className="text-[12.5px] text-muted-foreground hidden sm:block">{purpose}</div>
    </div>
  );
}
