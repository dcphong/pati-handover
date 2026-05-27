// Snapshot of the timcook agent + Mac mini host as of 2026-05-27.
// Sourced live from: launchctl list, crontab -l, ~/.cloudflared/config.yml,
// docker ps, and ~/.openclaw/workspace/agents/timcook/{AGENTS,SOUL,HEARTBEAT,
// IDENTITY}.md + skills/SKILL_INDEX.md.

// ─── CANVAS ──────────────────────────────────────────────────────────────

export type CanvasNode = {
  id: string;
  type: "group" | "file" | "text";
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string; // group only
  file?: string; // file-link only — resolved to in-page anchor
  text?: string; // text card only (mini-markdown)
  group?: "brain" | "infra" | "ext"; // visual tone for group nodes
};

export type CanvasEdge = {
  id: string;
  fromNode: string;
  fromSide: "top" | "bottom" | "left" | "right";
  toNode: string;
  toSide: "top" | "bottom" | "left" | "right";
  label?: string;
};

export const canvasNodes: CanvasNode[] = [
  // Groups (render lowest z-index)
  { id: "g_brain", type: "group", group: "brain", label: "timcook — Agent Brain", x: -1200, y: -1280, width: 2400, height: 900 },
  { id: "g_infra", type: "group", group: "infra", label: "Mac mini Infrastructure (host)", x: -1200, y: -360, width: 2400, height: 600 },
  { id: "g_ext",   type: "group", group: "ext",   label: "External Systems", x: -1200, y: 260, width: 2400, height: 380 },

  // Brain — top row of section links (file-link, không edges nối nhau — MECE)
  { id: "n_readme",         type: "file", file: "#overview",  x: -360,  y: -1260, width: 720, height: 80 },
  { id: "n_persona",        type: "file", file: "#persona",   x: -930,  y: -1140, width: 380, height: 100 },
  { id: "n_skills",         type: "file", file: "#skills",    x: -490,  y: -1140, width: 380, height: 100 },
  { id: "n_crons",          type: "file", file: "#crons",     x: -50,   y: -1140, width: 380, height: 100 },
  { id: "n_runbook_brain",  type: "file", file: "#runbook",   x: 390,   y: -1140, width: 380, height: 100 },

  // Brain — persona text cards
  {
    id: "n_hs", type: "text", x: -1140, y: -1010, width: 460, height: 200,
    text:
      "### 🚫 Hard stops\n" +
      "- Không lộ PII ra ngoài email khách đã verify\n" +
      "- Không refund vượt quyền\n" +
      "- Không cancel sub < 120 ngày (policy sếp)\n" +
      "- Không claim 'đã refund' khi chưa có API confirm\n" +
      "- Không trả lời khách bằng ngôn ngữ khác\n" +
      "- Không nói tên tool nội bộ với khách",
  },
  {
    id: "n_ns", type: "text", x: -660, y: -1010, width: 460, height: 200,
    text:
      "### 🎯 North Stars\n" +
      "- NS#1 FRT < 7 phút\n" +
      "- NS#2 OTIF ≥ 98 %\n" +
      "- NS#3 Refund < 3 %\n" +
      "- NS#3b Dispute < 0.15 %\n" +
      "- NS#4 Churn 5–7 %\n" +
      "- NS#5 Processing > 90 %\n" +
      "- NS#6 Stock cover > 95 %",
  },
  {
    id: "n_lark", type: "text", x: -180, y: -1010, width: 480, height: 220,
    text:
      "### 📨 Luật gửi Lark\n" +
      "Text assistant một mình **KHÔNG tới khách**.\n" +
      "→ Phải gọi tool **message** với channel:feishu + chat_id + body.\n" +
      "\n" +
      "Allow-list @-mention (3 sender):\n" +
      "- 1285148724 → @AntiSocialMedi4 (Phong)\n" +
      "- 8541694972 → @Tranphamhoaibao (Bảo)\n" +
      "- 5950274404 → @kevinkreativework (Kevin, sếp)",
  },
  {
    id: "n_silent", type: "text", x: 320, y: -1010, width: 460, height: 200,
    text:
      "### 🤐 Im lặng khi cron rỗng\n" +
      "Cron không kèm tin cụ thể → **kết lượt rỗng**, không gọi tool.\n" +
      "\n" +
      "Cấm filler: 'checking in', 'monitoring', 'All systems normal', 'Standing by'.\n" +
      "\n" +
      "Vụ 2026-05-06: 4 tin spam giống hệt nhau trong 5 phút.",
  },

  // Brain — skill row
  {
    id: "n_skills_d", type: "text", x: -1140, y: -790, width: 1920, height: 200,
    text:
      "### 🛠 19 skill (MECE — SKILL_INDEX.md tự route)\n" +
      "**Tin từ khách (agent)**: refund-flow · cancellation-retention · wismo · failed-deliveries · address-email-protocol · sentiment-handling · escalation-protocol · chargeflow-collect-evidence · csat-collection · best-3pl × 3 · held-order-release · amazon-orders\n" +
      "**Runbook cho operator**: bridge-crash-recovery · stuck-case-reprocess · report-verification\n" +
      "**Meta (self-discipline)**: context-discipline (luôn chạy — chống hallucination)\n" +
      "**Bridge JS (chỉ docs)**: spam-classification",
  },

  // Infra — section anchors (MECE, không nối edges sang nhau)
  { id: "n_services", type: "file", file: "#services", x: -1000, y: -340, width: 470, height: 80 },
  { id: "n_tunnel",   type: "file", file: "#tunnel",   x: -500,  y: -340, width: 470, height: 80 },
  { id: "n_supabase", type: "file", file: "#supabase", x: 0,     y: -340, width: 470, height: 80 },

  // Infra — service cards
  {
    id: "n_web", type: "text", x: -1140, y: -220, width: 360, height: 130,
    text:
      "### com.pati.web\n**:3000** → Next.js\nKeepAlive · pnl.patigroup.com\nworking dir = ~/Coding_workspace/PATI/shopify-lark-sync",
  },
  {
    id: "n_cf_trig", type: "text", x: -750, y: -220, width: 360, height: 130,
    text: "### chargeflow-trigger-server\n**:9876** · KeepAlive\nHTTP HMAC endpoint cho nút 'Sync now' của UI",
  },
  {
    id: "n_cf_chrome", type: "text", x: -360, y: -220, width: 360, height: 130,
    text:
      "### Chrome CDP\n**:9222 · :9223**\nSession scrape ChargeFlow UI\nsession-warmer giữ cookie ấm mỗi 20 phút",
  },
  {
    id: "n_caddy", type: "text", x: 30, y: -220, width: 360, height: 130,
    text:
      "### Caddy → Supabase\n**:8000** → 8 container Docker\ndb · pooler · rest · storage · studio · meta · caddy · imgproxy\nSchema: **master_app** (không phải public)",
  },
  {
    id: "n_cflared", type: "text", x: 420, y: -220, width: 360, height: 150,
    text:
      "### cloudflared (pati-supabase)\nhttp/2 · IPv4 · keepalive 30s\n→ **supabase.patiagency.com** → :8000\n→ **chargeflow-trigger.patiagency.com** → :9876\n→ **pnl.patigroup.com** (PROD) → :3000\n→ pnl-staging.* → :3000",
  },
  {
    id: "n_launchd", type: "text", x: -1140, y: -60, width: 1920, height: 240,
    text:
      "### 🛎 33 LaunchAgent + 20 cron pipeline\n" +
      "**KeepAlive**: web · chargeflow-trigger · openclaw gateway · cloudflared · ollama · email-bridge · paperclip · colima\n" +
      "**Interval 300 s**: sync-chargeflow-ui · sync-disputes-first-party · sync-lark-mail · probe-tunnel\n" +
      "**Mỗi giờ**: sync-shopify · sync-shopify-legacy · sync-payments · sync-providers · submit-stuck-fulfillments · resend-address\n" +
      "**Hàng ngày 05h ICT**: shopify-products · shopify-larkbase (5h+13h) · stock-cover · fulfillment · processing · delivery\n" +
      "**Hàng ngày 06h**: sync-cogs-full · sync-flexport · vnh-daily\n" +
      "**Cron của agent**: 15 phút FRT · 6 giờ OTIF · 08:30 NS hàng ngày · 09:00 failed-deliveries+amazon · 06/12/18 held-orders · 04:00 mem-size · CN eval-suite · T2 eval",
  },

  // External
  { id: "n_lark_api",   type: "text", x: -1140, y: 290, width: 360, height: 110, text: "### Lark / Feishu\nMail + Base + bot\n2 app (mail-scope vs generic)" },
  { id: "n_shopify",    type: "text", x: -750,  y: 290, width: 360, height: 110, text: "### Shopify\nAdmin GraphQL + webhook\nCustom App 'Lark Integration' (nguồn HMAC)" },
  { id: "n_recharge",   type: "text", x: -360,  y: 290, width: 360, height: 110, text: "### Recharge + Klaviyo\nSub (policy 4 tháng)\nBucketing UTC bắt buộc" },
  { id: "n_chargeflow", type: "text", x: 30,    y: 290, width: 360, height: 110, text: "### ChargeFlow\nScrape UI qua Chrome CDP\n+ fallback public-API" },
  { id: "n_flexport",   type: "text", x: 420,   y: 290, width: 360, height: 110, text: "### Flexport + 17track\nLogistics + event tracking" },
  { id: "n_tailscale",  type: "text", x: -1140, y: 410, width: 360, height: 100, text: "### Tailscale\n100.94.220.128 kevins-mac-mini\nĐường SSH vào máy" },
  { id: "n_cf_edge",    type: "text", x: -750,  y: 410, width: 360, height: 100, text: "### Cloudflare Edge\nDNS + termination tunnel (patiagency.com)" },
  { id: "n_godaddy",    type: "text", x: -360,  y: 410, width: 360, height: 100, text: "### GoDaddy DNS\npatigroup.com (chỉ thêm — không sửa root/MX/TXT)" },
  { id: "n_meta_etc",   type: "text", x: 30,    y: 410, width: 360, height: 100, text: "### Meta · Google · TikTok · MS · AppLovin · GA · GSC\nSync ad-spend + analytics" },
  { id: "n_amazon",     type: "text", x: 420,   y: 410, width: 360, height: 100, text: "### Amazon\nĐơn (Shockwave) + tracking" },
];

