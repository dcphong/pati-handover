// Hand-curated Vietnamese workflow for each timcook skill.
// User mode renders this; dev mode keeps the raw English SKILL.md cards.
// Each step has a stage tag → icon + tone in <SkillTable>.

export type FlowStage =
  | "trigger"   // skill chạy khi nào
  | "check"     // kiểm tra điều kiện / lookup data
  | "decide"    // nhánh quyết định
  | "act"       // hành động thực tế
  | "reply"     // soạn câu trả lời cho khách
  | "log"       // ghi memory / log
  | "limit"     // giới hạn quyền hạn / luật cấm
  | "fallback"; // fallback khi lỗi / edge case

export type FlowStep = {
  stage: FlowStage;
  text: string;
};

export type SkillFlow = {
  oneLiner: string;
  steps: FlowStep[];
};

export const skillFlows: Record<string, SkillFlow> = {
  "refund-flow": {
    oneLiner:
      "Xử lý yêu cầu hoàn tiền của khách. Quyết định hoàn full/partial theo policy, gọi Shopify refund, log NS#3 rồi mới reply.",
    steps: [
      { stage: "trigger", text: "Khách yêu cầu hoàn tiền, hoặc giao thất bại không cứu được, hoặc sentiment-handling đã kích hoạt" },
      { stage: "check",   text: "Đơn còn trong policy 30 ngày kể từ ngày giao không?" },
      { stage: "decide",  text: "Trong policy → hoàn theo yêu cầu. Hết policy + tone khách tốt → 1 lần courtesy. Khách dọa kiện → hoàn full ngay, bỏ thương lượng." },
      { stage: "limit",   text: "Trần 100% giá trị đơn — KHÔNG hoàn quá. KHÔNG vừa credit vừa refund (chọn 1)." },
      { stage: "act",     text: "Gọi Shopify refund API, đợi result báo success" },
      { stage: "reply",   text: '"Đã hoàn $X cho đơn #Y — 5-7 ngày làm việc sẽ thấy về thẻ"' },
      { stage: "log",     text: "BẮT BUỘC append refund_history.jsonl — heartbeat NS#3 đếm dòng này daily" },
      { stage: "fallback", text: "API lỗi → retry 3 lần (1s/5s/30s). Vẫn fail → flag PATI group + reply khách hứa follow-up trong 4h" },
    ],
  },

  "cancellation-retention": {
    oneLiner:
      "3-phase pipeline: phát hiện ý định hủy sub → đề xuất giữ lại (retention) → nếu khách vẫn muốn, hủy thật qua Recharge. Có crash recovery.",
    steps: [
      { stage: "trigger", text: "Tin khách chứa keyword hủy đa ngôn ngữ (cancel/kündig/abbestell/annuler/cancelar/cancellare)" },
      { stage: "limit",   text: "HARD: Sub chạy < 4 tháng → KHÔNG được hủy (luật sếp 2026-05-16). Reply lịch sự giải thích commitment." },
      { stage: "check",   text: "Đã thu tiền lần kế chưa? Còn trong charge window không?" },
      { stage: "decide",  text: "Phase 2A retention: đề xuất pause / skip / discount tùy lý do (giá, ship, side-effect, …)" },
      { stage: "decide",  text: "Khách vẫn muốn hủy → Phase 2B confirm intent rõ ràng" },
      { stage: "act",     text: "Gọi Recharge API hủy sub" },
      { stage: "check",   text: "Phase 3 verify — re-fetch sub, confirm status=\"cancelled\"" },
      { stage: "reply",   text: "Báo khách confirmed + ngày kết thúc billing cycle hiện tại" },
      { stage: "log",     text: "Append cancel history + NS metric" },
      { stage: "fallback", text: "Bridge crash giữa flow → daily_operations_recovery pick up tiếp ngày sau" },
    ],
  },

  "wismo": {
    oneLiner:
      "Khi khách hỏi tracking. Tra 17track + Shopify + Best 3PL, phân loại tình trạng đơn, reply ETA chính xác, follow-up nếu cần.",
    steps: [
      { stage: "trigger", text: "Câu hỏi tracking (where is my order, tracking, has it shipped, lieferung, où est ma commande)" },
      { stage: "act",     text: "Step 1 Detect — extract order number / email từ tin khách" },
      { stage: "act",     text: "Step 2 Lookup — query đồng thời 17track, Shopify, Best 3PL" },
      { stage: "decide",  text: "Step 3 Classify — in-transit / delivered / failed / not_shipped / refused / lost" },
      { stage: "reply",   text: "Step 4 Respond — chọn template theo loại + ETA cụ thể (không nói chung chung)" },
      { stage: "act",     text: "Step 5 Follow-up — nếu lost → trigger failed-deliveries, nếu refused → outreach" },
      { stage: "fallback", text: "17track lỗi → fallback chỉ dùng Shopify status, báo khách \"đang verify thêm\"" },
    ],
  },

  "failed-deliveries": {
    oneLiner:
      "Đơn giao thất bại / mất / refused. Phân loại sub-type, response template, follow up khách trong 5 ngày, sync Lark.",
    steps: [
      { stage: "trigger", text: "17track báo failed delivery, hoặc khách báo not delivered / lost / returned to sender" },
      { stage: "check",   text: "Fetch failed orders từ Lark Base Failed Deliveries table" },
      { stage: "act",     text: "Enrich tracking từ 17track API (carrier event log)" },
      { stage: "decide",  text: "Sub-classify: lost / refused / undeliverable / damaged / returned" },
      { stage: "reply",   text: "Pati response generation theo sub-type (khác hẳn nhau)" },
      { stage: "act",     text: "Section 8 Pickup follow-up — nếu khách không response trong 5 ngày, chủ động nhắc" },
      { stage: "log",     text: "Update Lark Failed Deliveries table + Protocol table nếu có" },
    ],
  },

  "address-email-protocol": {
    oneLiner:
      "Khi địa chỉ sai/thiếu — gửi email xin khách xác nhận theo cadence 0d/1d/3d, update Lark status, parse reply tự động.",
    steps: [
      { stage: "trigger", text: "Đơn có address issue (sai zip/thiếu apt/typo …) từ Lark Wrong Address table" },
      { stage: "act",     text: "Chọn email template theo loại lỗi cụ thể" },
      { stage: "act",     text: "Gửi cadence: ngay → nhắc 1 ngày sau → lần cuối 3 ngày sau" },
      { stage: "log",     text: "Cập nhật action status trong Lark (pending / replied / fixed / abandoned)" },
      { stage: "act",     text: "Cron daily 08:00 SGT chạy automation script" },
      { stage: "act",     text: "Khi khách reply → parse address mới, update Shopify, đóng record" },
    ],
  },

  "sentiment-handling": {
    oneLiner:
      "Gate cảm xúc — chạy ĐẦU TIÊN trước skill khác. Khách bực/giận → bật emotional mode, anti-abuse check trước khi grant 100%, giữ in-conversation.",
    steps: [
      { stage: "trigger", text: "Tin khách có angry/frustrated/urgent/upset/verärgert, hoặc CAPS lớn, hoặc threat language" },
      { stage: "limit",   text: "R3 — Skill này OWNS emotional gate, single source of truth, không skill khác được override" },
      { stage: "decide",  text: "NOT fire khi tin chỉ hỏi info đơn thuần (không có signal cảm xúc thật)" },
      { stage: "check",   text: "Anti-abuse: đã refund > N lần trong 30 ngày? Order < $20? Pattern lạm dụng có?" },
      { stage: "decide",  text: "Pass anti-abuse → auto-grant 100%. Fail → emotional_partial hoặc emotional_blocked" },
      { stage: "act",     text: "Trigger refund-flow ở PRIMITIVE mode với reason=emotional_verified" },
      { stage: "reply",   text: "Empathy template + confirm action ngay (không câu giờ)" },
      { stage: "fallback", text: "Worst case vẫn KHÔNG handoff con người — agent tự handle in-conversation" },
    ],
  },

  "escalation-protocol": {
    oneLiner:
      "Router 2 nhánh: Category A (legal/medical/>100%/address-post-ship — agent handle in-chat) vs B (system alert — post PATI group, không reply khách).",
    steps: [
      { stage: "trigger", text: "Tin có lawyer / lawsuit / medical / authority / FTC / complaint board mention" },
      { stage: "decide",  text: "Category A (customer-facing) hay Category B (system alert)?" },
      { stage: "act",     text: "Category A → handle in-conversation, có thể gọi refund-flow PRIMITIVE" },
      { stage: "act",     text: "Category B → post PATI group, KHÔNG reply khách" },
      { stage: "limit",   text: "R4 — khi đã do orchestrator gọi vào, KHÔNG re-detect intent lần nữa" },
      { stage: "log",     text: "memory/escalation_history.jsonl" },
    ],
  },

  "chargeflow-collect-evidence": {
    oneLiner:
      "Khi có dispute Stripe ChargeFlow — Chrome CDP triage. Phân loại managed/submitted/manual, CHỈ tự thu evidence cho manual. Verify store identity trước (Wellness Nest vs DE).",
    steps: [
      { stage: "limit",   text: "CRITICAL: verify store identity (Wellness Nest, NOT Wellness Nest DE). Sai store = thua kiện." },
      { stage: "trigger", text: "Notification dispute từ ChargeFlow / Stripe" },
      { stage: "check",   text: "Trigger triage script — phân loại cf_auto (skip) / submitted (skip) / manual (làm)" },
      { stage: "act",     text: "Setup folder structure per dispute (EVID/$ID/)" },
      { stage: "act",     text: "End-to-end procedure — fetch evidence files, screenshot, viết defense narrative" },
      { stage: "limit",   text: "HARD RULE Phase 8 — re-inspect mandatory TRƯỚC khi submit" },
      { stage: "act",     text: "Upload qua Chrome CDP, screenshot kết quả lưu lại" },
      { stage: "log",     text: "Audit accuracy Phase A4 — count match attachment list trước/sau" },
      { stage: "fallback", text: "DOM rename (ChargeFlow update UI) → áp dụng stealth-mode rule, alert nếu selector miss" },
    ],
  },

  "csat-collection": {
    oneLiner:
      "Sau khi refund / cancel / shipped đã xong — gửi survey CSAT 1-5 sao + comment. Aggregate weekly.",
    steps: [
      { stage: "trigger", text: "Event refund/cancel/shipped đã complete trên Shopify" },
      { stage: "decide",  text: "NOT ask nếu đã survey trong 30 ngày qua, hoặc conversation chưa kết thúc rõ" },
      { stage: "act",     text: "Soạn survey format 1-5 sao + comment optional" },
      { stage: "log",     text: "Append memory/csat_responses.jsonl" },
      { stage: "act",     text: "Weekly cron aggregate score, post lên PATI group" },
      { stage: "limit",   text: "Anti-hallucination — đừng tự bịa CSAT khi chưa có response thật" },
    ],
  },

  "best-3pl-protocol": {
    oneLiner:
      "Tracking routing đơn B2B qua Best 3PL — carrier mapping, 17track integration, Lark Base sync, error retry.",
    steps: [
      { stage: "trigger", text: "Đơn B2B route qua Best 3PL" },
      { stage: "check",   text: "Phân biệt 3 loại tracking number: Best ID vs forwarder vs final carrier" },
      { stage: "act",     text: "Carrier mapping — Best ID → real carrier code 17track dùng được" },
      { stage: "act",     text: "Gọi 17track API enrich tracking event timeline" },
      { stage: "log",     text: "Sync vào Lark Base 3PL tables" },
      { stage: "fallback", text: "Error handling theo carrier code (mỗi carrier có retry policy khác)" },
    ],
  },

  "best-3pl-tracking-update": {
    oneLiner:
      "Cron refresh status đơn Best 3PL còn active. Map 17track → Lark field. Khi khách REFUSED, outreach step-by-step.",
    steps: [
      { stage: "trigger", text: "Cron interval — quét đơn Best 3PL chưa final state" },
      { stage: "act",     text: "Fetch Lark Base records active" },
      { stage: "act",     text: "Record classification matrix → label loại đơn" },
      { stage: "act",     text: "17track status → Lark field mapping (multi-select)" },
      { stage: "decide",  text: "Nếu REFUSED → bắt đầu outreach khách theo step-by-step procedure" },
      { stage: "check",   text: "Record thiếu customer data → Shopify enrichment lookup" },
      { stage: "log",     text: "Batch update script ghi back Lark + execution checklist" },
    ],
  },

  "best-cannot-ship": {
    oneLiner:
      "Best báo cannot_ship → reroute Flexport. Scan 2 bảng Lark (Unfulfilled + Wrong Address), substitute SKU OOS bằng WNPSGS2024 Gold Grade.",
    steps: [
      { stage: "trigger", text: "Cron — Best báo trạng thái cannot_ship cho đơn pending" },
      { stage: "check",   text: "Step 1 — scan Best Unfulfilled table" },
      { stage: "check",   text: "Step 2 — scan Wrong Address table" },
      { stage: "decide",  text: "SKU đang OOS? → substitute bằng WNPSGS2024 Gold Grade" },
      { stage: "act",     text: "Step 3 — tạo Flexport order cho từng Best Unfulfilled" },
      { stage: "act",     text: "Step 4 — tạo Flexport order cho Wrong Address sau khi đã có địa chỉ mới" },
      { stage: "limit",   text: "KHÔNG refund đơn OOS nếu chưa offer substitute cho khách chọn trước" },
      { stage: "fallback", text: "Error recovery script — rollback partial state" },
    ],
  },

  "context-discipline": {
    oneLiner:
      "Meta self-discipline — chạy mỗi turn agent. Anti-hallucination self-check, memory hygiene, heartbeat update mỗi 15 phút.",
    steps: [
      { stage: "trigger", text: "Đầu mỗi turn / trước mỗi tuyên bố sự kiện factual" },
      { stage: "check",   text: "Core principles — không nói điều chưa verify, không suy đoán làm fact" },
      { stage: "act",     text: "Anti-hallucination self-check: \"Tôi đã có tool result confirm chưa? Hay đang nhớ?\"" },
      { stage: "act",     text: "Context overflow prevention — trim memory cũ, không repeat" },
      { stage: "act",     text: "Heartbeat self-update mỗi 15 phút (memory/HEARTBEAT.md)" },
      { stage: "fallback", text: "Suspect đang hallucinate → STOP, gọi lại tool verify trước khi tiếp" },
      { stage: "log",     text: "Tool result interpretation log + 🧹 self-curate auto memory hygiene" },
    ],
  },

  "bridge-crash-recovery": {
    oneLiner:
      "Runbook cho operator khi bridge crash / gateway rớt / IMAP fail / token hết hạn. Recovery theo priority cao→thấp.",
    steps: [
      { stage: "trigger", text: "Operator gọi khi nghi bridge crash, hoặc health-check cron alert" },
      { stage: "check",   text: "Section 1 — crash detection (gateway log, last email processed, ago > X phút?)" },
      { stage: "act",     text: "Section 2 — recovery priority: gateway > bridge > credential > queue" },
      { stage: "check",   text: "Section 3 — API failure modes (token expired vs rate limit vs upstream down)" },
      { stage: "act",     text: "Section 4 — total crash recovery: restart launchd, replay queue, count check" },
      { stage: "act",     text: "Section 5 — partial failures (chỉ 1 source rớt)" },
      { stage: "log",     text: "Post group chat update: \"Bridge down lúc X, fix lúc Y, lost N emails (replay queued)\"" },
      { stage: "act",     text: "Section 6 prevention — health check cron + credential backup" },
    ],
  },

  "stuck-case-reprocess": {
    oneLiner:
      "Operator chạy script khi queue có case stuck. 5-step procedure, safety guards bắt buộc dry-run trước.",
    steps: [
      { stage: "trigger", text: "Operator gõ \"xử case stuck\" hoặc queue undetermined > threshold" },
      { stage: "decide",  text: "NOT chạy nếu gateway đang up + tự xử kịp (đừng can thiệp)" },
      { stage: "act",     text: "Procedure 5 steps: identify → fetch → classify → reprocess → confirm" },
      { stage: "limit",   text: "MANDATORY safety guards: dry-run trước, batch size limit, không destructive op" },
      { stage: "log",     text: "Example output 2026-05-06 13:18-13:23 UTC (reference run)" },
      { stage: "fallback", text: "Sai sót → reference paths cho rollback nhanh" },
    ],
  },

  "spam-classification": {
    oneLiner:
      "Bridge JS dùng luật này TRƯỚC khi gọi LLM — filter spam 3-pass. Chỉ docs, agent KHÔNG được auto-invoke.",
    steps: [
      { stage: "trigger", text: "Email mới đi vào bridge JS layer (không phải agent layer)" },
      { stage: "decide",  text: "NOT filter customer reply có context lịch sử conversation" },
      { stage: "act",     text: "Three-pass filter: sender domain → keyword pattern → empty content" },
      { stage: "check",   text: "Real-customer signals — order ID mention, name match → pass through ngay" },
      { stage: "act",     text: "Output spam_score 0-1 + reason tag" },
      { stage: "limit",   text: "Anti-pattern: đừng over-filter, đừng cắt reply hợp lệ" },
      { stage: "log",     text: "Tuning record audit trail (false positive review weekly)" },
    ],
  },

  "report-verification": {
    oneLiner:
      "Operator audit claim batch — verify report real hay fake. Cross-check 5 nguồn (Shopify / reply log / bridge log / session jsonl / agent claim).",
    steps: [
      { stage: "trigger", text: "Operator gõ \"verify report real or fake\" hoặc audit batch claim" },
      { stage: "decide",  text: "NOT dùng để verify chuyện đang xảy ra real-time — chỉ audit quá khứ" },
      { stage: "act",     text: "Five-source cross-check matrix: Shopify orders / reply log / bridge log / session jsonl / agent claim" },
      { stage: "act",     text: "Verification procedure: fetch each source → count → compare → flag mismatch" },
      { stage: "act",     text: "Agent claim verification — so với session jsonl tool calls count" },
      { stage: "log",     text: "Bottom line conclusion (real / partially real / fake) + evidence" },
      { stage: "limit",   text: "Anti-pattern: đừng kết luận \"real\" khi mới check 1 source" },
    ],
  },

  "held-order-release": {
    oneLiner:
      "Cron 06/12/18 — quét đơn Shopify bị ChargeFlow hold, release đơn đã an toàn. Operator có --force override để bypass risk.",
    steps: [
      { stage: "trigger", text: "Cron 06:00 / 12:00 / 18:00 daily (3 lần / ngày)" },
      { stage: "act",     text: "Scan all on_hold fulfillment trên Shopify" },
      { stage: "check",   text: "Risk assessment logic per order (age, value, dispute status, ChargeFlow signal)" },
      { stage: "decide",  text: "Safe → auto release. Unsafe → skip + log lý do" },
      { stage: "act",     text: "Operator override: --force (bypass risk) hoặc --order ID (target cụ thể)" },
      { stage: "log",     text: "History append per release record" },
    ],
  },

  "amazon-orders": {
    oneLiner:
      "Pipeline 2× / ngày (09:00 + 15:00) — pull đơn Amazon Shockwave từ Lark, fill Flexport form qua Chrome CDP, follow-up tracking.",
    steps: [
      { stage: "trigger", text: "Cron 09:00 + 15:00 daily (kết hợp 1 cron 0 9,15 * * *)" },
      { stage: "act",     text: "Fetch Lark Amazon Orders table records pending" },
      { stage: "check",   text: "Validate Lark schema — mandatory fields phải đủ trước khi fill form" },
      { stage: "act",     text: "Flow — Chrome CDP fill Flexport form từng field theo SKU map" },
      { stage: "limit",   text: "HARD RULES — KHÔNG submit nếu thiếu mandatory field. Store ID đúng (Amazon ≠ Shopify)." },
      { stage: "fallback", text: "Failure modes (form drift, captcha, SKU unknown) → PATI group alert + skip record" },
      { stage: "log",     text: "View today's run script + tracking follow-up cho đơn đã submit" },
    ],
  },

  "flexport-invalid-address": {
    oneLiner:
      "Cron quét Flexport portal, bắt đơn status 'Invalid address', tự fix theo cleanup rules, báo PATI group số fixed/failed.",
    steps: [
      { stage: "trigger", text: "Cron interval daily" },
      { stage: "act",     text: "Login Flexport portal qua Chrome CDP session" },
      { stage: "check",   text: "Filter orders có status = 'Invalid address'" },
      { stage: "act",     text: "Apply cleanup rules: strip extra chars, normalize zip, expand state abbrev, …" },
      { stage: "act",     text: "Update address mới + re-submit đơn" },
      { stage: "log",     text: "Báo PATI group: N đơn fixed / M đơn failed + list ID" },
      { stage: "fallback", text: "Error per order — skip, retry, hoặc alert tùy loại lỗi" },
    ],
  },

  "flexport-self-learn": {
    oneLiner:
      "Meta — khi Flexport báo lỗi pattern mới chưa có trong luật, học từ lịch sử fix manual để mở rộng cleanup rules.",
    steps: [
      { stage: "trigger", text: "Flexport trả lỗi không match luật cleanup hiện tại" },
      { stage: "act",     text: "Đọc lịch sử fix manual cùng dạng (operator đã sửa tay)" },
      { stage: "check",   text: "Trích xuất pattern chung (regex / dictionary mapping)" },
      { stage: "act",     text: "Đề xuất luật cleanup mới — operator review confirm" },
      { stage: "log",     text: "Append vào rule catalog + ghi nguồn (case ID dùng để học)" },
      { stage: "limit",   text: "KHÔNG auto-apply luật mới — phải operator approve trước khi production dùng" },
    ],
  },

  "semantic-recall": {
    oneLiner:
      "Meta — đầu mỗi turn, vector search memory/ để recall ngữ cảnh khách hàng cũ. Chống hỏi lại thông tin đã có.",
    steps: [
      { stage: "trigger", text: "Đầu mỗi turn agent (trước khi soạn reply)" },
      { stage: "act",     text: "Embed customer email + ngữ cảnh tin hiện tại" },
      { stage: "act",     text: "Vector search memory/ — tìm conversation cũ liên quan" },
      { stage: "check",   text: "Match relevance threshold (đủ liên quan mới inject)" },
      { stage: "act",     text: "Inject recall context vào prompt — agent biết \"đã chat trước về X\"" },
      { stage: "limit",   text: "Recall ≠ verify — vẫn phải tool-check facts trước khi nói ra với khách" },
    ],
  },
};
