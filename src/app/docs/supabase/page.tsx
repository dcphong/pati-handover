import {
  Cloud,
  Container,
  Database,
  ExternalLink,
  Globe,
  KeyRound,
  Lock,
  ShieldOff,
  Table,
  Wrench,
} from "lucide-react";
import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import {
  FactRow,
  FlowNode,
  FlowRow,
  Terminal,
  TerminalInline,
} from "@/components/docs/visuals";

export const metadata = { title: "Supabase Connection — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Getting Started"
        title="Supabase Connection"
        description="Database tự host trên Mac mini. Mọi số liệu dashboard đọc đều từ đây."
      />

      <div className="not-prose my-6 grid gap-3 sm:grid-cols-2">
        <a
          href="https://supabase.patiagency.com"
          target="_blank"
          rel="noreferrer"
          className="group rounded-xl border-2 border-emerald-500/40 bg-emerald-500/[0.04] p-4 hover:bg-emerald-500/[0.08] transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
              <Database className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 font-semibold text-[14.5px] leading-tight mb-1">
                Mở Supabase Studio
                <ExternalLink className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300" />
              </div>
              <div className="font-mono text-[12px] text-emerald-700 dark:text-emerald-300 break-all">
                supabase.patiagency.com
              </div>
              <div className="text-[12px] text-muted-foreground leading-5 mt-1.5">
                UI để xem bảng + chạy SQL. Cần đăng nhập tài khoản admin trước.
              </div>
            </div>
          </div>
        </a>
        <a
          href="https://pnl.patigroup.com"
          target="_blank"
          rel="noreferrer"
          className="group rounded-xl border-2 border-sky-500/40 bg-sky-500/[0.04] p-4 hover:bg-sky-500/[0.08] transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-sky-500/15 text-sky-700 dark:text-sky-300">
              <Globe className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 font-semibold text-[14.5px] leading-tight mb-1">
                Mở Dashboard (PROD)
                <ExternalLink className="h-3.5 w-3.5 text-sky-700 dark:text-sky-300" />
              </div>
              <div className="font-mono text-[12px] text-sky-700 dark:text-sky-300 break-all">
                pnl.patigroup.com
              </div>
              <div className="text-[12px] text-muted-foreground leading-5 mt-1.5">
                Dashboard chính cho mọi báo cáo và thao tác hằng ngày.
              </div>
            </div>
          </div>
        </a>
      </div>

      <h2 id="user-what">Supabase là gì trong dashboard này</h2>
      <p>
        Supabase là <strong>database trung tâm</strong>. Mọi số trên dashboard (đơn, refund,
        ads, lợi nhuận, kho, ticket CS) đều được đọc từ đây. Các cron job đồng bộ thì ghi mới
        vào đây.
      </p>
      <p>
        Database được host trên Mac mini đặt tại văn phòng PATI — không phải cloud bên ngoài. Khi tunnel
        (đường ra internet) rớt thì dashboard mất kết nối; xem trang Cloudflared để xử.
      </p>

      <h2 id="login">Cách truy cập Supabase Studio</h2>
      <p>
        Supabase Studio là UI web để xem bảng, sửa từng dòng, hoặc chạy SQL. Mở ở{" "}
        <a href="https://supabase.patiagency.com" target="_blank" rel="noreferrer" className="underline">
          supabase.patiagency.com
        </a>.
      </p>
      <Callout variant="warning" title="Cần HTTP Basic Auth (locked 2026-05-27)">
        Studio + postgres-meta đã từng <strong>mở public</strong> ai cũng vào được. Đã lock bằng
        Caddy basic auth. Khi mở link sẽ có browser popup yêu cầu credentials:
        <div className="not-prose mt-2 rounded-md border bg-background/50 p-2.5 font-mono text-[12.5px]">
          <div>Username: <strong>admin</strong></div>
          <div>Password: <strong>Admin@2025</strong></div>
        </div>
        Cùng credential với dashboard PATI. Browser sẽ remember session sau 1 lần nhập.
        <em>App code (PostgREST <code>/rest/v1/*</code>) KHÔNG bị basic auth — vẫn dùng anon JWT
        + RLS như cũ, không gãy production.</em>
      </Callout>
      <div className="not-prose my-5 grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-500/[0.04] p-4">
          <div className="flex items-center gap-2 font-semibold text-[14px] mb-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold">U</span>
            Cho User (non-tech)
          </div>
          <ol className="ml-4 list-decimal space-y-1.5 text-[13px] leading-6 text-foreground/85">
            <li>Mở link <TerminalInline>supabase.patiagency.com</TerminalInline>.</li>
            <li>Form login hiện ra — nhập email + password được admin cấp.</li>
            <li>
              Nếu chưa có account: xin admin (Phong/dev) tạo. KHÔNG tự đăng ký — self-host này
              không mở public sign-up.
            </li>
            <li>
              Vào rồi: bên trái có icon <em>Table editor</em> (xem bảng), <em>SQL editor</em> (chạy
              SQL), <em>Database</em> (schema), <em>Logs</em>.
            </li>
          </ol>
        </div>
        <div className="rounded-xl border-2 border-violet-500/40 bg-violet-500/[0.04] p-4">
          <div className="flex items-center gap-2 font-semibold text-[14px] mb-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-violet-500/20 text-violet-700 dark:text-violet-300 text-xs font-bold">D</span>
            Cho Dev
          </div>
          <ol className="ml-4 list-decimal space-y-1.5 text-[13px] leading-6 text-foreground/85">
            <li>Studio container đang chạy: <TerminalInline>pati-supabase-studio-1</TerminalInline>.</li>
            <li>
              Bypass UI: <TerminalInline>NEXT_PUBLIC_SUPABASE_ANON_KEY</TerminalInline> +{" "}
              <TerminalInline>SUPABASE_SERVICE_KEY</TerminalInline> trong <code>.env</code> — đừng share.
            </li>
            <li>
              Đi direct: <TerminalInline>ssh timcook@100.94.220.128</TerminalInline> →{" "}
              <TerminalInline>docker exec -it pati-supabase-db-1 psql -U postgres</TerminalInline>.
            </li>
            <li>
              MCP server <TerminalInline>pati-supabase</TerminalInline> cho Claude — xem
              {" "}<a href="/docs/tailscale#claude-access" className="underline">Tailscale § Claude access</a>.
            </li>
          </ol>
        </div>
      </div>

      <h2 id="crud">CRUD — thao tác dữ liệu</h2>
      <p>
        4 thao tác CRUD (Create / Read / Update / Delete) đều có thể làm qua Studio UI. Dev có
        thêm SQL editor, psql, hoặc supabase-js từ code.
      </p>
      <div className="not-prose my-5 space-y-3">
        <div className="rounded-lg border bg-card p-4">
          <div className="font-semibold text-[14px] mb-1">📖 Read (xem dữ liệu)</div>
          <ul className="ml-4 list-disc text-[13px] leading-6 text-foreground/85 space-y-1">
            <li>
              <strong>User</strong>: Table editor → chọn schema <TerminalInline>master_app</TerminalInline> ở dropdown trên cùng → click bảng → filter/sort bằng nút trên cùng.
            </li>
            <li>
              <strong>Dev</strong>: SQL editor →{" "}
              <TerminalInline>SELECT * FROM master_app.shopify_orders LIMIT 50;</TerminalInline>
            </li>
          </ul>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="font-semibold text-[14px] mb-1">✏️ Update (sửa 1 dòng)</div>
          <ul className="ml-4 list-disc text-[13px] leading-6 text-foreground/85 space-y-1">
            <li>
              <strong>User</strong>: Table editor → double-click ô cần sửa → gõ giá trị mới → Save.
              Studio sẽ commit ngay.
            </li>
            <li>
              <strong>Dev</strong>: SQL editor → <TerminalInline>UPDATE ... WHERE ...</TerminalInline>{" "}
              (luôn có WHERE — không update toàn bảng).
            </li>
            <li className="text-amber-700 dark:text-amber-300">
              ⚠ Sửa <TerminalInline>customer_profiles</TerminalInline>, <TerminalInline>shopify_orders</TerminalInline> hoặc các bảng matview-source sẽ ảnh hưởng dashboard ngay — báo dev trước nếu không chắc.
            </li>
          </ul>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="font-semibold text-[14px] mb-1">➕ Create (thêm dòng mới)</div>
          <ul className="ml-4 list-disc text-[13px] leading-6 text-foreground/85 space-y-1">
            <li>
              <strong>User</strong>: Table editor → nút <em>+ Insert row</em> trên cùng phải → điền field bắt buộc (đỏ) → Save.
            </li>
            <li>
              <strong>Dev</strong>: <TerminalInline>INSERT INTO master_app.&lt;table&gt; (...) VALUES (...);</TerminalInline>{" "}
              hoặc <TerminalInline>supabase.from(&apos;...&apos;).insert(...)</TerminalInline> qua API.
            </li>
          </ul>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="font-semibold text-[14px] mb-1">🗑 Delete (xoá dòng)</div>
          <ul className="ml-4 list-disc text-[13px] leading-6 text-foreground/85 space-y-1">
            <li>
              <strong>User</strong>: Table editor → check vào dòng cần xoá → nút <em>Delete</em>{" "}
              trên cùng → confirm.
            </li>
            <li>
              <strong>Dev</strong>: <TerminalInline>DELETE FROM master_app.&lt;table&gt; WHERE ...;</TerminalInline>{" "}
              — BẮT BUỘC có WHERE.
            </li>
            <li className="text-red-700 dark:text-red-300">
              ⚠ Xoá hầu như không bao giờ undo được. Backup bằng{" "}
              <TerminalInline>SELECT ... INTO TEMP backup_xxx</TerminalInline> trước khi DELETE nếu không chắc.
            </li>
          </ul>
        </div>
      </div>

      <h2 id="user-when-call">Khi nào cần báo dev</h2>
      <ul>
        <li>Dashboard trống một cách bất thường mặc dù cron đã chạy.</li>
        <li>Một bảng/số lượt từ chối liên tục với mã <code>403</code> hoặc <code>401</code> — thường là RLS / API key.</li>
        <li>Sửa số trên Studio xong dashboard không cập nhật → dev kiểm tra PostgREST cache.</li>
        <li>Cần migration / DDL — luôn qua dev (không tự ALTER bảng trên Studio).</li>
      </ul>

      {/* ─────────── DEV MODE ─────────── */}
      <section data-dev-detail>
      <h2 id="what">Production Supabase = self-host</h2>
      <p>
        <strong>Không phải Supabase Cloud.</strong> Stack chạy bằng Docker Compose trên Mac mini
        ở văn phòng PATI (M4/16GB, từ 2026-05-10), expose ra internet qua Cloudflared tunnel.
      </p>

      <div className="not-prose my-6 rounded-xl border bg-card p-4 sm:p-5">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">
          Đường đi của 1 query từ client → DB
        </div>
        <FlowRow arrows="right">
          {[
            <FlowNode
              key="client"
              icon={Globe}
              label="Client / API route"
              sub="supabase.from(...).select()"
              tone="sky"
            />,
            <FlowNode
              key="cf"
              icon={Cloud}
              label="Cloudflared"
              sub="supabase.patiagency.com"
              tone="orange"
            />,
            <FlowNode
              key="kong"
              icon={Container}
              label="Kong gateway"
              sub=":8000 trên Mac mini"
              tone="violet"
            />,
            <FlowNode
              key="pgrst"
              icon={Database}
              label="PostgREST"
              sub="schema cache (lag 6-15')"
              tone="emerald"
            />,
            <FlowNode
              key="pg"
              icon={Database}
              label="Postgres"
              sub="schema master_app"
              tone="pink"
            />,
          ]}
        </FlowRow>
      </div>

      <h2 id="facts">Thông tin kết nối</h2>
      <div className="not-prose my-5 rounded-xl border bg-card p-4">
        <FactRow label="Public URL" value="https://supabase.patiagency.com" />
        <FactRow label="Tailscale IP" value="100.94.220.128 (tailnet only)" />
        <FactRow label="SSH user" value="timcook" />
        <FactRow label="Docker engine" value="Colima VM (lightweight Docker Desktop alt)" mono={false} />
        <FactRow label="Schema PATI" value="master_app" />
        <FactRow label="Other schemas" value="lark_email (other project, same instance)" mono={false} />
        <FactRow label="Migration date" value="2026-05-10 (Cloud → self-host)" mono={false} />
      </div>

      <Callout variant="success" title="Colima auto-start ĐÃ được setup">
        LaunchAgent <TerminalInline>com.user.colima</TerminalInline> tự gọi{" "}
        <TerminalInline>colima start</TerminalInline> khi Mac mini boot lên (xác minh{" "}
        2026-05-27). Log ở <TerminalInline>~/Library/Logs/colima-autostart.{`{out,err}`}.log</TerminalInline>.{" "}
        <strong>Caveat hiện tại</strong>: <TerminalInline>limactl</TerminalInline> symlink trong{" "}
        Homebrew bị broken — VM đang chạy vẫn ổn, nhưng <TerminalInline>colima status</TerminalInline>{" "}
        báo lỗi &ldquo;lima not found&rdquo; và lần restart tiếp theo có thể fail. Fix triệt để:{" "}
        <TerminalInline>brew reinstall lima</TerminalInline>. Xem{" "}
        <a href="/docs/mac-mini" className="underline">Mac mini</a>.
      </Callout>

      <h2 id="schema">Schema layout — master_app</h2>
      <p>
        Self-host này host nhiều project. PATI sống trong schema riêng{" "}
        <TerminalInline>master_app</TerminalInline> (rename từ public ngày 2026-05-14). Project{" "}
        khác như <TerminalInline>lark_email</TerminalInline> dùng schema riêng cùng instance.
      </p>
      <CodeBlock language="ts" filename="src/lib/supabase.ts">
{`import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    // CRITICAL — supabase-js mặc định Accept-Profile: public
    db: { schema: "master_app" },
  }
);`}
      </CodeBlock>

      <h2 id="four-traps">4 trap KHÔNG được quên</h2>

      <div className="not-prose my-6 space-y-4">
        <Trap
          n={1}
          icon={Table}
          title="Accept-Profile mặc định = public"
          severity="danger"
          symptom="supabase-js trả [] giống empty table, mà data thật có"
          cause="Quên pass db.schema khi createClient. PostgREST đọc schema public (rỗng) → return []."
          fix={
            <Terminal
              host="you@laptop"
              cwd="~"
              title="src/lib/supabase.ts"
              lines={[
                { out: "createClient(URL, KEY, {" },
                { out: "  db: { schema: \"master_app\" },   // BUỘC PHẢI CÓ", tone: "ok" },
                { out: "});" },
              ]}
            />
          }
        />

        <Trap
          n={2}
          icon={ShieldOff}
          title="RLS = ON, no policy → anon reads = []"
          severity="danger"
          symptom="Trên client thấy [], dùng service-role key lại có data"
          cause="Tables master_app có RLS ON nhưng KHÔNG có policy. Anon read được PostgREST filter ra rỗng."
          fix={
            <Terminal
              host="postgres"
              cwd="psql"
              lines={[
                { prompt: "psql>", cmd: "CREATE POLICY anon_read ON master_app.<table>" },
                { prompt: "", cmd: "  FOR SELECT TO anon USING (true);" },
              ]}
            />
          }
        />

        <Trap
          n={3}
          icon={Database}
          title="PostgREST schema cache lag 6-15 phút"
          severity="warn"
          symptom="Vừa thêm column/constraint, query vẫn báo column not found"
          cause="Self-host PostgREST có schema cache. NOTIFY pgrst, 'reload schema' không phải lúc nào cũng force được."
          fix={
            <>
              <Terminal
                host="timcook@mini"
                cwd="~"
                lines={[
                  { prompt: "$", cmd: "docker restart supabase-rest" },
                ]}
              />
              <p className="text-[12.5px] text-muted-foreground mt-2 leading-5">
                Hoặc fallback gọi RPC trực tiếp:{" "}
                <TerminalInline>upsert_ad_spend_batch</TerminalInline> đã tồn tại làm fallback.
              </p>
            </>
          }
        />

        <Trap
          n={4}
          icon={Wrench}
          title="1000-row silent cap"
          severity="danger"
          symptom='Refund-rate hoặc aggregate nào đó "lạ" — kiểu 34% vs sự thật 5.5%'
          cause="PGRST_DB_MAX_ROWS=1000 trên self-host. Bare .select() silent-truncate ở 1000."
          fix={
            <Terminal
              host="you@laptop"
              cwd="~"
              title="dùng pageAll() helper"
              lines={[
                { out: "import { pageAll } from \"@/lib/supabase\";" },
                { out: "" },
                { out: "const refunds = await pageAll(supabase" },
                { out: "  .from(\"raw_refunds\")" },
                { out: "  .select(\"id, amount, created_at\")" },
                { out: "  .gte(\"created_at\", startISO));", tone: "ok" },
              ]}
            />
          }
        />
      </div>

      <h2 id="anon-vs-service">Anon key vs Service-role key</h2>
      <div className="not-prose my-5 grid sm:grid-cols-2 gap-3">
        <KeyCard
          icon={KeyRound}
          name="NEXT_PUBLIC_SUPABASE_ANON_KEY"
          users="Client-side hooks, React Query"
          rls="ENFORCED — chỉ thấy data RLS cho phép"
          tone="sky"
        />
        <KeyCard
          icon={Lock}
          name="SUPABASE_SERVICE_KEY"
          users="API routes server-side, Python workers, cron"
          rls="BYPASSED — thấy hết. NEVER expose to client."
          tone="red"
        />
      </div>

      <h2 id="direct-pg">Direct Postgres — khi cần SQL trực tiếp</h2>
      <p>
        Cho DDL, one-off backfill, view debug. Có 2 cách:
      </p>
      <Terminal
        host="you@laptop"
        cwd="~"
        title="Option A — psql qua SSH"
        lines={[
          { prompt: "$", cmd: "ssh timcook@100.94.220.128" },
          { prompt: "timcook@mini $", cmd: "docker exec -it supabase-db psql -U postgres" },
          { divider: true, label: "trong psql" },
          { prompt: "psql>", cmd: "SET search_path TO master_app, public;" },
          { prompt: "psql>", cmd: "\\dt" },
        ]}
      />
      <p className="text-[13px]">
        <strong>Option B (recommended):</strong> dùng <TerminalInline>pati-supabase</TerminalInline>{" "}
        MCP server sếp đã host cho Claude — query + DDL từ chat luôn.
      </p>

      <h2 id="key-tables">Map nhanh các table quan trọng</h2>
      <p>
        Full schema ở <a href="/docs/database">Database Schema</a>. 7 table dưới đây xuất hiện
        90% trong code:
      </p>
      <div className="not-prose my-5 space-y-2">
        <TableRow
          name="shopify_orders"
          purpose="Source-of-truth cho orders. shop_id column scope multi-store."
          warn={
            <>
              <TerminalInline>variant_sku</TerminalInline> blank → sentinel{" "}
              <TerminalInline>__no_sku__:&#123;line_item_id&#125;</TerminalInline>. Filter{" "}
              <TerminalInline>NOT LIKE &apos;__no_sku__:%&apos;</TerminalInline> cho real-SKU
              queries.
            </>
          }
        />
        <TableRow
          name="raw_orders / raw_refunds / raw_ad_spend"
          purpose="Analytics base tables. raw_ad_spend phân loại theo provider column (meta/google/paypal_fees/...)"
        />
        <TableRow
          name="v_stvf"
          purpose="Single-Table View Function (materialized) cho TripleWhale parity."
        />
        <TableRow
          name="cogs_full_catalog"
          purpose="Lark per-PO COGS — AUTHORITATIVE source, KHÔNG dùng raw_variants.cost cho analytics."
        />
        <TableRow
          name="bestfulfill_shipping_rates"
          purpose="Best fulfillment shipping rate card."
        />
        <TableRow
          name="customer_profiles"
          purpose="CS note + customer_type tag. Join Lark Mail messages."
        />
        <TableRow
          name="sync_logs"
          purpose="Mọi pipeline ghi vào đây — debug đầu tiên xem cái này."
        />
      </div>

      </section>

      <PageNav href="/docs/supabase" />
    </>
  );
}