// MECE canvas: skills · workflows · file-link cards là HẠT ĐỘC LẬP, không nối
// nhau bằng arrow. Edges chỉ giữ những quan hệ data-flow / kiến trúc THẬT giữa
// các text-card hạ tầng và external systems. Section anchors (file-link cards
// như persona/skills/crons/services/tunnel/supabase) không có edge nào.
export const canvasEdges: CanvasEdge[] = [
  // Cloudflared tunnel topology — request đi từ edge xuống service nội bộ
  { id: "e20", fromNode: "n_cflared", fromSide: "left", toNode: "n_web",     toSide: "right", label: "pnl.patigroup.com" },
  { id: "e21", fromNode: "n_cflared", fromSide: "left", toNode: "n_cf_trig", toSide: "right", label: "chargeflow-trigger" },
  { id: "e22", fromNode: "n_cflared", fromSide: "left", toNode: "n_caddy",   toSide: "right", label: "supabase.patiagency.com" },

  // Chrome CDP feed vào chargeflow-trigger HTTP server
  { id: "e23", fromNode: "n_cf_chrome", fromSide: "right", toNode: "n_cf_trig", toSide: "left", label: "CDP" },

  // Web app đọc DB qua Caddy
  { id: "e24", fromNode: "n_caddy", fromSide: "left", toNode: "n_web", toSide: "right", label: "DB master_app" },

  // Tunnel daemon nối ra Cloudflare edge
  { id: "e30", fromNode: "n_cflared", fromSide: "bottom", toNode: "n_cf_edge", toSide: "top", label: "http/2 v4" },

  // Launchd cron pipelines fan-out tới external systems (data flow OUT)
  { id: "e31", fromNode: "n_launchd", fromSide: "bottom", toNode: "n_shopify",    toSide: "top", label: "sync-shopify*" },
  { id: "e32", fromNode: "n_launchd", fromSide: "bottom", toNode: "n_recharge",   toSide: "top", label: "sync-providers" },
  { id: "e33", fromNode: "n_launchd", fromSide: "bottom", toNode: "n_chargeflow", toSide: "top", label: "sync-chargeflow-ui 5m" },
  { id: "e34", fromNode: "n_launchd", fromSide: "bottom", toNode: "n_lark_api",   toSide: "top", label: "sync-lark-mail 5m" },
  { id: "e35", fromNode: "n_launchd", fromSide: "bottom", toNode: "n_flexport",   toSide: "top", label: "sync-flexport" },
  { id: "e36", fromNode: "n_launchd", fromSide: "bottom", toNode: "n_meta_etc",   toSide: "top", label: "sync-providers" },
  { id: "e37", fromNode: "n_launchd", fromSide: "bottom", toNode: "n_amazon",     toSide: "top", label: "amazon-orders 09/15" },
];

