import {
  Cloud,
  Globe,
  HardDrive,
  Server,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { ExternalLinkRow } from "@/components/docs/external-link-card";
import {
  FlowNode,
  FlowRow,
  HealthCheckGrid,
  Step,
  Steps,
  StepCheck,
  StepWarn,
  Terminal,
  TerminalInline,
} from "@/components/docs/visuals";
import { INFRA } from "@/lib/external-links";

export const metadata = { title: "Cloudflared Tunnel — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Deployment"
        title="Cloudflared Tunnel"
        description="Đường ra internet của Mac mini. Web app + database + chargeflow đều đi qua đây."
      />

      <ExternalLinkRow
        links={[
          {
            href: INFRA.cloudflareTunnels,
            title: "Cloudflare Zero Trust — Tunnels",
            pathHint: "one.dash.cloudflare.com",
            desc: "Quản lý tunnel pati-supabase: hostname routing, status, recreate, certs.",
            icon: Cloud,
            tone: "amber",
          },
          {
            href: INFRA.cloudflareDash,
            title: "Cloudflare DNS dashboard",
            pathHint: "dash.cloudflare.com",
            desc: "DNS cho patiagency.com — CNAME từ tunnel UUID xuống hostname public.",
            icon: Globe,
            tone: "sky",
          },
        ]}
      />

      {/* ─────────── USER MODE ─────────── */}
      <section data-user-detail>
        <h2 id="user-what">Tunnel này dùng để làm gì</h2>
        <p>
          Mac mini ở văn phòng PATI không có IP public. Cloudflared mở một &ldquo;ống dẫn&rdquo; ra
          internet để dashboard (<code>pnl.patigroup.com</code>) và database
          (<code>supabase.patiagency.com</code>) tới được Mac mini mà không phải mở port router.
        </p>
        <p>
          Khi tunnel rớt: dashboard báo lỗi 502, cards $0, hoặc các nút bấm không phản hồi.
          Đây là <strong>chỗ đầu tiên</strong> cần kiểm tra trước khi đào schema hay RLS.
        </p>

        <h2 id="user-when-call">Khi nào cần báo dev</h2>
        <ul>
          <li>Dashboard load không nổi mà internet vẫn OK.</li>
          <li>Một số trang hiện được, một số 502 — tunnel có thể đang reconnect.</li>
          <li>Tình trạng kéo dài quá 5 phút.</li>
        </ul>
      </section>

      {/* ─────────── DEV MODE ─────────── */}
      <section data-dev-detail>
      <h2 id="why">Cách tunnel hoạt động</h2>
      <p>
        Mac mini ở văn phòng PATI sau ISP NAT — không có IP public cố định. Cloudflared mở outbound từ Mac
        mini lên Cloudflare edge, sau đó traffic được Cloudflare proxy ngược vào Mac mini qua
        chính connection đó. Mọi request đi theo đường:
      </p>

      <div className="not-prose my-6 rounded-xl border bg-card p-4 sm:p-5">
        <FlowRow arrows="right">
          {[
            <FlowNode
              key="user"
              icon={Globe}
              label="User browser"
              sub="pnl.patigroup.com"
              tone="sky"
            />,
            <FlowNode
              key="web"
              icon={ShieldCheck}
              label="Mac mini Next.js"
              sub="127.0.0.1:3000"
              tone="violet"
            />,
            <FlowNode
              key="cf"
              icon={Cloud}
              label="Cloudflare edge"
              sub="supabase.patiagency.com"
              tone="orange"
            />,
            <FlowNode
              key="tunnel"
              icon={Server}
              label="cloudflared on Mac mini"
              sub="outbound connection up"
              tone="emerald"
            />,
            <FlowNode
              key="db"
              icon={HardDrive}
              label="Postgres + PostgREST"
              sub="docker stack"
              tone="pink"
            />,
          ]}
        </FlowRow>
        <div className="text-[11.5px] text-muted-foreground mt-3 leading-5">
          Mỗi mũi tên: HTTPS. Mac mini chủ động connect lên Cloudflare (outbound) — không cần
          mở port nào ở router.
        </div>
      </div>

      <h2 id="config">3 dòng config quyết định mọi thứ</h2>
      <p>
        File <TerminalInline>~/.cloudflared/config.yml</TerminalInline> trên Mac mini.{" "}
        <strong>Đừng sửa</strong> nếu không biết — đặc biệt 3 dòng được highlight:
      </p>
      <CodeBlock language="yaml" filename="~/.cloudflared/config.yml">
{`tunnel: pati-supabase
credentials-file: /Users/timcook/.cloudflared/pati-supabase.json

# (1) Force IPv4 — IPv6 trên residential ISP routing không ổn định; IPv4 tránh disconnect
edge-ip-version: "4"

# (2) Keep upstream alive xuyên qua NAT idle timeout (~60-120s)
originRequest:
  tcpKeepAlive: 30s
  noTLSVerify: false
  connectTimeout: 30s
  keepAliveConnections: 100
  keepAliveTimeout: 90s

# (3) Tolerate short network blips
retries: 10

ingress:
  - hostname: supabase.patiagency.com
    service: http://localhost:8000   # Kong gateway của Supabase Docker stack
  - hostname: chargeflow-trigger.patiagency.com
    service: http://localhost:9876
  - hostname: pnl.patigroup.com
    service: http://localhost:3000   # Next.js web trên Mac mini
  - service: http_status:404`}
      </CodeBlock>

      <Callout variant="danger" title="3 dòng đó đã giảm 111 → 0 disconnects/24h">
        Ngày đầu tunnel rớt liên tục, dashboard $0 cả buổi sáng. Thêm{" "}
        <TerminalInline>edge-ip-version: &quot;4&quot;</TerminalInline> +{" "}
        <TerminalInline>tcpKeepAlive: 30s</TerminalInline> + <TerminalInline>retries: 10</TerminalInline>{" "}
        — log clean ngay. Memo: <TerminalInline>reference_cloudflared_quic_502</TerminalInline>.
      </Callout>

      <h2 id="probe">Probe tunnel — luôn làm đầu tiên</h2>
      <p>
        Trước khi đào schema / RLS / auth, chạy lệnh dưới. Nó trả lời câu hỏi quan trọng nhất:
        <em>“Cloudflare có route được vào Mac mini không?”</em>
      </p>
      <Terminal
        host="you@laptop"
        cwd="~"
        lines={[
          { prompt: "$", cmd: "curl -I https://supabase.patiagency.com/rest/v1/" },
          { divider: true, label: "phân tích kết quả" },
          { out: "HTTP/2 200  →  Tunnel OK, đào sâu hơn (RLS/schema/cache)", tone: "ok" },
          { out: "HTTP/2 401  →  Tunnel OK (401 do thiếu API key — không lỗi)", tone: "ok" },
          { out: "HTTP/2 502  →  Tunnel DOWN — đọc tiếp phần Restart bên dưới", tone: "err" },
          { out: "Could not resolve host  →  DNS lỗi — hiếm khi gặp", tone: "err" },
        ]}
      />

      <h2 id="restart">Restart tunnel — 4 bước</h2>

      <Steps>
        <Step n={1} title="SSH vào Mac mini" hint="qua Tailscale">
          <Terminal
            host="you@laptop"
            cwd="~"
            lines={[
              { prompt: "$", cmd: "ssh timcook@100.94.220.128" },
              { divider: true, label: "expected" },
              { out: "Last login: ...", tone: "muted" },
              { out: "timcook@Mac-mini ~ %", tone: "ok" },
            ]}
          />
          <StepWarn title="SSH fail?">
            <ol className="list-decimal ml-5">
              <li>Kiểm tra Tailscale: <TerminalInline>tailscale status</TerminalInline> — Mac mini phải online.</li>
              <li>Mac mini đã bật chưa? (kiểm tra UPS / ổ điện tại văn phòng PATI)</li>
              <li>SSH key bạn đã được add vào <TerminalInline>~/.ssh/authorized_keys</TerminalInline> trên Mac mini?</li>
            </ol>
          </StepWarn>
        </Step>

        <Step n={2} title="Check trạng thái tunnel hiện tại">
          <Terminal
            host="timcook@mini"
            cwd="~"
            lines={[
              { prompt: "$", cmd: "cloudflared tunnel info pati-supabase" },
              { divider: true, label: "healthy" },
              { out: "ID:        <uuid>", tone: "muted" },
              { out: "Connections: 4  (sjc01, sjc02, sin01, sin02)", tone: "ok" },
              { divider: true, label: "down" },
              { out: "Connections: 0", tone: "err" },
              { out: "Last seen: 2 hours ago", tone: "err" },
            ]}
          />
        </Step>

        <Step n={3} title="Kill cũ + start mới (nohup)">
          <Terminal
            host="timcook@mini"
            cwd="~"
            lines={[
              { prompt: "$", cmd: "pkill cloudflared" },
              { prompt: "$", cmd: "nohup cloudflared tunnel run pati-supabase > ~/cloudflared.log 2>&1 &" },
              { prompt: "$", cmd: "tail -f ~/cloudflared.log" },
              { divider: true, label: "đợi 10-15s rồi sẽ thấy" },
              { out: "INF Registered tunnel connection ... location=sjc01", tone: "ok" },
              { out: "INF Registered tunnel connection ... location=sjc02", tone: "ok" },
              { out: "INF Registered tunnel connection ... location=sin01", tone: "ok" },
              { out: "INF Registered tunnel connection ... location=sin02", tone: "ok" },
            ]}
          />
          <StepWarn title="Vẫn thấy 'failed to dial QUIC' liên tục?">
            ISP block QUIC. Verify <TerminalInline>edge-ip-version: &quot;4&quot;</TerminalInline> ở config — phải có, không thì cloudflared sẽ thử IPv6/QUIC.
          </StepWarn>
        </Step>

        <Step n={4} title="Verify từ máy bạn (laptop)">
          <Terminal
            host="you@laptop"
            cwd="~"
            lines={[
              { prompt: "$", cmd: "curl -I https://supabase.patiagency.com/rest/v1/" },
              { divider: true, label: "phải thấy" },
              { out: "HTTP/2 401 hoặc 200", tone: "ok" },
            ]}
          />
          <StepCheck>
            Dashboard <TerminalInline>pnl.patigroup.com</TerminalInline> load lại — cards có số.
          </StepCheck>
        </Step>
      </Steps>

      <h2 id="health">Khi nào nên proactive check tunnel</h2>
      <HealthCheckGrid
        title="3 check Phong hay làm 1×/ngày (có thể automate bằng cron)"
        probes={[
          {
            label: "Tunnel reachable từ outside",
            cmd: "curl -I https://supabase.patiagency.com/rest/v1/",
            expect: "HTTP/2 200 hoặc 401",
            badResult: "HTTP/2 502",
            badMeans: "tunnel rớt — quay lại phần Restart",
          },
          {
            label: "Số connections của tunnel",
            cmd: "ssh timcook@100.94.220.128 'cloudflared tunnel info pati-supabase'",
            expect: "Connections: ≥ 2 (lý tưởng 4)",
            badResult: "Connections: 0",
            badMeans: "cloudflared process chưa chạy hoặc đang reconnect",
          },
          {
            label: "Disconnect count 24h qua",
            cmd: "ssh timcook@100.94.220.128 'grep -c \"connection lost\" ~/cloudflared.log'",
            expect: "≤ 5 trong 24h là OK",
            badResult: "> 30 trong 24h",
            badMeans: "config có vấn đề (thường thiếu edge-ip-version hoặc tcpKeepAlive)",
          },
        ]}
      />

      <h2 id="dns">DNS — đừng động vào</h2>
      <Callout variant="warning">
        Cloudflared route nhiều hostname về cùng tunnel UUID:{" "}
        <TerminalInline>pnl.patigroup.com</TerminalInline>,{" "}
        <TerminalInline>supabase.patiagency.com</TerminalInline>, và{" "}
        <TerminalInline>chargeflow-trigger.patiagency.com</TerminalInline>. Khi cần đổi hostname: dùng{" "}
        <TerminalInline>cloudflared tunnel route dns &lt;tunnel&gt; &lt;hostname&gt;</TerminalInline>.
      </Callout>

      <h2 id="alt-tunnel">Phương án dự phòng (chưa cần dùng)</h2>
      <div className="not-prose my-5 grid sm:grid-cols-3 gap-3 text-[13px]">
        <div className="rounded-lg border p-3">
          <div className="font-semibold mb-1">Tailscale Funnel</div>
          <div className="text-muted-foreground text-[12px] leading-5">
            Không lock vào Cloudflare. Đã thử, nhưng bandwidth thấp + không có DDoS protect.
          </div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="font-semibold mb-1">VPS reverse proxy (VPS2)</div>
          <div className="text-muted-foreground text-[12px] leading-5">
            Caddy <TerminalInline>proxy_pass</TerminalInline> từ VPS đã sẵn → Mac mini qua
            Tailscale. Dự phòng nếu Cloudflare rớt liên tục.
          </div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="font-semibold mb-1">Legacy /api/proxy/*</div>
          <div className="text-muted-foreground text-[12px] leading-5">
            Proxy qua Tailscale từ serverless function đời cũ. Đã thử nhưng latency cao do
            double-hop.
          </div>
        </div>
      </div>

      </section>

      <PageNav href="/docs/cloudflared" />
    </>
  );
}
