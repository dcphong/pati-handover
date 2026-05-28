"use client";

// One button → grabs the current page's main article, converts to clean
// markdown, downloads as .md so the reader can drop it into any AI chat
// or markdown editor. Also exposes a "full context" variant that walks
// every route in nav.ts and concatenates them.

import { Download, Loader2, Copy, Check } from "lucide-react";
import { useState } from "react";
import TurndownService from "turndown";
import { flatNav, type NavLink } from "@/lib/nav";
import { cn } from "@/lib/utils";

// ─── Turndown setup ──────────────────────────────────────────────────────

function makeTurndown(): TurndownService {
  const td = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
    emDelimiter: "_",
  });

  // Tables: turndown's default tableContents plugin renders pipe tables
  // reasonably; we keep them as-is. Add minimal custom rules below.

  // Drop noise: scripts, audience-mode-only-detail wrappers that hide
  // content in the active mode are still in DOM — exporting them would
  // mix dev + user content. Honour data-audience attr.
  td.remove(["script", "style", "noscript", "iframe"]);

  td.addRule("dropHiddenAudienceBlocks", {
    filter: (node) => {
      if (node.nodeType !== 1) return false;
      const el = node as HTMLElement;
      // Get computed display via DOM if available; fall back to attr check.
      try {
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") return true;
      } catch {
        // SSR — skip
      }
      return false;
    },
    replacement: () => "",
  });

  // Headings: keep the heading text only (strip help icons / tooltips that
  // live inside <h2>…<svg>…</h2>).
  td.addRule("cleanHeadings", {
    filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
    replacement: (content, node) => {
      const level = Number((node as HTMLElement).tagName.substring(1));
      const text = content.replace(/\s+/g, " ").trim();
      if (!text) return "";
      return "\n\n" + "#".repeat(level) + " " + text + "\n\n";
    },
  });

  // Inline keyboard kbd → backtick
  td.addRule("kbdAsCode", {
    filter: ["kbd"],
    replacement: (c) => "`" + c + "`",
  });

  return td;
}

// ─── HTML → markdown ─────────────────────────────────────────────────────

function articleHtmlFromDoc(doc: Document): string | null {
  // Docs pages wrap content in <article class="prose-docs">; the home /
  // landing page just uses <main>. Fall through so both work.
  const article =
    doc.querySelector("article.prose-docs") ??
    doc.querySelector("main") ??
    doc.querySelector("[role='main']");
  if (!article) return null;

  // Clone so we can mutate without disturbing the live page.
  const clone = article.cloneNode(true) as HTMLElement;

  // Strip the integration-decorations + audience-brief at the top — they're
  // navigation chrome, not content.
  clone.querySelectorAll("[data-page-decoration], [data-audience-brief]").forEach((n) => n.remove());

  // Honour current audience mode: drop hidden detail wrappers based on the
  // <html data-audience="…"> attribute already applied to the source doc.
  const audience = doc.documentElement.getAttribute("data-audience");
  if (audience === "user") {
    clone.querySelectorAll("[data-dev-detail]").forEach((n) => n.remove());
  } else if (audience === "dev") {
    clone.querySelectorAll("[data-user-detail]").forEach((n) => n.remove());
  }

  return clone.innerHTML;
}

function pageTitle(doc: Document): string {
  const h1 =
    doc.querySelector("article.prose-docs h1") ?? doc.querySelector("main h1") ?? doc.querySelector("h1");
  if (h1?.textContent) return h1.textContent.trim();
  return doc.title.replace(/—.*$/, "").trim() || "Untitled";
}