// ─── SKILLS ──────────────────────────────────────────────────────────────

export type SkillAudience = "agent" | "meta" | "operator" | "code";
export type SkillRow = {
  n: number;
  name: string;
  audience: SkillAudience;
  triggers: string;
  notes?: string;
};

// Trigger giữ nguyên multilingual keyword vì đó là từ thật khách viết EN/DE/FR/IT/ES
// (agent matching dựa vào chuỗi gốc, không phải mô tả).
export const skills: SkillRow[] = [
  { n: 1, name: "refund-flow", audience: "agent", triggers: "refund · money back · rückerstattung · rimborso · geld zurück", notes: "BẮT BUỘC gọi API confirm trước khi báo cho khách là đã refund" },
  { n: 2, name: "cancellation-retention", audience: "agent", triggers: "cancel · kündig · abbestell · annuler · ακύρωση · stornier", notes: "Orchestrator. Hard stop: sub < 120 ngày không được hủy" },
  { n: 3, name: "wismo", audience: "agent", triggers: "where is my order · tracking · has it shipped · lieferung", notes: "Tra 17track + Shopify + Best 3PL" },
  { n: 4, name: "failed-deliveries", audience: "agent", triggers: "not delivered · returned to sender · lost in transit", notes: "Cron 09:00 hàng ngày chạy pipeline" },
  { n: 5, name: "address-email-protocol", audience: "agent", triggers: "wrong address · change shipping · update address", notes: "Resend address sync chạy mỗi giờ" },
  { n: 6, name: "sentiment-handling", audience: "agent", triggers: "angry · frustrated · urgent · upset · verärgert", notes: "Gate cảm xúc — chạy ĐẦU TIÊN trước skill khác" },
  { n: 7, name: "escalation-protocol", audience: "agent", triggers: "legal · lawyer · medical · authority · FTC · complaint board", notes: "Router Category A vs B" },
  { n: 8, name: "chargeflow-collect-evidence", audience: "agent", triggers: "chargeback · dispute · Stripe Chargeflow notification", notes: "Trigger Chrome CDP qua :9222/:9223" },
  { n: 9, name: "csat-collection", audience: "agent", triggers: "khảo sát hậu xử lý sau refund/cancel/shipped" },
  { n: 10, name: "best-3pl-protocol", audience: "agent", triggers: "Best 3PL routing đơn hàng · routing B2B" },
  { n: 11, name: "best-3pl-tracking-update", audience: "agent", triggers: "refresh tracking Best · sync tracking từ Best" },
  { n: 12, name: "best-cannot-ship", audience: "agent", triggers: "Best không ship được · đơn unfulfillable → reroute Flexport" },
  { n: 13, name: "context-discipline", audience: "meta", triggers: "đầu session · trước mỗi tuyên bố sự kiện", notes: "Self-check chống hallucination" },
  { n: 14, name: "bridge-crash-recovery", audience: "operator", triggers: "gateway crash · IMAP rớt · API timeout · token hết hạn", notes: "Runbook cho con người chạy tay" },
  { n: 15, name: "stuck-case-reprocess", audience: "operator", triggers: "'xử case stuck' · reprocess hàng loạt queue undetermined", notes: "Operator chạy script" },
  { n: 16, name: "spam-classification", audience: "code", triggers: "bridge JS dùng luật này trước khi gọi LLM", notes: "Chỉ docs, đừng auto-invoke" },
  { n: 17, name: "report-verification", audience: "operator", triggers: "'verify report real or fake' · audit claim batch vs ground truth" },
  { n: 18, name: "held-order-release", audience: "agent", triggers: "đơn bị hold · on_hold fulfillment · chargeflow hold · force release", notes: "Cron chạy thêm 06/12/18 hàng ngày" },
  { n: 19, name: "amazon-orders", audience: "agent", triggers: "đơn Amazon · Shockwave · fulfillment Amazon · tracking Amazon" },
];

