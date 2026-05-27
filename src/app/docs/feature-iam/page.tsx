import {
  BarChart3,
  Crown,
  Eye,
  FileText,
  Headphones,
  KeyRound,
  Shield,
  ShoppingBag,
  User,
  Wrench,
} from "lucide-react";
import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import {
  FlowNode,
  FlowRow,
  TerminalInline,
} from "@/components/docs/visuals";

export const metadata = { title: "IAM — PATI Handover" };

const policies = [
  {
    name: "Admin",
    icon: Crown,
    tone: "red" as const,
    scope: "wildcard *:*",
    desc: "Toàn quyền + IAM management.",
  },
  {
    name: "Operations",
    icon: Wrench,
    tone: "amber" as const,
    scope: "bulk-update + fulfillment",
    desc: "Bulk-update, fulfillment, COGS read.",
  },
  {
    name: "CS",
    icon: Headphones,
    tone: "sky" as const,
    scope: "CS Dashboard + Mail",
    desc: "CS Dashboard, Lark Mail, customer notes.",
  },
  {
    name: "Analytics",
    icon: BarChart3,
    tone: "violet" as const,
    scope: "analytics:Read",
    desc: "Analytics dashboard read, sync trigger read-only.",
  },
  {
    name: "FinanceReadOnly",
    icon: BarChart3,
    tone: "violet" as const,
    scope: "analytics + payments balance read",
    desc: "Read-only finance.",
  },
  {
    name: "Engineering",
    icon: Wrench,
    tone: "emerald" as const,
    scope: "sync:Write + IAM read",
    desc: "Sync trigger write, IAM read, cron health.",
  },
  {
    name: "ChargeFlowReviewer",
    icon: Shield,
    tone: "pink" as const,
    scope: "disputes + evidence",
    desc: "Disputes read + evidence upload.",
  },
  {
    name: "Auditor",
    icon: Eye,
    tone: "neutral" as const,
    scope: "read-only mọi entity",
    desc: "Read-only mọi entity + audit log read.",
  },
  {
    name: "Guest",
    icon: User,
    tone: "neutral" as const,
    scope: "self only",
    desc: "Login + change own password only.",
  },
];

