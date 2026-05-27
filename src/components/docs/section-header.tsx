import { AiPromptButton } from "@/components/docs/ai-prompt-button";

/**
 * H2 section heading với optional "Prompt AI" button bên phải.
 * Dùng thay cho `<h2 id="...">title</h2>` khi muốn user copy được prompt
 * đã được prime cho LLM về section đó.
 */
export function SectionHeader({
  id,
  title,
  prompt,
}: {
  id?: string;
  title: string;
  prompt?: string;
}) {
  return (
    <div className="mt-12 mb-4 flex items-center gap-3 border-b pb-2">
      <h2
        id={id}
        className="m-0 flex-1 border-0 p-0 text-2xl font-semibold tracking-tight"
        style={{ letterSpacing: "-0.01em" }}
      >
        {title}
      </h2>
      {prompt && <AiPromptButton prompt={prompt} />}
    </div>
  );
}

/**
 * Builder tiện cho per-section prompt — auto-prefix safety rules + page context.
 * Dùng khi không có prompt handcrafted, để khỏi paste lặp boilerplate.
 */
export function buildSectionPrompt({
  pageTitle,
  sectionTitle,
  focus,
}: {
  pageTitle: string;
  sectionTitle: string;
  focus: string;
}): string {
  return `Bạn là AI technical assistant đang giúp tôi hiểu section "${sectionTitle}" trên trang "${pageTitle}" của tài liệu PATI Handover (dashboard nội bộ PATI, dùng Shopify · Lark · Supabase self-host trên Mac mini).

Focus của section: ${focus}

Quy tắc:
- Trả lời rõ ràng, ngắn gọn, có ví dụ cụ thể.
- Không yêu cầu tôi paste token, password, secret hay cookie thật vào chat. Khi cần secret, dùng placeholder và nhắc tôi xin/lấy từ nguồn nội bộ.
- Không đưa lệnh destructive (rm, DROP, force-push, reset --hard) nếu tôi chưa xác nhận rõ.
- Nếu tôi non-tech, giải thích bằng từ thường, không dùng jargon trừ khi có giải thích kèm.
- Sau khi trả lời, hỏi tôi muốn đào sâu phần nào hay đi sang section khác.`;
}
