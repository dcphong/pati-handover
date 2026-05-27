import {
  ArrowRight,
  BarChart3,
  Boxes,
  Code2,
  Cog,
  Database,
  Headphones,
  ShoppingBag,
  Truck,
  UserCog,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { FlowNode, FlowRow } from "@/components/docs/visuals";

export const metadata = { title: "Project Overview — PATI Handover" };

// 4 mảng workflow bạn (maintainer kế nhiệm) sẽ trông coi. Không phải 4 persona
// hay 4 team — 1 người gánh hết cả 4, đây chỉ là cách chia mảng cho dễ định vị
// feature/code khi cần sửa.
const personas = [
  {
    icon: Truck,
    role: "Operations",
    userUses: "Mảng fulfillment, giá vốn, routing kho, phí vận chuyển — giữ pipeline chạy và sửa khi lệch.",
    devUses: "COGS catalog, VNH/NS3 routing, shipping rate cards",
  },
  {
    icon: Headphones,
    role: "Customer Service",
    userUses: "CS workflow: 3-panel dashboard + Lark Mail reconcile — giữ sync chạy và refund-rate chính xác.",
    devUses: "CS Dashboard 3-panel, Lark Mail reconcile, customer_profiles + cs_note",
  },
  {
    icon: BarChart3,
    role: "Analytics / Finance",
    userUses: "Doanh thu, chi phí, lợi nhuận + 3 North Stars — giữ TW parity và pipeline ads/Shopify.",
    devUses: "TripleWhale parity P&L, North Stars (Processing / OTIF / Stock Cover)",
  },
  {
    icon: UserCog,
    role: "Engineering / Maintenance",
    userUses: "IAM, cron health, schema migrations — backbone vận hành cả hệ thống.",
    devUses: "IAM, cron health, schema migrations, troubleshooting",
  },
];

const betaFeatures = [
  {
    title: "Bulk Update",
    href: "/docs/feature-bulk-update",
    status: "Beta",
    userDesc:
      "Flask sidecar để thử nghiệm gửi fulfillment hàng loạt từ Lark/Excel/CSV. Không coi là luồng vận hành mặc định.",
    devDesc:
      "/api/bulk/* proxy sang Flask :5000. Dùng khi cần test hoặc xử lý batch có người kiểm soát.",
    checks: [
      "Chỉ chạy khi ops/dev chủ động gửi danh sách đơn.",
      "Không tự chạy theo lịch như cron production.",
      "Nếu lỗi theo từng dòng, sửa input rồi chạy lại batch nhỏ trước.",
    ],
  },
];

const flows = [
  {
    userTitle: "Đơn hàng Shopify",
    devTitle: "Shopify Order Sync → Supabase",
    userDesc: "Đơn hàng mới từ Shopify tự động xuất hiện trong dashboard.",
    devDesc: "pipeline.py fetch paginated, batch upsert.",
    userChain: [
      { label: "Shopify" },
      {
        label: "Đồng bộ tự động",
        info: "2 lần/ngày: 05:00 và 13:00 giờ Việt Nam. Mỗi lần thường vài phút, nhưng có thể lâu hơn nếu nhiều order.",
      },
      { label: "Dashboard" },
    ],
    userDetails: [
      {
        title: "Dữ liệu được đưa vào dashboard",
        items: [
          "Đơn hàng mới và đơn được cập nhật trong Shopify.",
          "Payment status, fulfillment status và customer/order timeline.",
          "Refunds đi qua webhook gần real-time; nếu webhook lỗi thì chờ lần sync kế tiếp để đối chiếu.",
        ],
      },
      {
        title: "Lịch vận hành",
        items: [
          "Orders sync 2 lần/ngày: 05:00 và 13:00 giờ Việt Nam.",
          "Mỗi lần thường vài phút; ngày nhiều order hoặc backfill rộng có thể lâu hơn.",
          "Nếu đơn chưa hiện, kiểm tra lần sync gần nhất trước khi kết luận dữ liệu mất.",
        ],
      },
      {
        title: "Kiểm tra ở đâu",
        items: [
          "Mở Cron Jobs để xem lịch Shopify sync và các job đang chạy trong ngày.",
          "Mở Shopify Sync nếu cần biết order/refund đi vào dashboard qua đường nào.",
          "Mở Troubleshooting khi đơn vẫn chưa hiện sau lần sync kế tiếp.",
        ],
        tableChecks: [
          {
            url: "https://pnl.patigroup.com/orders",
            label: "Orders table",
            check: "Mở bảng orders và nhìn order date / created date mới nhất có phải hôm nay không.",
            stale: "Nếu vẫn là ngày cũ sau mốc 05:00 hoặc 13:00 giờ VN, coi như Shopify cron/sync đang không hoạt động và cần kiểm tra Cron Jobs.",
          },
        ],
        links: [
          { href: "/docs/cron-jobs", label: "Cron Jobs" },
          { href: "/docs/feature-shopify-sync", label: "Shopify Sync" },
          { href: "/docs/troubleshooting", label: "Troubleshooting" },
        ],
      },
    ],
    devChain: ["run", "pipeline.py", "_batch_upsert"],
  },
  {
    userTitle: "Báo cáo kho vận",
    devTitle: "Warehouse + Logistics Sync → Supabase",
    userDesc: "Tồn kho và trạng thái logistics từ 3 nguồn (Flexport · VNH/NS3 · Best) được cập nhật định kỳ.",
    devDesc: "Flexport REST 06h · VNH inventory 11h + tracking-poll · Best qua Lark Base + Shopify FO submit.",
    userChain: [
      {
        label: "Flexport · VNH · Best",
        info:
          "3 nguồn logistics: Flexport (US 3PL, Logistics API REST), VNH/NS3 (kho Việt Nam, custom poll), Best (US 3PL — không có API, dữ liệu shipping cost vào qua Lark Base + workflow Payment Request).",
      },
      {
        label: "Cập nhật định kỳ",
        info:
          "Flexport sync 06h hàng ngày. VNH inventory 11h + vnh-daily-auto 06h + vnh-tracking-poll. Best fulfillment auto-submit stuck FO hằng giờ. Có thể chạy manual qua dashboard khi cần force refresh.",
      },
      { label: "Dashboard" },
    ],
    userDetails: [
      {
        title: "Dữ liệu kho vận",
        items: [
          "Flexport: shipment + tracking + tồn kho US, dùng cho NS#3 stock cover.",
          "VNH / NS3: tồn kho Hà Nội + tracking nội địa + routing US → VNH.",
          "Best: shipping cost theo từng order, vào DB qua workflow Payment Request (CS & OF). Đơn Shopify bị stuck ở Best được tự click 'Request fulfillment' hằng giờ.",
          "Tất cả gom về matview stock cover + bảng inventory để dashboard đối chiếu.",
        ],
      },
      {
        title: "Khi nào cần kiểm tra",
        items: [
          "Tracking Flexport/VNH không cập nhật sau lần sync kế tiếp.",
          "Dashboard báo stock hoặc trạng thái fulfillment lệch với nguồn gốc.",
          "Đơn bị stuck fulfillment ở Best / Flexport — xem trang VNH / NS3 Fulfillment + Best Fulfillment.",
          "Shipping cost của Best không khớp tin nhắn cuối ngày — chạy lại workflow Payment Request.",
        ],
      },
      {
        title: "Kiểm tra ở đâu",
        items: [
          "Mở Cron Jobs để xem lịch job sync-flexport / vnh-* / submit-stuck-fulfillments.",
          "Mở VNH / NS3 Fulfillment + Best Fulfillment khi vấn đề liên quan tracking, warehouse hoặc fulfillment.",
          "Mở CS & OF · Payment Request để rà lại shipping cost của Best.",
        ],
        tableChecks: [
          {
            url: "https://pnl.patigroup.com/portfolio/inventory",
            label: "Inventory portfolio",
            check: "Mở inventory portfolio và xem snapshot/tồn kho mới nhất có cập nhật hôm nay không.",
            stale: "Nếu date/snapshot vẫn cũ, kiểm tra sync-flexport hoặc vnh-inventory.",
          },
          {
            url: "https://pnl.patigroup.com/north-stars",
            label: "North Stars (NS#3 stock cover)",
            check: "Mở North Stars để xem NS3/warehouse stock cover có dùng dữ liệu mới không.",
            stale: "Nếu số không đổi sau lần sync kế tiếp, kiểm tra job Flexport / VNH.",
          },
        ],
        links: [
          { href: "/docs/cron-jobs", label: "Cron Jobs" },
          { href: "/docs/feature-fulfillment", label: "VNH / NS3 Fulfillment" },
          { href: "/docs/feature-bestfulfill", label: "Best Fulfillment" },
          { href: "/docs/cs-of/payment-request", label: "Payment Request — Best Shipping" },
        ],
      },
    ],
    devChain: ["main", "warehouse_sync.pipeline", "_batch_upsert"],
  },
  {
    userTitle: "Gửi đơn đi fulfillment",
    devTitle: "Shopify Order Fulfillment",
    userDesc: "Người vận hành chuẩn bị danh sách đơn, hệ thống gửi yêu cầu fulfillment hàng loạt.",
    devDesc: "bulk-update Flask server (input Lark/Excel).",
    userChain: [
      { label: "Danh sách đơn" },
      {
        label: "Kiểm tra",
        info: "Auto-submit đơn bị kẹt chạy mỗi giờ. Bulk fulfillment theo file thì chạy khi ops gửi danh sách.",
      },
      { label: "Gửi fulfillment" },
    ],
    userDetails: [
      {
        title: "Danh sách đơn có thể đến từ đâu",
        items: [
          "Lark Base URL: dùng khi đã có sẵn bảng đơn trong Lark.",
          "Excel/CSV upload: dùng khi có file từ warehouse, vendor hoặc export nội bộ.",
          "Order ID list: dùng khi chỉ cần xử lý một danh sách order ngắn.",
        ],
      },
      {
        title: "Thông tin cần kiểm tra trước khi gửi",
        items: [
          "Order/customer/tracking phải khớp với đơn cần fulfill.",
          "Warehouse hoặc tuyến fulfillment phải đúng nếu đơn đi VNH/NS3.",
          "Lỗi sẽ hiện theo từng dòng để ops biết order nào cần sửa rồi chạy lại.",
        ],
      },
      {
        title: "Lịch tự động",
        items: [
          "Đơn fulfillment bị kẹt được kiểm tra mỗi giờ.",
          "Bulk fulfillment theo file không tự chạy theo giờ; ops gửi danh sách thì hệ thống mới xử lý.",
        ],
      },
      {
        title: "Kiểm tra ở đâu",
        items: [
          "Mở Bulk Update để xem 3 kiểu input danh sách đơn.",
          "Mở VNH / NS3 Fulfillment nếu vấn đề là warehouse/routing hoặc auto-submit đơn kẹt.",
          "Mở Cron Jobs để xem lịch auto-submit mỗi giờ.",
        ],
        tableChecks: [
          {
            url: "https://pnl.patigroup.com/vnh-fulfill",
            label: "VNH fulfill",
            check: "Mở VNH fulfill để xem danh sách/order cần gửi fulfillment còn đúng trạng thái không.",
            stale: "Nếu order đã đổi trạng thái ở Shopify nhưng trang vẫn cũ, kiểm tra fulfillment/order sync.",
          },
          {
            url: "https://pnl.patigroup.com/bulk-update",
            label: "Bulk update",
            check: "Mở Bulk Update để kiểm tra file/list vừa gửi và progress/error theo từng order.",
            stale: "Nếu kết quả không cập nhật hoặc progress đứng, kiểm tra bulk service trước khi gửi lại.",
          },
        ],
        links: [
          { href: "/docs/feature-bulk-update", label: "Bulk Update" },
          { href: "/docs/feature-fulfillment", label: "VNH / NS3 Fulfillment" },
          { href: "/docs/cron-jobs", label: "Cron Jobs" },
        ],
      },
    ],
    devChain: ["run_fulfill", "shopify_fulfiller", "_shopify_request"],
  },
  {
    userTitle: "Báo cáo tài chính",
    devTitle: "Analytics ETL",
    userDesc: "Doanh thu, refund, ad spend và COGS được gom lại để ra P&L.",
    devDesc: "raw_orders / raw_refunds / raw_ad_spend → v_stvf → summary_metrics RPC.",
    userChain: [
      { label: "Nguồn dữ liệu" },
      {
        label: "Chuẩn hóa",
        info: "Một số nguồn chạy theo giờ, một số chạy hằng ngày. Meta Ads chạy hourly; Klaviyo/Google Ads chạy daily.",
      },
      { label: "P&L" },
    ],
    userDetails: [
      {
        title: "Nguồn tạo P&L",
        items: [
          "Shopify: orders, refunds, payment status và payments balance.",
          "Ads/email/subscription: Meta Ads, Google Ads, Klaviyo và Recharge.",
          "Lark: COGS đúng theo PO và shipping/fulfillment cost.",
          "Payment gateways: phí cổng thanh toán và payout khi có dữ liệu.",
        ],
      },
      {
        title: "Tần suất cập nhật",
        items: [
          "Meta Ads chạy hourly.",
          "Klaviyo và Google Ads chạy daily.",
          "COGS/Shipping phụ thuộc Lark sync hoặc CSV import mới nhất.",
        ],
      },
      {
        title: "Khi số P&L lạ",
        items: [
          "Kiểm tra đúng store và khoảng ngày trước.",
          "Sau đó kiểm tra nguồn dữ liệu nào vừa sync trễ hoặc thiếu.",
          "COGS thấp bất thường thường do dùng nhầm Shopify variant cost thay vì Lark COGS.",
        ],
      },
      {
        title: "Kiểm tra ở đâu",
        items: [
          "Mở Analytics nếu số P&L, ads, refund hoặc provider cost lệch.",
          "Mở COGS Catalog nếu vấn đề là giá vốn.",
          "Mở Cron Jobs nếu nghi dữ liệu chưa sync xong.",
        ],
        tableChecks: [
          {
            url: "https://pnl.patigroup.com/analytics",
            label: "Analytics dashboard",
            check: "Mở Analytics, chọn đúng store/date range và xem số hôm nay có đổi sau lịch sync không.",
            stale: "Nếu hôm nay vẫn $0 hoặc số không đổi sau lịch provider sync, kiểm tra provider cron tương ứng.",
          },
          {
            url: "https://pnl.patigroup.com/analytics/summary",
            label: "Analytics summary (TW parity)",
            check: "Mở Analytics → Summary khi cần đối chiếu card P&L / TripleWhale parity.",
            stale: "Nếu card dùng data cũ hoặc stale overlay, kiểm tra analytics sync và cache trước khi kết luận số sai.",
          },
          {
            url: "https://pnl.patigroup.com/analytics/cost-settings",
            label: "Cost Settings (COGS tab)",
            check: "Mở Analytics → Cost Settings → COGS tab nếu profit/COGS thấp bất thường.",
            stale: "Nếu COGS chưa nhận update từ Lark, kiểm tra COGS sync thay vì dùng Shopify cost.",
          },
        ],
        links: [
          { href: "/docs/feature-analytics", label: "Analytics" },
          { href: "/docs/feature-cogs", label: "COGS Catalog" },
          { href: "/docs/cron-jobs", label: "Cron Jobs" },
        ],
      },
    ],
    devChain: ["provider sync", "raw_*", "v_stvf", "summary_metrics"],
  },
];

const coreFlows = flows.filter((flow) => flow.devTitle !== "Shopify Order Fulfillment");

const nextCards = [
  {
    href: "/docs/setup",
    icon: Cog,
    title: "Local Setup",
    userDesc: "Cài dự án trên máy cá nhân và mở dashboard để kiểm tra.",
    devDesc: "Clone, install, env, run dev — 6 bước hand-holding.",
  },
  {
    href: "/docs/supabase",
    icon: Database,
    title: "Supabase Connection",
    userDesc: "Hiểu database trung tâm đang lưu dữ liệu của dashboard.",
    devDesc: "Self-host master_app, 4 trap RLS / cache / row-cap.",
  },
  {
    href: "/docs/architecture",
    icon: Boxes,
    title: "Architecture",
    userDesc: "Xem các phần chính của hệ thống và chúng nối với nhau ra sao.",
    devDesc: "5 layer, cluster maps, invariants không được phá.",
  },
  {
    href: "/docs/troubleshooting",
    icon: ShoppingBag,
    title: "Troubleshooting",
    userDesc: "Bắt đầu từ triệu chứng thường gặp và đi tới cách xử lý.",
    devDesc: "Decision tree: triệu chứng → cause → fix.",
  },
];

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Getting Started"
        title="Project Overview"
        description="Cái gì là pati-master-app, ai dùng, các phần ráp với nhau ra sao."
      />

      <h2 id="what-it-is">Sản phẩm là gì</h2>
      <p data-user-detail>
        <strong>pati-master-app</strong> là dashboard vận hành cho PATI Group. Nó gom dữ liệu từ
        Shopify, Lark, kho vận và các kênh marketing thành một nguồn số liệu cho mọi workflow —
        Operations, CS, Finance/Analytics. Sau bàn giao, một maintainer duy nhất giữ pipeline này chạy.
      </p>
      <p data-user-detail>
        Dashboard chạy ở{" "}
        <a href="https://pnl.patigroup.com" target="_blank" rel="noreferrer">
          pnl.patigroup.com
        </a>
        . Người dùng bình thường chỉ cần biết dữ liệu được cập nhật tự động; khi số liệu lệch hoặc
        thiếu, chuyển sang trang troubleshooting hoặc gọi dev kiểm tra pipeline.
      </p>
      <p data-dev-detail>
        <strong>pati-master-app</strong> là full-stack operations dashboard cho PATI Group. Nó
        đồng bộ data giữa <strong>Shopify · Lark (Feishu) Base · Flexport</strong> và các
        analytics provider (Meta / Google / Klaviyo / Recharge / PayPal), lưu vào{" "}
        <strong>Supabase Postgres</strong> self-host trên Mac mini đặt tại văn phòng PATI.
      </p>
      <p data-dev-detail>
        UI là dashboard Next.js (
        <a href="https://pnl.patigroup.com" target="_blank" rel="noreferrer">
          pnl.patigroup.com
        </a>
        ) bao quát các mảng Operations / CS / Analytics. Sync workers Python chạy trên cron để pull
        data từ external và push vào Supabase. Toàn bộ pipeline + UI sẽ do 1 maintainer duy nhất
        trông coi sau bàn giao.
      </p>

      <h2 id="who-uses-it">Các mảng dashboard bạn sẽ trông coi</h2>
      <div className="not-prose my-5 grid sm:grid-cols-2 gap-3">
        {personas.map((p) => (
          <div key={p.role} className="rounded-lg border bg-card p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="h-7 w-7 rounded-md bg-muted grid place-items-center">
                <p.icon className="h-3.5 w-3.5" />
              </div>
              <div className="font-semibold text-[14px]">{p.role}</div>
            </div>
            <div className="text-[12.5px] text-muted-foreground leading-5">
              <span data-user-detail>{p.userUses}</span>
              <span data-dev-detail>{p.devUses}</span>
            </div>
          </div>
        ))}
      </div>

      <h2 id="two-layers">
        <span data-user-detail>Dashboard hoạt động theo 2 phần</span>
        <span data-dev-detail>2 layer — split rạch ròi theo runtime</span>
      </h2>
      <div data-user-detail className="not-prose my-6 grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl border-2 border-violet-500/40 bg-violet-500/[0.04] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Code2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            <div className="text-[11px] uppercase tracking-widest font-semibold text-violet-700 dark:text-violet-300">
              Màn hình dashboard
            </div>
          </div>
          <div className="text-[13px] text-foreground/85 leading-6">
            Đây là phần người dùng mở trên browser để xem số liệu, thao tác fulfillment, kiểm tra
            CS và đọc báo cáo.
          </div>
        </div>
        <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-500/[0.04] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Workflow className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <div className="text-[11px] uppercase tracking-widest font-semibold text-emerald-700 dark:text-emerald-300">
              Các job đồng bộ dữ liệu
            </div>
          </div>
          <div className="text-[13px] text-foreground/85 leading-6">
            Đây là phần chạy nền để lấy dữ liệu mới từ Shopify, Lark, kho vận và các kênh
            marketing rồi cập nhật vào database.
          </div>
        </div>
      </div>
      <div data-dev-detail className="not-prose my-6 grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl border-2 border-violet-500/40 bg-violet-500/[0.04] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Code2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            <div className="text-[11px] uppercase tracking-widest font-semibold text-violet-700 dark:text-violet-300">
              Layer 1 — Web dashboard
            </div>
          </div>
          <div className="space-y-1 text-[13px] leading-6">
            <Fact label="Runtime" value="Next.js 16 (TypeScript) · Node 24" />
            <Fact label="Code path" value="src/" />
            <Fact label="Host" value="Mac mini launchd · next start :3000" />
            <Fact label="Reads + writes" value="Supabase qua REST + RPC" />
          </div>
        </div>
        <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-500/[0.04] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Workflow className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <div className="text-[11px] uppercase tracking-widest font-semibold text-emerald-700 dark:text-emerald-300">
              Layer 2 — Sync workers
            </div>
          </div>
          <div className="space-y-1 text-[13px] leading-6">
            <Fact label="Runtime" value="Python 3.12 · venv" />
            <Fact label="Code path" value="sync/" />
            <Fact label="Host" value="Mac mini launchd cron + GitHub Actions" />
            <Fact label="WRITE-only" value="batch upsert vào Supabase" />
          </div>
        </div>
      </div>

      <p data-user-detail>
        Hai phần này không gọi nhau trực tiếp. Chúng gặp nhau ở database: job nền ghi dữ liệu mới,
        dashboard đọc dữ liệu đó để hiển thị.
      </p>
      <p data-dev-detail>Hai layer KHÔNG nói chuyện trực tiếp — chỉ giao tiếp qua Postgres:</p>
      <div data-user-detail className="not-prose my-5 rounded-xl border bg-card p-4">
        <FlowRow arrows="right">
          {[
            <FlowNode key="jobs" icon={Workflow} label="Job nền" sub="Cập nhật dữ liệu" tone="emerald" />,
            <FlowNode key="db" icon={Database} label="Database" sub="Nguồn dữ liệu chung" tone="pink" />,
            <FlowNode key="web" icon={Code2} label="Dashboard" sub="Người dùng thao tác" tone="violet" />,
          ]}
        </FlowRow>
      </div>
      <div data-dev-detail className="not-prose my-5 rounded-xl border bg-card p-4">
        <FlowRow arrows="right">
          {[
            <FlowNode
              key="workers"
              icon={Workflow}
              label="Python workers"
              sub="WRITE batch upsert"
              tone="emerald"
            />,
            <FlowNode
              key="db"
              icon={Database}
              label="Supabase Postgres"
              sub="master_app schema"
              tone="pink"
            />,
            <FlowNode
              key="web"
              icon={Code2}
              label="Next.js dashboard"
              sub="READ + mutation"
              tone="violet"
            />,
          ]}
        </FlowRow>
      </div>

      <Callout variant="info" title="Source-of-truth rule">
        <p>
          <strong>Shopify là nguồn đúng cho orders.</strong> Order, payment status, fulfillment
          status và customer/order timeline đi từ Shopify sang dashboard. Date backfill đã chạy 1
          lần ngày 2026-05-07 và đã lock, đừng chạy lại.
        </p>
        <p data-user-detail>
          <strong>COGS thì không lấy từ Shopify.</strong> Cost trên Shopify variant chỉ là số cost
          nhập trong Shopify Admin, thường thiếu barcode, lab fee, vận chuyển PO về kho, designer
          và fulfillment. Nếu dùng số đó cho P&amp;L, COGS sẽ bị thấp hơn thực tế.
        </p>
        <p data-dev-detail>
          <strong>COGS thì không lấy từ Shopify variant cost.</strong>{" "}
          <code>raw_variants.cost</code> map từ Shopify <code>variants.inventory_item.cost</code>,
          chỉ có partial coverage. Nó bỏ qua barcode, lab, transport, designer và fulfillment nên
          không được dùng làm analytics COGS.
        </p>
        <p>
          <strong>Lark COGS mới là nguồn đúng cho giá vốn.</strong> Lark lưu breakdown theo từng PO
          và được sync về catalog COGS dùng cho analytics.
        </p>
        <Link
          href="/docs/feature-cogs"
          className="inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-4"
        >
          Xem Lark COGS Catalog
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <span data-dev-detail className="mt-2 block text-xs text-muted-foreground">
          Dev detail: join <code>master_app.cogs_full_catalog</code>, không join{" "}
          <code>raw_variants.cost</code>.
        </span>
      </Callout>

      <h2 id="key-flows">
        <span data-user-detail>4 luồng chính cần nắm</span>
        <span data-dev-detail>4 execution flow chính</span>
      </h2>
      <p data-user-detail>
        Hiểu 4 luồng này là đủ để biết dữ liệu đi từ đâu tới đâu và khi nào cần kiểm tra.
      </p>
      <p data-dev-detail>
        Hiểu được 4 flow này = hiểu phần vận hành chính của hệ thống. Mỗi flow tương ứng 1 trang chi tiết.
      </p>
      <div className="not-prose my-6 space-y-3">
        {coreFlows.map((f, i) => (
          <div key={f.devTitle} className="rounded-xl border bg-card overflow-visible">
            <div className="flex items-center gap-3 px-4 py-2.5 border-b bg-muted/30">
              <span className="grid place-items-center h-6 w-6 rounded-full bg-foreground text-background text-[11px] font-bold tabular-nums">
                {i + 1}
              </span>
              <div className="font-semibold text-[14px] flex-1">
                <span data-user-detail>{f.userTitle}</span>
                <span data-dev-detail>{f.devTitle}</span>
              </div>
            </div>
            <div className="px-4 py-3">
              <div className="text-[12.5px] text-muted-foreground mb-2 leading-5">
                <span data-user-detail>{f.userDesc}</span>
                <span data-dev-detail>{f.devDesc}</span>
              </div>
              <div data-user-detail>
                <FlowRow arrows="right">
                  {f.userChain.map((c, j) => (
                    <FlowNode
                      key={j}
                      label={c.label}
                      info={c.info}
                      tone={
                        j === 0 ? "violet" : j === f.userChain.length - 1 ? "emerald" : "neutral"
                      }
                    />
                  ))}
                </FlowRow>
                <UserFlowDetails sections={f.userDetails} />
              </div>
              <div data-dev-detail>
                <FlowRow arrows="right">
                  {f.devChain.map((c, j) => (
                    <FlowNode
                      key={j}
                      label={c}
                      tone={
                        j === 0 ? "violet" : j === f.devChain.length - 1 ? "emerald" : "neutral"
                      }
                    />
                  ))}
                </FlowRow>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 id="beta-test-features">Beta / test features</h2>
      <p data-user-detail>
        Các phần dưới đây có ích khi test hoặc xử lý case đặc biệt, nhưng không nằm trong overview
        vận hành chính. Đừng dùng chúng như workflow mặc định nếu bạn (maintainer) chưa confirm.
      </p>
      <p data-dev-detail>
        Các feature này vẫn có tài liệu riêng, nhưng được tách khỏi core overview vì blast radius và
        trạng thái vận hành chưa ổn định như luồng production.
      </p>
      <div className="not-prose my-5 grid gap-3 sm:grid-cols-2">
        {betaFeatures.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className="group rounded-xl border border-amber-500/35 bg-amber-500/[0.04] p-4 transition-colors hover:border-amber-500/60"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="font-semibold text-[14px]">{feature.title}</div>
              <span className="rounded-full border border-amber-500/40 bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                {feature.status}
              </span>
            </div>
            <div className="text-[12.5px] leading-5 text-muted-foreground">
              <span data-user-detail>{feature.userDesc}</span>
              <span data-dev-detail>{feature.devDesc}</span>
            </div>
            <ul className="mt-3 space-y-1.5 text-[12px] leading-5 text-foreground/75">
              {feature.checks.map((check) => (
                <li key={check} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                  <span>{check}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-foreground group-hover:underline">
              Open beta docs
              <ArrowRight className="h-3 w-3" />
            </div>
          </Link>
        ))}
      </div>

      <h2 id="next">Bước tiếp theo</h2>
      <div className="not-prose my-5 grid sm:grid-cols-2 gap-3">
        {nextCards.map((card) => (
          <NextCard key={card.href} {...card} />
        ))}
      </div>

      <PageNav href="/docs/overview" />
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground w-24 shrink-0">
        {label}
      </span>
      <code className="font-mono text-[12px] text-foreground/90">{value}</code>
    </div>
  );
}

function UserFlowDetails({
  sections,
}: {
  sections: Array<{
    title: string;
    items: string[];
    tableChecks?: Array<{
      url: string;
      label: string;
      check: string;
      stale: string;
    }>;
    links?: Array<{ href: string; label: string }>;
  }>;
}) {
  return (
    <details className="group mt-3 rounded-lg border bg-muted/20">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 text-[13px] font-semibold">
        <span>Chi tiết vận hành</span>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-open:rotate-90" />
      </summary>
      <div className="border-t px-3 py-3">
        <div className="grid gap-3 sm:grid-cols-2">
          {sections.map((section) => (
            <div key={section.title} className="rounded-md border bg-background/70 p-3">
              <div className="text-[12.5px] font-semibold mb-1.5">{section.title}</div>
              <ul className="space-y-1.5 text-[12.5px] leading-5 text-muted-foreground">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {section.tableChecks && (
                <div className="mt-3 space-y-2">
                  {section.tableChecks.map((tableCheck) => (
                    <div
                      key={tableCheck.url}
                      className="rounded-md border border-blue-500/25 bg-blue-500/[0.04] p-2.5"
                    >
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                          Table sync check
                        </span>
                        <a
                          href={tableCheck.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded border bg-background px-1.5 py-0.5 text-[12px] font-medium hover:bg-muted"
                        >
                          {tableCheck.label}
                          <ArrowRight className="h-3 w-3" />
                        </a>
                      </div>
                      <div className="text-[12px] leading-5 text-foreground/80">
                        {tableCheck.check}
                      </div>
                      <div className="mt-1 text-[12px] leading-5 text-muted-foreground">
                        {tableCheck.stale}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {section.links && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {section.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1 text-[12px] font-medium hover:bg-muted"
                    >
                      {link.label}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}

function NextCard({
  href,
  icon: Icon,
  title,
  userDesc,
  devDesc,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  userDesc: string;
  devDesc: string;
}) {
  return (
    <a
      href={href}
      className="group rounded-lg border bg-card p-3.5 hover:border-foreground/30 transition-all"
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-foreground/80" />
          <div className="font-semibold text-[14px]">{title}</div>
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
      </div>
      <div className="text-[12.5px] text-muted-foreground leading-5">
        <span data-user-detail>{userDesc}</span>
        <span data-dev-detail>{devDesc}</span>
      </div>
    </a>
  );
}
