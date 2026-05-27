import {
  AlertOctagon,
  AlertTriangle,
  Bot,
  GitFork,
  Layers,
  MessageSquareText,
  Scale,
  Siren,
  Target,
  VolumeX,
  Wand2,
} from "lucide-react";
import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import {
  Canvas,
  Step,
  Steps,
  StepCheck,
  Terminal,
  TerminalInline,
} from "@/components/docs/visuals";
import { cn } from "@/lib/utils";
import {
  canvasNodes,
  canvasEdges,
  skills,
  cronPipelines,
  services,
  ports,
  tunnelHostnames,
  supabaseContainers,
  gotchas,
  type SkillAudience,
  type CronTag,
  type ServiceTag,
} from "@/lib/timcook-agent-data";

export const metadata = { title: "Timcook Agent — PATI Handover" };

const audienceClass: Record<SkillAudience, string> = {
  agent:    "bg-blue-500/15 border-blue-500/40 text-blue-700 dark:text-blue-300",
  meta:     "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300",
  operator: "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300",
  code:     "bg-red-500/15 border-red-500/40 text-red-700 dark:text-red-300",
};

const audienceLabel: Record<SkillAudience, string> = {
  agent:    "agent",
  meta:     "meta",
  operator: "operator",
  code:     "code",
};

const cronClass: Record<CronTag, string> = {
  interval: "bg-blue-500/15 border-blue-500/40 text-blue-700 dark:text-blue-300",
  hourly:   "bg-violet-500/15 border-violet-500/40 text-violet-700 dark:text-violet-300",
  daily:    "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300",
  weekly:   "bg-red-500/15 border-red-500/40 text-red-700 dark:text-red-300",
};

const serviceClass: Record<ServiceTag, string> = {
  keepalive: "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300",
  interval:  "bg-blue-500/15 border-blue-500/40 text-blue-700 dark:text-blue-300",
  hourly:    "bg-violet-500/15 border-violet-500/40 text-violet-700 dark:text-violet-300",
  daily:     "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300",
};

