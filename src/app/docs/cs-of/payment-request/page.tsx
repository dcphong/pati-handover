import { AlertTriangle, CircleCheckBig, Search } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { PreviewableFigure } from "@/components/docs/previewable-figure";
import { Step, Steps, StepCheck, TerminalInline } from "@/components/docs/visuals";
import prStep1 from "@/assets/OF/PR/image1.png";
import prExportCsv from "@/assets/OF/PR/image2.png";
import prOutputCheck from "@/assets/OF/PR/image3.png";
import prOutputCheckAlt from "@/assets/OF/PR/image4.png";
import prForm1 from "@/assets/OF/PR/image5.png";
import prForm2 from "@/assets/OF/PR/image6.png";
import prForm3 from "@/assets/OF/PR/image7.png";
import prForm4 from "@/assets/OF/PR/image8.png";
import prForm5 from "@/assets/OF/PR/image9.png";
import prApproval1 from "@/assets/OF/PR/image10.png";
import prApproval2 from "@/assets/OF/PR/image11.png";
import prAttention1 from "@/assets/OF/PR/image12.png";
import prAttention2 from "@/assets/OF/PR/image13.png";
import prAttention3 from "@/assets/OF/PR/image14.png";

const LARK_BASE_URL =
  "https://paticreativeagency.sg.larksuite.com/wiki/JhiDwNmtwizHQ6kTV8slDMJZgOr?table=tblcV9D0F3alJajJ&view=vewQMTdXqs";
const OUTPUT_TEMPLATE_URL =
  "https://docs.google.com/spreadsheets/d/14j0FvZJCqI03Ak-ImbrHPFO98m4xG9HtzvB3WWTR2Pg/edit?usp=sharing";
const PROMPT_URL =
  "https://docs.google.com/document/d/1w-3lyqi9GWQol2_n2yVfnH8giL2P-wuO4mqzv1B5QYI/edit?usp=sharing";
const PAYMENT_FORM_URL =
  "https://paticreativeagency.sg.larksuite.com/share/base/form/shrlgdjWNHXRURbjYx5kHl5LFcb?from=from_parent_docs";
const ADDITIONAL_ITEM_SHIPPING_COST_URL =
  "https://paticreativeagency.sg.larksuite.com/wiki/JhiDwNmtwizHQ6kTV8slDMJZgOr?table=tbljgr7rhuZPNob4&view=vewGLOwukq";
const BEST_CANNOT_SHIP_URL =
  "https://paticreativeagency.sg.larksuite.com/wiki/JhiDwNmtwizHQ6kTV8slDMJZgOr?table=tbloYzPvpIRSE4it&view=vewYzPtwrL";

export const metadata = { title: "Payment Request — Shipping Cost · CS & OF" };

const batchExamples = [
  {
    label: "2 days",
    shilajit: "$343.98 + $160.29",
    warehouse: "$66.40",
    total: "$504.27",
  },
  {
    label: "2 days",
    shilajit: "$344.75 + $134.19",
    warehouse: "$94.80",
    total: "$478.94",
  },
  {
    label: "4 days",
    shilajit: "$480.69 + $267.60",
    warehouse: "$210.00",
    total: "$748.29",
  },
];

