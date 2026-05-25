import {
  Activity,
  Cable,
  Cog,
  KeyRound,
  Mail,
  Package,
  RefreshCw,
  Shield,
  Truck,
  Users,
  Webhook,
} from "lucide-react";
import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import {
  RouteCatalog,
  RouteGroup,
  TerminalInline,
} from "@/components/docs/visuals";

export const metadata = { title: "API Routes — PATI Handover" };

const ICON = "h-4 w-4 text-foreground/70";

const groups: RouteGroup[] = [
  {
    title: "Auth",
    description: "JWT cookie–based. /verify dùng để check session hợp lệ.",
    icon: <KeyRound className={ICON} />,
    routes: [
      { method: "POST", path: "/api/auth/login", purpose: "Email + password → JWT cookie" },
      { method: "POST", path: "/api/auth/logout", purpose: "Clear cookie" },
      { method: "GET", path: "/api/auth/verify", purpose: "Verify cookie" },
      {
        method: "POST",
        path: "/api/auth/migrate-passwords",
        purpose: "Bulk hash plaintext passwords",
        note: "MIGRATION_SECRET required",
      },
      { method: "GET", path: "/api/auth/lark/start", purpose: "Begin Lark OAuth flow" },
      { method: "GET", path: "/api/auth/lark/callback", purpose: "Lark OAuth callback" },
    ],
  },
  {
    title: "Sync triggers",
    description: "Mọi pipeline đều gọi qua đây để workflow_dispatch sang GH Actions.",
    icon: <RefreshCw className={ICON} />,
    routes: [
      { method: "POST", path: "/api/sync", purpose: "Date-window Shopify sync (Python pipeline)" },
      { method: "GET", path: "/api/sync/preview", purpose: "Preview rows trước khi commit" },
      { method: "GET", path: "/api/sync-logs", purpose: "Lấy sync_logs gần đây" },
      {
        method: "POST",
        path: "/api/cron",
        purpose: "Trigger GitHub Actions workflow",
        note: "x-cron-secret required",
      },
      {
        method: "POST",
        path: "/api/cron/chargeflow-sync-ui",
        purpose: "ChargeFlow CDP sync trigger",
      },
      { method: "GET", path: "/api/health", purpose: "Liveness probe" },
      { method: "GET", path: "/api/sync-health", purpose: "Per-pipeline freshness check" },
    ],
  },
  {
    title: "Analytics",
    description: "TripleWhale-parity. summary card đọc qua RPC summary_metrics.",
    icon: <Activity className={ICON} />,
    routes: [
      { method: "GET", path: "/api/analytics/summary", purpose: "TW-parity summary cards" },
      {
        method: "POST",
        path: "/api/analytics/sync/shopify",
        purpose: "Incremental Shopify order sync (TS)",
      },
      { method: "POST", path: "/api/analytics/sync/paypal", purpose: "PayPal transactions" },
      {
        method: "POST",
        path: "/api/analytics/sync/paypal-fees",
        purpose: "PayPal fee breakdown",
      },
      {
        method: "POST",
        path: "/api/analytics/sync/recharge",
        purpose: "Recharge subs + charges",
      },
      { method: "POST", path: "/api/analytics/sync/meta", purpose: "Meta Ads spend" },
      { method: "POST", path: "/api/analytics/sync/google", purpose: "Google Ads spend" },
      { method: "POST", path: "/api/analytics/sync/klaviyo", purpose: "Klaviyo events" },
    ],
  },
  {
    title: "Orders / Inventory",
    description: "Active-store scoped. /shopify-orders là view lower-level.",
    icon: <Package className={ICON} />,
    routes: [
      { method: "GET", path: "/api/orders", purpose: "List orders cho active store" },
      { method: "POST", path: "/api/orders/import", purpose: "CSV order import" },
      { method: "GET", path: "/api/shopify-orders", purpose: "Lower-level shopify_orders view" },
      { method: "GET", path: "/api/inventory", purpose: "Inventory snapshot" },
      {
        method: "GET",
        path: "/api/tracking-timeline/[order]",
        purpose: "Tracking timeline events",
      },
      { method: "POST", path: "/api/update-row", purpose: "Inline row edit" },
      { method: "DELETE", path: "/api/delete", purpose: "Delete record" },
    ],
  },
  {
    title: "Custom tables",
    description: "Dynamic custom-table viewer/editor cho mỗi slug.",
    icon: <Cable className={ICON} />,
    routes: [
      { method: "GET", path: "/api/custom-menus", purpose: "Sidebar entries cho custom tables" },
      {
        method: "GET",
        path: "/api/custom-columns/[slug]",
        purpose: "Column defs for custom table",
      },
      { method: "GET", path: "/api/custom-data/[slug]", purpose: "Rows" },
      {
        method: "POST",
        path: "/api/custom-data/[slug]/import",
        purpose: "Bulk import rows",
      },
    ],
  },
  {
    title: "IAM",
    description: "AWS-style policies. /iam UI tạo policy + attach user.",
    icon: <Shield className={ICON} />,
    routes: [
      { method: "GET", path: "/api/users", purpose: "List users" },
      { method: "POST", path: "/api/users", purpose: "Create user" },
      { method: "PUT", path: "/api/users/[id]", purpose: "Edit user" },
      { method: "DELETE", path: "/api/users/[id]", purpose: "Soft-delete user" },
      { method: "GET", path: "/api/roles", purpose: "List roles (legacy)" },
      { method: "GET", path: "/api/permissions", purpose: "List permissions (legacy)" },
      { method: "GET", path: "/api/iam/actions", purpose: "75-action catalog" },
      { method: "GET", path: "/api/iam/policies", purpose: "9 managed policies" },
      { method: "POST", path: "/api/iam/policies", purpose: "Create custom policy" },
      {
        method: "POST",
        path: "/api/iam/users/[id]/policies",
        purpose: "Attach policy to user",
      },
      { method: "GET", path: "/api/iam/audit", purpose: "Audit log" },
    ],
  },
  {
    title: "CS Dashboard",
    description: "Gorgias 3-panel rebuild. customer_profiles join Lark Mail.",
    icon: <Users className={ICON} />,
    routes: [
      { method: "GET", path: "/api/cs-dashboard", purpose: "Daily aggregate counters" },
      { method: "GET", path: "/api/cs-dashboard/orders", purpose: "Orders cho active store" },
      {
        method: "GET",
        path: "/api/cs/customers/[customerId]",
        purpose: "Unified customer view",
      },
      {
        method: "PUT",
        path: "/api/cs/customers/[customerId]/profile",
        purpose: "Save CS note + tag",
      },
    ],
  },
  {
    title: "Lark Mail",
    description: "Đồng bộ + truy vấn Lark Mail messages.",
    icon: <Mail className={ICON} />,
    routes: [
      { method: "GET", path: "/api/lark-mail-charts", purpose: "Volume charts" },
      { method: "GET", path: "/api/lark-mail-clients", purpose: "Per-client breakdown" },
      {
        method: "GET",
        path: "/api/lark-mail-customer-history/[email]",
        purpose: "Email history",
      },
      { method: "GET", path: "/api/lark-mail-detail/[id]", purpose: "Message detail" },
      { method: "POST", path: "/api/lark-mail-ignore", purpose: "Mark thread ignored" },
      { method: "GET", path: "/api/lark-mail-sent", purpose: "Sent items" },
      { method: "GET", path: "/api/lark-mail-stats", purpose: "Per-day stats" },
      { method: "POST", path: "/api/lark-mail-sync", purpose: "Manual re-sync" },
      { method: "GET", path: "/api/lark-mail-sync-logs", purpose: "Sync logs" },
      {
        method: "DELETE",
        path: "/api/lark-mail-delete",
        purpose: "Hard delete",
        note: "ADMIN_SECRET gated",
      },
      {
        method: "POST",
        path: "/api/lark-mail-truncate",
        purpose: "Truncate table",
        note: "ADMIN_SECRET gated",
      },
    ],
  },
  {
    title: "ChargeFlow / Disputes",
    description: "Active-store scoped. CDP sync trigger.",
    icon: <Shield className={ICON} />,
    routes: [
      { method: "GET", path: "/api/disputes", purpose: "List disputes cho active store" },
      { method: "POST", path: "/api/disputes/sync", purpose: "Trigger ChargeFlow sync" },
      { method: "POST", path: "/api/disputes/evidence", purpose: "Upload evidence package" },
    ],
  },
  {
    title: "Bulk Update (proxy)",
    description: "Tất cả /api/bulk/* được proxy sang Flask server :5000 trên Mac mini.",
    icon: <Truck className={ICON} />,
    routes: [
      {
        method: "POST",
        path: "/api/bulk/[...path]",
        purpose: "Proxy → Flask bulk-update server",
      },
    ],
  },
  {
    title: "Webhooks",
    description: "HMAC-verified. Shopify secret bắt buộc match Lark Integration app.",
    icon: <Webhook className={ICON} />,
    routes: [
      {
        method: "POST",
        path: "/api/webhooks/shopify/refunds",
        purpose: "HMAC-verified refund webhook",
      },
      {
        method: "POST",
        path: "/api/cj/webhook-setup",
        purpose: "Setup CJ Dropshipping webhook",
        note: "ADMIN_SECRET",
      },
    ],
  },
  {
    title: "Misc",
    icon: <Cog className={ICON} />,
    routes: [],
  },
];

