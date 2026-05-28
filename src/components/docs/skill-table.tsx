"use client";

import {
  AlertOctagon,
  ArrowDown,
  ChevronDown,
  ChevronRight,
  FileText,
  GitFork,
  Link2,
  ListChecks,
  MessageSquareText,
  Play,
  Search,
  Shield,
  Target,
  ZapOff,
  type LucideIcon,
} from "lucide-react";
import { Fragment, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { SkillAudience, SkillRow } from "@/lib/timcook-agent-data";
import { skillDetails } from "@/lib/timcook-skill-details";
import { skillFlows, type FlowStage } from "@/lib/timcook-skill-flows";

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
                        <SkillDetail skill={s} content={skillDetails[s.name]!} />
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

// ─── Workflow visualizer cho SKILL.md ────────────────────────────────────
// Tách content theo `## heading`, mỗi section → step card với icon + tone.
// Dev-only sections (Execution/Cross-refs/code blocks) gắn data-dev-detail
// để CSS audience-mode tự ẩn ở User mode.

type SectionKind =
  | "trigger"
  | "authority"
  | "decision"
  | "guardrail"
  | "example"
  | "mandatory"
  | "execution"  // dev only
  | "reference"  // dev only
  | "default";

const kindStyle: Record<SectionKind, { icon: LucideIcon; tone: string; pill: string; label: string }> = {
  trigger:    { icon: Target,            tone: "border-blue-500/40 bg-blue-500/5",       pill: "bg-blue-500/15 text-blue-700 dark:text-blue-300",       label: "Khi nào kích hoạt" },
  authority:  { icon: Shield,            tone: "border-amber-500/40 bg-amber-500/5",     pill: "bg-amber-500/15 text-amber-700 dark:text-amber-300",     label: "Quyền hành" },
  decision:   { icon: GitFork,           tone: "border-violet-500/40 bg-violet-500/5",   pill: "bg-violet-500/15 text-violet-700 dark:text-violet-300", label: "Quyết định" },
  guardrail:  { icon: AlertOctagon,      tone: "border-red-500/40 bg-red-500/5",         pill: "bg-red-500/15 text-red-700 dark:text-red-300",           label: "Cấm / phải tránh" },
  example:    { icon: MessageSquareText, tone: "border-emerald-500/40 bg-emerald-500/5", pill: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300", label: "Ví dụ phản hồi" },
  mandatory:  { icon: ZapOff,            tone: "border-orange-500/50 bg-orange-500/10",  pill: "bg-orange-500/20 text-orange-700 dark:text-orange-300",   label: "Bắt buộc" },
  execution:  { icon: Play,              tone: "border-red-500/30 bg-red-500/[0.03]",    pill: "bg-red-500/10 text-red-700 dark:text-red-300",           label: "Code / script (dev)" },
  reference:  { icon: Link2,             tone: "border-zinc-500/30 bg-zinc-500/5",       pill: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300",         label: "Tham chiếu (dev)" },
  default:    { icon: ListChecks,        tone: "border-border bg-card",                  pill: "bg-muted text-muted-foreground",                          label: "Nội dung" },
};

function classify(heading: string): SectionKind {
  const h = heading.toLowerCase();
  if (h.includes("⛔") || h.includes("mandatory") || h.includes("bắt buộc") || h.includes("must")) return "mandatory";
  if (h.includes("anti-hallucin") || h.includes("forbidden") || h.includes("never") || h.includes("do not") || h.includes("don't")) return "guardrail";
  if (h.includes("execution") || h.includes("script") || h.includes("implementation") || h.includes("run ") || h.includes("invoke ") && h.includes("python")) return "execution";
  if (h.includes("cross-ref") || h.includes("reference") || h.includes("see also") || h.includes("related")) return "reference";
  if (h.includes("example") || h.includes("template") || h.includes("reply") || h.includes("response")) return "example";
  if (h.includes("decision") || h.includes("tree") || /^r\d+/.test(h)) return "decision";
  if (h.includes("authority") || h.includes("policy") || h.includes("can ") || h.includes("cannot") || h.includes("scope")) return "authority";
  if (h.includes("when ") || h.includes("invoke") || h.includes("trigger") || h.includes("fire")) return "trigger";
  return "default";
}

function stripFrontmatter(src: string): string {
  if (!src.startsWith("---\n")) return src;
  const end = src.indexOf("\n---\n", 4);
  if (end === -1) return src;
  return src.slice(end + 5).replace(/^\n+/, "");
}

type Section = {
  heading: string | null;  // null = preamble (between H1 and first H2)
  level: 1 | 2;            // H1 = title block; H2 = phase
  body: string;
  kind: SectionKind;
  devOnly: boolean;
};

function splitSections(src: string): { title: string | null; sections: Section[] } {
  const lines = stripFrontmatter(src).split("\n");
  let title: string | null = null;
  const sections: Section[] = [];
  let cur: Section | null = null;
  const flush = () => {
    if (cur) {
      cur.body = cur.body.replace(/^\n+|\n+$/g, "");
      sections.push(cur);
    }
    cur = null;
  };

  for (const line of lines) {
    if (line.startsWith("# ") && title == null) {
      title = line.slice(2).trim();
      continue;
    }
    if (line.startsWith("## ")) {
      flush();
      const heading = line.slice(3).trim();
      const kind = classify(heading);
      cur = {
        heading,
        level: 2,
        body: "",
        kind,
        devOnly: kind === "execution" || kind === "reference",
      };
      continue;
    }
    if (cur == null) {
      cur = { heading: null, level: 2, body: "", kind: "default", devOnly: false };
    }
    cur.body += line + "\n";
  }
  flush();

  // Drop empty preamble section
  return {
    title,
    sections: sections.filter((s) => s.body.trim() || s.heading),
  };
}

function SkillDetail({ skill, content }: { skill: SkillRow; content: string }) {
  const { title, sections } = splitSections(content);

  return (
    <div className="rounded-md border bg-background/60 p-4 max-h-[700px] overflow-auto">
      {title && (
        <div className="mb-3 pb-2 border-b">
          <div className="text-[15px] font-bold text-foreground">{title}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Workflow visualize từ <span className="font-mono">SKILL.md</span> trên Mac mini ·
            {" "}<span data-dev-detail>dev mode hiển thị thêm code + cross-refs</span>
            <span data-user-detail>user mode chỉ xem hành vi, ẩn code script</span>
          </div>
        </div>
      )}

      {/* ─── USER MODE: Vietnamese workflow tay viết ───────────────── */}
      <div data-user-detail className="space-y-3">
        <UserModeSummary skill={skill} />
      </div>

      {/* ─── DEV MODE: full markdown cards ──────────────────────────── */}
      <div data-dev-detail className="space-y-2.5">
        {sections.map((s, idx) => (
          <SectionCard key={idx} section={s} index={idx + 1} />
        ))}
      </div>
    </div>
  );
}

const stageStyle: Record<FlowStage, { icon: LucideIcon; tone: string; pill: string; label: string }> = {
  trigger:  { icon: Target,            tone: "border-blue-500/40 bg-blue-500/5",       pill: "bg-blue-500/15 text-blue-700 dark:text-blue-300",       label: "Khi nào" },
  check:    { icon: Search,            tone: "border-cyan-500/40 bg-cyan-500/5",       pill: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300",       label: "Kiểm tra" },
  decide:   { icon: GitFork,           tone: "border-violet-500/40 bg-violet-500/5",   pill: "bg-violet-500/15 text-violet-700 dark:text-violet-300", label: "Quyết định" },
  act:      { icon: Play,              tone: "border-emerald-500/40 bg-emerald-500/5", pill: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300", label: "Thực hiện" },
  reply:    { icon: MessageSquareText, tone: "border-green-500/40 bg-green-500/5",     pill: "bg-green-500/15 text-green-700 dark:text-green-300",   label: "Trả lời khách" },
  log:      { icon: FileText,          tone: "border-zinc-500/30 bg-zinc-500/5",       pill: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300",       label: "Ghi log" },
  limit:    { icon: Shield,            tone: "border-amber-500/40 bg-amber-500/5",     pill: "bg-amber-500/15 text-amber-700 dark:text-amber-300",   label: "Giới hạn" },
  fallback: { icon: AlertOctagon,      tone: "border-red-500/40 bg-red-500/5",         pill: "bg-red-500/15 text-red-700 dark:text-red-300",         label: "Khi lỗi" },
};

function UserModeSummary({ skill }: { skill: SkillRow }) {
  const flow = skillFlows[skill.name];

  if (!flow) {
    return (
      <div className="rounded-md border border-dashed bg-muted/20 p-3 text-[12.5px] text-muted-foreground">
        Workflow tiếng Việt cho skill này chưa được viết. Bật{" "}
        <span className="font-semibold text-foreground">Dev mode</span> để xem nguyên gốc SKILL.md.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card p-3">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
          Skill này dùng để
        </div>
        <div className="text-[13.5px] leading-6 text-foreground/95">{flow.oneLiner}</div>
      </div>

      <div className="rounded-md border border-dashed border-border bg-muted/20 px-3 py-2 text-[11.5px] text-muted-foreground">
        Flow {flow.steps.length} bước — đọc từ trên xuống. Mỗi bước có nhãn loại
        (Khi nào / Kiểm tra / Quyết định / Thực hiện …) để dễ nhận diện.
      </div>

      <ol className="relative space-y-2 pt-1">
        {flow.steps.map((step, i) => {
          const style = stageStyle[step.stage];
          const Icon = style.icon;
          const isLast = i === flow.steps.length - 1;
          return (
            <li key={i} className="relative">
              <div className={cn("rounded-lg border p-3", style.tone)}>
                <div className="flex items-start gap-2.5">
                  <div className={cn("flex h-7 w-7 items-center justify-center rounded-md text-[11px] font-bold shrink-0", style.pill)}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <Icon className="h-3.5 w-3.5 text-foreground/70 shrink-0" />
                      <span className={cn("rounded px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider", style.pill)}>
                        {style.label}
                      </span>
                    </div>
                    <div className="text-[13px] leading-6 text-foreground/90">{step.text}</div>
                  </div>
                </div>
              </div>
              {!isLast && (
                <div className="flex justify-start pl-5 py-0.5">
                  <ArrowDown className="h-3 w-3 text-muted-foreground/60" strokeWidth={2.5} />
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="rounded-md border border-dashed border-border bg-muted/20 p-2.5 text-[11.5px] text-muted-foreground">
        Cần xem nguyên gốc tiếng Anh từ <span className="font-mono">SKILL.md</span> mà agent
        đang đọc (code Python, cross-refs, Anti-hallucination prose …)? Bật{" "}
        <span className="font-semibold text-foreground">Dev mode</span> ở góc phải header.
      </div>
    </>
  );
}

function SectionCard({ section, index }: { section: Section; index: number }) {
  const style = kindStyle[section.kind];
  const Icon = style.icon;
  const wrapperProps = section.devOnly ? { "data-dev-detail": true as const } : {};

  return (
    <div {...wrapperProps} className={cn("rounded-lg border p-3", style.tone)}>
      <div className="flex items-start gap-2.5 mb-2">
        <div className={cn("flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold", style.pill)}>
          {index}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Icon className="h-3.5 w-3.5 text-foreground/70 shrink-0" />
            <div className="text-[13px] font-semibold text-foreground leading-tight">
              {section.heading ?? "Tổng quan"}
            </div>
            <span className={cn("rounded px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider", style.pill)}>
              {style.label}
            </span>
          </div>
        </div>
      </div>
      <div className="pl-9 text-[12.5px] leading-6">
        <Markdown source={section.body} />
      </div>
    </div>
  );
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

    // Code block — dev-only (user mode hides via CSS)
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
          data-dev-detail
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