const sourceLinks = [
  {
    title: "Lark Base export view",
    href: LARK_BASE_URL,
    desc: "Table + view dùng để export CSV.",
  },
  {
    title: "Output template",
    href: OUTPUT_TEMPLATE_URL,
    desc: "File template cho payment request output.",
  },
  {
    title: "Prompt doc",
    href: PROMPT_URL,
    desc: "Prompt chuẩn dùng để generate request text.",
  },
  {
    title: "Payment Request Form",
    href: PAYMENT_FORM_URL,
    desc: "Form Lark dùng để submit request cuối cùng.",
  },
];

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="CS & OF · Workflow"
        title="Payment Request — Shipping Cost"
        description="Workflow tạo payment request cho shipping cost của Best: lấy cost đúng nguồn, gom batch, export CSV, kiểm tra output rồi submit form."
      />

      <Callout variant="info" title="Đọc trước khi làm">
        Đừng lấy số từ tin nhắn <TerminalInline>total cost cuối ngày</TerminalInline>. Workflow này
        bắt đầu từ cost thô trong Lark Base, sau đó mới gom theo batch nếu cần.
      </Callout>

      <h2 id="sources">Source links</h2>
      <div data-user-detail className="not-prose my-5 grid gap-3 sm:grid-cols-2">
        {sourceLinks.map((item) => (
          <ExternalCard
            key={item.title}
            href={item.href}
            title={item.title}
            desc={item.desc}
          />
        ))}
      </div>

      <h2 id="steps">Main steps</h2>
      <Steps>
        <Step n={1} title="Lấy cost gốc">
          <p>
            Chỉ lấy cost theo từng order/period cần thanh toán. Không lấy tin nhắn tổng cuối ngày.
          </p>
          <StepCheck>
            Nếu payment request làm sau 2-3 ngày, gom các phần cost lại trước khi tính tổng.
          </StepCheck>
          <PreviewableFigure
            src={prStep1}
            alt="Ảnh minh họa bước lấy cost gốc"
            caption="Bước 1 - lấy cost gốc, không dùng total cuối ngày."
          />
        </Step>

        <Step n={2} title="Export CSV từ Lark Base">
          <p>
            Mở Lark Base, filter theo <TerminalInline>Date Range</TerminalInline> cho gọn rồi export
            CSV sang Docs.
          </p>
          <StepCheck>
            Chọn option export đã configured sẵn để file ra đúng format cho bước sau.
          </StepCheck>
          <div className="not-prose mt-3 flex flex-wrap items-center gap-2">
            <Link
              href={LARK_BASE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-md border bg-background px-3 py-1.5 text-[13px] font-medium hover:bg-muted transition-colors"
            >
              Open Lark Base
            </Link>
            <span className="text-[12px] text-muted-foreground">
              Link gốc từ DOCX, dùng đúng table + view cho export.
            </span>
          </div>
          <PreviewableFigure
            src={prExportCsv}
            alt="Ảnh minh họa cấu hình export CSV"
            caption="Bước 2 - filter date range và export CSV theo option đã cấu hình."
          />
        </Step>

        <Step n={3} title="Gửi dữ liệu cho AI">
          <p>
            Gửi cost, file CSV ở bước trước và prompt <TerminalInline>Payment Request</TerminalInline>.
            Nếu có file xlsx template thì gửi kèm để AI đọc dễ hơn.
          </p>
          <div className="not-prose mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[13px] text-muted-foreground">Prompt:</span>
            <SourcePill href={OUTPUT_TEMPLATE_URL} kind="sheet">
              Output_Template
            </SourcePill>
            <SourcePill href={PROMPT_URL} kind="docs">
              Prompt - Payment Request
            </SourcePill>
          </div>
        </Step>

        <Step n={4} title="Kiểm tra output">
          <p>
            Đảm bảo output có <TerminalInline>Transfer content</TerminalInline> và đủ các khoản chi
            theo số ngày đã gom.
          </p>
          <StepCheck>
            So lại total cost cuối cùng với số Best đã tính trước khi chuyển sang form.
          </StepCheck>
          <div className="not-prose mt-4 grid gap-3">
            <PreviewableFigure
              src={prOutputCheck}
              alt="Ảnh minh họa bảng kiểm tra output"
              caption="Bước 4 - rà lại Cost Difference, Right/Wrong và duplicate."
            />
            <PreviewableFigure
              src={prOutputCheckAlt}
              alt="Ảnh minh họa BEST CANNOT SHIP và case cần kiểm tra"
              caption="Bước 4 - kiểm tra các line bị flag trước khi sang form."
            />
          </div>
        </Step>

        <Step n={5} title="Nhập payment request form">
          <p>
            Mở Payment Request Form, chọn các field cần thiết. Nhiều field sẽ tự generated nên
            không cần đụng vào.
          </p>
          <StepCheck>
            Search <TerminalInline>BEST</TerminalInline> để lấy tài khoản PayPal của BEST.
          </StepCheck>
          <div className="not-prose mt-3 flex flex-wrap items-center gap-2">
            <Link
              href={PAYMENT_FORM_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-md border bg-background px-3 py-1.5 text-[13px] font-medium hover:bg-muted transition-colors"
            >
              Open payment form
            </Link>
          </div>
          <div className="not-prose mt-4 grid gap-3">
            <PreviewableFigure
              src={prForm1}
              alt="Ảnh minh họa phần phân loại và account name"
              caption="Form - Phân loại và account name."
            />
            <PreviewableFigure
              src={prForm2}
              alt="Ảnh minh họa department optional"
              caption="Form - Department optional."
            />
            <PreviewableFigure
              src={prForm3}
              alt="Ảnh minh họa accounting period và NDCK"
              caption="Form - Accounting Period và NDCK."
            />
            <PreviewableFigure
              src={prForm4}
              alt="Ảnh minh họa đối tượng nhận và BEST account"
              caption="Form - Đối tượng nhận, BEST và PayPal account."
            />
            <PreviewableFigure
              src={prForm5}
              alt="Ảnh minh họa phần đính kèm chứng từ"
              caption="Form - File link và attachment trước khi submit."
            />
          </div>
        </Step>

        <Step n={6} title="Submit và theo dõi trạng thái">
          <p>
            Submit xong thì đợi anh Quang approved và paid. Khi đã paid, báo Best để họ cập nhật
            lại cost.
          </p>
          <div className="not-prose mt-4 grid gap-3">
            <PreviewableFigure
              src={prApproval1}
              alt="Ảnh minh họa trạng thái submit thành công"
              caption="Bước 6 - submit thành công và chờ approved."
            />
            <PreviewableFigure
              src={prApproval2}
              alt="Ảnh minh họa trạng thái paid sau khi được duyệt"
              caption="Bước 6 - sau khi paid thì báo lại cho Best."
            />
          </div>
        </Step>
      </Steps>

      <h2 id="batching">Batch math</h2>
      <p>
        Khi gom 2-3 ngày thành một payment request, chỉ cần cộng các phần cost của Shilajit với
        phần cost hàng US warehouse tương ứng.
      </p>
      <div data-user-detail className="not-prose my-5 grid gap-3 md:grid-cols-3">
        {batchExamples.map((row) => (
          <div key={`${row.label}-${row.total}`} className="rounded-xl border bg-card p-4">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1.5">
              {row.label}
            </div>
            <div className="text-[13px] leading-6 text-foreground/85">
              Shilajit: {row.shilajit}
              <br />
              US warehouse: {row.warehouse}
            </div>
            <div className="mt-3 font-semibold text-[14px]">{row.total}</div>
          </div>
        ))}
      </div>

      <h2 id="attention">Attention & solutions</h2>
      <div data-user-detail className="not-prose my-5 rounded-xl border bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <Search className="h-4 w-4 text-foreground/70" />
          <div className="font-semibold text-[14px]">
            Luôn đối chiếu với Best Orders Shipping Cost
          </div>
        </div>
        <div className="not-prose mt-4 grid gap-3">
          <PreviewableFigure
            src={prAttention1}
            alt="Ảnh minh họa bảng kiểm tra output"
            caption="Cost Difference và Right/Wrong."
          />
          <PreviewableFigure
            src={prAttention2}
            alt="Ảnh minh họa bảng kiểm tra duplicate"
            caption="Duplication checking và BEST CANNOT SHIP."
          />
        </div>
        <ol className="ml-5 list-decimal text-[13px] leading-6 space-y-1">
          <li>Nếu cost difference âm hay dương, báo order number để BEST tính lại.</li>
          <li>
            Nếu case dương, kiểm tra order có nhiều line item hay không. Item thứ 2 có thể bị charge
            theo{" "}
            <Link href={ADDITIONAL_ITEM_SHIPPING_COST_URL} target="_blank" rel="noreferrer" className="underline decoration-dotted underline-offset-2 text-blue-700 hover:text-blue-600">
              Additional Item Shipping Cost
            </Link>.
            <div className="not-prose mt-3">
              <PreviewableFigure
                src={prAttention3}
                alt="Ảnh minh họa case cost dương cần hỏi Best tính lại"
                caption="Case dương - hỏi Best tính lại để đối chiếu đúng cost."
              />
            </div>
          </li>
          <li>Nếu cùng lúc trùng variants và order number thì mark duplicated và báo Best kiểm tra.</li>
          <li>
            Nếu order nằm trong{" "}
            <Link href={BEST_CANNOT_SHIP_URL} target="_blank" rel="noreferrer" className="underline decoration-dotted underline-offset-2 text-blue-700 hover:text-blue-600">
              BEST CANNOT SHIP
            </Link>{" "}
            thì không nên tính
            vào cost, phải hỏi lại Best vì sao đơn đó xuất hiện.
          </li>
        </ol>
      </div>

      <div data-user-detail className="not-prose my-5 rounded-xl border-2 border-amber-500/40 bg-amber-500/[0.04] p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold text-[14px] mb-1">Nguyên tắc đọc cho người mới</div>
            <div className="text-[13px] leading-6 text-foreground/85">
              Quy trình này là chuỗi kiểm tra và xác nhận, không phải chỉ “điền form rồi submit”.
              Nếu bước đối chiếu với Best chưa khớp thì dừng lại ở đó.
            </div>
          </div>
        </div>
      </div>

      <h2 id="checklist">Quick handoff checklist</h2>
      <div data-user-detail className="not-prose my-5 rounded-xl border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <CircleCheckBig className="h-4 w-4 text-foreground/70" />
          <div className="font-semibold text-[14px]">Trước khi coi là xong</div>
        </div>
        <ul className="ml-5 list-disc text-[13px] leading-6 space-y-1">
          <li>Cost nguồn vào đã lọc đúng date range.</li>
          <li>CSV export đủ để người sau mở lại và kiểm tra.</li>
          <li>Prompt và output đã được đối chiếu với total cost.</li>
          <li>Payment request đã submit và trạng thái được theo dõi đến paid.</li>
          <li>Best đã được báo cập nhật lại cost sau khi paid.</li>
        </ul>
      </div>

      <PageNav href="/docs/cs-of/payment-request" />
    </>
  );
}

