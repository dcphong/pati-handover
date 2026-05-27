import {
  Cloud,
  Container,
  Cookie,
  Database,
  KeyRound,
  Monitor,
  Network,
  Power,
  ScreenShare,
  Terminal as TerminalIcon,
} from "lucide-react";
import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { ExternalLinkRow } from "@/components/docs/external-link-card";
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
import { INFRA } from "@/lib/external-links";

export const metadata = { title: "Mac mini Self-Host — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Deployment"
        title="Mac mini Self-Host"
        description="Máy đặt tại văn phòng PATI chạy hầu hết hệ thống: dashboard, database, cron jobs, và session ChargeFlow."
      />

      <ExternalLinkRow
        links={[
          {
            href: INFRA.tailscaleAdmin,
            title: "Tailscale admin — tailnet members",
            pathHint: "login.tailscale.com/admin/machines",
            desc: "Mời người mới vào tailnet, xem ACL, xem device list.",
            icon: Network,
            tone: "blue",
          },
          {
            href: INFRA.supabaseStudio,
            title: "Supabase Studio (Mac mini host)",
            pathHint: "supabase.patiagency.com",
            desc: "Database UI — cần basic_auth admin/Admin@2025.",
            icon: Database,
            tone: "emerald",
          },
        ]}
      />

      {/* ─────────── USER MODE ─────────── */}
      <section data-user-detail>
        <h2 id="user-what">Vì sao quan trọng</h2>
        <p>
          Mac mini này &ldquo;gánh&rdquo; hầu hết hệ thống PATI: dashboard web, database, các
          cron đồng bộ Shopify/Lark/Flexport, và phiên Chrome dùng để lấy dispute từ ChargeFlow.
          Nếu Mac mini sập → dashboard mất kết nối, cron ngừng, dữ liệu không vào.
        </p>

        <h2 id="user-watch">Để ý gì hằng ngày</h2>
        <ul>
          <li>Dashboard có load không (502 = tunnel / Mac mini có vấn đề).</li>
          <li>Cron trên trang Cron Jobs có chạy gần đây không (mỗi 30 phút phải có 1 job).</li>
          <li>Khi văn phòng cúp điện hoặc Mac mini phải reboot, dev cần check Colima &amp; tunnel.</li>
        </ul>

        <h2 id="user-when-call">Khi nào báo dev</h2>
        <ul>
          <li>Dashboard 502 hoặc trắng trang trong &gt; 5 phút.</li>
          <li>Số liệu cũ &gt; 24 h.</li>
          <li>Văn phòng mất điện hoặc Mac mini bị reboot — báo để dev khởi động lại Colima.</li>
        </ul>
      </section>

      {/* ─────────── DEV MODE ─────────── */}
      <section data-dev-detail>
      <h2 id="topology">Topology — cái gì ở đâu</h2>

      <div className="not-prose my-6 grid lg:grid-cols-2 gap-4">
        <ZoneCard zone="Mac mini @ PATI office" location="100.94.220.128 (Tailscale)" tone="emerald">
          <Service
            icon={Monitor}
            name="Next.js web"
            detail="com.pati.web · next start 127.0.0.1:3000 · pnl.patigroup.com"
            status="up"
          />
          <Service
            icon={Container}
            name="Colima VM"
            detail="Docker engine — auto-start qua com.user.colima LaunchAgent"
            status="up"
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
            name="launchd"
            detail="33 plist com.pati.* (xem trang Cron Jobs)"
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
            detail="Tại văn phòng PATI — vào giờ làm việc"
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
        <FactRow label="Vị trí" value="Văn phòng PATI" mono={false} />
      </div>

      <Callout variant="info" title="Tại sao tự host?">
        Supabase Cloud hit quota bandwidth + storage nhiều lần (hết free tier). Web hosting cũng
        đã chuyển khỏi Vercel để tránh timeout/cold-start và gom runtime về cùng Mac mini. M4 đủ
        chạy Next.js, Supabase Docker, cron và Chrome CDP nếu theo dõi RAM/log đều đặn.
      </Callout>

      <h2 id="tailscale-remote-control">Remote control Mac mini qua Tailscale</h2>
      <p>
        Tailscale chỉ tạo mạng riêng giữa máy của bạn và Mac mini. Muốn điều khiển màn hình thì
        Mac mini vẫn phải bật dịch vụ Screen Sharing của macOS; muốn thao tác kỹ thuật thì dùng SSH.
      </p>

      <div data-user-detail className="not-prose my-5 space-y-3">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-start gap-3">
            <ScreenShare className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h3 className="m-0 text-base font-semibold tracking-tight">Bản user-non-tech</h3>
              <p className="mt-2 text-sm leading-6 text-foreground/80">
                Dùng khi cần nhìn và điều khiển màn hình Mac mini như đang ngồi trước máy.
              </p>
            </div>
          </div>
          <ol className="mt-4 space-y-3 text-sm leading-6 text-foreground/85">
            <li>
              <strong>1.</strong> Nhờ dev/admin gửi invite vào Tailscale tailnet PATI. Bạn phải dùng
              đúng email được mời, không dùng email cá nhân khác.
            </li>
            <li>
              <strong>2.</strong> Cài Tailscale từ trang chính thức{" "}
              <a className="underline" href="https://tailscale.com/download" target="_blank" rel="noreferrer">
                tailscale.com/download
              </a>
              . Trên Mac nên dùng bản Standalone; trên Windows tải file installer rồi chạy như app
              bình thường.
            </li>
            <li>
              <strong>3.</strong> Mở Tailscale, bấm Log in, đăng nhập bằng email đã được mời, rồi
              cho phép VPN configuration nếu máy hỏi quyền.
            </li>
            <li>
              <strong>4.</strong> Kiểm tra Mac mini đang online trong Tailscale. Nếu thấy offline,
              báo dev hoặc người giữ máy kiểm tra điện/mạng.
            </li>
            <li>
              <strong>5.</strong> Trên Mac, mở app <TerminalInline>Screen Sharing</TerminalInline>,
              nhập <TerminalInline>100.94.220.128</TerminalInline> rồi bấm Connect. Nếu app yêu cầu URL,
              dùng <TerminalInline>vnc://100.94.220.128</TerminalInline>.
            </li>
            <li>
              <strong>6.</strong> Đăng nhập user <TerminalInline>timcook</TerminalInline> nếu bạn đã
              được cấp quyền. Chỉ làm đúng việc đã được yêu cầu, không tự sửa env, restart service
              hoặc đổi setting hệ thống.
            </li>
            <li>
              <strong>7.</strong> Xong việc thì disconnect Screen Sharing và để Tailscale bật nếu còn
              cần hỗ trợ tiếp.
            </li>
          </ol>
        </div>
        <div className="mt-4 rounded-md border border-amber-500/40 bg-amber-500/[0.06] px-3 py-2 text-[13px] leading-6">
          Nếu bạn dùng Windows hoặc không thấy app Screen Sharing, nhờ dev setup VNC viewer qua
          Tailscale thay vì mở port ra internet.
        </div>
      </div>

      <div data-dev-detail className="not-prose my-5 space-y-4">
        <div className="flex items-start gap-3">
          <TerminalIcon className="mt-0.5 h-5 w-5 shrink-0 text-violet-600 dark:text-violet-400" />
          <div>
            <h3 className="m-0 text-base font-semibold tracking-tight">Bản dev</h3>
            <p className="mt-2 text-sm leading-6 text-foreground/80">
              Dùng Tailscale để vào private IP của Mac mini. SSH dùng cho vận hành service; Screen
              Sharing/VNC dùng khi cần UI macOS hoặc Chrome profile.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border bg-background p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Step 1: cài trên máy dev
            </div>
            <ul className="mt-2 space-y-1.5 text-sm leading-6 text-foreground/85">
              <li>macOS: dùng Standalone package từ <TerminalInline>tailscale.com/download</TerminalInline>.</li>
              <li>Windows: dùng official <TerminalInline>.exe</TerminalInline> installer, icon nằm ở system tray.</li>
              <li>Login bằng email đã được invite vào PATI tailnet, approve VPN configuration.</li>
              <li>Không dùng exit node cho việc này; chỉ cần private tailnet access.</li>
            </ul>
          </div>
          <div className="rounded-lg border bg-background p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Step 2: cấp quyền
            </div>
            <ul className="mt-2 space-y-1.5 text-sm leading-6 text-foreground/85">
              <li>Tailnet ACL cho phép máy của bạn connect tới <TerminalInline>100.94.220.128</TerminalInline>.</li>
              <li>macOS Screen Sharing bật, Remote Management tắt nếu dùng Screen Sharing native.</li>
              <li>SSH key của dev nằm trong <TerminalInline>~timcook/.ssh/authorized_keys</TerminalInline>.</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border bg-background p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Step 3: dùng đúng kênh
            </div>
            <ul className="mt-2 space-y-1.5 text-sm leading-6 text-foreground/85">
              <li><TerminalInline>ssh</TerminalInline>: deploy, logs, env, Docker, launchd, cron.</li>
              <li><TerminalInline>vnc://</TerminalInline>: Chrome ChargeFlow, macOS settings, UI-only checks.</li>
              <li><TerminalInline>tailscale ping</TerminalInline>: debug path trước khi đổ lỗi service.</li>
            </ul>
          </div>
          <div className="rounded-lg border bg-background p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Step 4: kết thúc phiên
            </div>
            <ul className="mt-2 space-y-1.5 text-sm leading-6 text-foreground/85">
              <li>Đóng Screen Sharing khi xong, không để session treo qua đêm.</li>
              <li>Không restart Mac mini nếu chưa confirm impact production.</li>
              <li>Nếu thay env/service, ghi lại thời điểm, command và kết quả healthcheck.</li>
            </ul>
          </div>
        </div>

        <Terminal
          host="you@laptop"
          cwd="~"
          title="Verify Tailscale path"
          lines={[
            { prompt: "$", cmd: "tailscale status | grep 100.94.220.128" },
            { prompt: "$", cmd: "tailscale ping 100.94.220.128" },
            { prompt: "$", cmd: "nc -vz 100.94.220.128 22" },
            { prompt: "$", cmd: "nc -vz 100.94.220.128 5900   # Screen Sharing/VNC" },
          ]}
        />

        <div className="rounded-lg border bg-background p-3 text-sm leading-6 text-foreground/85">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Nếu Screen Sharing chưa bật trên Mac mini
          </div>
          <ol className="mt-2 space-y-1.5">
            <li>1. Vào System Settings, General, Sharing.</li>
            <li>2. Tắt Remote Management nếu đang bật.</li>
            <li>3. Bật Screen Sharing.</li>
            <li>4. Trong Allow access for, chọn user được phép điều khiển, tối thiểu là <TerminalInline>timcook</TerminalInline>.</li>
            <li>5. Từ laptop dev chạy lại <TerminalInline>nc -vz 100.94.220.128 5900</TerminalInline>.</li>
          </ol>
        </div>

        <Terminal
          host="timcook@mini"
          cwd="~"
          title="Enable SSH Remote Login if disabled"
          lines={[
            { prompt: "$", cmd: "sudo systemsetup -setremotelogin on" },
          ]}
        />

        <Terminal
          host="you@laptop"
          cwd="~"
          title="Connect"
          lines={[
            { prompt: "$", cmd: "ssh timcook@100.94.220.128" },
            { prompt: "$", cmd: "open vnc://100.94.220.128" },
          ]}
        />

        <div className="mt-4 rounded-md border border-amber-500/40 bg-amber-500/[0.06] px-3 py-2 text-[13px] leading-6">
          Không expose VNC/SSH bằng port-forward router. Nếu cần cấp quyền người mới, thêm user vào
          tailnet/ACL trước, rồi cấp riêng SSH hoặc Screen Sharing permission trên Mac mini.
        </div>

        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          Reference:{" "}
          <a className="underline" href="https://tailscale.com/docs/how-to/connect-to-devices" target="_blank" rel="noreferrer">
            Tailscale connect to devices
          </a>
          {" · "}
          <a className="underline" href="https://tailscale.com/docs/install/mac" target="_blank" rel="noreferrer">
            Install on macOS
          </a>
          {" · "}
          <a className="underline" href="https://tailscale.com/docs/install/windows" target="_blank" rel="noreferrer">
            Install on Windows
          </a>
          {" · "}
          <a className="underline" href="https://support.apple.com/guide/mac-help/mh14066/mac" target="_blank" rel="noreferrer">
            Apple Screen Sharing
          </a>
          {" · "}
          <a className="underline" href="https://support.apple.com/guide/mac-help/mh11848/mac" target="_blank" rel="noreferrer">
            Turn Screen Sharing on/off
          </a>
        </p>
      </div>

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

        <Step n={2} title="Kiểm tra Colima (Docker VM)" hint="auto-start qua launchd">
          <Terminal
            host="timcook@mini"
            cwd="~"
            lines={[
              { prompt: "$", cmd: "export PATH=\"/opt/homebrew/bin:/opt/homebrew/sbin:$PATH\"" },
              { prompt: "$", cmd: "launchctl print \"gui/$(id -u)/com.user.colima\" | grep -E \"state|last exit\"" },
              { prompt: "$", cmd: "colima status" },
              { divider: true, label: "fallback nếu status chưa running" },
              { prompt: "$", cmd: "launchctl kickstart -k \"gui/$(id -u)/com.user.colima\"" },
              { prompt: "$", cmd: "sleep 30 && colima status" },
            ]}
          />
          <StepWarn title="Caveat: limactl symlink có thể broken sau brew update">
            <TerminalInline>com.user.colima</TerminalInline> đã được install + đã fire nhiều lần
            sau reboot (xác minh 2026-05-27, log{" "}
            <TerminalInline>~/Library/Logs/colima-autostart.err.log</TerminalInline>). VM hiện đang
            chạy. <strong>Nhưng</strong>: <TerminalInline>colima status</TerminalInline> có thể báo{" "}
            <em>&ldquo;lima not found&rdquo;</em> do <TerminalInline>limactl</TerminalInline>{" "}
            symlink Homebrew bị broken sau update lima 2.x. Fix triệt để:{" "}
            <TerminalInline>brew reinstall lima</TerminalInline>. Nếu reboot xong Docker chưa chạy:
            dùng fallback <TerminalInline>launchctl kickstart</TerminalInline> hoặc{" "}
            <TerminalInline>colima start</TerminalInline>.
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
            cwd="~/Coding_workspace/PATI/pati-master-app"
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

      <h2 id="cron">launchd — 33 plist <code className="text-[12px]">com.pati.*</code></h2>
      <Callout variant="warning" title="PATI dùng launchd, không phải crontab">
        Mac mini PATI là macOS — pipeline production chạy bằng <strong>launchd</strong>{" "}
        (file <TerminalInline>~/Library/LaunchAgents/com.pati.*.plist</TerminalInline>) với{" "}
        <TerminalInline>StartInterval</TerminalInline> /{" "}
        <TerminalInline>StartCalendarInterval</TerminalInline>. <TerminalInline>crontab -l</TerminalInline>{" "}
        trên Mac mini chỉ chứa job của <strong>openclaw agent timcook</strong> (~20 entry độc lập),
        không phải PATI. Xem agent's crontab ở{" "}
        <a href="/docs/timcook-agent" className="underline">Timcook Agent</a>.
      </Callout>
      <p>
        SSH vào Mac mini rồi <TerminalInline>launchctl list | grep com.pati</TerminalInline> sẽ
        thấy 33 dòng. 5 ví dụ tiêu biểu:
      </p>
      <div className="not-prose my-5 rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-[13px]">
          <thead className="bg-muted/40 border-b">
            <tr>
              <th className="text-left px-3 py-2 font-semibold text-[11px] uppercase tracking-wider w-[220px]">
                Plist
              </th>
              <th className="text-left px-3 py-2 font-semibold text-[11px] uppercase tracking-wider w-[160px]">
                Lịch
              </th>
              <th className="text-left px-3 py-2 font-semibold text-[11px] uppercase tracking-wider">
                Job
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="px-3 py-2 font-mono text-[12px]">com.pati.sync-shopify-larkbase</td>
              <td className="px-3 py-2 text-muted-foreground">05:00 + 13:00 VN</td>
              <td className="px-3 py-2">Shopify orders → Lark Base (APPEND only)</td>
            </tr>
            <tr className="border-t">
              <td className="px-3 py-2 font-mono text-[12px]">com.pati.sync-chargeflow-ui</td>
              <td className="px-3 py-2 text-muted-foreground">300s (5 phút)</td>
              <td className="px-3 py-2">ChargeFlow UI parity via Chrome CDP</td>
            </tr>
            <tr className="border-t">
              <td className="px-3 py-2 font-mono text-[12px]">com.pati.sync-lark-mail</td>
              <td className="px-3 py-2 text-muted-foreground">300s (5 phút)</td>
              <td className="px-3 py-2">Lark Mail messages reconcile</td>
            </tr>
            <tr className="border-t">
              <td className="px-3 py-2 font-mono text-[12px]">com.pati.submit-stuck-fulfillments</td>
              <td className="px-3 py-2 text-muted-foreground">3600s (hourly)</td>
              <td className="px-3 py-2">Auto-submit Shopify FOs UNSUBMITTED</td>
            </tr>
            <tr className="border-t">
              <td className="px-3 py-2 font-mono text-[12px]">com.pati.sync-shopify</td>
              <td className="px-3 py-2 text-muted-foreground">*/15 phút</td>
              <td className="px-3 py-2">/api/analytics/sync/shopify/v2 → raw_orders + 5 raw_* khác</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Full visual schedule grid của cả 33 plist + GH Actions ở{" "}
        <a href="/docs/cron-jobs">Cron Jobs</a>.
      </p>

      <h2 id="vps2">VPS2 — host phụ</h2>
      <div className="not-prose my-5 rounded-xl border bg-card p-4">
        <FactRow label="Host" value="116.118.45.248 (Ubuntu 24.04)" />
        <FactRow label="Mục đích" value="Hosting full Supabase stack cho project lark_email (multi-tenant)" mono={false} />
        <FactRow label="Quan hệ với PATI" value="Chưa load-bearing. Có thể move PATI DB sang tenant nếu Mac mini ngừng." mono={false} />
        <FactRow label="SSH access" value="Phải xin tenant từ sếp trước" mono={false} />
        <FactRow label="Memo" value="reference_vps2" />
      </div>

      </section>

      <PageNav href="/docs/mac-mini" />
    </>
  );
}