// ─── CRON PIPELINES (agent's own crontab) ────────────────────────────────

export type CronTag = "interval" | "hourly" | "daily" | "weekly";
export type CronRow = {
  cron: string;
  when: string;
  pipeline: string;
  script: string;
  desc: string;
  tag: CronTag;
};

export const cronPipelines: CronRow[] = [
  { cron: "*/15 * * * *", when: "mỗi 15 phút", pipeline: "FRT tracker", script: "frt_tracker.py", desc: "NS#1 — đo first-response time, append memory/frt.jsonl", tag: "interval" },
  { cron: "*/30 * * * *", when: "mỗi 30 phút", pipeline: "Lark Mail sync (HTTP)", script: "curl POST pnl.patiagency.com/api/lark-mail-sync", desc: "Kéo inbox CS → Supabase. ⚠ hostname có thể cần re-point sang pnl.patigroup.com", tag: "interval" },
  { cron: "0 * * * *", when: "mỗi giờ", pipeline: "Resend address sync", script: "resend_address_sync.py", desc: "Đẩy địa chỉ khách đã sửa sang Resend / mailer", tag: "hourly" },
  { cron: "0 */2 * * *", when: "mỗi 2 giờ", pipeline: "Health probe", script: "health_probe.py", desc: "Smoke-test agent + hạ tầng", tag: "interval" },
  { cron: "0 */6 * * *", when: "mỗi 6 giờ", pipeline: "Obsidian vault monitor", script: "obsidian_vault_monitor.py sync", desc: "Đồng bộ note curated ↔ vault", tag: "interval" },
  { cron: "0 */6 * * *", when: "mỗi 6 giờ", pipeline: "OTIF tracker", script: "otif_tracker.py", desc: "NS#2 — tỉ lệ on-time-in-full", tag: "interval" },
  { cron: "0 6,12,18 * * *", when: "06 / 12 / 18", pipeline: "Held-order release", script: "held_order_release.js", desc: "Tự release đơn Shopify bị ChargeFlow hold khi đã an toàn", tag: "daily" },
  { cron: "0 8 * * *", when: "08:00", pipeline: "Unfulfilled-order follow-up", script: "unfulfilled_orders_followup.py", desc: "Email chủ động cho đơn chưa fulfilled > 48 h", tag: "daily" },
  { cron: "30 8 * * *", when: "08:30", pipeline: "North-Star tracker", script: "north_star_tracker.py", desc: "Snapshot NS#1–#6 hàng ngày → logs/north_star_daily.jsonl", tag: "daily" },
  { cron: "0 9 * * *", when: "09:00", pipeline: "Failed deliveries pipeline", script: "failed_deliveries_pipeline.py", desc: "Chạy hàng ngày của skill #4", tag: "daily" },
  { cron: "0 9 * * *", when: "09:00", pipeline: "Amazon orders (sáng)", script: "amazon_orders_pipeline.py", desc: "Chạy hàng ngày của skill #19", tag: "daily" },
  { cron: "30 9 * * *", when: "09:30", pipeline: "Stuck-transit follow-up", script: "stuck_transit_followup.py", desc: "Outreach khách cho transit bất thường", tag: "daily" },
  { cron: "0 15 * * *", when: "15:00", pipeline: "Amazon orders (chiều)", script: "amazon_orders_pipeline.py", desc: "Lượt chạy thứ hai trong ngày", tag: "daily" },
  { cron: "0 3 * * *", when: "03:00", pipeline: "Auto-archive sessions", script: "auto_archive_sessions.py", desc: "Roll log session cũ", tag: "daily" },
  { cron: "0 3 * * *", when: "03:00", pipeline: "openclaw patch reapply", script: "openclaw_apply_all_patches.sh", desc: "Apply lại patch local lên framework", tag: "daily" },
  { cron: "15 4 * * *", when: "04:15", pipeline: "cocoindex-poc update", script: "cocoindex-poc update-all", desc: "Refresh code index", tag: "daily" },
  { cron: "0 4 * * *", when: "04:00", pipeline: "Memory size check", script: "memory_size_check.py", desc: "Trim MEMORY.md / file mem nếu quá size", tag: "daily" },
  { cron: "0 2 * * 1", when: "T2 02:00", pipeline: "Eval suite", script: "eval_suite.py", desc: "Eval agent hàng tuần", tag: "weekly" },
  { cron: "0 23 * * 0", when: "CN 23:00", pipeline: "Weekly conversation review", script: "weekly_conversation_review.py", desc: "QA lại reply CS của tuần vừa rồi", tag: "weekly" },
  { cron: "0 2 * * 0", when: "CN 02:00", pipeline: "Credential rotator", script: "credential_rotator.py report", desc: "Audit + báo cáo tuổi credential", tag: "weekly" },
];

