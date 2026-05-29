import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { Terminal, TerminalInline } from "@/components/docs/visuals";

export const metadata = { title: "CLI (pati-cli) — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Reference"
        title="CLI · pati-cli"
        description="Command-line interface cho PATI master app. Đăng nhập 1 lần bằng Lark OAuth, sau đó query disputes / CS metrics / cron health từ terminal — không cần mở browser."
      />

      {/* ── USER MODE ─────────────────────────────────────────────── */}
      <section data-user-detail>
        <h2 id="user-what">CLI để làm gì</h2>
        <p>
          Thay vì mở browser vào <code>pnl.patigroup.com</code> và click qua các dashboard,
          anh có thể gõ lệnh ngắn để xem cùng số liệu — vd <code>pati cs metrics</code> show 6
          North-Star metrics ngay trong terminal. Hữu ích khi cần snapshot nhanh, pipe sang
          jq / awk, hoặc viết script tự động.
        </p>
        <h2 id="user-quickstart">Bắt đầu trong 3 lệnh</h2>
        <Terminal
          host="you@laptop"
          cwd="~"
          lines={[
            { prompt: "$", cmd: "npm i -g pati-cli" },
            { prompt: "$", cmd: "pati auth login" },
            { divider: true, label: "browser mở, login Lark như thường lệ" },
            { prompt: "$", cmd: "pati dispute list" },
          ]}
        />
        <h2 id="user-when-call">Khi nào báo dev</h2>
        <ul>
          <li>
            Lệnh báo <TerminalInline>Request timed out after 30s</TerminalInline> dù mạng OK
            → backend / Mac mini có thể chậm.
          </li>
          <li>
            <TerminalInline>pati auth login</TerminalInline> không mở browser hoặc browser
            mở nhưng terminal không nhận callback.
          </li>
          <li>
            Số liệu giữa <TerminalInline>pati cs metrics</TerminalInline> và dashboard web
            khác nhau rõ rệt — có thể là cache.
          </li>
        </ul>
      </section>

      {/* ── DEV MODE ──────────────────────────────────────────────── */}
      <section data-dev-detail>
        <h2 id="install">Install</h2>
        <Terminal
          host="you@laptop"
          cwd="~"
          lines={[
            { prompt: "$", cmd: "npm i -g pati-cli" },
            { divider: true, label: "hoặc với bun" },
            { prompt: "$", cmd: "bun install -g pati-cli" },
            { divider: true, label: "verify" },
            { prompt: "$", cmd: "pati --version" },
            { out: "0.2.0", tone: "ok" },
          ]}
        />
        <p>
          Yêu cầu Node ≥ 20 (CLI bundle là ESM). Source code ở{" "}
          <TerminalInline>cli/</TerminalInline> workspace trong repo{" "}
          <TerminalInline>pati-master-app</TerminalInline>.
        </p>

        <h2 id="auth">Auth — Lark OAuth qua browser</h2>
        <p>
          <TerminalInline>pati auth login</TerminalInline> tạo HTTP server tạm ở port random
          trên <code>127.0.0.1</code>, mở browser tới{" "}
          <TerminalInline>pnl.patigroup.com/cli/auth?port=...&state=...</TerminalInline>. Nếu
          anh chưa login pnl, page tự redirect qua Lark OAuth → callback quay lại{" "}
          <TerminalInline>/cli/auth</TerminalInline> với session đã set, page render HTML
          redirect về <code>http://localhost:&lt;port&gt;/callback</code>, CLI bắt token,
          verify state, lưu vào <TerminalInline>~/.pati/config.json</TerminalInline> (mode
          0600).
        </p>
        <Callout variant="info" title="Token boundary">
          Token chỉ gửi đến <code>localhost</code> (browser quyết destination). Random port +
          16-byte state nonce + 127.0.0.1-only binding chặn LAN snoop, CSRF, open-redirect.
        </Callout>
        <Terminal
          host="you@laptop"
          cwd="~"
          lines={[
            { prompt: "$", cmd: "pati auth login" },
            { out: "Opening browser:" },
            { out: "  https://pnl.patigroup.com/cli/auth?port=58423&state=a1b2c3…" },
            { out: "" },
            { out: "Waiting for callback on localhost:58423 (timeout 300s)…" },
            { divider: true, label: "browser bounces back, CLI captures token" },
            { out: "✓ Logged in. Token saved to /Users/you/.pati/config.json", tone: "ok" },
            { divider: true, label: "verify config" },
            { prompt: "$", cmd: "pati auth status" },
          ]}
        />

        <h2 id="commands">Command reference</h2>

        <h3 id="cmd-auth">
          <code>pati auth</code> — login / status / logout
        </h3>
        <CodeBlock language="bash">
{`pati auth login                  # browser-based Lark OAuth
pati auth login --timeout 120    # đổi timeout (default 300s)
pati auth login --base-url http://localhost:3000   # dev server

pati auth status                 # show config + token preview
pati auth logout                 # xoá token khỏi config`}
        </CodeBlock>

        <h3 id="cmd-shop">
          <code>pati shop</code> — chọn active store
        </h3>
        <p>
          Multi-store: CLI gửi <TerminalInline>?store=&lt;slug&gt;</TerminalInline> trên mỗi
          request. Slug lưu vào <TerminalInline>~/.pati/config.json</TerminalInline>. Nếu
          chưa set, backend tự chọn default (env <code>SHOPIFY_DOMAIN</code> hoặc store đầu).
        </p>
        <CodeBlock language="bash">
{`pati shop list                   # bảng stores · ● = đang chọn
pati shop switch wellness-nest   # pin slug
pati shop switch wellness-nest-de
pati shop active                 # show current
pati shop clear                  # bỏ pin, để backend chọn default`}
        </CodeBlock>

        <h3 id="cmd-dispute">
          <code>pati dispute</code> — disputes 3 cổng
        </h3>
        <CodeBlock language="bash">
{`pati dispute list                          # 15 dispute mới nhất gộp PayPal + Shopify + Stripe
pati dispute list --status needs_response  # filter theo status
pati dispute list --gateway paypal         # filter theo gateway
pati dispute list --limit 30
pati dispute list --json | jq '.[].id'     # pipe vào jq

pati dispute show <id>                     # chi tiết 1 dispute
pati dispute show <id> --json`}
        </CodeBlock>
        <p>
          Backend: <TerminalInline>GET /api/disputes</TerminalInline> — gộp{" "}
          <code>sections[].recent</code> client-side và sort theo{" "}
          <code>opened_at</code> desc. Response payload có thể 5-10 MB cho window 30 ngày,
          spinner sẽ in elapsed time để biết đang chạy.
        </p>

        <h3 id="cmd-cs">
          <code>pati cs</code> — CS dashboard
        </h3>
        <CodeBlock language="bash">
{`pati cs metrics              # 6 North-Star metrics (FRT, OTIF, refund rate, churn, …)
pati cs metrics --json

pati cs overdue              # email open + overdue > 7 phút + replied today + avg response`}
        </CodeBlock>

        <h3 id="cmd-cron">
          <code>pati cron</code> — sync pipeline health
        </h3>
        <CodeBlock language="bash">
{`pati cron status                         # per-shop, per-provider health snapshot
pati cron status --shop wellness         # filter shop (substring match)
pati cron status --json`}
        </CodeBlock>
        <p>
          Hữu ích khi nghi <code>shopify-sync</code> hoặc{" "}
          <code>paypal_transactions</code> stale — show last run, last success, errors trong
          24h gần nhất. Backend: <TerminalInline>GET /api/sync-health</TerminalInline>.
        </p>

        <h3 id="cmd-sync-logs">
          <code>pati sync-logs</code> — recent sync_logs rows
        </h3>
        <CodeBlock language="bash">
{`pati sync-logs                       # 20 rows mới nhất cho active shop
pati sync-logs --limit 100
pati sync-logs --status error        # chỉ rows failed
pati sync-logs --type shopify        # filter theo sync_type
pati sync-logs --status error --type paypal_transactions --json`}
        </CodeBlock>

        <h2 id="config">Config & env</h2>
        <div className="not-prose my-4 rounded-xl border bg-card overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-widest">
              <tr className="border-b">
                <th className="px-3 py-2 text-left w-[200px]">Key</th>
                <th className="px-3 py-2 text-left">Mô tả</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="px-3 py-2 font-mono text-[12px]">~/.pati/config.json</td>
                <td className="px-3 py-2 text-foreground/85">
                  File chứa <code>baseUrl</code>, <code>token</code>, <code>shopId</code>.
                  Mode 0600. CLI tự tạo khi <code>auth login</code>.
                </td>
              </tr>
              <tr className="border-t">
                <td className="px-3 py-2 font-mono text-[12px]">PATI_TOKEN</td>
                <td className="px-3 py-2 text-foreground/85">
                  Override token — ưu tiên hơn file. Hữu ích cho CI / agent automation.
                </td>
              </tr>
              <tr className="border-t">
                <td className="px-3 py-2 font-mono text-[12px]">PATI_BASE_URL</td>
                <td className="px-3 py-2 text-foreground/85">
                  Override base URL (default <code>https://pnl.patigroup.com</code>).
                </td>
              </tr>
              <tr className="border-t">
                <td className="px-3 py-2 font-mono text-[12px]">PATI_SHOP_ID</td>
                <td className="px-3 py-2 text-foreground/85">
                  Override store slug.
                </td>
              </tr>
              <tr className="border-t">
                <td className="px-3 py-2 font-mono text-[12px]">PATI_DEBUG=1</td>
                <td className="px-3 py-2 text-foreground/85">
                  In URL gửi đi + response status / size. In stack trace khi error.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 id="output">Output modes — table vs JSON</h2>
        <p>
          Mọi list command đều có flag <TerminalInline>--json</TerminalInline> để pipe vào{" "}
          <code>jq</code>, <code>fx</code>, hoặc xử lý script. Khi TTY (terminal tương tác) →
          bảng pretty với màu + spinner. Khi pipe (vd <code>| less</code>, <code>| jq</code>
          ) → chỉ JSON, không ANSI noise.
        </p>
        <Terminal
          host="you@laptop"
          cwd="~"
          lines={[
            { prompt: "$", cmd: "pati dispute list --json | jq '[.[] | {id, status, amount}]'" },
            { out: "[" },
            { out: '  { "id": "PP-abc...", "status": "needs_response", "amount": 89.0 },' },
            { out: '  …' },
            { out: "]" },
          ]}
        />

        <h2 id="troubleshoot">Troubleshooting</h2>
        <div className="not-prose my-4 rounded-xl border bg-card overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-widest">
              <tr className="border-b">
                <th className="px-3 py-2 text-left w-[260px]">Triệu chứng</th>
                <th className="px-3 py-2 text-left">Cause / fix</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t align-top">
                <td className="px-3 py-2 font-mono text-[12px]">No auth token. Set PATI_TOKEN…</td>
                <td className="px-3 py-2 text-foreground/85">
                  Chưa login. Chạy <TerminalInline>pati auth login</TerminalInline>.
                </td>
              </tr>
              <tr className="border-t align-top">
                <td className="px-3 py-2 font-mono text-[12px]">401 Unauthorized</td>
                <td className="px-3 py-2 text-foreground/85">
                  Token hết hạn (JWT 7 ngày). Login lại:{" "}
                  <TerminalInline>pati auth login</TerminalInline>.
                </td>
              </tr>
              <tr className="border-t align-top">
                <td className="px-3 py-2 font-mono text-[12px]">Request timed out after 30s</td>
                <td className="px-3 py-2 text-foreground/85">
                  API call quá lâu (vd <code>/api/disputes</code> với window 30d). Tăng
                  timeout bằng PATI_DEBUG=1 để xem URL, hoặc rút window xuống (nếu endpoint
                  hỗ trợ <code>?from/to</code>).
                </td>
              </tr>
              <tr className="border-t align-top">
                <td className="px-3 py-2 font-mono text-[12px]">
                  Browser không mở khi <code>auth login</code>
                </td>
                <td className="px-3 py-2 text-foreground/85">
                  Copy URL CLI in ra → paste vào browser thủ công. CLI vẫn lắng nghe callback
                  trên <code>localhost:&lt;port&gt;</code> trong 300 giây.
                </td>
              </tr>
              <tr className="border-t align-top">
                <td className="px-3 py-2 font-mono text-[12px]">CLI hang vô hạn không thấy gì</td>
                <td className="px-3 py-2 text-foreground/85">
                  Update bản mới nhất (≥ 0.1.3 có spinner):{" "}
                  <TerminalInline>npm i -g pati-cli@latest</TerminalInline>.
                </td>
              </tr>
              <tr className="border-t align-top">
                <td className="px-3 py-2 font-mono text-[12px]">Số liệu khác giữa CLI và web</td>
                <td className="px-3 py-2 text-foreground/85">
                  CLI và web cùng gọi cùng endpoint, nhưng React Query stale-time ở web có
                  thể giữ data cũ. F5 web → so lại với CLI.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 id="dev">Dev mode (build từ source)</h2>
        <Terminal
          host="you@laptop"
          cwd="~/Coding_workspace/PATI/shopify-lark-sync"
          lines={[
            { prompt: "$", cmd: "cd cli" },
            { prompt: "$", cmd: "bun install" },
            { prompt: "$", cmd: "bun run dev dispute list   # chạy từ src/, không cần build" },
            { divider: true, label: "build & link global" },
            { prompt: "$", cmd: "bun run build" },
            { prompt: "$", cmd: "npm link               # tạo symlink global pati → dist/index.mjs" },
            { divider: true, label: "publish (chỉ Phong)" },
            { prompt: "$", cmd: "npm version patch" },
            { prompt: "$", cmd: "npm publish --access public" },
          ]}
        />
        <Callout variant="warning" title="Đừng publish từ repo root">
          <code>shopify-lark-sync/package.json</code> có{" "}
          <code>&quot;private&quot;: true</code> + <code>prepublishOnly</code> guard.
          Phải <TerminalInline>cd cli</TerminalInline> trước khi publish — nếu không sẽ
          publish toàn bộ source code Next.js (45 MB, gồm <code>.env.local</code>) lên npm
          public. Đã có rào cản nhưng đừng test sự may mắn.
        </Callout>

        <h2 id="roadmap">Roadmap</h2>
        <ul>
          <li>
            <strong>v0.2 — current</strong>: auth, shop, dispute list/show, cs metrics +
            overdue, cron status, sync-logs.
          </li>
          <li>
            <strong>v0.3 (planned)</strong>:{" "}
            <TerminalInline>pati dispute upload-evidence &lt;id&gt; &lt;files...&gt;</TerminalInline>{" "}
            — upload evidence ChargeFlow từ terminal.
          </li>
          <li>
            <strong>v0.4 (planned)</strong>: <TerminalInline>pati order get &lt;name&gt;</TerminalInline>{" "}
            (cần backend mở endpoint). <TerminalInline>pati cron run &lt;pipeline&gt;</TerminalInline>{" "}
            — trigger cron manually.
          </li>
          <li>
            <strong>v1.0 (planned)</strong>: single-binary release qua GitHub Releases (no
            Node required), Authorization Bearer header native (không cần cookie hack).
          </li>
        </ul>
      </section>

      <PageNav href="/docs/cli" />
    </>
  );
}