function Trap({
  n,
  icon: Icon,
  title,
  symptom,
  cause,
  fix,
  severity,
}: {
  n: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  symptom: string;
  cause: string;
  fix: React.ReactNode;
  severity: "warn" | "danger";
}) {
  const palette =
    severity === "danger"
      ? "border-red-500/40 bg-red-500/[0.04]"
      : "border-amber-500/40 bg-amber-500/[0.04]";
  const titleColor =
    severity === "danger"
      ? "text-red-700 dark:text-red-300"
      : "text-amber-700 dark:text-amber-300";
  return (
    <div className={`rounded-xl border-2 overflow-hidden ${palette}`}>
      <div className="px-4 py-3 border-b bg-card/60 flex items-center gap-3">
        <span
          className={`grid place-items-center h-7 w-7 rounded-full text-background bg-foreground text-[12px] font-bold tabular-nums shrink-0`}
        >
          {n}
        </span>
        <Icon className={`h-4 w-4 ${titleColor} shrink-0`} />
        <div className={`font-semibold text-[14.5px] ${titleColor}`}>{title}</div>
      </div>
      <div className="px-4 py-3 space-y-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-0.5">
            Triệu chứng
          </div>
          <div className="text-[13px] text-foreground/85 leading-6">{symptom}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-0.5">
            Nguyên nhân
          </div>
          <div className="text-[13px] text-foreground/85 leading-6">{cause}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-emerald-700 dark:text-emerald-300 font-semibold mb-1">
            Cách fix
          </div>
          {fix}
        </div>
      </div>
    </div>
  );
}

