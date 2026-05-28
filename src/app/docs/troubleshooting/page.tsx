import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import {
  DecisionBranch,
  DecisionStart,
  FixStep,
  FixSuccess,
  ProbeFirst,
  Terminal,
  TerminalInline,
  HealthCheckGrid,
} from "@/components/docs/visuals";
import {
  TroubleshootAccordion,
  type TroubleshootSection,
} from "@/components/docs/troubleshoot-accordion";

export const metadata = { title: "Troubleshooting — PATI Handover" };

const sections: TroubleshootSection[] = [
  {
    id: "cs",
    title: "CS — operational",
    subtitle:
      "Cái CS thấy trên /cs-dashboard và /lark-mail-reconcile: email không sync, unfulfilled trống, Timcook không reply…",
    count: 6,
    content: (
      <>
        <p className="text-[13px] text-muted-foreground mb-4">
          Đa số trace ngược về Timcook (Mac mini) hoặc Supabase, nên có link tham
          chiếu xuống các area dưới.
        </p>

        <DecisionBranch
          symptom="Email mới > 30 phút trên Lark Mail nhưng không thấy trong /lark-mail-reconcile"
          cause="Cron lark-mail-sync (mỗi 5 phút) fail, hoặc email-bridge trên Mac mini stop. UI chỉ đọc bảng lark_mail_messages — bảng không có row mới = cron chưa đẩy về."
          severity="warn"
          fix={
            <>
              <FixStep n={1}>
                Probe sync_logs ở DB xem cron có chạy không:
                <Terminal
                  host="postgres"
                  cwd="psql"
                  lines={[
                    { prompt: "psql>", cmd: "SELECT job, status, started_at, error" },
                    { prompt: "psql>", cmd: "FROM master_app.sync_logs" },
                    { prompt: "psql>", cmd: "WHERE job LIKE 'lark-mail%'" },
                    { prompt: "psql>", cmd: "ORDER BY started_at DESC LIMIT 5;" },
                  ]}
                />
                Nếu row mới nhất &gt; 15 phút, cron đang stuck.
              </FixStep>
              <FixStep n={2}>
                Thử trigger thủ công từ UI: POST{" "}
                <TerminalInline>/api/lark-mail-sync</TerminalInline>{" "}
                (hoặc click nút Re-sync nếu trang có).
              </FixStep>
              <FixStep n={3}>
                SSH Mac mini, restart email-bridge:
                <Terminal
                  host="timcook@mini"
                  cwd="~"
                  lines={[
                    { prompt: "$", cmd: "launchctl list | grep email-bridge" },
                    { prompt: "$", cmd: "launchctl kickstart -k gui/$(id -u)/ai.openclaw.email-bridge" },
                  ]}
                />
              </FixStep>
              <FixSuccess>
                <TerminalInline>sync_logs</TerminalInline> có row mới{" "}
                <TerminalInline>status=&quot;completed&quot;</TerminalInline> trong 5
                phút gần nhất.
              </FixSuccess>
            </>
          }
        />

        <DecisionBranch
          symptom="Bảng Unfulfilled trống dù Shopify rõ ràng có đơn chưa giao"
          cause="2 khả năng: (a) StoreSwitcher đang chọn nhầm shop (active store khác), hoặc (b) cron shopify-sync stuck → bảng raw_orders chưa có đơn mới."
          severity="warn"
          fix={
            <>
              <FixStep n={1}>
                Kiểm tra StoreSwitcher góc trên-trái sidebar — đang chọn đúng shop?
                Đổi shop và reload.
              </FixStep>
              <FixStep n={2}>
                Nếu shop đúng mà vẫn trống, check sync_logs:
                <Terminal
                  host="postgres"
                  cwd="psql"
                  lines={[
                    { prompt: "psql>", cmd: "SELECT job, status, error, started_at" },
                    { prompt: "psql>", cmd: "FROM master_app.sync_logs" },
                    { prompt: "psql>", cmd: "WHERE job LIKE 'shopify%'" },
                    { prompt: "psql>", cmd: "ORDER BY started_at DESC LIMIT 5;" },
                  ]}
                />
              </FixStep>
              <FixStep n={3}>
                Nếu sync_logs OK mà UI vẫn trống → khả năng cao là PostgREST schema
                cache hoặc supabase-js schema config — xem area{" "}
                <a href="#supabase">Supabase</a>.
              </FixStep>
            </>
          }
        />

        <DecisionBranch
          symptom="Customer profile bên phải trống dù khách có đơn Shopify"
          cause="customer_email trong email không match Shopify customer (case-sensitive, alias, hoặc tên thật khác email gửi). Profile chỉ tạo khi có row trong customer_profiles."
          severity="info"
          fix={
            <>
              <FixStep n={1}>
                Vào <TerminalInline>/lark-mail-reconcile</TerminalInline>, pick
                customer trong dropdown bên phải → save. Lần sync sau auto-match.
              </FixStep>
              <FixStep n={2}>
                Nếu dropdown không tìm thấy customer → email gửi và email Shopify
                khách khác nhau. Thêm tay vào{" "}
                <TerminalInline>customer_profiles</TerminalInline>:
                <Terminal
                  host="postgres"
                  cwd="psql"
                  lines={[
                    { prompt: "psql>", cmd: "INSERT INTO master_app.customer_profiles" },
                    { prompt: "psql>", cmd: "  (customer_email, shop_id, customer_type, cs_note)" },
                    { prompt: "psql>", cmd: "VALUES ('alias@x.com', 'shop_xxx', NULL, 'alias of real@x.com');" },
                  ]}
                />
              </FixStep>
            </>
          }
        />

        <DecisionBranch
          symptom="Refund rate trên CS overview cao bất thường (> 10%)"
          cause="Đa phần do PostgREST 1000-row cap truncate raw_refunds (silent) — không phải data thật xấu. Một số ít do bulk-parse overwrite amount=0."
          severity="warn"
          fix={
            <>
              <FixStep n={1}>
                Sanity check count raw thật:
                <Terminal
                  host="postgres"
                  cwd="psql"
                  lines={[
                    { prompt: "psql>", cmd: "SELECT COUNT(*) FROM master_app.raw_refunds" },
                    { prompt: "psql>", cmd: "WHERE created_at >= NOW() - INTERVAL '30 days';" },
                  ]}
                />
                Nếu &gt; 1000 → khả năng cao đang dính cap. Đọc tiếp area{" "}
                <a href="#supabase">Supabase</a> (nhánh Refund-rate lệch).
              </FixStep>
              <FixStep n={2}>
                Cũng check count amount=0 (bulk-parse overwrite):
                <Terminal
                  host="postgres"
                  cwd="psql"
                  lines={[
                    { prompt: "psql>", cmd: "SELECT COUNT(*) FROM master_app.raw_refunds WHERE amount = 0;" },
                  ]}
                />
                Nếu nhiều bất thường → đọc area{" "}
                <a href="#project">Project</a> (nhánh Refund amount = 0).
              </FixStep>
            </>
          }
        />

        <DecisionBranch
          symptom="Timcook không reply email khách, hoặc FRT (NS#1) > 7 phút kéo dài"
          cause="openclaw agent dừng, email-bridge crash, hoặc cron frt_tracker không log. Symptom tổng: ticket overdue tăng, FRT trên CS overview spike."
          severity="danger"
          fix={
            <>
              <FixStep n={1}>
                SSH Mac mini, check LaunchAgent agent + bridge:
                <Terminal
                  host="timcook@mini"
                  cwd="~"
                  lines={[
                    { prompt: "$", cmd: "launchctl list | grep -E 'ai.openclaw|email-bridge'" },
                    { out: "ai.openclaw.email-bridge    0   PID  → OK", tone: "ok" },
                    { out: "ai.openclaw.email-bridge    1   -    → crashed", tone: "err" },
                  ]}
                />
              </FixStep>
              <FixStep n={2}>
                Kickstart lại process nào crashed:
                <Terminal
                  host="timcook@mini"
                  cwd="~"
                  lines={[
                    { prompt: "$", cmd: "launchctl kickstart -k gui/$(id -u)/ai.openclaw.email-bridge" },
                  ]}
                />
              </FixStep>
              <FixStep n={3}>
                Check log gần nhất của agent:
                <Terminal
                  host="timcook@mini"
                  cwd="~"
                  lines={[
                    { prompt: "$", cmd: "tail -50 ~/.openclaw/workspace/agents/timcook/logs/agent.log" },
                    { prompt: "$", cmd: "tail -1 ~/.openclaw/workspace/agents/timcook/logs/north_star_daily.log" },
                  ]}
                />
                NS log không có row hôm nay → cron NS aggregator chết, xem area{" "}
                <a href="#timcook">Timcook</a> (nhánh NS log không update).
              </FixStep>
              <FixStep n={4}>
                Nếu agent restart xong vẫn không reply trong 15 phút tiếp theo → báo
                Phong / Bảo (Lark{" "}
                <TerminalInline>#openclaw-alerts</TerminalInline>).
              </FixStep>
            </>
          }
        />

        <DecisionBranch
          symptom="Click một nút trên CS dashboard mà không có gì xảy ra"
          cause="Vi phạm rule no-stub: tất cả button phải trigger real backend action. Nếu thấy dead click → bug, không phải user lỗi."
          severity="warn"
          fix={
            <>
              <FixStep n={1}>
                Mở DevTools → Network tab → click lại nút. Nếu không có request bay
                đi → handler client-side đang bị nuốt (regression). Báo dev kèm
                screenshot Network.
              </FixStep>
              <FixStep n={2}>
                Nếu có request mà trả 4xx/5xx → copy response error, kiểm tra area{" "}
                <a href="#supabase">Supabase</a> hoặc{" "}
                <a href="#project">Project</a> tuỳ status.
              </FixStep>
            </>
          }
        />
      </>
    ),
  },
  {
    id: "timcook",
    title: "Timcook — Mac mini & AI agent",
    subtitle:
      "Hạ tầng chạy trên Mac mini (timcook@100.94.220.128): tunnel, Colima, LaunchAgent, openclaw agent.",
    count: 5,
    content: (
      <>
        <p className="text-[13px] text-muted-foreground mb-4">
          Mọi thứ chạy trên Mac mini: Supabase self-host, Next.js web, Cloudflared
          tunnel, 33 LaunchAgent, 20 cron + AI agent openclaw. Khi 502 / cards $0 /
          agent silent → đào ở đây.
        </p>

        <DecisionBranch
          symptom="Dashboard cards show $0 / sections trống / spinner mãi không xong"
          cause="99% là Cloudflared tunnel ở Mac mini bị drop (ISP NAT timeout) HOẶC Colima Docker VM chưa start lại sau khi Mac mini reboot."
          severity="danger"
          fix={
            <>
              <FixStep n={1}>
                Probe trước:{" "}
                <TerminalInline>curl -I https://supabase.patiagency.com/rest/v1/</TerminalInline>{" "}
                — nếu 502 thì confirm tunnel down.
              </FixStep>
              <FixStep n={2}>
                SSH vào Mac mini:
                <Terminal
                  host="you@laptop"
                  cwd="~"
                  lines={[
                    { prompt: "$", cmd: "ssh timcook@100.94.220.128" },
                    { prompt: "timcook@mini $", cmd: "colima start   # nếu Docker chưa chạy" },
                    { prompt: "timcook@mini $", cmd: "pkill cloudflared" },
                    { prompt: "timcook@mini $", cmd: "nohup cloudflared tunnel run pati-supabase > ~/cloudflared.log 2>&1 &" },
                  ]}
                />
              </FixStep>
              <FixStep n={3}>
                Verify config có 3 setting quan trọng (đề phòng ai sửa nhầm):
                <Terminal
                  host="timcook@mini"
                  cwd="~"
                  title="~/.cloudflared/config.yml — 3 dòng quan trọng"
                  lines={[
                    { out: "edge-ip-version: \"4\"", tone: "ok" },
                    { out: "originRequest:" },
                    { out: "  tcpKeepAlive: 30s", tone: "ok" },
                    { out: "retries: 10", tone: "ok" },
                  ]}
                />
              </FixStep>
              <FixStep n={4}>
                Quay lại laptop, chạy lại curl ở step 1 → phải thấy 200/401.
              </FixStep>
              <FixSuccess>
                <TerminalInline>HTTP/2 200</TerminalInline> hoặc <TerminalInline>401</TerminalInline>
              </FixSuccess>
            </>
          }
        />

        <DecisionBranch
          symptom="Mac mini reboot xong dashboard im luôn"
          cause="Colima auto-start đã được setup (LaunchAgent com.user.colima) — đáng ra nó tự lên. Nếu vẫn im, hoặc launchd fail (xem colima-autostart.err.log), hoặc lima/limactl symlink Homebrew bị broken sau update."
          severity="warn"
          fix={
            <>
              <FixStep n={1}>SSH vào Mac mini.</FixStep>
              <FixStep n={2}>
                Check log launchd:{" "}
                <TerminalInline>tail ~/Library/Logs/colima-autostart.err.log</TerminalInline>.
              </FixStep>
              <FixStep n={3}>
                Nếu thấy lỗi <em>&quot;lima not found&quot;</em>, sửa Homebrew:{" "}
                <TerminalInline>brew reinstall lima</TerminalInline>.
              </FixStep>
              <FixStep n={4}>
                Kick lại LaunchAgent:{" "}
                <TerminalInline>
                  launchctl kickstart -k gui/$(id -u)/com.user.colima
                </TerminalInline>{" "}
                hoặc fallback chạy tay <TerminalInline>colima start</TerminalInline>.
              </FixStep>
              <FixStep n={5}>
                Confirm containers chạy:{" "}
                <TerminalInline>docker ps | grep supabase</TerminalInline> — phải có{" "}
                <TerminalInline>supabase-rest</TerminalInline>,{" "}
                <TerminalInline>supabase-db</TerminalInline>.
              </FixStep>
              <FixSuccess>
                <TerminalInline>docker ps</TerminalInline> liệt kê ≥ 5 supabase-* containers
              </FixSuccess>
            </>
          }
        />

        <DecisionBranch
          symptom="Build OK nhưng https://pnl.patigroup.com trả 502"
          cause="Next.js service (com.pati.web LaunchAgent) hoặc Cloudflared ingress trên Mac mini không route được tới 127.0.0.1:3000."
          severity="warn"
          fix={
            <>
              <FixStep n={1}>
                Check local service:{" "}
                <TerminalInline>curl -sf http://127.0.0.1:3000/api/health</TerminalInline>{" "}
                trên Mac mini.
              </FixStep>
              <FixStep n={2}>
                Check launchd:{" "}
                <TerminalInline>launchctl print gui/$(id -u)/com.pati.web</TerminalInline>.
              </FixStep>
              <FixStep n={3}>
                Nếu local OK nhưng public 502, restart cloudflared và verify ingress có{" "}
                <TerminalInline>pnl.patigroup.com → http://localhost:3000</TerminalInline>.
              </FixStep>
            </>
          }
        />

        <DecisionBranch
          symptom="north_star_daily.log không có dòng mới hôm nay / NS metrics đứng yên"
          cause="Cron NS aggregator (08:30 ICT) fail, hoặc upstream tracker (frt_tracker.py mỗi 15') không log. Symptom phụ: CS overview thấy số NS lùi 1+ ngày."
          severity="warn"
          fix={
            <>
              <FixStep n={1}>
                SSH Mac mini, check log mới nhất:
                <Terminal
                  host="timcook@mini"
                  cwd="~"
                  lines={[
                    { prompt: "$", cmd: "tail -3 ~/.openclaw/workspace/agents/timcook/logs/north_star_daily.log" },
                    { prompt: "$", cmd: "ls -lt ~/.openclaw/workspace/agents/timcook/logs/ | head -10" },
                  ]}
                />
                Dòng cuối &gt; 24h → cron NS chết.
              </FixStep>
              <FixStep n={2}>
                Coi crontab agent, chạy aggregator thủ công xem có lỗi gì:
                <Terminal
                  host="timcook@mini"
                  cwd="~"
                  lines={[
                    { prompt: "$", cmd: "crontab -l | grep north_star" },
                    { prompt: "$", cmd: "cd ~/.openclaw/workspace/agents/timcook && python3 scripts/north_star_daily.py" },
                  ]}
                />
              </FixStep>
              <FixStep n={3}>
                Nếu upstream (frt_tracker, otif_tracker) chết → restart LaunchAgent
                tương ứng. Tham khảo bảng services ở{" "}
                <a href="/docs/timcook-agent#services">Timcook Agent → Mac mini services</a>.
              </FixStep>
            </>
          }
        />

        <DecisionBranch
          symptom="openclaw agent stuck — không phản hồi cron tick, không reply tin"
          cause="LaunchAgent ai.openclaw.* crashed, hoặc bridge JS hang. Khác với FRT spike (cron NS chậm); đây là agent process chính chết."
          severity="danger"
          fix={
            <>
              <FixStep n={1}>
                SSH Mac mini, list tất cả service openclaw + check exit code:
                <Terminal
                  host="timcook@mini"
                  cwd="~"
                  lines={[
                    { prompt: "$", cmd: "launchctl list | grep -E 'ai.openclaw' | awk '{print $1, $2, $3}'" },
                    { divider: true, label: "đọc cột 2" },
                    { out: "0    → process đang chạy bình thường", tone: "ok" },
                    { out: "-    → idle (không bật / không thuộc keepalive) — OK với cron job", tone: "ok" },
                    { out: "1+   → exited non-zero, crashed", tone: "err" },
                  ]}
                />
              </FixStep>
              <FixStep n={2}>
                Kickstart service nào crashed:
                <Terminal
                  host="timcook@mini"
                  cwd="~"
                  lines={[
                    { prompt: "$", cmd: "launchctl kickstart -k gui/$(id -u)/ai.openclaw.<label>" },
                  ]}
                />
              </FixStep>
              <FixStep n={3}>
                Xem stderr gần nhất nếu vẫn fail:
                <Terminal
                  host="timcook@mini"
                  cwd="~"
                  lines={[
                    { prompt: "$", cmd: "tail -50 ~/.openclaw/logs/openclaw.err.log" },
                  ]}
                />
              </FixStep>
              <FixStep n={4}>
                Restart 2 lần vẫn die → báo Phong. Đừng tự sửa patch agent.
              </FixStep>
            </>
          }
        />
      </>
    ),
  },
  {
    id: "supabase",
    title: "Supabase — data layer",
    subtitle:
      "Schema master_app + PostgREST self-host. 2 bẫy cố hữu: schema cache lag và 1000-row cap.",
    count: 3,
    content: (
      <>
        <p className="text-[13px] text-muted-foreground mb-4">
          Schema chính là <TerminalInline>master_app</TerminalInline> (không phải{" "}
          <TerminalInline>public</TerminalInline>). PostgREST self-host có 2 bẫy cố
          hữu: schema cache lag và 1000-row cap.
        </p>

        <DecisionBranch
          symptom="Cards hiển thị số cũ, refresh không update"
          cause="PostgREST schema cache lag — self-host có thể chậm 6-15 phút sau khi thêm column/constraint. Hoặc React Query stale-time chưa expire."
          severity="warn"
          fix={
            <>
              <FixStep n={1}>
                Restart PostgREST trên Mac mini:
                <Terminal
                  host="timcook@mini"
                  cwd="~"
                  lines={[
                    { prompt: "$", cmd: "docker restart supabase-rest" },
                  ]}
                />
              </FixStep>
              <FixStep n={2}>
                Hoặc fallback gọi RPC trực tiếp (ví dụ{" "}
                <TerminalInline>upsert_ad_spend_batch</TerminalInline>) để bypass cache.
              </FixStep>
              <FixStep n={3}>
                Ở UI: invalidate query key thủ công (React Query devtools → Invalidate).
              </FixStep>
            </>
          }
        />

        <DecisionBranch
          symptom="supabase-js trả về [] giống empty table, mà data thật có"
          cause="Quên pass db: { schema: 'master_app' } khi createClient. supabase-js default Accept-Profile: public → PostgREST đọc schema public (rỗng) → trả [] đẹp như empty thật."
          severity="danger"
          fix={
            <>
              <FixStep n={1}>
                Mở <TerminalInline>src/lib/supabase.ts</TerminalInline>, verify{" "}
                <TerminalInline>db: {`{ schema: "master_app" }`}</TerminalInline> có trong{" "}
                createClient options.
              </FixStep>
              <FixStep n={2}>
                Test bằng service-role key. Nếu vẫn [] thì data thật là rỗng, không phải bug.
                Nếu thấy data → là RLS trap (xem nhánh kế tiếp).
              </FixStep>
              <FixStep n={3}>
                Nếu là RLS trap: add policy:
                <Terminal
                  host="postgres"
                  cwd="psql"
                  lines={[
                    { prompt: "psql>", cmd: "CREATE POLICY anon_read ON master_app.<table>" },
                    { prompt: "psql>", cmd: "  FOR SELECT TO anon USING (true);" },
                  ]}
                />
              </FixStep>
            </>
          }
        />

        <DecisionBranch
          symptom="Refund-rate hoặc aggregate nào đó lệch lạ (ví dụ 34% thay vì 5%)"
          cause="PostgREST silent cap PGRST_DB_MAX_ROWS = 1000. Bare .select() truncate ở row thứ 1000 KHÔNG báo gì."
          severity="danger"
          fix={
            <>
              <FixStep n={1}>
                Tìm chỗ query trong code, replace <TerminalInline>.select()</TerminalInline> bare
                bằng <TerminalInline>pageAll()</TerminalInline> helper:
              </FixStep>
              <FixStep n={2}>
                <Terminal
                  host="you@laptop"
                  cwd="~"
                  title="src/lib/supabase.ts"
                  lines={[
                    { out: "import { pageAll } from \"@/lib/supabase\";" },
                    { out: "" },
                    { out: "const refunds = await pageAll(supabase" },
                    { out: "  .from(\"raw_refunds\")" },
                    { out: "  .select(\"id, amount, created_at\")" },
                    { out: "  .gte(\"created_at\", startISO));", tone: "ok" },
                  ]}
                />
              </FixStep>
              <FixStep n={3}>
                Hoặc band-aid: <TerminalInline>.range(0, 9999)</TerminalInline>.
              </FixStep>
            </>
          }
        />
      </>
    ),
  },
  {
    id: "project",
    title: "Project — Next.js app, deploy & integrations",
    subtitle:
      "Code repo này: web app, env config, deploy pipeline, webhook handler, analytics parity.",
    count: 9,
    content: (
      <>
        <p className="text-[13px] text-muted-foreground mb-4">
          Bug ở đây là bug code/config, không phải hạ tầng. Chia 3 cụm: deploy/env,
          webhook/integration, analytics/parity.
        </p>

        <h3 className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mt-2 mb-3">
          Deploy / env
        </h3>

        <DecisionBranch
          symptom="GitHub Actions deploy Mac mini fail / production không đổi sau khi push"
          cause="Working-tree drift hoặc deploy-web.sh không fast-forward được. Mac mini chỉ deploy code đã commit/push lên origin/main."
          severity="danger"
          fix={
            <>
              <FixStep n={1}>
                Local: <TerminalInline>git status --porcelain</TerminalInline> phải sạch hoặc
                chỉ có file unrelated.
              </FixStep>
              <FixStep n={2}>
                Nếu có M file mà HEAD reference: <strong>commit</strong> hoặc{" "}
                <strong>revert</strong>, đừng để treo.
              </FixStep>
              <FixStep n={3}>
                <TerminalInline>bun run typecheck</TerminalInline> phải xanh local.
              </FixStep>
              <FixStep n={4}>
                Re-deploy explicit (đừng đợi auto):{" "}
                <TerminalInline>DEPLOY_BRANCH=main bash scripts/macmini-stack/deploy-web.sh --force</TerminalInline>{" "}
                trên Mac mini.
              </FixStep>
            </>
          }
        />

        <DecisionBranch
          symptom="NEXT_PUBLIC_X mới add nhưng client vẫn dùng giá trị cũ"
          cause="NEXT_PUBLIC_* được inline vào client bundle ở build time. Đổi .env trên Mac mini KHÔNG tự rebuild."
          severity="info"
          fix={
            <>
              <FixStep n={1}>
                Sau khi đổi <TerminalInline>NEXT_PUBLIC_X</TerminalInline> →{" "}
                <strong>buộc phải</strong>{" "}
                <TerminalInline>bash scripts/macmini-stack/deploy-web.sh --force</TerminalInline>{" "}
                để rebuild + restart.
              </FixStep>
              <FixStep n={2}>
                Server-side vars cũng nên restart <TerminalInline>com.pati.web</TerminalInline> để
                process đọc lại env rõ ràng.
              </FixStep>
            </>
          }
        />

        <DecisionBranch
          symptom="Prod env đổi rồi nhưng API vẫn đọc giá trị cũ"
          cause="Mac mini web process đọc .env lúc start. Đổi file env mà không restart thì process cũ vẫn giữ giá trị cũ."
          severity="warn"
          fix={
            <>
              <FixStep n={1}>
                Sửa đúng nguồn env production:
                <Terminal
                  host="timcook@mini"
                  cwd="~/Coding_workspace/PATI/pati-master-app"
                  lines={[
                    { prompt: "$", cmd: "nano .env" },
                    { prompt: "$", cmd: "nano ~/pati-supabase/cron/.env.web   # prod override nếu có" },
                  ]}
                />
              </FixStep>
              <FixStep n={2}>
                Restart rõ ràng:{" "}
                <TerminalInline>bash scripts/macmini-stack/deploy-web.sh --force</TerminalInline>{" "}
                hoặc <TerminalInline>launchctl kickstart -k gui/$(id -u)/com.pati.web</TerminalInline>.
              </FixStep>
            </>
          }
        />

        <DecisionBranch
          symptom="Auto-deploy GitHub → Mac mini không trigger"
          cause="GitHub Actions deploy-macmini không chạy, hoặc fail ở bước Tailscale/SSH."
          severity="info"
          fix={
            <>
              <FixStep n={1}>
                Mở Actions → <TerminalInline>Deploy to Mac mini</TerminalInline>. Nếu cần, chạy{" "}
                <TerminalInline>workflow_dispatch</TerminalInline> thủ công hoặc SSH vào Mac mini
                chạy <TerminalInline>deploy-web.sh --force</TerminalInline>.
              </FixStep>
            </>
          }
        />

        <h3 className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mt-6 mb-3">
          Webhook / integration
        </h3>

        <DecisionBranch
          symptom="Shopify webhook 401 / HMAC fail trong web logs"
          cause="SHOPIFY_API_SECRET không match secret của Lark Integration custom app (KHÔNG phải public app)."
          severity="warn"
          fix={
            <>
              <FixStep n={1}>
                Shopify Admin → <strong>Develop apps</strong> → chọn <strong>Lark Integration</strong>{" "}
                (không phải app khác) → <strong>API credentials</strong> tab.
              </FixStep>
              <FixStep n={2}>
                Click <strong>Reveal token once</strong> ở phần <em>API secret key</em> — copy ngay
                (chỉ show 1 lần).
              </FixStep>
              <FixStep n={3}>
                <Terminal
                  host="timcook@mini"
                  cwd="~/Coding_workspace/PATI/pati-master-app"
                  lines={[
                    { prompt: "$", cmd: "nano ~/pati-supabase/cron/.env.web   # SHOPIFY_API_SECRET=shpss_xxx" },
                    { prompt: "$", cmd: "bash scripts/macmini-stack/deploy-web.sh --force" },
                  ]}
                />
              </FixStep>
            </>
          }
        />

        <DecisionBranch
          symptom="ChargeFlow sync bắt đầu 401 toàn bộ"
          cause="Session cookie hết hạn (~30 ngày). UI-API path dùng cookie không phải HMAC."
          severity="warn"
          fix={
            <>
              <FixStep n={1}>
                SSH vào Mac mini, mở Chrome đã pin profile:
                <Terminal
                  host="timcook@mini"
                  cwd="~"
                  lines={[
                    { prompt: "$", cmd: "~/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome \\" },
                    { prompt: "", cmd: "  --remote-debugging-port=9222 \\" },
                    { prompt: "", cmd: "  --user-data-dir=$HOME/.chargeflow-chrome" },
                  ]}
                />
              </FixStep>
              <FixStep n={2}>
                Login ChargeFlow bằng tay → DevTools → Application → Cookies → copy{" "}
                <TerminalInline>__session</TerminalInline> value.
              </FixStep>
              <FixStep n={3}>
                <Terminal
                  host="timcook@mini"
                  cwd="~/Coding_workspace/PATI/pati-master-app"
                  lines={[
                    { prompt: "$", cmd: "nano ~/pati-supabase/cron/.env.web   # CHARGEFLOW_UI_COOKIE=<cookie value>" },
                    { prompt: "$", cmd: "bash scripts/macmini-stack/deploy-web.sh --force" },
                  ]}
                />
              </FixStep>
              <FixSuccess>
                Cron 5-phút tiếp theo sync xanh, sync_logs có status &quot;completed&quot;
              </FixSuccess>
            </>
          }
        />

        <h3 className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mt-6 mb-3">
          Analytics / parity
        </h3>

        <DecisionBranch
          symptom="Calendar onChange chọn nhầm 1 ngày (chọn 18, lưu 17)"
          cause="toISOString().slice(0,10) shift UTC. Click 18 ở UTC+7 → ISO UTC → 17."
          severity="warn"
          fix={
            <>
              <FixStep n={1}>
                Replace toàn bộ <TerminalInline>toISOString().slice(0,10)</TerminalInline> trong
                calendar handler bằng <TerminalInline>format(d, &apos;yyyy-MM-dd&apos;)</TerminalInline>{" "}
                từ date-fns (tôn trọng local tz).
              </FixStep>
            </>
          }
        />

        <DecisionBranch
          symptom="Recharge subscription metrics lệch vài đơn vị"
          cause="Recharge trả naive ISO (không có Z), Node parse thành local-PDT → bucket shift theo shop tz → cancelled_subs undercount."
          severity="warn"
          fix={
            <>
              <FixStep n={1}>
                Set env: <TerminalInline>RECHARGE_BUCKET_TZ=&quot;+00:00&quot;</TerminalInline>.
              </FixStep>
              <FixStep n={2}>
                Verify handler dùng env này khi bucket: grep{" "}
                <TerminalInline>RECHARGE_BUCKET_TZ</TerminalInline> trong{" "}
                <TerminalInline>src/lib/analytics/</TerminalInline>.
              </FixStep>
            </>
          }
        />

        <DecisionBranch
          symptom="Analytics card $0 cho Recharge / PG / COGS / Shipping (mà nguồn có data)"
          cause="Stale tw-dump/live-audit/<today>_*.json captured pre-dawn — override live data via setAuditedMetric."
          severity="warn"
          fix={
            <>
              <FixStep n={1}>
                Check function <TerminalInline>readTwAuditMetricSums</TerminalInline> phải return{" "}
                <TerminalInline>null</TerminalInline> nếu không có non-zero bucket. Commit{" "}
                <TerminalInline>978e02b</TerminalInline> đã fix — verify nhánh hiện tại đã merge.
              </FixStep>
            </>
          }
        />

        <DecisionBranch
          symptom="Refund amount = 0 cho restock refunds (drift 0.5-2%)"
          cause="Bulk-parse path overwrite correct values với 0. Restock refunds chiếm ~52% của 30-day window."
          severity="warn"
          fix={
            <>
              <FixStep n={1}>
                Có DB trigger preserve non-zero amount đã được setup. Verify trigger tồn tại:
                <Terminal
                  host="postgres"
                  cwd="psql"
                  lines={[
                    { prompt: "psql>", cmd: "\\dt master_app.raw_refunds" },
                    { prompt: "psql>", cmd: "SELECT * FROM pg_trigger WHERE tgrelid = 'master_app.raw_refunds'::regclass;" },
                  ]}
                />
              </FixStep>
              <FixStep n={2}>
                Đừng kết luận &quot;FX noise&quot; trước khi check{" "}
                <TerminalInline>raw_refunds WHERE amount = 0</TerminalInline> count.
              </FixStep>
            </>
          }
        />
      </>
    ),
  },
];

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Reference"
        title="Troubleshooting"
        description="4 mục dropdown theo area: CS (operational) · Timcook (Mac mini & agent) · Supabase (data layer) · Project (app & deploy). Click vào mục mình cần."
      />

      {/* ─────────── USER MODE ─────────── */}
      <section data-user-detail>
        <h2 id="user-what">Khi gặp lỗi</h2>
        <p>
          Trước khi báo dev, làm 2 việc giúp khoanh nhanh vấn đề:
        </p>
        <ol>
          <li>Reload lại trang. Một số lỗi do mạng tạm thời.</li>
          <li>Mở thử trang khác trên dashboard — nếu cũng lỗi, khả năng tunnel hoặc Mac mini có vấn đề.</li>
        </ol>
        <h2 id="user-when-call">Khi nào báo dev</h2>
        <ul>
          <li>Lỗi kéo dài &gt; 5 phút trên nhiều trang.</li>
          <li>Số liệu hiển thị bất thường (âm, 0, hoặc lệch quá xa).</li>
          <li>Một nút bấm không phản hồi.</li>
          <li>Email khách vào Lark Mail &gt; 30 phút nhưng dashboard chưa thấy.</li>
          <li>Timcook im hơn vài tiếng / nhiều ticket overdue mà chưa được reply.</li>
        </ul>
      </section>

      {/* ─────────── DEV MODE ─────────── */}
      <section data-dev-detail>
        <ProbeFirst>
          Khi dashboard hỏng / cards $0 / API trả lỗi, <strong>luôn luôn</strong> chạy lệnh
          sau ĐẦU TIÊN. Nếu trả 502, tunnel Mac mini down — fix tunnel xong mọi thứ khác
          sẽ tự ổn:
          <Terminal
            host="you@laptop"
            cwd="~"
            lines={[
              { prompt: "$", cmd: "curl -I https://supabase.patiagency.com/rest/v1/" },
              { divider: true, label: "diễn giải" },
              { out: "HTTP/2 200  →  Tunnel OK, đào tiếp", tone: "ok" },
              { out: "HTTP/2 401  →  Tunnel OK, đào tiếp (401 do thiếu key, không lỗi)", tone: "ok" },
              { out: "HTTP/2 502  →  Tunnel DOWN, mở mục Timcook bên dưới", tone: "err" },
            ]}
          />
        </ProbeFirst>

        <DecisionStart question="Bạn thấy triệu chứng gì?">
          Click vào 1 trong 4 mục bên dưới để expand. Cross-link giữa các mục (vd CS
          → Supabase) sẽ tự mở mục đích khi click.
        </DecisionStart>

        <TroubleshootAccordion sections={sections} />

        <h2 id="last-resort">Khi mọi cách đều fail</h2>
        <HealthCheckGrid
          title="3 chỗ tra cuối cùng trước khi ping Phong"
          probes={[
            {
              label: "Sync logs trong DB",
              cmd: "psql> SELECT * FROM master_app.sync_logs ORDER BY started_at DESC LIMIT 10;",
              expect: "Error message thường nói rõ root cause",
              badResult: "Empty",
              badMeans: "pipeline chưa từng chạy → vấn đề ở cron, không phải data",
            },
            {
              label: "GitNexus (impact analysis)",
              cmd: "npx gitnexus query \"your concept\"   # chạy trong repo pati-master-app",
              expect: "Process-grouped results — dẫn về đúng module liên quan",
            },
            {
              label: "Git log + commit messages",
              cmd: "git log --oneline --all | grep -i \"<keyword bạn nghi\\>\"",
              expect: "Phong viết commit kỹ — thường đã có ghi chú về incident tương tự",
            },
          ]}
        />
      </section>

      <PageNav href="/docs/troubleshooting" />
    </>
  );
}
