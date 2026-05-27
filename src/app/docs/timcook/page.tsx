import { CheckCircle2, ClipboardList, GraduationCap, MessageSquareText, Users } from "lucide-react";
import { PageHeader } from "@/components/docs/page-header";
import { PageNav } from "@/components/docs/page-nav";
import { Callout } from "@/components/docs/callout";
import { Step, Steps, StepCheck, TerminalInline } from "@/components/docs/visuals";

export const metadata = { title: "Timcook — PATI Handover" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Ownership"
        title="Timcook"
        description="Trang này gom phần bạn nắm cho việc train Openclaw: scope, agenda, checklist và follow-up."
      />

      <Callout variant="info" title="Mục tiêu của tab này">
        Người mới mở trang này phải hiểu ngay: đây là chỗ để chuẩn bị và chạy training Openclaw,
        không phải tài liệu kỹ thuật sâu của hệ thống.
      </Callout>

      <h2 id="scope">Phạm vi</h2>
      <div className="not-prose my-5 grid gap-3 sm:grid-cols-3">
        <InfoCard
          icon={GraduationCap}
          title="Training"
          desc="Bạn nắm agenda, phần demo và cách dẫn buổi học."
        />
        <InfoCard
          icon={Users}
          title="Audience"
          desc="Người mới vào Openclaw hoặc người cần refresh quy trình."
        />
        <InfoCard
          icon={ClipboardList}
          title="Output"
          desc="Checklist đã hoàn thành, câu hỏi còn mở và action items."
        />
      </div>

      <h2 id="flow">Training flow</h2>
      <Steps>
        <Step n={1} title="Intake request">
          <p>
            Xác nhận người học là ai, họ cần học phần nào của Openclaw, và deadline của buổi
            training.
          </p>
        </Step>
        <Step n={2} title="Prepare material">
          <p>
            Chuẩn bị access, sample data, notes và môi trường demo trước khi vào buổi học.
          </p>
          <StepCheck>
            Nếu có thiếu quyền hoặc thiếu dữ liệu mẫu, xử lý xong trước rồi mới bắt đầu.
          </StepCheck>
        </Step>
        <Step n={3} title="Run the session">
          <p>
            Dẫn theo agenda ngắn gọn: mục tiêu, demo, phần làm thử, rồi hỏi lại để xác nhận người
            học nắm được luồng.
          </p>
        </Step>
        <Step n={4} title="Capture follow-up">
          <p>
            Ghi lại phần chưa rõ, vấn đề truy cập, và việc cần làm tiếp bằng{" "}
            <TerminalInline>follow-up notes</TerminalInline>.
          </p>
        </Step>
        <Step n={5} title="Close the loop">
          <p>
            Sau buổi training, chốt lại checklist và các bước tiếp theo cho người học hoặc người
            liên quan.
          </p>
        </Step>
      </Steps>

      <h2 id="checklist">Pre-training checklist</h2>
      <div className="not-prose my-5 rounded-xl border bg-card p-4">
        <ul className="ml-5 list-disc text-[13px] leading-6 space-y-1">
          <li>Người học đã biết mục tiêu của buổi training.</li>
          <li>Access và môi trường demo đã sẵn sàng.</li>
          <li>Ví dụ hoặc sample data đã chuẩn bị trước.</li>
          <li>Có chỗ để ghi lại câu hỏi và action items.</li>
        </ul>
      </div>

      <h2 id="after">After training</h2>
      <div className="not-prose my-5 rounded-xl border bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquareText className="h-4 w-4 text-foreground/70" />
          <div className="font-semibold text-[14px]">Những gì cần lưu lại</div>
        </div>
        <ul className="ml-5 list-disc text-[13px] leading-6 space-y-1">
          <li>Phần nào người học đã làm được độc lập.</li>
          <li>Phần nào vẫn cần hỗ trợ thêm.</li>
          <li>Việc nào phải follow-up sau buổi học.</li>
        </ul>
      </div>

      <div className="not-prose my-5 rounded-xl border-2 border-emerald-500/40 bg-emerald-500/[0.04] p-4">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold text-[14px] mb-1">Cách dùng trang này</div>
            <div className="text-[13px] leading-6 text-foreground/85">
              Nếu ai hỏi “Timcook là gì?”, câu trả lời ngắn nhất là: chỗ bạn giữ workflow training
              Openclaw và danh sách việc cần theo dõi sau buổi học.
            </div>
          </div>
        </div>
      </div>

      <PageNav href="/docs/timcook" />
    </>
  );
}

function InfoCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="h-4 w-4 text-foreground/70" />
        <div className="font-semibold text-[14px]">{title}</div>
      </div>
      <div className="text-[13px] leading-6 text-foreground/80">{desc}</div>
    </div>
  );
}
