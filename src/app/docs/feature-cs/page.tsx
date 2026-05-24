import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export const metadata = { title: "CS Dashboard — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="CS Dashboard"
        description="Gorgias 3-panel rebuild + Lark Mail reconcile. Customer profile join."
      />

      <h2 id="why">Why we rebuilt</h2>
      <p>
        Gorgias quá đắt cho volume hiện tại. Team CS đã dùng Lark Mail làm primary inbox.
        Cần một dashboard:
      </p>
      <ul>
        <li>3-panel layout (inbox / thread / customer side-panel) — quen tay Gorgias.</li>
        <li>Auto-join customer profile (Shopify orders + Recharge subs + tracking).</li>
        <li>Lark Mail reconcile — match email ↔ Shopify customer.</li>
      </ul>

      <h2 id="panels">Three panels = sidebar + middle + right</h2>
      <Callout variant="info" title="Sidebar app counts as panel 1">
        Đừng add second rail. App sidebar (StoreSwitcher + nav) là panel 1. Sửa CS view qua{" "}
        <code>&lt;ViewDropdown&gt;</code> ở middle header, không phải thêm column trái thứ 2.
        Memo: <code>feedback_three_panel_count</code>.
      </Callout>

      <CodeBlock language="text">
{`┌─────────────┬──────────────────────────────┬───────────────────┐
│ App         │ Middle (thread list / detail) │ Customer panel    │
│ sidebar     │                              │                   │
│             │ Tabs: Inbox · Sent · Tagged  │ Shopify | Recharge│
│             │                              │  - Orders         │
│             │                              │  - Subscriptions  │
│             │                              │  - Profile note   │
└─────────────┴──────────────────────────────┴───────────────────┘`}
      </CodeBlock>

      <h2 id="routes">Routes</h2>
      <ul>
        <li><code>/cs-dashboard</code> — main view (default landing for CS users)</li>
        <li><code>/cs-dashboard/customer/[id]</code> — deep link cho customer</li>
        <li><code>/lark-mail-reconcile</code> — reconcile loose emails</li>
        <li><code>/lark-mail-reconcile/admin</code> — legacy admin (kept)</li>
      </ul>

      <h2 id="api">Key APIs</h2>
      <table>
        <thead><tr><th>Route</th><th>Purpose</th></tr></thead>
        <tbody>
          <tr><td><code>GET /api/cs-dashboard</code></td><td>Aggregate daily counters (tickets, resolved, refund-rate)</td></tr>
          <tr><td><code>GET /api/cs-dashboard/orders</code></td><td>Orders for active store, paginated</td></tr>
          <tr><td><code>GET /api/cs/customers/[id]</code></td><td>Unified customer: Shopify + Recharge + profile note</td></tr>
          <tr><td><code>PUT /api/cs/customers/[id]/profile</code></td><td>Save CS note + customer_type tag</td></tr>
          <tr><td><code>POST /api/lark-mail-sync</code></td><td>Manual Lark Mail re-sync</td></tr>
        </tbody>
      </table>

      <h2 id="customer-profiles">customer_profiles table</h2>
      <CodeBlock language="sql">
{`master_app.customer_profiles (
  customer_email   TEXT PRIMARY KEY,
  shop_id          TEXT NOT NULL,
  customer_type    TEXT,          -- 'vip', 'risk', 'partner', NULL
  cs_note          TEXT,
  updated_by       TEXT,
  updated_at       TIMESTAMPTZ DEFAULT NOW()
)`}
      </CodeBlock>

      <Callout variant="warning" title="PostgREST row cap stung us">
        CS Dashboard refund-rate đã show 34.3% vs true 5.56% vì query refunds bị cap ở 1000
        rows. Fix: dùng <code>pageAll()</code> helper khi aggregate. Memo:{" "}
        <code>reference_postgrest_row_cap</code>.
      </Callout>

      <h2 id="tz">Today semantics</h2>
      <p>
        Mọi &quot;today&quot; ở CS Dashboard anchor về <code>Asia/Ho_Chi_Minh</code>. Date picker
        component phải dùng <code>format(d, &apos;yyyy-MM-dd&apos;)</code>, KHÔNG{" "}
        <code>toISOString().slice(0,10)</code> (latter shifts UTC).
      </p>

      <h2 id="no-stub">No stub UI affordances</h2>
      <Callout variant="danger">
        Bất kỳ button / checkbox / link nào trong CS view <strong>phải</strong> trigger real
        backend action. Đừng leave placeholder UI. Memo: <code>feedback_no_stub_ui</code>.
      </Callout>

      <PageNav href="/docs/feature-cs" />
    </>
  );
}
