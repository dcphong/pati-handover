import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export const metadata = { title: "Cloudflared Tunnel — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Deployment"
        title="Cloudflared Tunnel"
        description="How Vercel reaches Supabase running ở nhà — và làm sao fix khi 502."
      />

      <h2 id="why">Why Cloudflared</h2>
      <p>
        Mac mini ở nhà sau ISP NAT — không có public IP cố định. Cloudflared tunnel mở
        outbound connection từ Mac mini → Cloudflare edge, sau đó traffic đi
        <code> pnl.patigroup.com → supabase.patiagency.com → Cloudflare → Mac mini</code>.
      </p>

      <h2 id="config">Tunnel config</h2>
      <CodeBlock language="yaml" filename="~/.cloudflared/config.yml">
{`tunnel: pati-supabase
credentials-file: /Users/timcook/.cloudflared/pati-supabase.json

# CRITICAL — force IPv4 (avoid IPv6 flakiness on home internet)
edge-ip-version: "4"

# CRITICAL — keep upstream alive through NAT idle timeouts
originRequest:
  tcpKeepAlive: 30s
  noTLSVerify: false
  connectTimeout: 30s
  keepAliveConnections: 100
  keepAliveTimeout: 90s

# Be resilient to short network blips
retries: 10

ingress:
  - hostname: supabase.patiagency.com
    service: http://localhost:8000   # Kong gateway
  - service: http_status:404`}
      </CodeBlock>

      <Callout variant="danger" title="Cards $0 / 502 — DEFINITIVE FIX">
        Nếu dashboard show $0 / sections missing / tunnel 502, root cause hầu như luôn là:
        home ISP NAT idle timeout + IPv6 flakiness drop cloudflared edge connections. Memo:
        <code> reference_cloudflared_quic_502</code>. Fix:
        <ol>
          <li><code>edge-ip-version: &quot;4&quot;</code></li>
          <li><code>originRequest.tcpKeepAlive: 30s</code></li>
          <li><code>retries: 10</code></li>
        </ol>
        Đã từng giảm từ 111 disconnects → 0 trong 24h.
      </Callout>

      <h2 id="probe-first">Probe tunnel FIRST before chasing other bugs</h2>
      <p>Trước khi đi đào schema / RLS / auth rabbit hole, run:</p>
      <CodeBlock language="bash">
{`# From your laptop
curl -I https://supabase.patiagency.com/rest/v1/

# Expected: HTTP/2 200 (anon endpoint) or 401
# If 502: tunnel down, skip everything else and fix this`}
      </CodeBlock>

      <h2 id="restart">Restart tunnel</h2>
      <CodeBlock language="bash">
{`ssh timcook@100.94.220.128

# Check current status
cloudflared tunnel info pati-supabase

# Restart
pkill cloudflared
nohup cloudflared tunnel run pati-supabase > ~/cloudflared.log 2>&1 &

# Watch logs
tail -f ~/cloudflared.log`}
      </CodeBlock>

      <h2 id="dns">DNS routing</h2>
      <p>
        Cloudflared tự manage CNAME ở Cloudflare DNS cho <code>supabase.patiagency.com</code>.
        Đừng động vào record này từ Cloudflare dashboard — nó point về tunnel UUID, nếu sửa sẽ
        miss routes.
      </p>

      <h2 id="alt-tunnel">Alternatives</h2>
      <ul>
        <li>
          <strong>Tailscale Funnel</strong> — không lock vào Cloudflare. Đã thử, nhưng giới hạn
          bandwidth thấp + không có DDoS protect.
        </li>
        <li>
          <strong>VPS reverse proxy</strong> (VPS2) — chạy Caddy proxy_pass. Phương án dự phòng
          nếu Cloudflare tunnel rớt liên tục.
        </li>
        <li>
          <strong>Vercel proxy route</strong> — proxy <code>/api/proxy/*</code> qua Tailscale.
          Đã thử nhưng latency cao.
        </li>
      </ul>

      <PageNav href="/docs/cloudflared" />
    </>
  );
}