function slugForRoute(href: string): string {
  if (href === "/") return "home";
  return href.replace(/^\//, "").replace(/\/+/g, "-").replace(/-page$/, "") || "page";
}

function download(filename: string, body: string) {
  const blob = new Blob([body], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke after a tick to let the download start.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ─── Single-page export button ───────────────────────────────────────────

export function ExportMdButton({
  className,
  label = "Export .md",
  variant = "default",
}: {
  className?: string;
  label?: string;
  variant?: "default" | "subtle";
}) {
  const [copied, setCopied] = useState(false);

  function exportCurrentPage() {
    const html = articleHtmlFromDoc(document);
    if (!html) {
      alert("Không tìm thấy nội dung trang để export.");
      return;
    }
    const td = makeTurndown();
    const md = td.turndown(html);
    const title = pageTitle(document);
    const slug = slugForRoute(window.location.pathname);
    const header = `# ${title}\n\nSource: ${window.location.href}\nExported: ${new Date().toISOString()}\n\n---\n\n`;
    download(`pati-handover-${slug}.md`, header + md.trim() + "\n");
  }

  async function copyToClipboard() {
    const html = articleHtmlFromDoc(document);
    if (!html) return;
    const md = makeTurndown().turndown(html);
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const base =
    variant === "subtle"
      ? "inline-flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1.5 text-[12px] text-foreground/85 hover:bg-accent hover:text-foreground"
      : "inline-flex items-center gap-1.5 rounded-md border bg-card px-3 py-1.5 text-[12.5px] font-medium text-foreground hover:bg-accent";

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <button type="button" onClick={exportCurrentPage} className={base} title="Tải nguyên section thành file .md để AI đọc">
        <Download className="h-3.5 w-3.5" />
        {label}
      </button>
      <button
        type="button"
        onClick={copyToClipboard}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
        title="Copy markdown vào clipboard"
        aria-label="Copy markdown"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

// ─── Full-context export button (home page) ──────────────────────────────

export function ExportFullContextButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number; current: string } | null>(null);

  async function exportEverything() {
    setLoading(true);
    setProgress({ done: 0, total: 0, current: "" });

    // Build the full route list: home + every nav link, dedupe by href.
    const homeLink: NavLink = { title: "Home — Welcome", href: "/" };
    const docs = flatNav();
    const all: NavLink[] = [homeLink, ...docs.filter((l) => l.href !== "/")];

    setProgress({ done: 0, total: all.length, current: all[0].title });

    const parser = new DOMParser();
    const td = makeTurndown();
    const chunks: string[] = [];

    chunks.push(
      `# PATI Handover — Full Context Export\n\n` +
        `Exported: ${new Date().toISOString()}\n` +
        `Source: ${window.location.origin}\n` +
        `Sections: ${all.length}\n\n` +
        `> Audience mode at export time: \`${document.documentElement.getAttribute("data-audience") ?? "default"}\`. ` +
        `Re-run in the other mode to capture the alternate content.\n\n` +
        `---\n\n## Mục lục\n\n` +
        all.map((l, i) => `${i + 1}. [${l.title}](${l.href})`).join("\n") +
        `\n\n---\n`,
    );

    for (let i = 0; i < all.length; i++) {
      const link = all[i];
      setProgress({ done: i, total: all.length, current: link.title });

      try {
        // Carry the current audience cookie so server-rendered audience-mode
        // content matches what the user is viewing. Same-origin fetch
        // includes cookies by default.
        const res = await fetch(link.href, { headers: { Accept: "text/html" } });
        if (!res.ok) {
          chunks.push(`\n\n## ${link.title}\n\n_Lỗi tải ${link.href}: HTTP ${res.status}_\n`);
          continue;
        }
        const html = await res.text();
        const doc = parser.parseFromString(html, "text/html");
        // Mirror current audience to the parsed doc so the css-hidden rule
        // can drop the right details.
        const audience = document.documentElement.getAttribute("data-audience");
        if (audience) doc.documentElement.setAttribute("data-audience", audience);
        const article = articleHtmlFromDoc(doc);
        const title = pageTitle(doc);
        if (!article) {
          chunks.push(`\n\n## ${title}\n\nSource: ${link.href}\n\n_Không trích được nội dung._\n`);
          continue;
        }
        const md = td.turndown(article);
        chunks.push(
          `\n\n## ${title}\n\n` +
            `Source: \`${link.href}\`\n\n` +
            md.trim() +
            `\n`,
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : "lỗi không rõ";
        chunks.push(`\n\n## ${link.title}\n\n_Lỗi parse ${link.href}: ${msg}_\n`);
      }
    }

    setProgress({ done: all.length, total: all.length, current: "Done" });
    download(`pati-handover-full-context-${new Date().toISOString().slice(0, 10)}.md`, chunks.join("\n"));

    setLoading(false);
    setProgress(null);
  }

  return (
    <button
      type="button"
      onClick={exportEverything}
      disabled={loading}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-60",
        className,
      )}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {loading && progress
        ? `Đang gói ${progress.done}/${progress.total}…`
        : "Export toàn bộ context (.md cho AI)"}
    </button>
  );
}