function ExternalCard({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group rounded-xl border bg-card p-4 hover:border-foreground/30 transition-colors"
    >
      <div className="font-semibold text-[14px] mb-1">{title}</div>
      <div className="text-[12.5px] leading-5 text-muted-foreground group-hover:text-foreground/80">
        {desc}
      </div>
    </a>
  );
}

function SourcePill({
  href,
  kind,
  children,
}: {
  href: string;
  kind: "docs" | "sheet";
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-[13px] font-medium hover:bg-muted transition-colors"
    >
      {kind === "docs" ? <DocsBadge /> : <SheetBadge />}
      <span>{children}</span>
    </Link>
  );
}

function DocsBadge() {
  return (
    <span className="inline-flex h-4 w-4 items-center justify-center rounded-[3px] bg-blue-600/15 text-blue-700 dark:text-blue-300">
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
        <path
          d="M4 1.5h5.5L12.5 4v10.5A1.5 1.5 0 0 1 11 16H4a1.5 1.5 0 0 1-1.5-1.5v-13A1.5 1.5 0 0 1 4 1.5Z"
          fill="currentColor"
          opacity="0.18"
        />
        <path d="M9.5 1.5V4H12.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M4.9 6.2h6.2M4.9 8.4h6.2M4.9 10.6h4.2" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function SheetBadge() {
  return (
    <span className="inline-flex h-4 w-4 items-center justify-center rounded-[3px] bg-emerald-600/15 text-emerald-700 dark:text-emerald-300">
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
        <path
          d="M4 1.5h5.5L12.5 4v10.5A1.5 1.5 0 0 1 11 16H4a1.5 1.5 0 0 1-1.5-1.5v-13A1.5 1.5 0 0 1 4 1.5Z"
          fill="currentColor"
          opacity="0.18"
        />
        <path d="M9.5 1.5V4H12.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M4.8 6.2h6.4M4.8 8.2h6.4M4.8 10.2h6.4M4.8 12.2h6.4" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
        <path d="M7.2 6.2v6M9.6 6.2v6" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
      </svg>
    </span>
  );
}
