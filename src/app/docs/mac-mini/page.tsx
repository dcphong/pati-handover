import {
  Cloud,
  Container,
  Cookie,
  Database,
  KeyRound,
  Monitor,
  Network,
  Power,
  Terminal as TerminalIcon,
} from "lucide-react";
import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import {
  FactRow,
  HealthCheckGrid,
  Service,
  Step,
  Steps,
  StepCheck,
  StepWarn,
  Terminal,
  TerminalInline,
  ZoneCard,
} from "@/components/docs/visuals";

export const metadata = { title: "Mac mini Self-Host — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Deployment"
        title="Mac mini Self-Host"
        description="Máy ở nhà Phong chạy production web Next.js, Supabase, cron và Chrome session cho ChargeFlow. Mọi feature dashboard đều phụ thuộc nó."
      />

      <h2 id="topology">Topology — cái gì ở đâu</h2>

      <div className="not-prose my-6 grid lg:grid-cols-2 gap-4">
        <ZoneCard zone="Mac mini @ home" location="100.94.220.128 (Tailscale)" tone="emerald">
          <Service
            icon={Monitor}
            name="Next.js web"
            detail="com.pati.web · next start 127.0.0.1:3000 · pnl.patigroup.com"
            status="up"
          />
          <Service
            icon={Container}
            name="Colima VM"
            detail="Docker engine — KHÔNG auto-start sau reboot"
            status="manual"
          />
          <Service
            icon={Database}
            name="Supabase Docker stack"
            detail="kong · gotrue · postgrest · realtime · storage · studio · db"
            status="up"
          />
          <Service
            icon={Cloud}
            name="cloudflared"
            detail="tunnel → pnl.patigroup.com + supabase.patiagency.com"
            status="up"
          />
          <Service
            icon={Cookie}
            name="Chrome (CDP)"
            detail=":9222 · pinned profile cho ChargeFlow cookie"
            status="up"
          />
          <Service
            icon={TerminalIcon}
            name="crontab"
            detail="16 jobs (xem trang Cron Jobs)"
            status="up"
          />
        </ZoneCard>

        <ZoneCard zone="Access (làm sao vào)" location="từ laptop của bạn" tone="violet">
          <Service
            icon={Network}
            name="Tailscale"
            detail="Bật tailscale → ssh timcook@100.94.220.128"
          />
          <Service
            icon={KeyRound}
            name="SSH user"
            detail="timcook (phải add public key của bạn vào ~/.ssh/authorized_keys)"
          />
          <Service
            icon={Monitor}
            name="Public URL"
            detail="https://pnl.patigroup.com + https://supabase.patiagency.com"
          />
          <Service
            icon={Power}
            name="Physical access"
            detail="Tại nhà Phong (Q.1, HCMC) — phải hẹn trước"
          />
        </ZoneCard>
      </div>

      <h2 id="hardware">Thông số phần cứng</h2>
      <div className="not-prose my-5 rounded-xl border bg-card p-4">
        <FactRow label="Model" value="Mac mini M4, 16GB RAM, 256GB SSD" mono={false} />
        <FactRow label="Tailscale IP" value="100.94.220.128" />
        <FactRow label="SSH user" value="timcook" />
        <FactRow label="Docker" value="Colima VM (lightweight Docker Desktop alt)" mono={false} />
        <FactRow label="Web service" value="launchd com.pati.web → bun run next start --hostname 127.0.0.1 --port 3000" mono={false} />
        <FactRow label="Public tunnel" value="cloudflared → pnl.patigroup.com + supabase.patiagency.com" />
        <FactRow label="DB lên prod" value="2026-05-10 (migrate khỏi Supabase Cloud)" mono={false} />
        <FactRow label="Web deploy" value="GitHub Actions deploy-macmini.yml → deploy-web.sh" mono={false} />
        <FactRow label="Vị trí" value="Nhà Phong — Quận 1, HCMC" mono={false} />
      </div>

      <Callout variant="info" title="Tại sao tự host?">
        Supabase Cloud hit quota bandwidth + storage nhiều lần (hết free tier). Web hosting cũng
        đã chuyển khỏi Vercel để tránh timeout/cold-start và gom runtime về cùng Mac mini. M4 đủ
        chạy Next.js, Supabase Docker, cron và Chrome CDP nếu theo dõi RAM/log đều đặn.
      </Callout>

      <h2 id="boot-order">Thứ tự khởi động sau khi Mac mini reboot</h2>
      <p>
        Mac mini bị mất điện / restart? Đi đúng 5 bước này, KHÔNG skip step:
      </p>

      <Steps>
        <Step n={1} title="SSH vào Mac mini">
          <Terminal
            host="you@laptop"
            cwd="~"
            lines={[
              { prompt: "$", cmd: "tailscale status   # đảm bảo Mac mini xanh" },
              { prompt: "$", cmd: "ssh timcook@100.94.220.128" },
            ]}
          />
        </Step>

        <Step n={2} title="Khởi động Colima (Docker VM)" hint="rất hay quên">
          <Terminal
            host="timcook@mini"
            cwd="~"
            lines={[
              { prompt: "$", cmd: "colima start" },
              { divider: true, label: "đợi 10-20s" },
              { out: "INFO[0000] starting colima", tone: "muted" },
              { out: "INFO[0015] Provisioning ...", tone: "muted" },
              { out: "INFO[0018] colima is running", tone: "ok" },
            ]}
          />
          <StepWarn title="Đây là nguồn gốc 80% sự cố sau reboot">
            Colima default user-level → không tự start khi máy boot. <strong>Pending:</strong>{" "}
            launchd plist để auto-start (chưa triển khai). Khi nào làm xong, có thể bỏ step này.
          </StepWarn>
        </Step>

        <Step n={3} title="Bật Supabase Docker stack">
          <Terminal
            host="timcook@mini"
            cwd="~/supabase-selfhost"
            lines={[
              { prompt: "$", cmd: "cd ~/supabase-selfhost" },
              { prompt: "$", cmd: "docker compose up -d" },
              { divider: true, label: "verify" },
              { prompt: "$", cmd: "docker ps --format 'table {{.Names}}\\t{{.Status}}'" },
              { out: "NAMES                  STATUS", tone: "muted" },
              { out: "supabase-db            Up (healthy)", tone: "ok" },
              { out: "supabase-rest          Up (healthy)", tone: "ok" },
              { out: "supabase-kong          Up", tone: "ok" },
              { out: "supabase-auth          Up", tone: "ok" },
              { out: "supabase-storage       Up", tone: "ok" },
              { out: "supabase-realtime      Up", tone: "ok" },
            ]}
          />
        </Step>

        <Step n={4} title="Khởi động Cloudflared tunnel">
          <Terminal
            host="timcook@mini"
            cwd="~"
            lines={[
              { prompt: "$", cmd: "pkill cloudflared   # cleanup nếu có process treo" },
              { prompt: "$", cmd: "nohup cloudflared tunnel run pati-supabase > ~/cloudflared.log 2>&1 &" },
              { prompt: "$", cmd: "tail -n 5 ~/cloudflared.log" },
              { divider: true, label: "đợi 10-15s" },
              { out: "INF Registered tunnel connection ... sjc01", tone: "ok" },
              { out: "INF Registered tunnel connection ... sjc02", tone: "ok" },
            ]}
          />
        </Step>

        <Step n={5} title="Khởi động / kiểm tra web service">
          <Terminal
            host="timcook@mini"
            cwd="~/Coding_workspace/PATI/shopify-lark-sync"
            lines={[
              { prompt: "$", cmd: "launchctl kickstart -k \"gui/$(id -u)/com.pati.web\"" },
              { prompt: "$", cmd: "curl -sf http://127.0.0.1:3000/api/health" },
              { divider: true, label: "logs nếu fail" },
              { prompt: "$", cmd: "tail -80 ~/pati-supabase/cron/logs/web.err.log" },
              { prompt: "$", cmd: "tail -80 ~/pati-supabase/cron/logs/web.log" },
            ]}
          />
          <StepCheck>
            Từ máy bạn: <TerminalInline>curl -sf https://pnl.patigroup.com/api/health</TerminalInline>{" "}
            trả 2xx.
          </StepCheck>
        </Step>

        <Step n={6} title="(Nếu cần) Khởi động Chrome cho ChargeFlow">
          <p className="text-[13px]">
            Chỉ cần làm nếu cron ChargeFlow đang stale. Profile pin sẵn ở{" "}
            <TerminalInline>$HOME/.chargeflow-chrome</TerminalInline>.
          </p>
          <Terminal
            host="timcook@mini"
            cwd="~"
            lines={[
              { prompt: "$", cmd: "~/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome \\" },
              { prompt: "", cmd: "  --remote-debugging-port=9222 \\" },
              { prompt: "", cmd: "  --user-data-dir=$HOME/.chargeflow-chrome &" },
            ]}
          />
          <StepCheck>
            Từ máy bạn:{" "}
            <TerminalInline>curl http://100.94.220.128:9222/json/version</TerminalInline> trả
            về JSON.
          </StepCheck>
        </Step>
      </Steps>

      <Callout variant="success" title="Verify từ ngoài">
        Quay lại laptop, mở{" "}
        <a href="https://pnl.patigroup.com" target="_blank" rel="noreferrer">
          pnl.patigroup.com
        </a>{" "}
        — phải thấy login/dashboard. Hoặc:{" "}
        <TerminalInline>curl -sf https://pnl.patigroup.com/api/health</TerminalInline> → 2xx.
        Database tunnel check:{" "}
        <TerminalInline>curl -I https://supabase.patiagency.com/rest/v1/</TerminalInline>{" "}
        → 200/401.
      </Callout>

      <h2 id="health">Health checks (chạy bất cứ lúc nào)</h2>
      <HealthCheckGrid
        title="3 cái này confirm Mac mini đang OK"
        probes={[
          {
            label: "Web public reachable",
            cmd: "curl -sf https://pnl.patigroup.com/api/health",
            expect: "2xx JSON",
            badResult: "502 / timeout",
            badMeans: "com.pati.web hoặc cloudflared route down",
          },
          {
            label: "Public tunnel reachable",
            cmd: "curl -I https://supabase.patiagency.com/rest/v1/",
            expect: "HTTP/2 200 hoặc 401",
            badResult: "HTTP/2 502",
            badMeans: "tunnel hoặc Colima down",
          },
          {
            label: "Docker containers up",
            cmd: "ssh timcook@100.94.220.128 'docker ps | grep supabase | wc -l'",
            expect: "≥ 6",
            badResult: "0",
            badMeans: "Colima chưa start — chạy `colima start`",
          },
          {
            label: "DB chấp nhận query",
            cmd: "ssh timcook@100.94.220.128 'docker exec supabase-db psql -U postgres -c \"SELECT 1\"'",
            expect: "?column? = 1",
            badResult: "could not connect",
            badMeans: "DB container chưa healthy",
          },
        ]}
      />

      <h2 id="cron">Crontab — 16 jobs đang chạy</h2>
      <p>
        SSH vào và <TerminalInline>crontab -l</TerminalInline> để xem full. 5 entries quan trọng:
      </p>
      <div className="not-prose my-5 rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-[13px]">
          <thead className="bg-muted/40 border-b">
            <tr>
              <th className="text-left px-3 py-2 font-semibold text-[11px] uppercase tracking-wider w-[140px]">
                Lịch
              </th>
              <th className="text-left px-3 py-2 font-semibold text-[11px] uppercase tracking-wider">
                Job
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="px-3 py-2 font-mono text-[12px]">0 5,13 * * *</td>
              <td className="px-3 py-2">Shopify Lark Base sync (2× ngày — 05h + 13h VN)</td>
            </tr>
            <tr className="border-t">
              <td className="px-3 py-2 font-mono text-[12px]">*/5 * * * *</td>
              <td className="px-3 py-2">ChargeFlow UI sync (mỗi 5 phút)</td>
            </tr>
            <tr className="border-t">
              <td className="px-3 py-2 font-mono text-[12px]">0 6,18 * * *</td>
              <td className="px-3 py-2">Lark Mail sync (2× ngày)</td>
            </tr>
            <tr className="border-t">
              <td className="px-3 py-2 font-mono text-[12px]">0 * * * *</td>
              <td className="px-3 py-2">Shopify fulfillment auto-submit (mỗi giờ)</td>
            </tr>
            <tr className="border-t">
              <td className="px-3 py-2 font-mono text-[12px]">30 23 * * *</td>
              <td className="px-3 py-2">North Stars matview refresh (nightly)</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Full visual schedule grid ở <a href="/docs/cron-jobs">Cron Jobs</a>.
      </p>

      <h2 id="vps2">VPS2 — host phụ</h2>
      <div className="not-prose my-5 rounded-xl border bg-card p-4">
        <FactRow label="Host" value="116.118.45.248 (Ubuntu 24.04)" />
        <FactRow label="Mục đích" value="Hosting full Supabase stack cho project lark_email (multi-tenant)" mono={false} />
        <FactRow label="Quan hệ với PATI" value="Chưa load-bearing. Có thể move PATI DB sang tenant nếu Mac mini ngừng." mono={false} />
        <FactRow label="SSH access" value="Phải xin tenant từ sếp trước" mono={false} />
        <FactRow label="Memo" value="reference_vps2" />
      </div>

      <PageNav href="/docs/mac-mini" />
    </>
  );
}
