import {
  Activity,
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
        path: "/api/analytics/sync/[provider]",
        purpose: "Generic provider sync — provider ∈ {recharge, meta, google, klaviyo, shopify-payments, shopify-products, stripe, refresh-tokens, refund-line-items, customer-orders-count}",
      },
    ],
  },
  {
    title: "Orders / Inventory",
    description: "Active-store scoped. Top-level GETs do not exist — only dynamic + utility routes below.",
    icon: <Package className={ICON} />,
    routes: [
      { method: "POST", path: "/api/orders/import-csv", purpose: "CSV order import" },
      { method: "GET", path: "/api/shopify-orders/[orderId]", purpose: "Single order detail" },
      { method: "GET", path: "/api/inventory/shopify-products", purpose: "Inventory snapshot (Shopify products)" },
      {
        method: "GET",
        path: "/api/tracking-timeline/[orderId]",
        purpose: "Tracking timeline events",
      },
      { method: "POST", path: "/api/update-row", purpose: "Inline row edit" },
      { method: "DELETE", path: "/api/delete", purpose: "Delete record" },
    ],
  },
  // Custom table API section removed — generic /api/custom-* endpoints
  // expose the POM-style Lark Base sidebar viewer, which is out of scope
  // for the handover doc (Phong 2026-05-27). Lark-sourced features that DO
  // matter (COGS Catalog, fulfillment routing) live under their own docs.
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
      { method: "GET", path: "/api/iam/permissions", purpose: "75-action catalog" },
      { method: "GET", path: "/api/iam/policies", purpose: "9 managed policies" },
      { method: "POST", path: "/api/iam/policies", purpose: "Create custom policy" },
      {
        method: "POST",
        path: "/api/iam/users/[id]/policies",
        purpose: "Attach policy to user",
      },
      { method: "GET", path: "/api/iam/audit-log", purpose: "Audit log" },
    ],
  },
  {
    title: "CS Dashboard",
    description: "3-panel CS dashboard. customer_profiles join Lark Mail.",
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
        path: "/api/lark-mail-customer-history?email=...",
        purpose: "Email history",
      },
      { method: "GET", path: "/api/lark-mail-detail?id=...", purpose: "Message detail" },
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
    description: "Active-store scoped. CDP sync trigger lives under /api/cron, evidence under /api/chargeflow.",
    icon: <Shield className={ICON} />,
    routes: [
      { method: "GET", path: "/api/disputes", purpose: "List disputes cho active store" },
      { method: "GET", path: "/api/disputes/[gateway]", purpose: "Disputes filtered by payment gateway" },
      { method: "POST", path: "/api/cron/chargeflow-sync-ui", purpose: "Trigger ChargeFlow CDP sync (via cron endpoint)" },
      { method: "POST", path: "/api/chargeflow/disputes/[id]/evidence", purpose: "Upload evidence package" },
      { method: "POST", path: "/api/chargeflow/disputes/[id]/tracking-evidence", purpose: "Generate tracking-only evidence" },
      { method: "POST", path: "/api/chargeflow/disputes/[id]/lark-mail-evidence", purpose: "Generate Lark Mail evidence screenshots" },
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
        description="Danh mục các endpoint backend mà dashboard và worker dùng. Trang này thuần kỹ thuật."
      />

      {/* ─────────── USER MODE ─────────── */}
      <section data-user-detail>
        <h2 id="user-what">Trang này dành cho ai</h2>
        <p>
          Dành cho dev. Liệt kê toàn bộ ~80 endpoint backend. Người dùng cuối không cần đọc —
          các nút bấm trên dashboard đã tự gọi đúng endpoint.
        </p>
        <h2 id="user-when-call">Khi nào báo dev</h2>
        <ul>
          <li>Một nút trên dashboard click vào trả lỗi 404 hoặc 500.</li>
          <li>Cần endpoint mới cho workflow mới — luôn qua dev.</li>
        </ul>
      </section>

      {/* ─────────── DEV MODE ─────────── */}
      <section data-dev-detail>
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

      </section>

      <PageNav href="/docs/api-routes" />
    </>
  );
}
