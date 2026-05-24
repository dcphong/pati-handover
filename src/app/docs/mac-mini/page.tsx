import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export const metadata = { title: "Mac mini Self-Host — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Deployment"
        title="Mac mini Self-Host"
        description="Home server hosting Supabase + cron + ChargeFlow Chrome session."
      />

      <h2 id="hardware">Hardware & access</h2>
      <table>
        <tbody>
          <tr><td>Model</td><td>Mac mini M4, 16GB RAM</td></tr>
          <tr><td>Location</td><td>Phong&apos;s home</td></tr>
          <tr><td>Public access</td><td>Tailscale IP <code>100.94.220.128</code></td></tr>
          <tr><td>SSH user</td><td><code>timcook</code></td></tr>
          <tr><td>Public tunnel</td><td>Cloudflared → <code>supabase.patiagency.com</code></td></tr>
          <tr><td>Migration date</td><td>2026-05-10 (Supabase Cloud → self-host)</td></tr>
        </tbody>
      </table>

      <Callout variant="info" title="Why self-host?">
        Supabase Cloud quota hit limit nhiều lần (bandwidth + storage). Self-host trên M4 cho
        compute + storage gần như miễn phí, latency thấp hơn (Tailscale intra), và đủ stable
        cho production (32h+ uptime mặc định). Cloud project no longer load-bearing.
      </Callout>

      <h2 id="stack">Stack on Mac mini</h2>
      <CodeBlock language="bash">
{`# 1. Colima — Docker VM cho macOS (lightweight alternative to Docker Desktop)
colima start

# 2. Supabase Docker Compose (Caddy + Kong + Supavisor + GoTrue + Realtime + Storage + Studio)
cd ~/supabase-selfhost
docker compose up -d

# 3. Cloudflared tunnel
cloudflared tunnel run pati-supabase

# 4. Chrome (for ChargeFlow CDP) — pinned profile cho session cookie
~/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome \\
  --remote-debugging-port=9222 \\
  --user-data-dir=$HOME/.chargeflow-chrome`}
      </CodeBlock>

      <Callout variant="danger" title="Colima KHÔNG auto-start sau reboot">
        Mặc định Colima là user-level. Sau khi Mac mini restart, phải SSH vào và{" "}
        <code>colima start</code> thủ công. Triệu chứng: 502 tunnel, supabase.patiagency.com
        đập tường. <strong>Pending hardening</strong>: launchd plist để auto-start.
      </Callout>

      <h2 id="cron">Mac mini crontab</h2>
      <p>SSH vào và <code>crontab -e</code> để chỉnh. Một số entries quan trọng:</p>
      <CodeBlock language="cron" filename="crontab -l">
{`# Shopify Lark Base sync 2x/day (05h + 13h VN)
0 5,13 * * *  cd /Users/timcook/pati && bun run sync:shopify-larkbase

# ChargeFlow UI sync mỗi 5 phút
*/5 * * * *   cd /Users/timcook/pati && bun run sync:chargeflow-ui

# Lark Mail sync 2x/day
0 6,18 * * *  cd /Users/timcook/pati && bun run sync:lark-mail

# Auto-submit stuck Shopify fulfillment orders (hourly)
0 * * * *     cd /Users/timcook/pati && bun run cron:fulfillment

# North Stars matview refresh (nightly)
30 23 * * *   cd /Users/timcook/pati && bun run cron:north-stars`}
      </CodeBlock>

      <h2 id="vps2">VPS2 secondary host</h2>
      <p>
        VPS2 (<code>116.118.45.248</code>, Ubuntu 24.04) đang chạy full Supabase stack cho{" "}
        <code>lark_email</code> project (multi-tenant). Có thể host PATI DB như tenant mới nếu
        cần, nhưng chưa cần thiết — phải có SSH + tenant access từ sếp trước. Memo:{" "}
        <code>reference_vps2</code>.
      </p>

      <h2 id="ssh">SSH access</h2>
      <CodeBlock language="bash">
{`# Add Tailscale IP và SSH key
tailscale up   # nếu chưa
ssh timcook@100.94.220.128

# Once in:
docker ps                   # Supabase containers
docker logs supabase-rest   # PostgREST logs
cloudflared tunnel info pati-supabase`}
      </CodeBlock>

      <h2 id="probe">Health checks</h2>
      <ol>
        <li><code>curl -I https://supabase.patiagency.com/rest/v1/</code> → 200 / 401 = healthy. 502 = tunnel down.</li>
        <li><code>docker exec supabase-db psql -U postgres -c "SELECT 1"</code> → DB alive.</li>
        <li><code>cloudflared tunnel info pati-supabase</code> → bình thường có ≥ 1 connection.</li>
      </ol>

      <PageNav href="/docs/mac-mini" />
    </>
  );
}