const toneMap = {
  red: "border-red-500/40 bg-red-500/[0.04] text-red-700 dark:text-red-300",
  amber: "border-amber-500/40 bg-amber-500/[0.04] text-amber-700 dark:text-amber-300",
  sky: "border-sky-500/40 bg-sky-500/[0.04] text-sky-700 dark:text-sky-300",
  violet: "border-violet-500/40 bg-violet-500/[0.04] text-violet-700 dark:text-violet-300",
  emerald: "border-emerald-500/40 bg-emerald-500/[0.04] text-emerald-700 dark:text-emerald-300",
  pink: "border-pink-500/40 bg-pink-500/[0.04] text-pink-700 dark:text-pink-300",
  neutral: "border-border bg-card text-foreground",
} as const;

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Core Features"
        title="IAM & Permissions"
        description="Quản lý ai vào được trang nào, làm được thao tác gì. Mọi cấp quyền đều ghi audit log."
      />

      {/* ─────────── USER MODE ─────────── */}
      <section data-user-detail>
        <h2 id="user-what">Cấp quyền hoạt động ra sao</h2>
        <p>
          Mỗi tài khoản được gắn một hoặc nhiều policy (ví dụ Admin, Operations, CS, Analytics).
          Policy quyết định người đó vào được trang nào, click được nút nào. Nếu không thấy menu
          hay nút mà bạn nghĩ đáng ra phải có, khả năng cao là chưa được cấp quyền.
        </p>

        <h2 id="user-when-call">Khi nào báo dev / admin</h2>
        <ul>
          <li>Đăng nhập được nhưng không thấy menu cần dùng.</li>
          <li>Click một nút nhận lỗi &ldquo;permission denied&rdquo;.</li>
          <li>Cần cấp quyền cho thành viên mới — phải qua admin (không tự cấp).</li>
          <li>Có người vừa nghỉ — nhớ thu hồi quyền.</li>
        </ul>
      </section>

      {/* ─────────── DEV MODE ─────────── */}
      <section data-dev-detail>
      <h2 id="model">Permission model (luồng check)</h2>
      <div className="not-prose my-6 rounded-xl border bg-card p-4 sm:p-5">
        <FlowRow arrows="down">
          {[
            <FlowNode
              key="user"
              icon={User}
              label="User"
              sub="users table — email, hash, role"
              tone="sky"
            />,
            <FlowNode
              key="attach"
              icon={FileText}
              label="iam_user_policies"
              sub="many-to-many: user ↔ policy"
              tone="violet"
            />,
            <FlowNode
              key="policy"
              icon={Shield}
              label="iam_policies"
              sub="JSON document (Statement[])"
              tone="emerald"
            />,
            <FlowNode
              key="stmt"
              icon={KeyRound}
              label="Statement"
              sub='Effect: Allow|Deny · Action[] · Resource[]'
              tone="amber"
            />,
            <FlowNode
              key="act"
              icon={ShoppingBag}
              label="iam_actions"
              sub='75 entries (e.g. "shopify:SyncOrders")'
              tone="pink"
            />,
          ]}
        </FlowRow>
        <div className="text-[12px] text-muted-foreground mt-3 leading-5">
          Allow + Deny: Deny luôn thắng. Wildcard <TerminalInline>*:*</TerminalInline> match
          mọi action (Admin policy).
        </div>
      </div>

      <h2 id="9-policies">9 managed policies</h2>
      <div className="not-prose my-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {policies.map((p) => (
          <div key={p.name} className={`rounded-xl border-2 p-3.5 ${toneMap[p.tone]}`}>
            <div className="flex items-center gap-2 mb-1.5">
              <p.icon className="h-4 w-4" />
              <div className="font-semibold text-[14px]">{p.name}</div>
            </div>
            <div className="font-mono text-[11px] text-muted-foreground mb-1.5">{p.scope}</div>
            <div className="text-[12.5px] leading-5 text-foreground/85">{p.desc}</div>
          </div>
        ))}
      </div>

      <h2 id="check">Check permission ở code</h2>
      <CodeBlock language="ts" filename="src/lib/iam/check.ts">
{`import { canPerform } from "@/lib/iam/check";

if (!await canPerform(user.id, "shopify:SyncOrders", "store/WN")) {
  return new Response("Forbidden", { status: 403 });
}`}
      </CodeBlock>

      <h2 id="ui">UI — /iam page</h2>
      <p>
        JSON policy editor in browser, Monaco-style với action autocomplete. Format chuẩn AWS:
      </p>
      <CodeBlock language="json">
{`{
  "Version": "2026-05-18",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["analytics:Read", "analytics:SyncTrigger"],
      "Resource": ["store/WN"]
    },
    {
      "Effect": "Deny",
      "Action": ["iam:*"],
      "Resource": "*"
    }
  ]
}`}
      </CodeBlock>

      <h2 id="audit">Audit log</h2>
      <p>
        Mỗi grant/revoke/policy edit ghi vào{" "}
        <TerminalInline>iam_audit_log</TerminalInline> với actor_user_id, target_user_id,
        action (
        <TerminalInline>&quot;attach&quot;</TerminalInline>,{" "}
        <TerminalInline>&quot;detach&quot;</TerminalInline>,{" "}
        <TerminalInline>&quot;create&quot;</TerminalInline>,{" "}
        <TerminalInline>&quot;edit&quot;</TerminalInline>), policy_id, diff JSON.
      </p>
      <CodeBlock language="sql">
{`SELECT created_at, actor_email, target_email, action, policy_name
FROM master_app.iam_audit_log
ORDER BY created_at DESC
LIMIT 50;`}
      </CodeBlock>

      <Callout variant="info" title="Legacy permissions vẫn work">
        Old check pattern{" "}
        <TerminalInline>permissions.includes(&quot;view_analytics&quot;)</TerminalInline> vẫn
        work — IAM layer auto-emits aliases. Đừng rush rewrite chỗ check cũ; migrate dần.
      </Callout>

      </section>

      <PageNav href="/docs/feature-iam" />
    </>
  );
}
