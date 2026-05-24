import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { CodeBlock } from "@/components/docs/code-block";

export const metadata = { title: "API Routes — PATI Handover" };

const groups: { title: string; rows: string[][] }[] = [
  {
    title: "Auth",
    rows: [
      ["POST /api/auth/login", "Email + password → JWT cookie"],
      ["POST /api/auth/logout", "Clear cookie"],
      ["GET /api/auth/verify", "Verify cookie"],
      ["POST /api/auth/migrate-passwords", "Bulk hash plaintext (MIGRATION_SECRET required)"],
      ["GET /api/auth/lark/start", "Begin Lark OAuth"],
      ["GET /api/auth/lark/callback", "Lark OAuth callback"],
    ],
  },
  {
    title: "Sync triggers",
    rows: [
      ["POST /api/sync", "Date-window Shopify sync (Python pipeline)"],
      ["GET /api/sync/preview", "Preview rows before commit"],
      ["GET /api/sync-logs", "Recent sync_logs"],
      ["POST /api/cron", "Trigger GitHub Actions workflow (CRON_SECRET required)"],
      ["POST /api/cron/chargeflow-sync-ui", "ChargeFlow CDP sync trigger"],
      ["GET /api/health", "Liveness probe"],
      ["GET /api/sync-health", "Per-pipeline freshness check"],
    ],
  },
  {
    title: "Analytics",
    rows: [
      ["GET /api/analytics/summary", "TW-parity summary cards"],
      ["POST /api/analytics/sync/shopify", "Incremental Shopify order sync (TS)"],
      ["POST /api/analytics/sync/paypal", "PayPal txns sync"],
      ["POST /api/analytics/sync/paypal-fees", "PayPal fee breakdown sync"],
      ["POST /api/analytics/sync/recharge", "Recharge subs + charges sync"],
      ["POST /api/analytics/sync/meta", "Meta Ads spend sync"],
      ["POST /api/analytics/sync/google", "Google Ads spend sync"],
      ["POST /api/analytics/sync/klaviyo", "Klaviyo events sync"],
    ],
  },
  {
    title: "Orders / Inventory",
    rows: [
      ["GET /api/orders", "List orders for active store"],
      ["POST /api/orders/import", "CSV order import"],
      ["GET /api/shopify-orders", "Lower-level shopify_orders view"],
      ["GET /api/inventory", "Inventory snapshot"],
      ["GET /api/tracking-timeline/[order]", "Tracking timeline events"],
      ["POST /api/update-row", "Inline row edit"],
      ["DELETE /api/delete", "Delete record"],
    ],
  },
  {
    title: "Custom tables",
    rows: [
      ["GET /api/custom-menus", "Sidebar entries cho custom tables"],
      ["GET /api/custom-columns/[slug]", "Column defs for custom table"],
      ["GET /api/custom-data/[slug]", "Rows"],
      ["POST /api/custom-data/[slug]/import", "Bulk import rows"],
    ],
  },
  {
    title: "IAM",
    rows: [
      ["GET /api/users", "List users"],
      ["POST /api/users", "Create user"],
      ["PUT /api/users/[id]", "Edit user"],
      ["DELETE /api/users/[id]", "Soft-delete user"],
      ["GET /api/roles", "List roles (legacy)"],
      ["GET /api/permissions", "List permissions (legacy)"],
      ["GET /api/iam/actions", "75-action catalog"],
      ["GET /api/iam/policies", "9 managed policies"],
      ["POST /api/iam/policies", "Create custom policy"],
      ["POST /api/iam/users/[id]/policies", "Attach policy to user"],
      ["GET /api/iam/audit", "Audit log"],
    ],
  },
  {
    title: "CS Dashboard",
    rows: [
      ["GET /api/cs-dashboard", "Daily aggregate counters"],
      ["GET /api/cs-dashboard/orders", "Orders for active store"],
      ["GET /api/cs/customers/[customerId]", "Unified customer view"],
      ["PUT /api/cs/customers/[customerId]/profile", "Save CS note + tag"],
    ],
  },
  {
    title: "Lark Mail",
    rows: [
      ["GET /api/lark-mail-charts", "Volume charts"],
      ["GET /api/lark-mail-clients", "Per-client breakdown"],
      ["GET /api/lark-mail-customer-history/[email]", "Email history"],
      ["GET /api/lark-mail-detail/[id]", "Message detail"],
      ["POST /api/lark-mail-ignore", "Mark thread ignored"],
      ["GET /api/lark-mail-sent", "Sent items"],
      ["GET /api/lark-mail-stats", "Per-day stats"],
      ["POST /api/lark-mail-sync", "Manual re-sync"],
      ["GET /api/lark-mail-sync-logs", "Sync logs"],
      ["DELETE /api/lark-mail-delete", "Hard delete (gated)"],
      ["POST /api/lark-mail-truncate", "Truncate table (admin gated)"],
    ],
  },
  {
    title: "ChargeFlow / Disputes",
    rows: [
      ["GET /api/disputes", "List disputes for active store"],
      ["POST /api/disputes/sync", "Trigger ChargeFlow sync"],
      ["POST /api/disputes/evidence", "Upload evidence package"],
    ],
  },
  {
    title: "Bulk Update (proxy)",
    rows: [
      ["POST /api/bulk/[...path]", "Proxy to Flask bulk-update server on Mac mini"],
    ],
  },
  {
    title: "Webhooks",
    rows: [
      ["POST /api/webhooks/shopify/refunds", "HMAC-verified refund webhook"],
      ["POST /api/cj/webhook-setup", "Setup CJ webhook (ADMIN_SECRET)"],
    ],
  },
];

export default function Page() {
  return (
    <>
      <PageHeader eyebrow="Reference" title="API Routes" description="Toàn bộ /api/* endpoint của dashboard." />

      <p>
        Có ~80 API routes trong <code>src/app/api/</code>. Đây là index theo nhóm. Mỗi handler
        đều scope theo active store (xem <a href="/docs/feature-multistore">Multi-Store</a>).
      </p>

      {groups.map((g) => (
        <section key={g.title}>
          <h2 id={g.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}>{g.title}</h2>
          <table>
            <thead>
              <tr>
                <th style={{ width: "45%" }}>Endpoint</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              {g.rows.map(([k, v]) => (
                <tr key={k}>
                  <td><code className="text-[12px]">{k}</code></td>
                  <td className="text-[14px]">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      <h2 id="patterns">Conventions</h2>
      <ul>
        <li>All routes return JSON. Errors as <code>{`{ error: string, detail?: any }`}</code>.</li>
        <li>Auth via JWT cookie. 401 if cookie missing/expired. 403 if IAM denies.</li>
        <li>Cron-only endpoints require <code>x-cron-secret</code> header matching <code>CRON_SECRET</code>.</li>
        <li>Webhooks require valid HMAC. Wrong secret = 401.</li>
      </ul>

      <PageNav href="/docs/api-routes" />
    </>
  );
}