function Tag({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-block rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap",
        className,
      )}
    >
      {children}
    </span>
  );
}

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Ownership"
        title="Timcook Agent"
        description="Ảnh chụp skill + workflow của AI agent tự hành chạy trong openclaw trên Mac mini, kèm 33 LaunchAgent + 20 cron của host. Lấy live từ máy 2026-05-27."
      />

      {/* ─── OVERVIEW ─────────────────────────────────────────── */}
      <h2 id="overview">Tổng quan — hai vai trong cùng một cái tên</h2>
      <Callout variant="info" title="Vì sao có trang này">
        <p>
          <code>timcook</code> là <strong>hai thứ cùng lúc</strong>, người tiếp nhận phải nắm cả
          hai vai mới đủ:
        </p>
        <ol className="ml-5 list-decimal my-2">
          <li>
            Một <strong>AI agent tự hành</strong> (Wellness Customer Care Specialist cho
            WellnessNest) chạy bên trong framework <code>openclaw</code>. Tự reply email khách, xử
            refund / cancel, gửi tin nhắn Lark/Feishu, gom evidence cho dispute, theo dõi delivery,
            track 6 North-Star metrics.
          </li>
          <li>
            Một <strong>user macOS</strong> đứng tên toàn bộ stack production PATI trên Mac mini —
            Supabase self-host, Next.js web (<code>pnl.patigroup.com</code>), Cloudflared tunnel,
            33 launchd job, 20 cron.
          </li>
        </ol>
        <p>
          Nhận bàn giao mà chỉ nắm phần persona → cron sync prod chết âm thầm. Chỉ nắm phần hạ
          tầng → email khách bị trả lời sai giọng. Đọc cả hai phần.
        </p>
      </Callout>

      <div className="not-prose my-5 grid gap-3 sm:grid-cols-3">
        <KpiCard
          icon={Bot}
          k="Agent"
          v="WellnessNest CS"
          hint="đổi tên bezos → timcook 2026-05-06"
        />
        <KpiCard
          icon={Layers}
          k="Host"
          v="Mac mini · M4 / 16 GB"
          hint="macOS 26.4.1 · uptime 14 ngày"
        />
        <KpiCard
          icon={GitFork}
          k="Vào máy"
          v="100.94.220.128"
          hint="Tailscale · ssh timcook@…"
        />
      </div>

      {/* ─── CANVAS ─────────────────────────────────────────── */}
      <h2 id="canvas">Bản đồ trực quan</h2>
      <p>
        Ba làn: <strong>agent brain</strong> (persona · skill · cron),{" "}
        <strong>hạ tầng Mac mini</strong> (web · tunnel · supabase · 33 LaunchAgent), và{" "}
        <strong>hệ thống bên ngoài</strong> (Lark · Shopify · Recharge · ChargeFlow · …). Click vào
        các node 📄 để nhảy thẳng tới section tương ứng phía dưới.
      </p>
      <Canvas nodes={canvasNodes} edges={canvasEdges} height={760} initialScale={0.55} />

      {/* ─── PERSONA ─────────────────────────────────────────── */}
      <h2 id="persona">Persona — luật vận hành nhìn một lần</h2>
      <Callout variant="tip" title="Identity">
        “Tôi là <strong>timcook</strong>, chuyên viên chăm sóc khách của{" "}
        <strong>WellnessNest</strong>. Phục vụ khách bằng EN / DE / FR / IT / ES. Mang giọng brand:
        ấm áp, rõ ràng, có trách nhiệm. Suy nghĩ theo nguyên tắc MECE.” Nguồn:{" "}
        <code>~/.openclaw/workspace/agents/timcook/SOUL.md</code>. Đổi tên <code>bezos</code> →{" "}
        <code>timcook</code> ngày 2026-05-06 — <code>IDENTITY.md</code> vẫn còn ghi &ldquo;Jeff
        Bezos&rdquo; (xem <a href="#gotchas">Gotcha #1</a>).
      </Callout>

      <div className="not-prose my-5 grid gap-3 md:grid-cols-2">
        <PersonaCard tone="ok" icon={Target} title="🎯 North Stars">
          <ul className="ml-4 list-disc space-y-1">
            <li>NS#1 First-response time &lt; 7 phút</li>
            <li>NS#2 OTIF (on-time-in-full) ≥ 98 %</li>
            <li>NS#3 Refund rate &lt; 3 %</li>
            <li>NS#3b Dispute rate &lt; 0.15 %</li>
            <li>NS#4 Churn tháng 5–7 %</li>
            <li>NS#5 Order processing &gt; 90 %</li>
            <li>NS#6 Stock cover &gt; 95 %</li>
          </ul>
          <div className="mt-3 text-[12px] text-muted-foreground">
            Giá trị live tổng hợp mỗi ngày vào{" "}
            <code className="text-[11.5px]">logs/north_star_daily.jsonl</code>.
          </div>
        </PersonaCard>

        <PersonaCard tone="danger" icon={AlertOctagon} title="🚫 Hard stops (vi phạm = incident)">
          <ul className="ml-4 list-disc space-y-1">
            <li>Không lộ PII ra ngoài email đã verify của chính khách đó</li>
            <li>Không refund / replace vượt quyền được giao</li>
            <li>
              Không cancel sub <strong>&lt; 120 ngày</strong> (policy của sếp 2026-05-16)
            </li>
            <li>Không nói &ldquo;đã refund&rdquo; nếu chưa có API confirm trong cùng turn</li>
            <li>Không trả lời khách bằng ngôn ngữ khác ngôn ngữ khách dùng (đừng bao giờ tiếng Việt)</li>
            <li>Không nhắc tên tool nội bộ với khách (Shopify, Recharge, 17track, Best 3PL…)</li>
          </ul>
        </PersonaCard>

        <PersonaCard tone="warn" icon={MessageSquareText} title="📨 Luật gửi Lark / Feishu">
          <p>
            Text assistant trả về <strong>KHÔNG TỰ ĐỘNG</strong> tới khách. Agent buộc phải gọi
            tool <code>message</code> với <code>channel: feishu</code>, target{" "}
            <code>chat_id</code>, body.
          </p>
          <div className="mt-3 rounded-md border bg-background/50 p-2.5 text-[12.5px]">
            <div className="font-semibold mb-1 text-[11px] uppercase tracking-widest text-muted-foreground">
              Allow-list @-mention (chỉ 3 sender)
            </div>
            <div className="grid gap-1 font-mono text-[11.5px]">
              <div>1285148724 → @AntiSocialMedi4 (Phong)</div>
              <div>8541694972 → @Tranphamhoaibao (Bảo)</div>
              <div>5950274404 → @kevinkreativework (Kevin, sếp)</div>
            </div>
          </div>
        </PersonaCard>

        <PersonaCard tone="warn" icon={VolumeX} title="🤐 Im lặng khi cron rỗng">
          <p>
            Cron / watchdog gọi mà không kèm tin cụ thể → <strong>kết thúc lượt rỗng</strong>,
            tuyệt đối không gọi tool <code>message</code>.
          </p>
          <p className="mt-2">
            Cấm các câu sáo: &ldquo;checking in&rdquo;, &ldquo;monitoring&rdquo;, &ldquo;All
            systems normal&rdquo;, &ldquo;Standing by&rdquo;.
          </p>
          <p className="mt-2 text-[12px] text-muted-foreground">
            Vụ 2026-05-06 16:31 ICT: 4 tin &ldquo;checking in&rdquo; giống hệt nhau spam Telegram
            trong 5 phút. Rule này sinh ra để chặn lặp lại.
          </p>
        </PersonaCard>

        <PersonaCard tone="warn" icon={Siren} title="🚨 Trigger leo thang (Lark #openclaw-alerts)">
          <ul className="ml-4 list-disc space-y-1">
            <li>Refund &gt; $50 ngoài policy</li>
            <li>Khách nhắc: lawyer, BBB, social post, dispute, chargeback</li>
            <li>Khách báo product gây phản ứng y tế (allergic / rash / illness)</li>
            <li>Xin đổi địa chỉ sau khi đơn đã ship</li>
            <li>3+ email không reply cùng một khách trong 24 h</li>
            <li>Bridge / API fail 3 lần liên tiếp</li>
            <li>NS trôi &gt; 5 % trong 24 h</li>
            <li>Tool nào trả ≥ 500</li>
          </ul>
        </PersonaCard>

        <PersonaCard tone="info" icon={Scale} title="⚖ Thứ tự ưu tiên khi giằng co">
          <ol className="ml-4 list-decimal space-y-1">
            <li>
              <strong>Đúng &gt; nhanh</strong> — verify bằng API/file trước khi phát biểu sự kiện
            </li>
            <li>
              <strong>Outcome của khách &gt; literal policy</strong> — uốn trong giới hạn được giao
            </li>
            <li>
              <strong>Leo thang &gt; bịa</strong> — đẩy supervisor còn hơn đoán tự tin
            </li>
            <li>
              <strong>Source &gt; recall</strong> — đọc MEMORY/skill/API trước khi trả lời
            </li>
          </ol>
        </PersonaCard>
      </div>

      {/* ─── SKILLS ─────────────────────────────────────────── */}
      <h2 id="skills">Skill catalog (19)</h2>
      <p>
        Routing tự động qua <code>~/.openclaw/workspace/agents/timcook/skills/SKILL_INDEX.md</code>{" "}
        mỗi khi có tin vào. Audience = ai là người hành động:{" "}
        <Tag className={audienceClass.agent}>agent</Tag> tự hành,{" "}
        <Tag className={audienceClass.meta}>meta</Tag> self-discipline,{" "}
        <Tag className={audienceClass.operator}>operator</Tag> người chạy script,{" "}
        <Tag className={audienceClass.code}>code</Tag> bridge JS embed luật (chỉ docs).
      </p>
      <div className="not-prose my-6 rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] border-collapse">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-widest">
              <tr className="border-b">
                <th className="px-3 py-2 text-left w-10">#</th>
                <th className="px-3 py-2 text-left w-[220px]">Skill</th>
                <th className="px-3 py-2 text-left w-[110px]">Audience</th>
                <th className="px-3 py-2 text-left">Trigger</th>
                <th className="px-3 py-2 text-left">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((s) => (
                <tr key={s.n} className="border-t hover:bg-muted/20 align-top">
                  <td className="px-3 py-2 text-muted-foreground">{s.n}</td>
                  <td className="px-3 py-2 font-mono text-[12.5px] font-semibold">{s.name}</td>
                  <td className="px-3 py-2">
                    <Tag className={audienceClass[s.audience]}>{audienceLabel[s.audience]}</Tag>
                  </td>
                  <td className="px-3 py-2 text-foreground/85">{s.triggers}</td>
                  <td className="px-3 py-2 text-muted-foreground text-[12px]">{s.notes ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── CRONS ─────────────────────────────────────────── */}
      <h2 id="crons">Cron pipeline (crontab riêng của agent)</h2>
      <p>
        Đây là các dòng <code>crontab -l</code> agent tự chạy. Chúng nằm trên một lớp khác so với{" "}
        launchd plist ở <a href="#services">Mac mini services</a> — <code>crontab</code> là phần
        agent owns, <code>launchd</code> là hạ tầng production. Script ở{" "}
        <code>~/.openclaw/workspace/agents/timcook/scripts/</code>.
      </p>
      <div className="not-prose my-6 rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] border-collapse">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-widest">
              <tr className="border-b">
                <th className="px-3 py-2 text-left w-[140px]">Schedule</th>
                <th className="px-3 py-2 text-left w-[130px]">Khi nào (VN/ICT)</th>
                <th className="px-3 py-2 text-left w-[210px]">Pipeline</th>
                <th className="px-3 py-2 text-left w-[260px]">Script</th>
                <th className="px-3 py-2 text-left">Làm gì</th>
              </tr>
            </thead>
            <tbody>
              {cronPipelines.map((c) => (
                <tr key={`${c.cron}-${c.pipeline}`} className="border-t hover:bg-muted/20 align-top">
                  <td className="px-3 py-2 font-mono text-[12px]">{c.cron}</td>
                  <td className="px-3 py-2">
                    <Tag className={cronClass[c.tag]}>{c.when}</Tag>
                  </td>
                  <td className="px-3 py-2 font-semibold text-[12.5px]">{c.pipeline}</td>
                  <td className="px-3 py-2 font-mono text-[11.5px] text-foreground/85">{c.script}</td>
                  <td className="px-3 py-2 text-muted-foreground text-[12px]">{c.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── RUNBOOK ─────────────────────────────────────────── */}
      <h2 id="runbook">Access & health-check 60 giây hàng ngày</h2>
      <Steps>
        <Step n={1} title="Vào tailnet trước">
          <p>
            Trên máy bạn, <code>tailscale status</code> phải thấy{" "}
            <code>100.94.220.128 kevins-mac-mini</code>. Nếu báo logged out → chạy{" "}
            <code>tailscale login</code> rồi mở URL nó in ra.
          </p>
        </Step>
        <Step n={2} title="SSH vào">
          <Terminal
            host="you@laptop"
            cwd="~"
            lines={[
              { prompt: "$", cmd: "ssh timcook@100.94.220.128" },
              { prompt: "timcook@mini $", cmd: "hostname; uptime" },
            ]}
          />
        </Step>
        <Step n={3} title="Chạy health-check 60 giây">
          <Terminal
            host="timcook@mini"
            cwd="~"
            lines={[
              { prompt: "$", cmd: "echo '== keepalive =='" },
              {
                prompt: "$",
                cmd: "launchctl list | grep -E 'com.pati|ai.openclaw|cloudflared|colima' | awk '$2!=0 && $2!=\"-9\" {print \"  CRASHED: \" $0}'",
              },
              { prompt: "$", cmd: "echo '== docker =='" },
              { prompt: "$", cmd: "docker ps --format '{{.Names}} {{.Status}}'" },
              { prompt: "$", cmd: "echo '== tunnel =='" },
              { prompt: "$", cmd: "curl -sI https://supabase.patiagency.com/ | head -1" },
              { prompt: "$", cmd: "curl -sI https://pnl.patigroup.com/        | head -1" },
              { prompt: "$", cmd: "echo '== NS snapshot mới nhất =='" },
              {
                prompt: "$",
                cmd: "tail -1 ~/.openclaw/workspace/agents/timcook/logs/north_star_daily.log",
              },
            ]}
          />
          <StepCheck>
            Tất cả dòng đều <strong>up</strong> + tunnel trả 200/401 (không 502) + NS log mới hôm
            nay → đứng dậy đi. Có dòng nào đỏ → nhảy xuống <a href="#gotchas">Gotchas</a>.
          </StepCheck>
        </Step>
      </Steps>

      <h3>Cây thư mục trọng yếu trên Mac mini</h3>
      <pre className="not-prose rounded-lg border bg-muted/30 p-4 text-[12.5px] leading-6 overflow-x-auto font-mono">
{`~/
├─ .cloudflared/config.yml          ingress map của tunnel
├─ .openclaw/
│  ├─ workspace/agents/timcook/     ← BRAIN của agent
│  │  ├─ AGENTS.md SOUL.md HEARTBEAT.md MEMORY.md IDENTITY.md USER.md
│  │  ├─ skills/SKILL_INDEX.md + 19 thư mục skill
│  │  ├─ scripts/                   pipeline FRT/OTIF/NS/Amazon/…
│  │  └─ logs/
│  ├─ email-bridge/                 bridge email Node → Lark + bot routing
│  └─ patches/                      patch framework, reapply hằng đêm
├─ pati-supabase/                   self-host stack + wrapper shell cho cron
│  ├─ docker-compose.yml
│  └─ cron/                         (sync-web.sh, sync-shopify-larkbase.sh, …) + cron/logs/
├─ Coding_workspace/PATI/shopify-lark-sync/   ← REPO này (web serve từ đây)
└─ Library/LaunchAgents/com.pati.*.plist + ai.openclaw.* + …`}
      </pre>

      {/* ─── SERVICES ─────────────────────────────────────────── */}
      <h2 id="services">Mac mini services (33 LaunchAgent)</h2>
      <p>
        LaunchAgent per-user ở <code>~/Library/LaunchAgents/com.pati.*.plist</code>. Sau khi sửa
        plist thì reload bằng{" "}
        <TerminalInline>
          launchctl unload &lt;plist&gt; && launchctl load &lt;plist&gt;
        </TerminalInline>
        . Nguồn: <code>launchctl list</code>.
      </p>
      <div className="not-prose my-6 rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] border-collapse">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-widest">
              <tr className="border-b">
                <th className="px-3 py-2 text-left w-[300px]">Label</th>
                <th className="px-3 py-2 text-left w-[150px]">Lịch chạy</th>
                <th className="px-3 py-2 text-left">Nhiệm vụ</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.label} className="border-t hover:bg-muted/20 align-top">
                  <td className="px-3 py-2 font-mono text-[12px] font-semibold">{s.label}</td>
                  <td className="px-3 py-2">
                    <Tag className={serviceClass[s.tag]}>{s.schedule}</Tag>
                  </td>
                  <td className="px-3 py-2 text-foreground/85">{s.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h3>Bản đồ port đang listen</h3>
      <div className="not-prose my-5 rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-[13px] border-collapse">
          <thead className="bg-muted/40 text-[11px] uppercase tracking-widest">
            <tr className="border-b">
              <th className="px-3 py-2 text-left w-[140px]">Port</th>
              <th className="px-3 py-2 text-left w-[260px]">Process</th>
              <th className="px-3 py-2 text-left">Nhiệm vụ</th>
            </tr>
          </thead>
          <tbody>
            {ports.map((p) => (
              <tr key={p.port} className="border-t hover:bg-muted/20 align-top">
                <td className="px-3 py-2 font-mono text-[12px]">{p.port}</td>
                <td className="px-3 py-2 font-mono text-[11.5px]">{p.proc}</td>
                <td className="px-3 py-2 text-foreground/85">{p.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── TUNNEL ─────────────────────────────────────────── */}
      <h2 id="tunnel">Cloudflared tunnel <code className="text-[14px]">pati-supabase</code></h2>
      <p>
        Một tunnel multiplex <strong>5 hostname</strong> về các local port của Mac mini. Config ở{" "}
        <code>~/.cloudflared/config.yml</code>. Daemon = LaunchAgent{" "}
        <code>homebrew.mxcl.cloudflared</code>.
      </p>
      <div className="not-prose my-5 rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-[13px] border-collapse">
          <thead className="bg-muted/40 text-[11px] uppercase tracking-widest">
            <tr className="border-b">
              <th className="px-3 py-2 text-left">Hostname</th>
              <th className="px-3 py-2 text-left w-[120px]">→ Local</th>
              <th className="px-3 py-2 text-left w-[240px]">Phục vụ bởi</th>
              <th className="px-3 py-2 text-left w-[180px]">DNS</th>
            </tr>
          </thead>
          <tbody>
            {tunnelHostnames.map((h) => (
              <tr key={h.host} className="border-t hover:bg-muted/20">
                <td className="px-3 py-2 font-mono text-[12px]">
                  {h.host}
                  {h.prod && (
                    <Tag className="ml-2 bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300">
                      PROD
                    </Tag>
                  )}
                </td>
                <td className="px-3 py-2 font-mono text-[12px]">{h.local}</td>
                <td className="px-3 py-2 text-foreground/85">{h.servedBy}</td>
                <td className="px-3 py-2 text-muted-foreground text-[12px]">{h.dns}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout variant="danger" title="Bẫy 502 — luôn probe tunnel TRƯỚC">
        Triệu chứng: card hiện $0, section trống, 502 thỉnh thoảng nhảy ra.{" "}
        <strong>Đào nhầm chỗ</strong>: schema cache, RLS, matview gãy.{" "}
        <strong>Nguyên nhân thật</strong>: NAT ISP ở nhà drop kết nối idle của cloudflared edge
        sau vài phút (111 disconnects → 0 sau khi hardening). Cấu hình hardening nằm trong{" "}
        <code>~/.cloudflared/config.yml</code>: <code>protocol: http2</code>,{" "}
        <code>edge-ip-version: &quot;4&quot;</code>, <code>tcpKeepAlive: 30s</code>,{" "}
        <code>retries: 10</code>. Đừng &ldquo;dọn dẹp&rdquo; ngược lại về default.
      </Callout>

      {/* ─── SUPABASE ─────────────────────────────────────────── */}
      <h2 id="supabase">Stack Supabase self-host</h2>
      <p>
        Schema của app là <strong><code>master_app</code></strong>, không phải <code>public</code>.
        Mọi client <code>supabase-js</code> / <code>supabase-py</code> phải pass{" "}
        <code>db.schema=&apos;master_app&apos;</code>. Working dir trên disk:{" "}
        <code>~/pati-supabase/</code>.
      </p>
      <div className="not-prose my-5 rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-[13px] border-collapse">
          <thead className="bg-muted/40 text-[11px] uppercase tracking-widest">
            <tr className="border-b">
              <th className="px-3 py-2 text-left w-[260px]">Container</th>
              <th className="px-3 py-2 text-left w-[220px]">Tình trạng</th>
              <th className="px-3 py-2 text-left">Nhiệm vụ</th>
            </tr>
          </thead>
          <tbody>
            {supabaseContainers.map((c) => (
              <tr key={c.name} className="border-t hover:bg-muted/20">
                <td className="px-3 py-2 font-mono text-[12px] font-semibold">{c.name}</td>
                <td className="px-3 py-2 text-foreground/85">
                  {c.status}
                  {c.warn && <AlertTriangle className="inline-block h-3.5 w-3.5 ml-1.5 text-amber-500 -mt-0.5" />}
                </td>
                <td className="px-3 py-2 text-muted-foreground text-[12.5px]">{c.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── GOTCHAS ─────────────────────────────────────────── */}
      <h2 id="gotchas">Bẫy bàn giao — đọc TRƯỚC khi đụng bất cứ thứ gì</h2>
      <p>
        20 mìn Phong gom được trong quý vừa rồi. Mỗi cái đều từng tốn vài giờ thật.
      </p>
      <div className="not-prose my-6 grid gap-3 md:grid-cols-2">
        {gotchas.map((g) => (
          <Gotcha key={g.n} {...g} />
        ))}
      </div>

      <Callout variant="success" title="Three open landmines — cần xử trong tuần">
        Audit live phát hiện 3 chỗ đang lỗi <strong>cần xử ngay</strong>, không phải để tài liệu:
        <ul className="ml-5 list-disc my-2">
          <li>
            <strong>IDENTITY.md vẫn ghi &ldquo;Jeff Bezos&rdquo;</strong> — đợt rename bezos →
            timcook bỏ sót file này. Update trước khi người khác đọc.
          </li>
          <li>
            <strong>Colima báo lỗi: lima not found</strong> — container vẫn chạy nhờ VM hiện tại,
            nhưng nếu Mac mini reboot bây giờ thì không tự dậy được tới khi{" "}
            <code>brew install lima</code>.
          </li>
          <li>
            <strong>
              Cron <code>lark-mail-sync</code> còn trỏ <code>pnl.patiagency.com</code>
            </strong>
            {" "}— PROD hostname giờ là <code>pnl.patigroup.com</code>. Re-point trong{" "}
            <code>crontab -l</code>.
          </li>
        </ul>
      </Callout>

      <PageNav href="/docs/timcook-agent" />
    </>
  );
}

// ─── small helpers ───────────────────────────────────────────────────────

function KpiCard({
  icon: Icon,
  k,
  v,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  k: string;
  v: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
        <Icon className="h-3.5 w-3.5" />
        {k}
      </div>
      <div className="font-semibold text-[15px] leading-tight">{v}</div>
      {hint && <div className="text-[12px] text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}

function PersonaCard({
  tone,
  icon: Icon,
  title,
  children,
}: {
  tone: "ok" | "warn" | "danger" | "info";
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  const toneClass: Record<typeof tone, string> = {
    ok:     "border-emerald-500/40 bg-emerald-500/[0.04]",
    warn:   "border-amber-500/40 bg-amber-500/[0.05]",
    danger: "border-red-500/40 bg-red-500/[0.05]",
    info:   "border-blue-500/30 bg-blue-500/[0.04]",
  };
  const iconClass: Record<typeof tone, string> = {
    ok:     "text-emerald-600 dark:text-emerald-400",
    warn:   "text-amber-600 dark:text-amber-400",
    danger: "text-red-600 dark:text-red-400",
    info:   "text-blue-600 dark:text-blue-400",
  };
  return (
    <div className={cn("rounded-xl border p-4 text-[13px] leading-6", toneClass[tone])}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("h-4 w-4", iconClass[tone])} />
        <div className="font-semibold text-[14px]">{title}</div>
      </div>
      <div className="text-foreground/85 [&_strong]:text-foreground [&_code]:text-[12px]">
        {children}
      </div>
    </div>
  );
}

function Gotcha({
  n,
  title,
  body,
  sev,
}: {
  n: number;
  title: string;
  body: string;
  sev: "warn" | "danger";
}) {
  const sevClass = {
    warn: "border-l-amber-500 bg-amber-500/[0.04]",
    danger: "border-l-red-500 bg-red-500/[0.04]",
  }[sev];
  return (
    <div className={cn("rounded-lg border border-l-4 p-3.5 text-[12.5px] leading-6", sevClass)}>
      <div className="flex items-center gap-2 mb-1">
        <Wand2 className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] font-mono text-muted-foreground">#{n}</span>
        <span className="font-semibold text-[13px] text-foreground">{title}</span>
      </div>
      <div className="text-foreground/80">{body}</div>
    </div>
  );
}
