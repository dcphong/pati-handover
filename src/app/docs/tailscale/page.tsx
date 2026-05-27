import {
  Laptop,
  Monitor,
  Network,
  ShieldCheck,
  Terminal as TerminalIcon,
} from "lucide-react";
import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { Terminal, TerminalInline } from "@/components/docs/visuals";

export const metadata = { title: "Tailscale Access — PATI Handover" };

const userSteps = [
  {
    title: "Xin quyền vào tailnet PATI",
    body: "Nhờ dev/admin mời đúng email bạn sẽ dùng. Không dùng email cá nhân khác vì quyền được cấp theo account.",
  },
  {
    title: "Cài Tailscale",
    body: "Vào tailscale.com/download. Mac dùng bản Standalone; Windows tải installer .exe rồi cài như app bình thường.",
  },
  {
    title: "Đăng nhập và bật VPN",
    body: "Mở Tailscale, bấm Log in, đăng nhập bằng email đã được mời, rồi cho phép VPN configuration nếu máy hỏi quyền.",
  },
  {
    title: "Kiểm tra Mac mini online",
    body: "Trong app Tailscale, tìm Mac mini. Nếu thấy offline, báo dev hoặc người giữ máy kiểm tra điện/mạng.",
  },
  {
    title: "Remote control màn hình",
    body: "Trên Mac, mở Screen Sharing, nhập 100.94.220.128 hoặc vnc://100.94.220.128. Trên Windows, nhờ dev cài VNC viewer qua Tailscale.",
  },
  {
    title: "Kết thúc phiên",
    body: "Disconnect Screen Sharing khi xong. Không tự restart service, sửa env, đổi network setting hoặc mở port router.",
  },
];