const validGroups = groups.filter((g) => g.routes.length > 0);

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Reference"
        title="API Routes"
        description="~80 endpoints trong /src/app/api/. Search theo path/mô tả, lọc theo HTTP method."
      />

      <Callout variant="info" title="Convention chung">
        <ul className="list-disc ml-5 space-y-1">
          <li>
            Mọi route trả JSON. Lỗi:{" "}
            <TerminalInline>{`{ error: string, detail?: any }`}</TerminalInline>.
          </li>
          <li>
            Auth qua JWT cookie. <TerminalInline>401</TerminalInline> nếu thiếu/expired,{" "}
            <TerminalInline>403</TerminalInline> nếu IAM deny.
          </li>
          <li>
            Cron-only endpoint yêu cầu header{" "}
            <TerminalInline>x-cron-secret: $CRON_SECRET</TerminalInline>.
          </li>
          <li>
            Webhook yêu cầu HMAC hợp lệ. Sai secret → 401.
          </li>
          <li>
            Tất cả handler scope theo active store (xem{" "}
            <a href="/docs/feature-multistore" className="underline">
              Multi-Store
            </a>
            ).
          </li>
        </ul>
      </Callout>

      <RouteCatalog groups={validGroups} />

      <PageNav href="/docs/api-routes" />
    </>
  );
}
