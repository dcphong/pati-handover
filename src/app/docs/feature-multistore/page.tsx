import {
  Check,
  Clock,
  Database,
  Globe,
  KeyRound,
} from "lucide-react";
import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import {
  Step,
  Steps,
  Terminal,
  TerminalInline,
} from "@/components/docs/visuals";

export const metadata = { title: "Multi-Store — PATI Handover" };

const phases = [
  {
    n: 1,
    label: "Foundation",
    when: "đã land",
    desc: "Store registry table + sidebar StoreSwitcher",
    done: true,
  },
  {
    n: 2,
    label: "Read paths",
    when: "2026-05-15",
    desc: "Analytics read+write, webhooks, RQ keys all store-scoped. Foundation: active-store-context, useStoreScopedQuery, shopify-creds.",
    done: true,
  },
  {
    n: 3,
    label: "Schema scoping",
    when: "2026-05-16 overnight",
    desc: "shop_id added on shopify_orders, shopify_tracking, chargeflow_disputes, stock_cover, 5 matviews rebuilt. WN preserved, EDC clean-empty.",
    done: true,
  },
  {
    n: 4,
    label: "Cron rewrite",
    when: "pending",
    desc: "ChargeFlow / openclaw / cj libs + cron rewrite. Vẫn env-bound (legacy) chưa scope theo shop_id.",
    done: false,
  },
];

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Core Features"
        title="Multi-Store Scoping"
        description="Phase 3 đã land 2026-05-16 — mọi read/write scope theo shop_id. Đang chờ Phase 4 (cron rewrite)."
      />

      <h2 id="status">4 phase rollout</h2>
      <div className="not-prose my-6 space-y-2.5">
        {phases.map((p) => (
          <div
            key={p.n}
            className={`rounded-xl border-2 p-3.5 ${
              p.done
                ? "border-emerald-500/40 bg-emerald-500/[0.04]"
                : "border-amber-500/40 bg-amber-500/[0.04]"
            }`}
          >
            <div className="flex items-center gap-3 mb-1.5">
              <div
                className={`grid place-items-center h-7 w-7 rounded-full ${
                  p.done
                    ? "bg-emerald-500/20 border border-emerald-500/40"
                    : "bg-amber-500/20 border border-amber-500/40"
                }`}
              >
                {p.done ? (
                  <Check className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300" />
                ) : (
                  <Clock className="h-3.5 w-3.5 text-amber-700 dark:text-amber-300" />
                )}
              </div>
              <div className="font-semibold text-[14px]">
                Phase {p.n} — {p.label}
              </div>
              <div
                className={`ml-auto text-[10px] uppercase tracking-wider font-semibold rounded border px-1.5 py-0.5 ${
                  p.done
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
                    : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40"
                }`}
              >
                {p.when}
              </div>
            </div>
            <div className="text-[13px] text-foreground/85 leading-6 ml-10">{p.desc}</div>
          </div>
        ))}
      </div>

      <Callout variant="info" title="DEFAULT='WN domain' = safety net">
        Migration thêm{" "}
        <TerminalInline>shop_id NOT NULL DEFAULT &apos;e49d78-3.myshopify.com&apos;</TerminalInline>{" "}
        là tạm thời cho legacy writers còn lại chưa update. <strong>Phase 4</strong> sẽ remove
        DEFAULT khi tất cả cron đã rewrite.
      </Callout>

      <h2 id="layers">3 layer abstraction</h2>
      <div className="not-prose my-5 grid sm:grid-cols-3 gap-3">
        <LayerCard
          icon={Globe}
          name="active-store-context"
          purpose="Client-side context (React) lấy active store từ cookie"
          example="useActiveStore()"
        />
        <LayerCard
          icon={Database}
          name="useStoreScopedQuery"
          purpose="Wrapper React Query auto-inject shop_id vào key + URL"
          example='queryKey: ["x", {from, to}]'
        />
        <LayerCard
          icon={KeyRound}
          name="shopify-creds"
          purpose="Resolve token theo shop_id (env var hoặc DB-stored OAuth)"
          example="getShopifyCreds(shop_id)"
        />
      </div>

      <h2 id="active-store">Active store context — code shape</h2>
      <CodeBlock language="ts" filename="src/lib/active-store-context.tsx">
{`// Client side
import { useActiveStore } from "@/lib/active-store-context";
const { shop_id, store_label, timezone } = useActiveStore();

// Server side (API routes)
import { resolveActiveStore } from "@/lib/active-store-server";
const store = await resolveActiveStore(request);
// → reads cookie + falls back to default WN`}
      </CodeBlock>

      <h2 id="hooks">useStoreScopedQuery — auto inject shop_id</h2>
      <p>
        Wrapper React Query tự đẩy <TerminalInline>shop_id</TerminalInline> vào query key +
        URL. Đảm bảo switching store invalidates cache:
      </p>
      <CodeBlock language="ts">
{`const { data } = useStoreScopedQuery({
  queryKey: ["analytics-summary", "range", { from, to }],
  // → auto-becomes ["analytics-summary", "range", { from, to, shop_id }]
  queryFn: async (shop_id) =>
    fetch(\`/api/analytics/summary?from=\${from}&to=\${to}&shop_id=\${shop_id}\`).then(r => r.json()),
});`}
      </CodeBlock>

      <h2 id="creds">Per-store credentials resolution</h2>
      <div className="not-prose my-5 rounded-xl border bg-card p-4">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
          Thứ tự lookup khi gọi <code>getShopifyCreds(shop_id)</code>
        </div>
        <ol className="space-y-2 text-[13px] leading-6">
          <li className="flex items-start gap-2">
            <span className="grid place-items-center h-5 w-5 rounded-full bg-foreground text-background text-[10px] font-bold shrink-0">
              1
            </span>
            <div>
              Tìm env <TerminalInline>SHOPIFY_ACCESS_TOKEN_&lt;SLUG&gt;</TerminalInline> (ví dụ{" "}
              <TerminalInline>SHOPIFY_ACCESS_TOKEN_WN</TerminalInline>).
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="grid place-items-center h-5 w-5 rounded-full bg-foreground text-background text-[10px] font-bold shrink-0">
              2
            </span>
            <div>
              Fall back về default <TerminalInline>SHOPIFY_ACCESS_TOKEN</TerminalInline>.
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="grid place-items-center h-5 w-5 rounded-full bg-foreground text-background text-[10px] font-bold shrink-0">
              3
            </span>
            <div>
              Nếu store có DB-stored OAuth token (sau Phase 4 OAuth flow) — dùng nó thay.
            </div>
          </li>
        </ol>
      </div>

      <h2 id="onboard">Onboarding store mới — 5 bước</h2>
      <Steps>
        <Step n={1} title="INSERT vào master_app.shopify_stores">
          <Terminal
            host="postgres"
            cwd="psql"
            lines={[
              { prompt: "psql>", cmd: "INSERT INTO master_app.shopify_stores" },
              { prompt: "", cmd: "  (id, domain, timezone, country, default_currency)" },
              { prompt: "", cmd: "VALUES ('new-store', 'new-store.myshopify.com'," },
              { prompt: "", cmd: "        'Asia/Ho_Chi_Minh', 'VN', 'USD');" },
            ]}
          />
        </Step>
        <Step n={2} title="Add SHOPIFY_ACCESS_TOKEN_<SLUG> trên Mac mini">
          <Terminal
            host="timcook@mini"
            cwd="~/Coding_workspace/PATI/shopify-lark-sync"
            lines={[
              { prompt: "$", cmd: "nano .env   # SHOPIFY_ACCESS_TOKEN_NEWSTORE=shpat_xxx" },
              { prompt: "$", cmd: "nano ~/pati-supabase/cron/.env.web   # nếu cần override prod-only" },
            ]}
          />
        </Step>
        <Step n={3} title="Rebuild + restart web service">
          <Terminal
            host="timcook@mini"
            cwd="~/Coding_workspace/PATI/shopify-lark-sync"
            lines={[
              { prompt: "$", cmd: "bash scripts/macmini-stack/deploy-web.sh --force" },
            ]}
          />
        </Step>
        <Step n={4} title="Activate qua StoreSwitcher">
          <p>
            Login dashboard → sidebar → click <strong>StoreSwitcher</strong> → chọn store mới.
          </p>
        </Step>
        <Step n={5} title="Backfill data">
          <Terminal
            host="you@laptop"
            cwd="~"
            lines={[
              { prompt: "$", cmd: "curl -X POST https://pnl.patigroup.com/api/analytics/sync/shopify \\" },
              { prompt: "", cmd: "  -H \"x-cron-secret: $CRON_SECRET\" \\" },
              { prompt: "", cmd: "  -d '{\"shop_id\":\"new-store.myshopify.com\",\"since\":\"2026-01-01\"}'" },
            ]}
          />
          <p className="text-[12.5px] text-muted-foreground mt-1">
            Phase 4 cron rewrite chưa land — đừng rely auto-sync cho store mới, sync thủ công
            trước.
          </p>
        </Step>
      </Steps>

      <h2 id="oauth">OAuth tab — scaffolded, chưa activate</h2>
      <Callout variant="warning" title="Pending Partner Public app">
        Code đã scaffold 2026-05-15 (<TerminalInline>provider.oauth</TerminalInline> config,{" "}
        <TerminalInline>&#123;subdomain&#125;</TerminalInline> token-URL substitution, dialog
        pre-fill). Cần Shopify Partner Public app +{" "}
        <TerminalInline>SHOPIFY_OAUTH_CLIENT_ID/SECRET</TerminalInline> env trước khi tab OAuth
        work. <strong>api_key tab</strong> (paste token manual) work today.
      </Callout>

      <PageNav href="/docs/feature-multistore" />
    </>
  );
}

function LayerCard({
  icon: Icon,
  name,
  purpose,
  example,
}: {
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  purpose: string;
  example: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-3.5">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="h-3.5 w-3.5 text-foreground/70" />
        <div className="font-semibold text-[13px]">{name}</div>
      </div>
      <div className="text-[12px] text-muted-foreground leading-5 mb-2">{purpose}</div>
      <code className="block font-mono text-[11.5px] bg-zinc-950 text-zinc-100 rounded px-2 py-1 border border-zinc-800">
        {example}
      </code>
    </div>
  );
}
