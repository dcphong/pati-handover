import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export const metadata = { title: "IAM — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Core Features"
        title="IAM & Permissions"
        description="AWS-style policies, 75 actions, 9 managed policies, audit log. /iam page."
      />

      <h2 id="status">Status</h2>
      <p>
        Landed 2026-05-18. Page: <code>/iam</code>. Backwards-compatible với{" "}
        <code>permissions.includes(&quot;…&quot;)</code> legacy checks qua auto-alias emission.
      </p>

      <h2 id="model">Model</h2>
      <CodeBlock language="text">
{`User
  ▼
attached policies (many-to-many) ── iam_user_policies
  ▼
Policy (JSON document) ── iam_policies
  ▼
Statement[] { Effect: Allow|Deny, Action: ["service:Action", ...], Resource: ["arn:...", "*"] }
  ▼
Action ── iam_actions (75 entries, like "shopify:SyncOrders")`}
      </CodeBlock>

      <h2 id="9-policies">9 managed policies</h2>
      <ul>
        <li><strong>Admin</strong> — wildcard <code>*:*</code>, plus IAM management.</li>
        <li><strong>Operations</strong> — bulk-update, fulfillment, COGS read.</li>
        <li><strong>CS</strong> — CS Dashboard, Lark Mail, customer notes.</li>
        <li><strong>Analytics</strong> — analytics dashboard read, sync trigger read-only.</li>
        <li><strong>FinanceReadOnly</strong> — analytics + payments balance read.</li>
        <li><strong>Engineering</strong> — sync trigger write, IAM read, cron health.</li>
        <li><strong>ChargeFlowReviewer</strong> — disputes read + evidence upload.</li>
        <li><strong>Auditor</strong> — read-only mọi entity + audit log read.</li>
        <li><strong>Guest</strong> — login + change own password only.</li>
      </ul>

      <h2 id="check">Check permission</h2>
      <CodeBlock language="ts" filename="src/lib/iam/check.ts">
{`import { canPerform } from "@/lib/iam/check";

if (!await canPerform(user.id, "shopify:SyncOrders", "store/WN")) {
  return new Response("Forbidden", { status: 403 });
}`}
      </CodeBlock>

      <h2 id="audit">Audit log</h2>
      <p>
        Mỗi grant/revoke/policy edit ghi vào <code>iam_audit_log</code> với{" "}
        actor_user_id, target_user_id, action ("attach", "detach", "create", "edit"), policy_id,
        diff JSON.
      </p>
      <CodeBlock language="sql">
{`SELECT created_at, actor_email, target_email, action, policy_name
FROM master_app.iam_audit_log
ORDER BY created_at DESC
LIMIT 50;`}
      </CodeBlock>

      <h2 id="ui">UI</h2>
      <p>JSON policy editor in browser (<code>/iam</code>), Monaco-style with action autocomplete:</p>
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

      <Callout variant="info" title="Legacy permissions still work">
        Old check pattern <code>permissions.includes(&quot;view_analytics&quot;)</code> vẫn work
        — IAM layer auto-emits aliases. Đừng rush rewrite chỗ check cũ. Có thể migrate dần.
      </Callout>

      <PageNav href="/docs/feature-iam" />
    </>
  );
}
