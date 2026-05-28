"use client";

import { ChevronDown, ChevronRight, FileText } from "lucide-react";
import { Fragment, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { SkillAudience, SkillRow } from "@/lib/timcook-agent-data";
import { skillDetails } from "@/lib/timcook-skill-details";

const audienceClass: Record<SkillAudience, string> = {
  agent:    "bg-blue-500/15 border-blue-500/40 text-blue-700 dark:text-blue-300",
  meta:     "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300",
  operator: "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300",
  code:     "bg-red-500/15 border-red-500/40 text-red-700 dark:text-red-300",
};

export function SkillTable({ skills }: { skills: SkillRow[] }) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggle = (name: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <div className="not-prose my-6 rounded-xl border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[13px] border-collapse">
          <thead className="bg-muted/40 text-[11px] uppercase tracking-widest">
            <tr className="border-b">
              <th className="px-3 py-2 text-left w-8"></th>
              <th className="px-3 py-2 text-left w-10">#</th>
              <th className="px-3 py-2 text-left w-[220px]">Skill</th>
              <th className="px-3 py-2 text-left w-[110px]">Audience</th>
              <th className="px-3 py-2 text-left">Trigger</th>
              <th className="px-3 py-2 text-left">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((s) => {
              const isOpen = openIds.has(s.name);
              const hasDetail = skillDetails[s.name] != null;
              return (
                <Fragment key={s.name}>
                  <tr
                    onClick={() => hasDetail && toggle(s.name)}
                    className={cn(
                      "border-t align-top",
                      hasDetail
                        ? "cursor-pointer hover:bg-muted/30"
                        : "opacity-70",
                    )}
                  >
                    <td className="px-3 py-2">
                      {hasDetail ? (
                        isOpen ? (
                          <ChevronDown className="h-3.5 w-3.5 text-foreground/60" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 text-foreground/40" />
                        )
                      ) : (
                        <FileText className="h-3.5 w-3.5 text-muted-foreground/40" />
                      )}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{s.n}</td>
                    <td className="px-3 py-2 font-mono text-[12.5px] font-semibold">{s.name}</td>
                    <td className="px-3 py-2">
                      <span
                        className={cn(
                          "inline-block rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap",
                          audienceClass[s.audience],
                        )}
                      >
                        {s.audience}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-foreground/85">{s.triggers}</td>
                    <td className="px-3 py-2 text-muted-foreground text-[12px]">{s.notes ?? "—"}</td>
                  </tr>
                  {isOpen && hasDetail && (
                    <tr className="border-t-0 bg-muted/[0.15]">
                      <td colSpan={6} className="px-6 py-4">
                        <SkillDetail content={skillDetails[s.name]!} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="border-t bg-muted/20 px-3 py-1.5 text-[11px] text-muted-foreground">
        Click vào row để xem workflow chi tiết của skill — đọc nguyên SKILL.md từ Mac mini.
      </div>
    </div>
  );
}

// ─── Minimal markdown renderer cho SKILL.md content ──────────────────────

function SkillDetail({ content }: { content: string }) {
  return (
    <div className="rounded-md border bg-background/60 p-4 text-[12.5px] leading-6 max-h-[600px] overflow-auto">
      <Markdown source={content} />
    </div>
  );
}

function stripFrontmatter(src: string): string {
  if (!src.startsWith("---\n")) return src;
  const end = src.indexOf("\n---\n", 4);
  if (end === -1) return src;
  return src.slice(end + 5).replace(/^\n+/, "");
}

function Markdown({ source }: { source: string }) {
  const lines = stripFrontmatter(source).split("\n");
  const out: ReactNode[] = [];
  let i = 0;
  let key = 0;
  let listBuf: ReactNode[] = [];
  let listType: "ul" | "ol" | null = null;

  const flushList = () => {
    if (listBuf.length === 0) return;
    if (listType === "ol") {
      out.push(
        <ol key={key++} className="ml-5 list-decimal my-2 space-y-1 text-foreground/85">
          {listBuf}
        </ol>,
      );
    } else {
      out.push(
        <ul key={key++} className="ml-5 list-disc my-2 space-y-1 text-foreground/85">
          {listBuf}
        </ul>,
      );
    }
    listBuf = [];
    listType = null;
  };

  while (i < lines.length) {
    const line = lines[i];

    // Frontmatter / triple-dash separator → divider
    if (line.trim() === "---") {
      flushList();
      out.push(<hr key={key++} className="my-3 border-border" />);
      i++;
      continue;
    }

    // Code block
    if (line.startsWith("```")) {
      flushList();
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      out.push(
        <pre
          key={key++}
          className="my-2 rounded-md border bg-muted/40 p-2.5 overflow-x-auto font-mono text-[11.5px] leading-5"
        >
          {lang && (
            <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              {lang}
            </div>
          )}
          <code>{codeLines.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    // Headings
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      flushList();
      const level = h[1].length;
      const txt = h[2];
      const cls =
        level === 1
          ? "text-[15px] font-bold tracking-tight mt-4 mb-2 text-foreground"
          : level === 2
            ? "text-[14px] font-semibold tracking-tight mt-4 mb-1.5 text-foreground"
            : level === 3
              ? "text-[13px] font-semibold mt-3 mb-1 text-foreground/95"
              : "text-[12.5px] font-semibold mt-2 mb-1 text-foreground/85";
      out.push(
        <div key={key++} className={cls}>
          {inline(txt)}
        </div>,
      );
      i++;
      continue;
    }

    // Ordered list
    const ol = /^\s*(\d+)\.\s+(.*)$/.exec(line);
    if (ol) {
      if (listType !== "ol") flushList();
      listType = "ol";
      listBuf.push(
        <li key={`li${key++}`} className="text-foreground/85">
          {inline(ol[2])}
        </li>,
      );
      i++;
      continue;
    }

    // Unordered list
    const ul = /^\s*[-*]\s+(.*)$/.exec(line);
    if (ul) {
      if (listType !== "ul") flushList();
      listType = "ul";
      listBuf.push(
        <li key={`li${key++}`} className="text-foreground/85">
          {inline(ul[1])}
        </li>,
      );
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      flushList();
      out.push(
        <blockquote
          key={key++}
          className="my-2 border-l-2 border-amber-500/50 pl-3 text-muted-foreground italic"
        >
          {inline(line.slice(2))}
        </blockquote>,
      );
      i++;
      continue;
    }

    // Blank line → paragraph break
    if (line.trim() === "") {
      flushList();
      out.push(<div key={key++} className="h-2" />);
      i++;
      continue;
    }

    // Regular paragraph (collect adjacent non-special lines)
    flushList();
    const para: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("```") &&
      !lines[i].startsWith(">") &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      lines[i].trim() !== "---"
    ) {
      para.push(lines[i]);
      i++;
    }
    out.push(
      <p key={key++} className="my-1.5 text-foreground/85">
        {inline(para.join(" "))}
      </p>,
    );
  }
  flushList();

  return <>{out}</>;
}

// Inline markdown: **bold**, `code`, [text](url)
function inline(s: string): ReactNode {
  const parts: ReactNode[] = [];
  let last = 0;
  let key = 0;

  // Combined regex: backtick code | bold | link
  const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)]+\))/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) parts.push(<span key={key++}>{s.slice(last, m.index)}</span>);
    const tok = m[0];
    if (tok.startsWith("`")) {
      parts.push(
        <code
          key={key++}
          className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[11.5px]"
        >
          {tok.slice(1, -1)}
        </code>,
      );
    } else if (tok.startsWith("**")) {
      parts.push(
        <strong key={key++} className="text-foreground font-semibold">
          {tok.slice(2, -2)}
        </strong>,
      );
    } else {
      const lm = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(tok);
      if (lm) {
        parts.push(
          <a
            key={key++}
            href={lm[2]}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-dotted underline-offset-2 text-foreground/90 hover:text-foreground"
          >
            {lm[1]}
          </a>,
        );
      }
    }
    last = m.index + tok.length;
  }
  if (last < s.length) parts.push(<span key={key++}>{s.slice(last)}</span>);
  return parts;
}
