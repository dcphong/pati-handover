import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export const metadata = { title: "ChargeFlow Disputes — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="ChargeFlow Disputes"
        description="5-min cron via Mac mini Chrome CDP. Auto evidence collect + upload."
      />

      <h2 id="why-cdp">Why CDP instead of public API</h2>
      <p>
        ChargeFlow public API rate-limited, không expose tất cả internal fields cần thiết cho
        evidence package (timeline, fulfillment proof, customer chat history). Internal{" "}
        <code>disputes-api</code> mạnh hơn nhưng yêu cầu session cookie sống. Lựa chọn:
        Playwright + Chrome CDP từ persistent profile.
      </p>

      <h2 id="architecture">Architecture</h2>
      <CodeBlock language="text">
{`Mac mini
  ├─ Chrome (persistent profile ~/.chargeflow-chrome)
  │   └─ logged-in ChargeFlow session (refreshed mỗi 30 ngày)
  │
  ├─ Cron */5 * * * *
  │   └─ POST /api/cron/chargeflow-sync-ui  (Vercel, with CRON_SECRET)
  │
  └─ Cloudflare tunnel
      ├─ supabase.patiagency.com → Supabase
      └─ chargeflow-cdp.patiagency.com → Chrome :9222 (RDP)

Vercel
  └─ /api/cron/chargeflow-sync-ui
       └─ CDP via tunnel → /disputes-api/list
       └─ Upsert chargeflow_disputes`}
      </CodeBlock>

      <h2 id="env">Env vars</h2>
      <ul>
        <li><code>CHARGEFLOW_UI_COOKIE</code> — session cookie từ Chrome (refresh thủ công khi expire).</li>
        <li><code>CHARGEFLOW_UI_STATUS_PARAM</code> — optional filter (e.g. <code>?status=needs_evidence</code>).</li>
        <li><code>CHARGEFLOW_ACCESS_KEY / CHARGEFLOW_SECRET_KEY</code> — public API fallback (hardened, still functional).</li>
      </ul>

      <h2 id="evidence">Evidence skill</h2>
      <p>
        Có superpowers skill <code>chargeflow-evidence</code> dispatch khi user paste case ID
        hoặc nói &quot;chargeflow collect&quot;. Skill chạy 4 stage:
      </p>
      <ol>
        <li>Cookie extraction từ Chrome profile</li>
        <li>Lark Mail screenshot capture (chat history)</li>
        <li>Tracking page snapshot (Shopify + courier)</li>
        <li>Upload back to ChargeFlow với correct evidence type mapping</li>
      </ol>

      <h2 id="cookie-refresh">Refresh cookie</h2>
      <Callout variant="warning" title="Khi sync bắt đầu 401">
        Session cookie hết hạn (thường mỗi 30 ngày). Fix:
      </Callout>
      <ol>
        <li>SSH vào Mac mini, kill Chrome.</li>
        <li>Start Chrome với profile cũ, manually login ChargeFlow.</li>
        <li>DevTools → Application → Cookies → copy cookie value của <code>__session</code>.</li>
        <li><code>vercel env rm CHARGEFLOW_UI_COOKIE production</code> then <code>vercel env add CHARGEFLOW_UI_COOKIE production &lt; cookie.txt</code>.</li>
        <li><code>vercel --prod --yes</code> để propagate.</li>
      </ol>

      <h2 id="hardened-fallback">Public API fallback</h2>
      <p>
        Path công khai (HMAC, REST) vẫn được giữ hardened. Nếu CDP sync down, switch flag:
      </p>
      <CodeBlock language="bash">
{`vercel env add CHARGEFLOW_USE_HMAC production
# value: true`}
      </CodeBlock>

      <h2 id="tables">Tables touched</h2>
      <ul>
        <li><code>chargeflow_disputes</code> — main</li>
        <li><code>chargeflow_evidence_uploads</code> — evidence upload audit</li>
        <li><code>sync_logs</code> — pipeline='chargeflow_ui'</li>
      </ul>

      <PageNav href="/docs/feature-chargeflow" />
    </>
  );
}