function KeyCard({
  icon: Icon,
  name,
  users,
  rls,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  users: string;
  rls: string;
  tone: "sky" | "red";
}) {
  const map = {
    sky: "border-sky-500/40 bg-sky-500/[0.04]",
    red: "border-red-500/40 bg-red-500/[0.04]",
  } as const;
  const text = {
    sky: "text-sky-700 dark:text-sky-300",
    red: "text-red-700 dark:text-red-300",
  } as const;
  return (
    <div className={`rounded-xl border-2 p-4 ${map[tone]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${text[tone]}`} />
        <code className={`font-mono text-[12px] font-semibold ${text[tone]}`}>{name}</code>
      </div>
      <div className="text-[12.5px] text-foreground/85 mb-1.5 leading-5">
        <span className="font-medium text-foreground/70">Dùng bởi:</span> {users}
      </div>
      <div className={`text-[12.5px] leading-5 ${text[tone]}`}>
        <span className="font-medium">RLS:</span> {rls}
      </div>
    </div>
  );
}

function TableRow({
  name,
  purpose,
  warn,
}: {
  name: string;
  purpose: string;
  warn?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3">
      <code className="font-mono text-[12.5px] font-semibold text-pink-700 dark:text-pink-300">
        {name}
      </code>
      <div className="text-[13px] text-foreground/85 mt-1 leading-6">{purpose}</div>
      {warn && (
        <div className="mt-2 text-[12px] text-amber-700 dark:text-amber-400 leading-5">
          ⚠ {warn}
        </div>
      )}
    </div>
  );
}
