import {
  AlertTriangle,
  Calendar,
  KeyRound,
  ShieldAlert,
  User,
} from "lucide-react";
import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { TerminalInline } from "@/components/docs/visuals";
import { cn } from "@/lib/utils";

export const metadata = { title: "Auth & Credentials Rotation — PATI Handover" };

type Sev = "blocker" | "high" | "med" | "low";

type Cred = {
  name: string;
  where: string;
  ownedBy: string;
  needsRotate: boolean;
  sev: Sev;
  symptom: string;
  rotate: string;
};

const sevClass: Record<Sev, string> = {
  blocker: "bg-red-500/15 border-red-500/40 text-red-700 dark:text-red-300",
  high:    "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300",
  med:     "bg-sky-500/15 border-sky-500/40 text-sky-700 dark:text-sky-300",
  low:     "bg-muted text-muted-foreground border-border",
};

const sevLabel: Record<Sev, string> = {
  blocker: "Blocker",
  high: "Cao",
  med: "Trung bình",
  low: "Thấp",
};

const personalCreds: Cred[] = [
  {
    name: "FLEXPORT_EMAIL / FLEXPORT_PASSWORD",
    where: "Mac mini .env + repo .env (legacy Playwright fallback)",
    ownedBy: "chanphong@patigroup.com (Phong)",
    needsRotate: true,
    sev: "high",
    symptom: "Khi email Phong bị disable, Playwright login fallback fail. Hiện FLEXPORT_API_TOKEN là primary path nên không gãy ngay, nhưng fallback chết.",
    rotate:
      "Tạo Flexport account mới (vd ops@patigroup.com), invite vào Flexport workspace với quyền equivalent, đổi FLEXPORT_EMAIL+FLEXPORT_PASSWORD trong .env Mac mini và GitHub secrets, restart com.pati.sync-flexport.",
  },
  {
    name: "CHARGEFLOW_UI_COOKIE + Chrome session",
    where: "Mac mini Chrome profile + .env runtime",
    ownedBy: "Phong (ChargeFlow account đăng nhập bằng email Phong)",
    needsRotate: true,
    sev: "blocker",
    symptom: "Khi Phong logout / account bị disable, 5-min cron sync ChargeFlow disputes fail. Dispute UI scrape pipeline chết → backlog evidence không up.",
    rotate:
      "Tạo ChargeFlow account mới hoặc invite successor email, login trên Chrome Mac mini (qua VNC), save cookie. Cập nhật CHARGEFLOW_UI_COOKIE nếu cần. Sessions hết hạn ~30 ngày — đặt nhắc rotate định kỳ.",
  },
  {
    name: "Tailscale account trên Mac mini",
    where: "Tailscale app đang chạy trên Mac mini (login bằng doanchanphong0610@gmail.com)",
    ownedBy: "Phong (Mac mini login bằng Gmail cá nhân)",
    needsRotate: true,
    sev: "high",
    symptom: "Mac mini hiện đang join tailnet bằng Gmail cá nhân của Phong. Khi Phong revoke device hoặc Google account của Phong gãy, Mac mini sẽ rớt khỏi tailnet → mất SSH/VNC từ xa.",
    rotate:
      "Trên Mac mini (qua VNC hoặc bàn phím vật lý): mở Tailscale app → Log out → Log in lại bằng email tailnet thuộc PATI / successor. Verify hostname kevins-mac-mini vẫn xuất hiện trong tailnet và IP 100.94.220.128 giữ nguyên (Tailscale assign lại đúng node).",
  },
  {
    name: "LARK_MAIL_TARGET_USER",
    where: "Mac mini .env",
    ownedBy: "support@wellnessnest.co (shared mailbox, không nhân danh cá nhân)",
    needsRotate: false,
    sev: "low",
    symptom: "Đã trỏ đúng mailbox shared của CS. Khi nào CS đổi mailbox thì update.",
    rotate: "Không cần rotate trong dịp handover.",
  },
];