const devChecklist = [
  "Laptop đã login Tailscale và nằm trong tailnet PATI.",
  "ACL cho phép user/device connect tới Mac mini 100.94.220.128.",
  "SSH key của dev nằm trong ~timcook/.ssh/authorized_keys.",
  "Mac mini bật Screen Sharing nếu cần remote UI.",
  "Không expose SSH/VNC bằng router port-forward; chỉ đi qua Tailscale.",
];

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Access"
        title="Tailscale Access"
        description="Mạng riêng để máy bạn vào được Mac mini. Cài 5 phút, không cần đụng VPN truyền thống."
      />

      <h2 id="what">Tailscale dùng để làm gì</h2>
      <p>
        Tailscale tạo mạng riêng giữa máy bạn và Mac mini ở văn phòng PATI. Mọi truy cập vào Mac mini (SSH,
        VNC remote screen, Supabase Studio nội bộ, log files) đều phải đi qua đây — không bao
        giờ mở port router.
      </p>

      <h2 id="prereq">Cần gì trước khi kết nối</h2>
      <div className="not-prose my-5 rounded-xl border bg-card p-4">
        <ul className="space-y-2 text-[13px] leading-6 text-foreground/85">
          <li>
            <strong>1 email được mời vào tailnet PATI</strong> — admin (Phong/dev) mời từ Tailscale
            admin console. Account phải khớp email bạn dùng để login Tailscale app.
          </li>
          <li>
            <strong>App Tailscale</strong> đã cài trên máy bạn (Mac/Windows/Linux/iOS/Android).
            Tải ở <TerminalInline>tailscale.com/download</TerminalInline>.
          </li>
          <li>
            <strong>Internet</strong> bình thường. Tailscale không cần mở port — chỉ outbound HTTPS.
          </li>
        </ul>
      </div>

      <h2 id="steps">6 bước kết nối — làm lần đầu</h2>
      <ol className="not-prose my-5 space-y-3">
        {userSteps.map((step, i) => (
          <li key={step.title} className="flex gap-3 rounded-lg border bg-card p-4">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border bg-background text-xs font-semibold tabular-nums">
              {i + 1}
            </span>
            <div className="flex-1">
              <div className="font-semibold text-[14px] mb-0.5">{step.title}</div>
              <div className="text-[13px] leading-6 text-foreground/80">{step.body}</div>
            </div>
          </li>
        ))}
      </ol>

      <h2 id="remote-screen">Remote control màn hình Mac mini (screen sharing)</h2>
      <p>
        Khi cần &ldquo;nhìn&rdquo; trực tiếp màn hình Mac mini (ví dụ check Chrome ChargeFlow session,
        click vào app), dùng VNC qua Tailscale.
      </p>
      <div className="not-prose my-5 grid sm:grid-cols-2 gap-3">
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Monitor className="h-4 w-4 text-foreground/70" />
            Từ Mac
          </div>
          <ol className="space-y-1.5 text-[13px] leading-6 text-foreground/85 ml-4 list-decimal">
            <li>Mở Finder → menu Go → Connect to Server (⌘K).</li>
            <li>
              Nhập <TerminalInline>vnc://100.94.220.128</TerminalInline>, nhấn Connect.
            </li>
            <li>Đăng nhập bằng user macOS của Mac mini (<TerminalInline>timcook</TerminalInline> + password).</li>
          </ol>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Monitor className="h-4 w-4 text-foreground/70" />
            Từ Windows
          </div>
          <ol className="space-y-1.5 text-[13px] leading-6 text-foreground/85 ml-4 list-decimal">
            <li>
              Cài <a className="underline" href="https://www.realvnc.com/en/connect/download/viewer/" target="_blank" rel="noreferrer">RealVNC Viewer</a> hoặc TigerVNC.
            </li>
            <li>
              Tạo connection mới: address <TerminalInline>100.94.220.128:5900</TerminalInline>.
            </li>
            <li>Login bằng user macOS của Mac mini.</li>
          </ol>
        </div>
      </div>
      <Callout variant="warning">
        Khi xong, <strong>disconnect</strong> session VNC. Không tắt Tailscale (sẽ mất cron + tunnel).
      </Callout>

      <h2 id="troubleshoot">Khi không kết nối được</h2>
      <div className="not-prose my-5 space-y-3">
        <div className="rounded-lg border bg-card p-4">
          <div className="font-semibold text-[14px] mb-1">App Tailscale báo &ldquo;Logged out&rdquo;</div>
          <div className="text-[13px] text-foreground/80 leading-6">
            Đăng nhập lại bằng email đã được mời. Nếu URL auth không mở được, copy link từ thông báo
            paste sang browser.
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="font-semibold text-[14px] mb-1">Tailscale online nhưng Mac mini hiện &ldquo;Offline&rdquo;</div>
          <div className="text-[13px] text-foreground/80 leading-6">
            Mac mini có thể tắt nguồn / mất mạng. Nhờ người ở văn phòng PATI kiểm tra UPS + router. Nếu
            máy ON nhưng app Tailscale trên Mac mini chưa khởi động lại sau reboot, cần SSH vật lý
            (qua bàn phím + màn hình) bật.
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="font-semibold text-[14px] mb-1">SSH timeout / refused</div>
          <div className="text-[13px] text-foreground/80 leading-6">
            Verify từ máy bạn: <TerminalInline>tailscale ping 100.94.220.128</TerminalInline>. Nếu
            ping thông mà SSH fail → SSH key của bạn chưa được add vào{" "}
            <TerminalInline>~timcook/.ssh/authorized_keys</TerminalInline> trên Mac mini → báo dev.
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="font-semibold text-[14px] mb-1">VNC connect được nhưng màn hình đen</div>
          <div className="text-[13px] text-foreground/80 leading-6">
            Mac mini có thể đang ngủ. SSH vào trước, chạy{" "}
            <TerminalInline>caffeinate -u -t 5</TerminalInline> để đánh thức, rồi connect VNC lại.
          </div>
        </div>
      </div>

      <h2 id="claude-access">2.6 — Cách Claude truy cập Mac mini + mutate Supabase</h2>
      <p>
        Có 3 đường để Claude (CLI hoặc Claude Desktop) thao tác trên Mac mini, không phải cái nào
        cũng cần Claude CLI cài trên Mac mini:
      </p>
      <div className="not-prose my-5 space-y-3">
        <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-500/[0.04] p-4">
          <div className="font-semibold text-[14.5px] mb-1.5 text-emerald-700 dark:text-emerald-300">
            A. MCP server <TerminalInline>pati-supabase</TerminalInline> (đường ưu tiên — không cần Claude CLI trên Mac mini)
          </div>
          <ul className="ml-4 list-disc text-[13px] leading-6 text-foreground/85 space-y-1">
            <li>
              Config <strong>project-level</strong> ở <TerminalInline>.mcp.json</TerminalInline>{" "}
              ngay root repo <TerminalInline>shopify-lark-sync</TerminalInline> (KHÔNG phải{" "}
              <TerminalInline>~/.claude/mcp-servers.json</TerminalInline>). Khi mở repo bằng Claude
              Code, MCP tự load. Với Claude Desktop, copy vào{" "}
              <TerminalInline>%APPDATA%/Claude/claude_desktop_config.json</TerminalInline>.
            </li>
            <li>
              Server: <TerminalInline>@supabase/mcp-server-postgrest</TerminalInline> — gọi PostgREST
              <TerminalInline>https://supabase.patiagency.com/rest/v1</TerminalInline> qua tunnel cloudflared.
              Cung cấp 2 tool: <TerminalInline>postgrestRequest</TerminalInline>{" "}
              (GET/POST/PUT/PATCH/DELETE) + <TerminalInline>sqlToRest</TerminalInline> (chuyển SQL → REST path).
            </li>
            <li>
              <strong>Giới hạn:</strong> MCP lock cứng <strong>1 schema</strong> lúc start (qua arg{" "}
              <TerminalInline>--schema master_app</TerminalInline>). Muốn dùng schema khác phải start
              instance MCP thứ 2 với tên khác. <strong>Không chạy DDL được</strong> — REST chỉ thao tác
              table/view/RPC, không có <TerminalInline>CREATE TABLE</TerminalInline> hay arbitrary SQL.
              Cần DDL → dùng <TerminalInline>/pg/query</TerminalInline> endpoint (xem Supabase doc) hoặc
              <TerminalInline>pati-pg-direct</TerminalInline> MCP với SSH tunnel.
            </li>
            <li>
              <strong>Cảnh báo bảo mật:</strong> service-role JWT + DB password đang plaintext trong{" "}
              <TerminalInline>.mcp.json</TerminalInline>. Nếu repo public → rotate ngay. Phép Claude
              ngang service_role = bypass RLS, bypass UI.
            </li>
            <li>
              Yêu cầu: máy chạy Claude chỉ cần mạng internet — không cần Tailscale.
            </li>
          </ul>

          <div className="mt-3 text-[12.5px] font-semibold text-emerald-700 dark:text-emerald-300">
            Example .mcp.json (project root)
          </div>
          <CodeBlock language="json">
{`{
  "mcpServers": {
    "pati-supabase": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-postgrest",
        "--apiUrl",  "https://supabase.patiagency.com/rest/v1",
        "--apiKey",  "<SUPABASE_SERVICE_ROLE_JWT>",
        "--schema",  "master_app"
      ]
    },

    "pati-pg-direct": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://postgres.pati-prod:<DB_PASSWORD>@100.94.220.128:5432/postgres?sslmode=disable"
      ]
    }
  }
}`}
          </CodeBlock>
          <ul className="ml-4 mt-2 list-disc text-[12px] leading-6 text-foreground/75 space-y-0.5">
            <li>
              Lấy <TerminalInline>SUPABASE_SERVICE_ROLE_JWT</TerminalInline> ở Mac mini:{" "}
              <TerminalInline>grep SERVICE_ROLE_KEY ~/pati-supabase/.env</TerminalInline>{" "}
              (chmod 600 — đừng để leak).
            </li>
            <li>
              Lấy <TerminalInline>DB_PASSWORD</TerminalInline>:{" "}
              <TerminalInline>grep POSTGRES_PASSWORD ~/pati-supabase/.env</TerminalInline>.
            </li>
            <li>
              Muốn 2 schema → copy block <TerminalInline>pati-supabase</TerminalInline> thành{" "}
              <TerminalInline>pati-supabase-public</TerminalInline> (đổi tên + đổi{" "}
              <TerminalInline>--schema</TerminalInline>). Tool MCP sẽ xuất hiện gấp đôi.
            </li>
            <li>
              <TerminalInline>pati-pg-direct</TerminalInline> chỉ work khi máy chạy Claude có
              Tailscale + Postgres bind sẵn ra Tailscale IP (chưa làm). Tạm thời cần SSH tunnel{" "}
              <TerminalInline>ssh -L 5432:127.0.0.1:5432 timcook@100.94.220.128</TerminalInline>{" "}
              + đổi connection string thành <TerminalInline>localhost:5432</TerminalInline>.
            </li>
          </ul>

          <div className="mt-3 text-[12.5px] font-semibold text-emerald-700 dark:text-emerald-300">
            Claude Desktop config (nếu dùng Claude Desktop thay vì Claude Code)
          </div>
          <CodeBlock language="json">
{`// Windows: %APPDATA%\\Claude\\claude_desktop_config.json
// macOS:   ~/Library/Application Support/Claude/claude_desktop_config.json
//
// Cùng schema "mcpServers" như .mcp.json — paste vào file này thay vì repo.

{
  "mcpServers": {
    "pati-supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-postgrest",
        "--apiUrl",  "https://supabase.patiagency.com/rest/v1",
        "--apiKey",  "<SUPABASE_SERVICE_ROLE_JWT>",
        "--schema",  "master_app"
      ]
    }
  }
}`}
          </CodeBlock>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="font-semibold text-[14.5px] mb-1.5">
            B. Claude CLI chạy trên Mac mini (qua SSH session)
          </div>
          <ul className="ml-4 list-disc text-[13px] leading-6 text-foreground/85 space-y-1">
            <li>
              SSH vào Mac mini trước (qua Tailscale), rồi chạy <TerminalInline>claude</TerminalInline> bên trong session đó.
            </li>
            <li>
              Claude CLI <strong>đã cài sẵn</strong> trên Mac mini ở <TerminalInline>/Users/timcook/.claude</TerminalInline>.
              Có thể đọc file local, chạy shell, mutate DB qua psql/docker exec.
            </li>
            <li>
              Yêu cầu: phải có Tailscale + SSH key. Token Claude CLI riêng đã setup cho user timcook.
            </li>
          </ul>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="font-semibold text-[14.5px] mb-1.5">
            C. Claude từ máy bạn → SSH bridge → Mac mini
          </div>
          <ul className="ml-4 list-disc text-[13px] leading-6 text-foreground/85 space-y-1">
            <li>
              Chạy Claude CLI/Desktop trên máy bạn. Khi cần lệnh trên Mac mini, nó dùng SSH như tool —
              ví dụ <TerminalInline>ssh timcook@100.94.220.128 'docker ps'</TerminalInline>.
            </li>
            <li>Không cần cài Claude CLI trên Mac mini. Cần Tailscale + SSH key.</li>
          </ul>
        </div>
      </div>
      <Callout variant="warning">
        Đường A là default cho mutate Supabase vì MCP có schema-aware suggestion. Đường B/C dùng khi
        cần đụng file system Mac mini, restart Colima/cloudflared, hoặc thao tác Docker.
      </Callout>

      <h2 id="dev-verify">Verify path — cho dev</h2>
      <section data-dev-detail>
        <p>
          Sau khi cài + login Tailscale, verify từng layer:
        </p>
        <Terminal
          host="you@laptop"
          cwd="~"
          title="Verify private path"
          lines={[
            { prompt: "$", cmd: "tailscale status | grep 100.94.220.128" },
            { prompt: "$", cmd: "tailscale ping 100.94.220.128" },
            { prompt: "$", cmd: "nc -vz 100.94.220.128 22" },
            { prompt: "$", cmd: "nc -vz 100.94.220.128 5900" },
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

        <div className="not-prose my-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Laptop className="h-4 w-4 text-foreground/70" />
              Setup laptop
            </div>
            <ul className="space-y-2 text-sm leading-6 text-foreground/85">
              <li>Install từ <TerminalInline>https://tailscale.com/download</TerminalInline>.</li>
              <li>macOS: dùng Standalone package để tránh khác biệt App Store sandbox.</li>
              <li>Windows: dùng official installer, icon nằm trong system tray.</li>
              <li>Login đúng account được invite vào PATI tailnet.</li>
            </ul>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4 text-foreground/70" />
              Access checklist
            </div>
            <ul className="space-y-2 text-sm leading-6 text-foreground/85">
              {devChecklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 text-sm leading-6 text-foreground/85">
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <Monitor className="h-4 w-4 text-foreground/70" />
            Nếu Screen Sharing chưa bật trên Mac mini
          </div>
          <ol className="space-y-1.5">
            <li>1. Vào System Settings, General, Sharing.</li>
            <li>2. Tắt Remote Management nếu đang bật.</li>
            <li>3. Bật Screen Sharing.</li>
            <li>
              4. Trong Allow access for, chọn user được phép điều khiển, tối thiểu là{" "}
              <TerminalInline>timcook</TerminalInline>.
            </li>
            <li>
              5. Từ laptop dev chạy lại <TerminalInline>nc -vz 100.94.220.128 5900</TerminalInline>.
            </li>
          </ol>
        </div>
      </section>

      <Callout variant="warning" title="Security rule">
        Không mở port SSH/VNC trên router. Nếu người mới cần vào Mac mini, cấp quyền bằng
        Tailscale tailnet/ACL trước, rồi mới cấp SSH key hoặc Screen Sharing permission.
      </Callout>

      <h2 id="quick-reference">Thông tin nhanh</h2>
      <div className="not-prose my-5 rounded-xl border bg-card p-4">
        <Info label="Mac mini Tailscale IP" value="100.94.220.128" />
        <Info label="SSH user" value="timcook" />
        <Info label="SSH command" value="ssh timcook@100.94.220.128" />
        <Info label="Screen Sharing URL" value="vnc://100.94.220.128" />
        <Info label="Public web" value="https://pnl.patigroup.com" />
      </div>

      <p className="text-xs leading-5 text-muted-foreground">
        References:{" "}
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
      </p>

      <PageNav href="/docs/tailscale" />
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-t py-2 first:border-t-0 sm:grid-cols-[220px_1fr]">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <code className="font-mono text-[13px] text-foreground/90">{value}</code>
    </div>
  );
}
