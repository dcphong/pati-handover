export type AudienceBrief = {
  userTitle: string;
  userSummary: string;
  userBullets: string[];
  devSummary: string;
};

export const audienceBriefs: Record<string, AudienceBrief> = {
  "/docs/overview": {
    userTitle: "Tóm tắt cho người dùng",
    userSummary:
      "Đây là bức tranh tổng quan: hệ thống gom đơn hàng, tồn kho, vận chuyển, CS và số liệu kinh doanh vào một dashboard chung.",
    userBullets: [
      "Dùng trang này để hiểu dashboard phục vụ workflow nào và bắt đầu từ đâu.",
      "Bạn không cần nhớ tên bảng, worker hay file code ở User mode.",
      "Khi cần sửa hệ thống hoặc debug, chuyển sang Dev mode.",
    ],
    devSummary: "Dev mode giữ nguyên runtime, code path, data source, flow và invariant để bàn giao kỹ thuật.",
  },
  "/docs/setup": {
    userTitle: "Mục đích trang này",
    userSummary:
      "Trang này dành cho người cần chạy dự án trên máy cá nhân. Nếu bạn chỉ dùng dashboard, không cần làm các bước cài đặt này.",
    userBullets: [
      "Cần quyền GitHub, file cấu hình và quyền SSH/Tailscale vào Mac mini trước khi bắt đầu.",
      "Nếu thiếu secret hoặc access token, hỏi người quản lý kỹ thuật thay vì tự đoán.",
      "Các lệnh cài đặt chỉ hiện đầy đủ trong Dev mode.",
    ],
    devSummary: "Dev mode hiển thị đủ command, expected output, env template và checklist local setup.",
  },
  "/docs/env": {
    userTitle: "Thông tin cấu hình cần biết",
    userSummary:
      "Trang này giải thích các khóa cấu hình giúp dashboard kết nối Shopify, Supabase, Lark và các dịch vụ khác.",
    userBullets: [
      "Không chia sẻ hoặc paste secret vào chat công khai.",
      "Nếu dashboard mất kết nối hoặc sync lỗi, nguyên nhân có thể là cấu hình hết hạn hoặc sai.",
      "Dev mode có danh sách biến môi trường và cách thêm/xóa chi tiết.",
    ],
    devSummary: "Dev mode hiển thị exact env var names, scope production/local và cách Mac mini runtime đọc .env.",
  },
  "/docs/supabase": {
    userTitle: "Supabase là nơi lưu dữ liệu",
    userSummary:
      "Supabase là database trung tâm của PATI: dashboard đọc dữ liệu ở đây, còn các tiến trình sync ghi dữ liệu mới vào đây.",
    userBullets: [
      "Khi số liệu trống hoặc cũ, thường cần kiểm tra kết nối database hoặc tiến trình sync.",
      "Người dùng chỉ cần biết đây là nguồn dữ liệu chính của dashboard.",
      "Dev mode có schema, policy, cache và lệnh kiểm tra chi tiết.",
    ],
    devSummary: "Dev mode giữ chi tiết self-host, schema master_app, RLS, PostgREST cache và row-cap traps.",
  },
  "/docs/architecture": {
    userTitle: "Cách hệ thống được chia lớp",
    userSummary:
      "Trang này mô tả dashboard, database, các job đồng bộ và dịch vụ bên ngoài phối hợp với nhau như thế nào.",
    userBullets: [
      "Dùng để hiểu phần nào chịu trách nhiệm khi có lỗi.",
      "Không cần đọc tên file/code nếu bạn chỉ vận hành dashboard.",
      "Dev mode cho sơ đồ layer, module và rule không được phá khi sửa code.",
    ],
    devSummary: "Dev mode hiển thị module map, invariants, code paths và execution chains.",
  },
  "/docs/tech-stack": {
    userTitle: "Công nghệ đang dùng",
    userSummary:
      "Trang này liệt kê những công nghệ đứng sau dashboard, database, đồng bộ dữ liệu và triển khai.",
    userBullets: [
      "Hữu ích khi cần biết ai có thể hỗ trợ phần nào.",
      "Người dùng không cần cài hoặc hiểu toàn bộ stack để dùng dashboard.",
      "Dev mode hiển thị version, framework và tooling cụ thể.",
    ],
    devSummary: "Dev mode giữ danh sách framework, library, runtime và tooling để dev setup đúng phiên bản.",
  },
  "/docs/data-flow": {
    userTitle: "Dữ liệu đi từ đâu đến đâu",
    userSummary:
      "Trang này giải thích hành trình dữ liệu: từ Shopify/Lark/Flexport/ads đi vào database rồi hiện lên dashboard.",
    userBullets: [
      "Nếu số liệu sai, cần biết nguồn ban đầu là dịch vụ nào.",
      "Nếu số liệu chậm, thường là job đồng bộ chưa chạy xong.",
      "Dev mode có tên bảng, endpoint, RPC và flow chi tiết.",
    ],
    devSummary: "Dev mode hiển thị provider pipeline, raw tables, views, RPC và cache/query behavior.",
  },
  "/docs/database": {
    userTitle: "Danh mục dữ liệu trong hệ thống",
    userSummary:
      "Trang này mô tả các nhóm dữ liệu chính như đơn hàng, hoàn tiền, chi phí, khách hàng và log đồng bộ.",
    userBullets: [
      "Dùng để biết dữ liệu nào đang có trong dashboard.",
      "Không cần nhớ tên bảng nếu bạn không trực tiếp query database.",
      "Dev mode có schema, view, constraint và ví dụ truy vấn.",
    ],
    devSummary: "Dev mode giữ table/view map, key columns, constraints và SQL examples.",
  },
  "/docs/deploy-vercel": {
    userTitle: "Đưa dashboard lên production trên Mac mini",
    userSummary:
      "Trang này dành cho việc phát hành bản mới của dashboard lên Mac mini self-hosted.",
    userBullets: [
      "Chỉ người có quyền deploy nên thao tác theo trang này.",
      "Trước khi deploy cần đảm bảo thay đổi đã được kiểm tra.",
      "Dev mode có GitHub Actions, Tailscale SSH, launchd và checklist release chi tiết.",
    ],
    devSummary: "Dev mode hiển thị Mac mini deploy flow, deploy-web.sh, launchd service, healthcheck và rollback commands.",
  },
  "/docs/cron-jobs": {
    userTitle: "Các lịch đồng bộ tự động",
    userSummary:
      "Trang này cho biết dữ liệu nào được hệ thống tự động cập nhật theo giờ/ngày.",
    userBullets: [
      "Nếu số liệu chưa mới, kiểm tra job gần nhất có chạy thành công không.",
      "Một số dữ liệu cập nhật nhiều lần/ngày, không phải realtime tuyệt đối.",
      "Dev mode có tên workflow, cron schedule và lệnh debug.",
    ],
    devSummary: "Dev mode giữ workflow names, cron expressions, sync logs và trigger commands.",
  },
  "/docs/mac-mini": {
    userTitle: "Máy chủ nội bộ đang chạy một phần hệ thống",
    userSummary:
      "Mac mini là máy tự host một số dịch vụ nền như database và tunnel kết nối.",
    userBullets: [
      "Nếu mất kết nối database/tunnel, có thể cần kiểm tra Mac mini.",
      "Không tự restart hoặc đổi cấu hình nếu không phụ trách kỹ thuật.",
      "Dev mode có SSH, Docker, Colima và lệnh khôi phục.",
    ],
    devSummary: "Dev mode hiển thị IP, SSH, Docker services, Colima, Cloudflared và recovery commands.",
  },
  "/docs/cloudflared": {
    userTitle: "Đường kết nối an toàn vào database",
    userSummary:
      "Cloudflared giúp dashboard kết nối tới dịch vụ đang chạy trên Mac mini mà không mở trực tiếp máy ra internet.",
    userBullets: [
      "Nếu tunnel lỗi, dashboard có thể không lấy được dữ liệu.",
      "Người dùng chỉ cần báo lỗi kết nối, không cần thao tác tunnel.",
      "Dev mode có lệnh kiểm tra và restart tunnel.",
    ],
    devSummary: "Dev mode giữ tunnel hostname, service mapping, diagnostics và restart commands.",
  },
  "/docs/tailscale": {
    userTitle: "Kết nối an toàn vào Mac mini",
    userSummary:
      "Trang này hướng dẫn cài Tailscale và dùng mạng riêng để vào Mac mini khi cần hỗ trợ vận hành.",
    userBullets: [
      "User mode có từng bước cài app, đăng nhập và remote màn hình.",
      "Không mở port router hoặc chia sẻ quyền khi chưa được duyệt.",
      "Dev mode có lệnh SSH, VNC, kiểm tra port và checklist quyền.",
    ],
    devSummary: "Dev mode giữ Tailscale install flow, ACL/access checklist, SSH/VNC commands và security rules.",
  },
  "/docs/feature-shopify-sync": {
    userTitle: "Đồng bộ dữ liệu Shopify",
    userSummary:
      "Trang này giải thích cách đơn hàng, hoàn tiền và sản phẩm từ Shopify được đưa vào dashboard.",
    userBullets: [
      "Shopify là nguồn chính cho dữ liệu đơn hàng.",
      "Nếu đơn mới chưa hiện, có thể sync/webhook chưa chạy xong.",
      "Dev mode có endpoint, webhook, refund và timezone details.",
    ],
    devSummary: "Dev mode hiển thị raw_orders/refunds/variants flow, webhook HMAC và sync edge cases.",
  },
  "/docs/feature-analytics": {
    userTitle: "Báo cáo kinh doanh và lợi nhuận",
    userSummary:
      "Trang này nói về các chỉ số doanh thu, hoàn tiền, chi phí quảng cáo, COGS và lợi nhuận trên dashboard.",
    userBullets: [
      "Mục tiêu là số liệu gần khớp nguồn đối chiếu kinh doanh.",
      "Nếu thấy số khác lạ, cần kiểm tra khoảng ngày, store và dữ liệu sync.",
      "Dev mode có công thức, bảng dữ liệu và các trap kỹ thuật.",
    ],
    devSummary: "Dev mode giữ TW parity status, formulas, RPC, provider tables và number traps.",
  },
  "/docs/feature-multistore": {
    userTitle: "Hỗ trợ nhiều store",
    userSummary:
      "Trang này giải thích cách dashboard tách dữ liệu theo từng Shopify store.",
    userBullets: [
      "Luôn kiểm tra bạn đang xem đúng store trước khi kết luận số liệu.",
      "Thêm store mới cần cấu hình và sync riêng.",
      "Dev mode có shop_id, credential lookup và query-key details.",
    ],
    devSummary: "Dev mode giữ shop_id scoping, credentials, React Query key và onboarding SQL/env steps.",
  },
  "/docs/feature-iam": {
    userTitle: "Quyền truy cập người dùng",
    userSummary:
      "Trang này mô tả ai được xem hoặc thao tác phần nào trong dashboard.",
    userBullets: [
      "Nếu không thấy menu hoặc nút nào đó, có thể bạn chưa có quyền.",
      "Quyền nên cấp theo vai trò công việc, không cấp rộng mặc định.",
      "Dev mode có permission model và rule check chi tiết.",
    ],
    devSummary: "Dev mode giữ permission scopes, checks, examples và security caveats.",
  },
  "/docs/feature-cogs": {
    userTitle: "Giá vốn sản phẩm",
    userSummary:
      "Trang này giải thích dữ liệu giá vốn dùng để tính lợi nhuận và biên lợi nhuận.",
    userBullets: [
      "Nếu COGS sai, lợi nhuận có thể sai theo.",
      "Nguồn giá vốn chính cần được cập nhật đúng quy trình.",
      "Dev mode có nguồn bảng, sync script và rule không dùng cost sai.",
    ],
    devSummary: "Dev mode giữ authoritative COGS source, import/sync commands và SKU matching rules.",
  },
  "/docs/feature-chargeflow": {
    userTitle: "Quản lý tranh chấp thanh toán",
    userSummary:
      "Trang này mô tả cách xử lý dispute/chargeback và bằng chứng liên quan.",
    userBullets: [
      "Dùng để biết case nào cần bằng chứng hoặc hành động tiếp theo.",
      "Không expose thông tin nội bộ không cần thiết cho khách hàng.",
      "Dev mode có automation, cookie, browser và API details.",
    ],
    devSummary: "Dev mode giữ ChargeFlow sync, evidence upload, CDP/browser and cookie management details.",
  },
  "/docs/feature-cs": {
    userTitle: "Dashboard chăm sóc khách hàng",
    userSummary:
      "Trang này giải thích cách CS xem thông tin khách hàng, đơn hàng, email và ghi chú.",
    userBullets: [
      "Dùng để hỗ trợ khách nhanh hơn và có ngữ cảnh đầy đủ hơn.",
      "Nếu dữ liệu khách hàng thiếu, cần kiểm tra nguồn Shopify/Lark Mail.",
      "Dev mode có matching, refund-rate và query caveats.",
    ],
    devSummary: "Dev mode giữ CS data joins, Lark Mail reconcile, customer profile and bug history details.",
  },
  "/docs/feature-cs-of": {
    userTitle: "Workflow CS & OF",
    userSummary:
      "Trang này là hướng dẫn thao tác payment request cho shipping cost: lấy cost, gom theo batch, xuất CSV, kiểm tra output và submit form.",
    userBullets: [
      "Bắt đầu từ cost thô trong Lark Base, không dùng tin nhắn tổng cuối ngày.",
      "Nếu gom 2-3 ngày mới làm payment request thì phải cộng từng phần lại trước khi submit.",
      "Khi lệch số, xem phần Attention & Solutions trước khi hỏi Best.",
    ],
    devSummary:
      "Dev mode giữ workflow steps, batch math, form submission details và validation rules cho shipping cost payment request.",
  },
  "/docs/feature-bestfulfill": {
    userTitle: "Chọn phương án fulfillment tốt",
    userSummary:
      "Trang này mô tả dữ liệu dùng để chọn hoặc đối chiếu chi phí vận chuyển/fulfillment.",
    userBullets: [
      "Dùng khi cần so sánh chi phí vận chuyển theo route hoặc nhà cung cấp.",
      "Dữ liệu rate cần được cập nhật khi bảng giá thay đổi.",
      "Dev mode có file import, script và lookup details.",
    ],
    devSummary: "Dev mode giữ rate CSV import, table joins, command flow and validation notes.",
  },
  "/docs/feature-fulfillment": {
    userTitle: "Fulfillment VNH / NS3",
    userSummary:
      "Trang này giải thích cách đơn hàng được đẩy sang đơn vị fulfillment phù hợp.",
    userBullets: [
      "Dùng để hiểu khi nào đơn được gửi đi và route nào xử lý.",
      "Nếu đơn chưa fulfill, cần kiểm tra trạng thái đơn và queue xử lý.",
      "Dev mode có API, script và request details.",
    ],
    devSummary: "Dev mode giữ Flexport/Shopify fulfillment API flow, request payloads and operational checks.",
  },
  "/docs/feature-bulk-update": {
    userTitle: "Cập nhật hàng loạt",
    userSummary:
      "Trang này nói về công cụ cập nhật nhiều đơn hoặc dữ liệu vận hành cùng lúc.",
    userBullets: [
      "Dùng cẩn thận vì thao tác hàng loạt có thể ảnh hưởng nhiều đơn.",
      "Luôn kiểm tra file đầu vào trước khi chạy.",
      "Dev mode có server, route, command và validation details.",
    ],
    devSummary: "Dev mode giữ Flask/local server, input formats, command flow and failure modes.",
  },
  "/docs/timcook": {
    userTitle: "Openclaw training handover",
    userSummary:
      "Trang này tóm tắt phần bạn phụ trách cho Timcook: chuẩn bị training Openclaw, dẫn buổi học và chốt các việc cần theo dõi.",
    userBullets: [
      "Dùng khi cần onboarding hoặc training cho người mới vào Openclaw.",
      "Trang này giúp gom checklist, agenda và điểm cần follow-up sau buổi training.",
      "Nếu cần chi tiết kỹ thuật sâu hơn, chuyển sang Dev mode.",
    ],
    devSummary:
      "Dev mode giữ training flow, checklist, access prep và follow-up notes cho Openclaw handover.",
  },
  "/docs/api-routes": {
    userTitle: "Các cổng backend của dashboard",
    userSummary:
      "Trang này liệt kê các API nội bộ mà dashboard dùng để lấy dữ liệu hoặc kích hoạt tác vụ.",
    userBullets: [
      "Người dùng bình thường không cần gọi API trực tiếp.",
      "Nếu một màn hình lỗi, dev sẽ dùng trang này để tìm API liên quan.",
      "Dev mode có method, path và purpose chi tiết.",
    ],
    devSummary: "Dev mode giữ route inventory, HTTP methods, purpose and operational notes.",
  },
  "/docs/python-workers": {
    userTitle: "Các tiến trình đồng bộ dữ liệu",
    userSummary:
      "Trang này mô tả các chương trình nền kéo dữ liệu từ dịch vụ bên ngoài về database.",
    userBullets: [
      "Nếu dữ liệu chưa cập nhật, worker có thể chưa chạy hoặc đang lỗi.",
      "Một số worker chạy theo lịch, không phải ngay lập tức.",
      "Dev mode có môi trường Python, rate limit và command details.",
    ],
    devSummary: "Dev mode keeps venv setup, scripts, sync logs, API limits and worker commands.",
  },
  "/docs/troubleshooting": {
    userTitle: "Khi có lỗi thì bắt đầu từ đâu",
    userSummary:
      "Trang này giúp phân loại triệu chứng lỗi và chọn hướng xử lý nhanh nhất.",
    userBullets: [
      "Người dùng nên ghi lại màn hình lỗi, thời điểm, store và thao tác vừa làm.",
      "Không tự chạy lệnh kỹ thuật nếu không phụ trách phần đó.",
      "Dev mode có decision tree, root cause và lệnh fix chi tiết.",
    ],
    devSummary: "Dev mode giữ symptom → cause → fix mapping with exact commands and queries.",
  },
  "/docs/glossary": {
    userTitle: "Từ điển thuật ngữ",
    userSummary:
      "Trang này giải thích các từ viết tắt và thuật ngữ thường gặp trong dự án.",
    userBullets: [
      "User mode ưu tiên giải thích dễ hiểu.",
      "Dev mode giữ tên kỹ thuật chính xác để tránh hiểu sai khi debug.",
      "Nếu một thuật ngữ vẫn khó hiểu, xem thêm trang liên quan trong sidebar.",
    ],
    devSummary: "Dev mode keeps canonical technical terms, abbreviations and implementation references.",
  },
};

export const defaultAudienceBrief: AudienceBrief = {
  userTitle: "Tóm tắt dễ hiểu",
  userSummary:
    "Trang này có cả thông tin vận hành và chi tiết kỹ thuật. User mode ưu tiên ý nghĩa kinh doanh và ẩn bớt lệnh/code.",
  userBullets: [
    "Đọc phần tóm tắt trước để nắm mục đích.",
    "Chuyển sang Dev mode khi cần tên file, command, schema hoặc API.",
    "Nếu bạn chỉ dùng dashboard, không cần làm theo các bước kỹ thuật.",
  ],
  devSummary: "Dev mode hiển thị đầy đủ chi tiết bàn giao kỹ thuật.",
};