// ─── MAC MINI SERVICES (launchd) ─────────────────────────────────────────

export type ServiceTag = "keepalive" | "interval" | "hourly" | "daily";
export type ServiceRow = {
  label: string;
  schedule: string;
  role: string;
  tag: ServiceTag;
};

// Schedule giữ nguyên thuật ngữ launchd (KeepAlive / RunAtLoad / every Ns) vì là từ chính
// thức của macOS — đổi sẽ làm rối khi đọc plist gốc.
export const services: ServiceRow[] = [
  { label: "com.pati.web", schedule: "KeepAlive", role: "Next.js web (pnl.patigroup.com trên :3000) — chính repo này", tag: "keepalive" },
  { label: "com.pati.chargeflow-trigger-server", schedule: "KeepAlive", role: "HTTP server :9876 phục vụ nút 'Sync now' của UI", tag: "keepalive" },
  { label: "com.pati.chargeflow-evidence-collect", schedule: "every 900s", role: "Pipeline thu evidence ChargeFlow bằng Playwright", tag: "interval" },
  { label: "com.pati.sync-chargeflow-ui", schedule: "every 300s", role: "Scrape ChargeFlow UI qua Chrome CDP — pipeline dispute chính", tag: "interval" },
  { label: "com.pati.sync-chargeflow-disputes", schedule: "every 900s", role: "Đường public-API của ChargeFlow (fallback đã hardened)", tag: "interval" },
  { label: "com.pati.sync-disputes-first-party", schedule: "every 300s", role: "Sync dispute first-party từ Shopify Payments + PayPal + Stripe", tag: "interval" },
  { label: "com.pati.sync-shopify", schedule: "hourly", role: "Sync incremental Shopify orders v2 (updated_at)", tag: "hourly" },
  { label: "com.pati.sync-shopify-legacy", schedule: "hourly", role: "Sync Shopify date-window (Python legacy)", tag: "hourly" },
  { label: "com.pati.sync-shopify-products", schedule: "daily 05:00", role: "Catalog sản phẩm Shopify → DB", tag: "daily" },
  { label: "com.pati.sync-shopify-larkbase", schedule: "05:00 + 13:00", role: "Shopify → Lark Base (APPEND-only — coi chừng dupe)", tag: "daily" },
  { label: "com.pati.sync-lark-mail", schedule: "every 300s", role: "Sync mail Lark inbound", tag: "interval" },
  { label: "com.pati.sync-payments", schedule: "hourly @ :05", role: "Shopify Payments balance + payouts", tag: "hourly" },
  { label: "com.pati.sync-providers", schedule: "hourly @ :02", role: "Quét multi-provider analytics", tag: "hourly" },
  { label: "com.pati.sync-stock-cover", schedule: "daily 05:xx", role: "NS#6 — refresh matview stock-cover", tag: "daily" },
  { label: "com.pati.sync-fulfillment", schedule: "daily 05:xx", role: "Sync trạng thái fulfillment", tag: "daily" },
  { label: "com.pati.sync-processing", schedule: "daily 05:xx", role: "NS#5 — pipeline order processing", tag: "daily" },
  { label: "com.pati.sync-processing-report", schedule: "scheduled", role: "Report processing hàng ngày → Lark", tag: "daily" },
  { label: "com.pati.sync-delivery", schedule: "daily 05:xx", role: "Sync tracking delivery", tag: "daily" },
  { label: "com.pati.sync-delivery-report", schedule: "scheduled", role: "Report delivery hàng ngày → Lark", tag: "daily" },
  { label: "com.pati.sync-tracking-timeline", schedule: "every 1800s", role: "Timeline event tracking", tag: "interval" },
  { label: "com.pati.sync-cogs-full", schedule: "daily 06:xx", role: "COGS catalog Lark Base (nguồn authoritative)", tag: "daily" },
  { label: "com.pati.sync-custom-tables", schedule: "every 1800s", role: "Sync các custom-table", tag: "interval" },
  { label: "com.pati.sync-flexport", schedule: "daily 06:xx", role: "Flexport logistics API → DB", tag: "daily" },
  { label: "com.pati.sync-refund-backfill", schedule: "scheduled", role: "Backfill số tiền refund", tag: "daily" },
  { label: "com.pati.submit-stuck-fulfillments", schedule: "every 3600s", role: "Bấm 'Request fulfillment' cho FO Shopify bị stuck", tag: "hourly" },
  { label: "com.pati.vnh-daily-auto", schedule: "daily 06:xx", role: "Orchestrator VNH hàng ngày", tag: "daily" },
  { label: "com.pati.vnh-inventory", schedule: "daily 11:xx", role: "Sync tồn kho VNH", tag: "daily" },
  { label: "com.pati.vnh-tracking-poll", schedule: "scheduled", role: "Poll tracking VNH", tag: "interval" },
  { label: "com.pati.reroute-us-vnh", schedule: "every 3600s", role: "Reroute đơn US sang VNH khi cần", tag: "hourly" },
  { label: "com.pati.pgbackup", schedule: "daily 03:xx", role: "Backup Postgres self-host", tag: "daily" },
  { label: "com.pati.probe-tunnel", schedule: "every 300s", role: "Probe tunnel — tự restart cloudflared khi rớt", tag: "interval" },
  { label: "com.pati.cron-watchdog", schedule: "every 600s", role: "Watchdog cho tất cả service ở trên", tag: "interval" },
  { label: "com.pati.session-warmer", schedule: "every 1200s", role: "Giữ session ChargeFlow / Shopify ấm", tag: "interval" },
  { label: "ai.openclaw.gateway", schedule: "KeepAlive", role: "Gateway framework openclaw (runtime của agent timcook)", tag: "keepalive" },
  { label: "ai.openclaw.timcook-recovery", schedule: "scheduled", role: "Tự recover agent timcook khi crash", tag: "daily" },
  { label: "co.wellnessnest.email-bridge", schedule: "KeepAlive", role: "Email bridge WellnessNest (Bảo)", tag: "keepalive" },
  { label: "ai.paperclip.server", schedule: "KeepAlive", role: "Paperclip trên :5001", tag: "keepalive" },
  { label: "homebrew.mxcl.cloudflared", schedule: "KeepAlive", role: "Daemon Cloudflared tunnel", tag: "keepalive" },
  { label: "homebrew.mxcl.ollama", schedule: "KeepAlive", role: "Ollama trên :11434", tag: "keepalive" },
  { label: "com.user.colima", schedule: "RunAtLoad", role: "Colima Docker VM (HOST stack Supabase) — xem Gotcha #2", tag: "keepalive" },
];

