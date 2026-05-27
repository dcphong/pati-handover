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

      {/* ─────────── USER MODE ─────────── */}
      <section data-user-detail>
        <h2 id="user-what">Tóm tắt</h2>
        <p>
          Tailscale là một &ldquo;mạng riêng&rdquo; nhẹ giúp máy của bạn nói chuyện trực tiếp
          với Mac mini ở nhà Phong mà không mở port router. Chỉ ai được mời mới vào được. Cần
          khi muốn SSH / VNC / mở DB từ máy mình.
        </p>
        <h2 id="user-when-call">Khi nào báo dev</h2>
        <ul>
          <li>Cần được mời vào tailnet — không tự đăng ký.</li>
          <li>Đã cài Tailscale mà vẫn không thấy Mac mini — báo Phong/dev để verify ACL.</li>
        </ul>
      </section>

      {/* ─────────── DEV MODE ─────────── */}
      <section data-dev-detail>
      <h2 id="what">Tailscale dùng để làm gì</h2>
      <p>
        Tailscale tạo mạng riêng giữa laptop của bạn và Mac mini. Với PATI, nó dùng cho hai việc:
        SSH vận hành kỹ thuật và Screen Sharing/VNC khi cần nhìn màn hình Mac mini.
      </p>

      <div data-user-detail className="not-prose my-5 rounded-xl border bg-card p-4">
        <div className="flex items-start gap-3">
          <Network className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h3 className="m-0 text-base font-semibold tracking-tight">Bản user-non-tech</h3>
            <p className="mt-2 text-sm leading-6 text-foreground/80">
              Làm theo các bước này nếu bạn chỉ cần vào màn hình Mac mini để kiểm tra hoặc thao
              tác theo hướng dẫn của dev.
            </p>
          </div>
        </div>
        <ol className="mt-4 space-y-3 text-sm leading-6 text-foreground/85">
          {userSteps.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border bg-background text-xs font-semibold tabular-nums">
                {i + 1}
              </span>
              <span>
                <strong>{step.title}:</strong> {step.body}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div data-dev-detail className="not-prose my-5 space-y-4">
        <div className="flex items-start gap-3">
          <TerminalIcon className="mt-0.5 h-5 w-5 shrink-0 text-violet-600 dark:text-violet-400" />
          <div>
            <h3 className="m-0 text-base font-semibold tracking-tight">Bản dev</h3>
            <p className="mt-2 text-sm leading-6 text-foreground/80">
              Dùng khi cần SSH, deploy, xem logs, kiểm tra Docker/Supabase hoặc mở UI macOS qua VNC.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
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
      </div>

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

      </section>

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
