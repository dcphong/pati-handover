import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export const metadata = { title: "Multi-Store — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Core Features"
        title="Multi-Store Scoping"
        description="Phase 3 landed 2026-05-16 — every read/write scopes by shop_id."
      />

      <h2 id="status">Phase status</h2>
      <ul>
        <li><strong>Phase 1</strong> — store registry table, sidebar StoreSwitcher</li>
        <li><strong>Phase 2</strong> (2026-05-15) — analytics read+write routes, webhooks, RQ keys all store-scoped. Foundation: <code>active-store-context</code>, <code>useStoreScopedQuery</code>, <code>shopify-creds</code></li>
        <li>
          <strong>Phase 3</strong> (2026-05-16, overnight) — <code>shop_id</code> on{" "}
          <code>shopify_orders</code>, <code>shopify_tracking</code>,{" "}
          <code>chargeflow_disputes</code>, <code>stock_cover</code>, 5 matviews rebuilt.
          All read paths scope to active store. HTTP smoke proves WN preserved, EDC clean-empty.
        </li>
        <li>
          <strong>Phase 4</strong> (pending) — ChargeFlow/openclaw/cj libs + cron rewrite. These
          vẫn env-bound (legacy).
        </li>
      </ul>

      <Callout variant="info" title="DEFAULT='WN domain' = safety net">
        Migration thêm <code>shop_id NOT NULL DEFAULT &apos;e49d78-3.myshopify.com&apos;</code>{" "}
        là tạm thời cho legacy writers còn lại chưa update. Phase 4 sẽ remove DEFAULT.
      </Callout>

      <h2 id="active-store">Active store context</h2>
      <CodeBlock language="ts" filename="src/lib/active-store-context.tsx">
{`// Client side
import { useActiveStore } from "@/lib/active-store-context";
const { shop_id, store_label, timezone } = useActiveStore();

// Server side (API routes)
import { resolveActiveStore } from "@/lib/active-store-server";
const store = await resolveActiveStore(request); // reads cookie + falls back to default`}
      </CodeBlock>

      <h2 id="hooks">useStoreScopedQuery</h2>
      <p>
        Wrapper around react-query auto-injects <code>shop_id</code> vào query key + URL. Đảm bảo
        switching store invalidates cache:
      </p>
      <CodeBlock language="ts">
{`const { data } = useStoreScopedQuery({
  queryKey: ["analytics-summary", "range", { from, to }],
  // queryKey auto-becomes ["analytics-summary", "range", { from, to, shop_id }]
  queryFn: async (shop_id) =>
    fetch(\`/api/analytics/summary?from=\${from}&to=\${to}&shop_id=\${shop_id}\`).then(r => r.json()),
});`}
      </CodeBlock>

      <h2 id="creds">Per-store credentials</h2>
      <CodeBlock language="ts" filename="src/lib/shopify-creds.ts">
{`export function getShopifyCreds(shop_id: string) {
  // 1. Look for SHOPIFY_ACCESS_TOKEN_<SLUG> env (e.g. SHOPIFY_ACCESS_TOKEN_WN)
  // 2. Fall back to default SHOPIFY_ACCESS_TOKEN
  // 3. If a custom store has DB-stored OAuth token, use it instead
  return {
    domain: shop_id,
    accessToken: ...,
    apiVersion: process.env.SHOPIFY_API_VERSION,
  };
}`}
      </CodeBlock>

      <h2 id="onboard">Onboarding a new store</h2>
      <ol>
        <li>
          INSERT vào <code>master_app.shopify_stores</code> (id = myshopify domain, timezone,
          country, default_currency).
        </li>
        <li>Add env vars: <code>SHOPIFY_ACCESS_TOKEN_&lt;SLUG&gt;</code>.</li>
        <li>Run <code>vercel --prod</code> để rebuild env into client.</li>
        <li>Activate store qua <code>StoreSwitcher</code> ở sidebar.</li>
        <li>
          Backfill data: <code>POST /api/analytics/sync/shopify</code> với{" "}
          <code>shop_id</code> mới. Để Phase 4 cron rewrite trước khi rely on auto-sync.
        </li>
      </ol>

      <h2 id="oauth">OAuth tab (scaffolded, not yet activated)</h2>
      <Callout variant="warning" title="Pending Partner Public app">
        Mã đã scaffold 2026-05-15 (<code>provider.oauth</code> config,{" "}
        <code>{`{subdomain}`}</code> token-URL substitution, dialog pre-fill). Cần Shopify
        Partner Public app + <code>SHOPIFY_OAUTH_CLIENT_ID/SECRET</code> env vars trước khi
        OAuth tab work. <strong>api_key tab</strong> (paste token manual) works today.
      </Callout>

      <PageNav href="/docs/feature-multistore" />
    </>
  );
}