// ─── LISTENING PORTS ─────────────────────────────────────────────────────

export type PortRow = { port: string; proc: string; role: string };

export const ports: PortRow[] = [
  { port: ":3000", proc: "node (com.pati.web)", role: "Next.js — pnl.patigroup.com" },
  { port: ":8000", proc: "cloudflared → Caddy", role: "Caddy của Supabase (đứng trước Kong)" },
  { port: ":9876", proc: "node (chargeflow-trigger-server)", role: "Endpoint HMAC cho nút 'Sync now'" },
  { port: ":9222 / :9223", proc: "Google Chrome", role: "CDP để scrape ChargeFlow" },
  { port: ":5432", proc: "postgres (forwarded)", role: "Postgres direct từ container Supabase DB" },
  { port: ":6543", proc: "Supavisor", role: "Pool kết nối Postgres" },
  { port: ":54329", proc: "postgres", role: "Postgres secondary local" },
  { port: ":11434", proc: "ollama", role: "Runtime LLM local" },
  { port: ":5001", proc: "python (paperclip)", role: "Paperclip server" },
  { port: ":3100", proc: "node", role: "Service phụ" },
  { port: ":18789 / :18791", proc: "node", role: "Service phụ" },
  { port: ":20241", proc: "cloudflared", role: "Probe chất lượng tunnel" },
];