export default function Page() {
  const blockers = personalCreds.filter((c) => c.sev === "blocker").length;
  const totalRotate = personalCreds.filter((c) => c.needsRotate).length;

  return (
    <>
      <PageHeader
        eyebrow="Handover"
        title="Auth & Credentials"
        description="Login mặc định cho người tiếp nhận + danh sách credential nhân danh Phong cần rotate trước khi Phong off."
      />

      <h2 id="default-admin">Default admin account (bundled cho người tiếp nhận)</h2>
      <div className="not-prose my-5 rounded-xl border-2 border-emerald-500/40 bg-emerald-500/[0.05] p-5">
        <div className="flex items-center gap-2 mb-3 font-semibold text-[15px] text-emerald-700 dark:text-emerald-300">
          🔑 Login vào dashboard production
        </div>
        <div className="grid gap-2 text-[13.5px] font-mono mb-3">
          <div><span className="text-muted-foreground">URL:</span> <a href="https://pnl.patigroup.com" target="_blank" rel="noreferrer" className="underline">https://pnl.patigroup.com</a></div>
          <div><span className="text-muted-foreground">Username:</span> <strong className="text-foreground">admin</strong></div>
          <div><span className="text-muted-foreground">Password:</span> <strong className="text-foreground">Admin@2025</strong></div>
          <div><span className="text-muted-foreground">Policy:</span> <strong className="text-foreground">Admin</strong> (wildcard <code>*:*</code> — full quyền IAM, sync, settings, mọi tab)</div>
        </div>
        <div className="text-[12.5px] text-muted-foreground leading-5">
          Account dùng chung — ai trong handover cũng dùng được. Có thể login trực tiếp, không cần
          tạo user mới.
        </div>
      </div>

      {totalRotate > 0 && (
        <Callout variant="warning" title={`${blockers} blocker · ${totalRotate} credential cần rotate trước khi Phong rời`}>
          Các credential dưới đây nhân danh email/account cá nhân của Phong. Khi email/account đó
          bị disable, pipeline tương ứng sẽ chết. Đọc cột <em>Triệu chứng</em> + <em>Cách rotate</em>{" "}
          để plan trước.
        </Callout>
      )}

      <h2 id="user-what">Vì sao trang này tồn tại</h2>
      <p>
        Một mình Phong dựng các integration ngoài (Flexport, ChargeFlow, Tailscale node Mac mini)
        nên một số token / login đang gắn vào email/account cá nhân. Khi Phong leave PATI, công
        ty sẽ disable mailbox đó — và Mac mini đang join tailnet bằng Gmail cá nhân của Phong, nên
        cần đổi sang account khác trước khi Phong revoke device.
      </p>
      <p>
        Trang này liệt kê những credential đó + bước rotate cụ thể.
      </p>

      <h2 id="personal">Credentials cần rotate</h2>
      <CredTable creds={personalCreds} highlight />

      <h2 id="checklist">Checklist trước ngày Phong off</h2>
      <div className="not-prose my-5 rounded-xl border bg-card p-4">
        <ol className="ml-5 list-decimal space-y-2 text-[13.5px] leading-6">
          <li>
            <strong>FLEXPORT_EMAIL/PASSWORD</strong> — invite ops/successor vào Flexport workspace,
            update env trên Mac mini, restart com.pati.sync-flexport.
          </li>
          <li>
            <strong>CHARGEFLOW Chrome session</strong> — qua VNC vào Mac mini, logout ChargeFlow,
            login bằng account successor, save cookie. Verify 5-min cron tiếp theo OK.
          </li>
          <li>
            <strong>Tailscale Mac mini</strong> — qua VNC, logout Tailscale app, login bằng email
            tailnet thuộc PATI/successor. Verify SSH từ máy successor vẫn tới Mac mini ổn.
          </li>
          <li>
            <strong>Smoke test 24 h</strong> — sau khi rotate, để chạy 1 ngày rồi check{" "}
            <a href="/docs/cron-jobs" className="underline">Cron Jobs</a>. Nếu có pipeline đỏ →
            đào credential còn sót.
          </li>
        </ol>
      </div>

      <Callout variant="warning" title="Verify đã rotate đủ">
        Sau khi rotate, để Mac mini chạy 24 h. Sáng hôm sau check{" "}
        <a href="/docs/cron-jobs" className="underline">Cron Jobs</a> +{" "}
        <a href="/docs/troubleshooting" className="underline">Troubleshooting</a> — nếu job fail
        ngay sau rotate, đào credential khác chưa update bằng{" "}
        <TerminalInline>grep -r &quot;chanphong\|FLEXPORT_EMAIL&quot; ~/pati-supabase ~/.env</TerminalInline>.
      </Callout>

      <PageNav href="/docs/auth-credentials" />
    </>
  );
}

function CredTable({ creds, highlight }: { creds: Cred[]; highlight: boolean }) {
  return (
    <div className="not-prose my-5 space-y-3">
      {creds.map((c) => (
        <div
          key={c.name}
          className={cn(
            "rounded-xl border bg-card p-4",
            highlight && c.sev === "blocker" && "border-red-500/40 bg-red-500/[0.03]",
            highlight && c.sev === "high" && "border-amber-500/40 bg-amber-500/[0.03]",
          )}
        >
          <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-foreground/70 shrink-0" />
              <code className="font-mono text-[13px] font-semibold">{c.name}</code>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-block rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  sevClass[c.sev],
                )}
              >
                {sevLabel[c.sev]}
              </span>
              {c.needsRotate && (
                <span className="inline-block rounded border border-red-500/40 bg-red-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-700 dark:text-red-300">
                  Rotate
                </span>
              )}
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-[150px_1fr] text-[12.5px] leading-6">
            <div className="text-muted-foreground">
              <User className="inline h-3 w-3 mr-1 -mt-0.5" />
              Owner
            </div>
            <div className="text-foreground/90">{c.ownedBy}</div>
            <div className="text-muted-foreground">Nằm ở</div>
            <div className="text-foreground/90 font-mono text-[12px]">{c.where}</div>
            <div className="text-muted-foreground">
              <AlertTriangle className="inline h-3 w-3 mr-1 -mt-0.5 text-amber-600 dark:text-amber-400" />
              Triệu chứng
            </div>
            <div className="text-foreground/85">{c.symptom}</div>
            <div className="text-muted-foreground">
              <Calendar className="inline h-3 w-3 mr-1 -mt-0.5 text-emerald-600 dark:text-emerald-400" />
              Cách rotate
            </div>
            <div className="text-foreground/85">{c.rotate}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// suppress unused warning
void ShieldAlert;
