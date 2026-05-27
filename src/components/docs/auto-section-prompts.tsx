"use client";

import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AiPromptButton } from "@/components/docs/ai-prompt-button";

/**
 * Tự gắn nút "Prompt AI" bên cạnh mọi `<h2 id="...">` trong `article.prose-docs`.
 * Mount 1 lần trong docs/layout.tsx → cover toàn bộ docs.
 *
 * Pattern: dùng `createPortal` để render React button INSIDE h2. React tự quản
 * lifecycle (unmount portal khi component unmount) — không cần imperative DOM
 * cleanup gây race với Next.js client routing.
 *
 * Bỏ qua:
 *   - h2 đã ở trong `<SectionHeader>` / `<StepsHeader>` (parent có cả `.border-b` và `.flex`)
 *   - h2 không có `id`
 */
type Item = {
  h2: HTMLHeadingElement;
  prompt: string;
};

export function AutoSectionPrompts() {
  const [items, setItems] = useState<Item[]>([]);

  useLayoutEffect(() => {
    const article = document.querySelector("article.prose-docs");
    if (!article) return;

    const pageH1 = article.querySelector("h1")?.textContent?.trim() ?? document.title;
    const eyebrow =
      article.querySelector("[data-page-header] .text-xs")?.textContent?.trim() ?? "";
    const pageDescription =
      article.querySelector("[data-page-header] p")?.textContent?.trim() ?? "";

    const headings = Array.from(
      article.querySelectorAll<HTMLHeadingElement>("h2[id]"),
    );

    const filtered = headings.filter((h2) => {
      const parent = h2.parentElement;
      if (
        parent &&
        parent.classList.contains("border-b") &&
        parent.classList.contains("flex")
      ) {
        return false;
      }
      return true;
    });

    // Capture textContent BEFORE flex-styling + mounting button (otherwise button
    // text bleeds into next read).
    const next: Item[] = filtered.map((h2) => ({
      h2,
      prompt: buildAutoPrompt({
        eyebrow,
        pageTitle: pageH1,
        pageDescription,
        sectionTitle: h2.textContent?.trim() ?? h2.id,
      }),
    }));

    // Make each h2 a flex row so button đẩy về phải.
    filtered.forEach((h2) => {
      h2.style.display = "flex";
      h2.style.alignItems = "baseline";
      h2.style.justifyContent = "space-between";
      h2.style.gap = "12px";
      h2.style.flexWrap = "wrap";
    });

    setItems(next);

    return () => {
      // Restore h2 styles. React handles portal teardown automatically.
      filtered.forEach((h2) => {
        h2.style.display = "";
        h2.style.alignItems = "";
        h2.style.justifyContent = "";
        h2.style.gap = "";
        h2.style.flexWrap = "";
      });
    };
  }, []);

  return (
    <>
      {items.map(({ h2, prompt }) =>
        createPortal(
          <span className="shrink-0 self-center text-base font-normal">
            <AiPromptButton prompt={prompt} />
          </span>,
          h2,
          h2.id || undefined,
        ),
      )}
    </>
  );
}

function buildAutoPrompt({
  eyebrow,
  pageTitle,
  pageDescription,
  sectionTitle,
}: {
  eyebrow: string;
  pageTitle: string;
  pageDescription: string;
  sectionTitle: string;
}): string {
  const context = [
    eyebrow ? `Nhóm: ${eyebrow}` : null,
    pageTitle ? `Trang: ${pageTitle}` : null,
    pageDescription ? `Tóm tắt trang: ${pageDescription}` : null,
    sectionTitle ? `Section: ${sectionTitle}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `Bạn là AI technical assistant đang giúp tôi hiểu / xử lý một việc liên quan tới section "${sectionTitle}" của tài liệu PATI Handover (dashboard nội bộ PATI — Shopify · Lark · Supabase self-host trên Mac mini).

${context}

Quy tắc:
- Trả lời rõ ràng, ngắn gọn, có ví dụ cụ thể.
- Không yêu cầu tôi paste token, password, secret hay cookie thật vào chat. Khi cần secret, dùng placeholder và nhắc tôi xin từ nguồn nội bộ.
- Không đưa lệnh destructive (rm, DROP, force-push, reset --hard) nếu tôi chưa xác nhận rõ.
- Nếu tôi non-tech, giải thích bằng từ thường; nếu tôi dev, có thể đưa command + path cụ thể.
- Sau khi trả lời, hỏi tôi muốn đào sâu phần nào hay đi sang section khác.

Hãy bắt đầu bằng cách hỏi tôi cụ thể đang gặp / cần gì trong section này.`;
}