// ─── TUNNEL HOSTNAMES ────────────────────────────────────────────────────

export type TunnelRow = { host: string; local: string; servedBy: string; dns: string; prod?: boolean };
export const tunnelHostnames: TunnelRow[] = [
  { host: "supabase.patiagency.com", local: ":8000", servedBy: "Caddy của Supabase", dns: "Cloudflare" },
  { host: "chargeflow-trigger.patiagency.com", local: ":9876", servedBy: "com.pati.chargeflow-trigger-server", dns: "Cloudflare" },
  { host: "pnl-staging.patiagency.com", local: ":3000", servedBy: "com.pati.web (Next.js)", dns: "Cloudflare" },
  { host: "pnl-staging.patigroup.com", local: ":3000", servedBy: "com.pati.web (Next.js)", dns: "GoDaddy (CNAME tay)" },
  { host: "pnl.patigroup.com", local: ":3000", servedBy: "com.pati.web (Next.js)", dns: "GoDaddy (CNAME tay)", prod: true },
];

// ─── SUPABASE CONTAINERS ─────────────────────────────────────────────────

export type ContainerRow = { name: string; status: string; role: string; warn?: boolean };
export const supabaseContainers: ContainerRow[] = [
  { name: "pati-supabase-db-1", status: "Up 2 weeks (healthy)", role: "Postgres 15" },
  { name: "pati-supabase-pooler-1", status: "Up 2 weeks (healthy)", role: "Pool Supavisor trên :6543" },
  { name: "pati-supabase-meta-1", status: "Up 2 weeks (healthy)", role: "postgres-meta · /pg/query (lock Caddy basic_auth admin/Admin@2025 từ 2026-05-27)" },
  { name: "pati-supabase-imgproxy-1", status: "Up 12 days (healthy)", role: "Image proxy" },
  { name: "pati-supabase-rest-1", status: "Up 9 days", role: "PostgREST" },
  { name: "pati-supabase-caddy-1", status: "Up 9 days", role: "TLS + routing — đứng trước Kong ở :8000" },
  { name: "pati-supabase-storage-1", status: "Up 7 days (healthy)", role: "Object storage" },
  { name: "pati-supabase-studio-1", status: "Up 2 weeks (unhealthy)", role: "Studio UI — flaky, để priority thấp", warn: true },
];

// ─── GOTCHAS ─────────────────────────────────────────────────────────────

export type GotchaRow = { n: number; title: string; body: string; sev: "warn" | "danger" };

export const gotchas: GotchaRow[] = [
  { n: 1, title: "Đổi tên bezos → timcook chưa xong hết", body: "Đổi tên ngày 2026-05-06 để khớp bot @timcookpatibot. AGENTS.md / SOUL.md / script / label plist / user macOS / SSH đều đã update. IDENTITY.md vẫn còn ghi 'Jeff Bezos'. Coi AGENTS.md + SOUL.md là source of truth.", sev: "warn" },
  { n: 2, title: "Colima auto-start ĐÃ setup — caveat lima symlink", body: "launchd plist com.user.colima đã install + đã fire nhiều reboot (verified 2026-05-27). VM đang chạy. Caveat: brew lima 2.1.1 để lại limactl symlink broken, nên `colima status` báo 'lima not found'. VM hiện tại OK, nhưng next clean restart có thể fail. Fix triệt để: `brew reinstall lima` ngay khi VM còn lên.", sev: "warn" },
  { n: 3, title: "NAT của ISP văn phòng giết tunnel Cloudflare âm thầm", body: "Triệu chứng: card $0, section trống, 502 thỉnh thoảng. Nguyên nhân thật: ISP văn phòng PATI drop connection idle của cloudflared edge. Fix bằng `protocol: http2`, `edge-ip-version: 4`, `tcpKeepAlive: 30s`, `retries: 10` trong ~/.cloudflared/config.yml. ĐỪNG 'dọn dẹp' config về default.", sev: "danger" },
  { n: 4, title: "RLS bật mà không có policy = trông như bảng rỗng", body: "Bảng self-host bật RLS không kèm policy → anon đọc ra []. Luôn verify bằng service-role key hoặc docker exec ... psql trước khi kết luận 'gãy'.", sev: "warn" },
  { n: 5, title: "PostgREST âm thầm cắt còn 1000 row", body: "PGRST_DB_MAX_ROWS=1000. Bare .select() trả tối đa 1000 row không cảnh báo. Aggregation luôn dùng pageAll(). Từng làm CS Dashboard hiện refund-rate 34.3% thay vì 5.56% đúng.", sev: "warn" },
  { n: 6, title: "Schema cache PostgREST trễ 6–15 phút", body: "Sau ALTER TABLE, PostgREST trả schema cũ vài phút. NOTIFY pgrst không force reload trên managed PostgREST. Đợi, hoặc restart pati-supabase-rest-1.", sev: "warn" },
  { n: 7, title: "Hai app Lark — đừng dùng lộn", body: "Mail sync BUỘC dùng cli_a95674c12c385ed4 (LARK_MAIL_APP_ID). Generic LARK_APP_ID=cli_a95757de2739deef KHÔNG có mail scope → trả code 99991672.", sev: "warn" },
  { n: 8, title: "HMAC webhook Shopify = secret của Custom App 'Lark Integration'", body: "Webhook thuộc Custom App 'Lark Integration' (gid 286968840193, api_key 9a7886…1a6c). SHOPIFY_API_SECRET trong env hiện không khớp → mọi HMAC fail. Reveal token trong Shopify Admin → Develop apps → Lark Integration (chỉ hiện một lần).", sev: "warn" },
  { n: 9, title: "vercel env add qua stdin lưu chuỗi RỖNG", body: "echo 'v' | vercel env add NAME prod lưu EMPTY. Phải dùng < file.txt redirect. vercel env pull cũng không decrypt được.", sev: "warn" },
  { n: 10, title: ".vercelignore match recursive nuốt mất /api/analytics/sync/*", body: "Coi chừng pattern ignore quá rộng làm route biến mất khỏi build. Auto-deploy không tin được; chạy vercel --prod --yes tay.", sev: "warn" },
  { n: 11, title: "Hai pipeline sync Shopify song song — đừng gộp", body: "/api/sync (Python, date-window) vs /api/analytics/sync/shopify (TS, updated_at). Cố ý cover hai window khác nhau.", sev: "warn" },
  { n: 12, title: "Cron Shopify→Lark Base là APPEND-only", body: "com.pati.sync-shopify-larkbase chạy 05:00 + 13:00 ICT mỗi ngày. Chạy hai lần cùng ngày sẽ tạo dupe.", sev: "warn" },
  { n: 13, title: "Cron lark-mail-sync vẫn trỏ hostname đã thoái", body: "*/30 * * * * curl POST https://pnl.patiagency.com/api/lark-mail-sync ... — prod hiện tại là pnl.patigroup.com. Verify bằng curl -I rồi re-point.", sev: "warn" },
  { n: 14, title: "File .bak và .disabled-* làm bẩn LaunchAgents", body: "com.pati.sync-fulfillment.plist.bak.20260518, com.wellness.bridge.plist.disabled-… vv — là history, không active. Đừng launchctl load file .bak.", sev: "warn" },
  { n: 15, title: "postgres-meta /pg/query đã lock basic auth 2026-05-27", body: "Trước đây /pg/query (và toàn bộ Studio UI) mở public. Đã lock bằng Caddy basic_auth, credential admin/Admin@2025 (cùng dashboard). REST /rest/v1/* giữ public + anon JWT + RLS như cũ.", sev: "warn" },
  { n: 16, title: "DNS patigroup.com nằm ở GoDaddy + chỉ được thêm", body: "Nhiều app PATI khác cùng dùng. Thêm subdomain CNAME = OK. Sửa/xóa root/MX/TXT/record có sẵn = KHÔNG ĐƯỢC. Đừng đổi nameserver khỏi GoDaddy.", sev: "warn" },
  { n: 17, title: "Luật im lặng > câu nói cho có vẻ hữu ích", body: "Cron trigger không kèm tin cụ thể BUỘC kết thúc lượt rỗng. Vụ 2026-05-06: 4 tin 'checking in' giống hệt nhau spam Telegram trong 5 phút vì agent bịa filler.", sev: "warn" },
  { n: 18, title: "Asia/Ho_Chi_Minh ≠ UTC ≠ store TZ", body: "Card email-ops CS anchor VN_TZ. Card doanh thu anchor store TZ. Bucketing Recharge force UTC. Date picker phải dùng format(d, 'yyyy-MM-dd').", sev: "warn" },
  { n: 19, title: "git status trước mỗi push tới Mac mini", body: "Mọi file M ở working tree mà HEAD code reference đều làm build im re fail. File untracked nằm trong route đã commit thì 404.", sev: "warn" },
  { n: 20, title: "Dispute ChargeFlow — session Chrome rất mong manh", body: "Sync UI 5 phút cần một session Chrome thật ở :9222/:9223 với cookie còn hạn. com.pati.session-warmer (every 1200s) giữ session ấm.", sev: "warn" },
];
