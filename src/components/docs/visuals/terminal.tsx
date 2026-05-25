"use client";

import { useState, ReactNode } from "react";
import { Check, Copy, Terminal as TerminalIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Line =
  | { prompt: string; cmd: string }
  | { out: string; tone?: "ok" | "warn" | "err" | "muted" }
  | { divider: true; label?: string };

export function Terminal({
  host = "you@laptop",
  cwd = "~/shopify-lark-sync",
  lines,
  title,
}: {
  host?: string;
  cwd?: string;
  lines: Line[];
  title?: string;
}) {
  const [copied, setCopied] = useState(false);
  const cmdText = lines
    .filter((l): l is { prompt: string; cmd: string } => "cmd" in l)
    .map((l) => l.cmd)
    .join("\n");

  function copy() {
    if (!cmdText) return;
    navigator.clipboard.writeText(cmdText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div
      data-dev-detail
      className="not-prose my-4 rounded-lg border bg-zinc-950 text-zinc-100 overflow-hidden shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-3 py-1.5">
        <div className="flex items-center gap-2 text-[12px] text-zinc-400">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
          </div>
          <TerminalIcon className="h-3.5 w-3.5 ml-2" />
          <span className="font-mono">{title ?? `${host}: ${cwd}`}</span>
        </div>
        {cmdText && (
          <button
            onClick={copy}
            className="text-zinc-400 hover:text-zinc-100 transition-colors"
            aria-label="Copy commands"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>
      <div className="px-4 py-3 font-mono text-[12.5px] leading-6 whitespace-pre-wrap">
        {lines.map((line, i) => {
          if ("divider" in line) {
            return (
              <div
                key={i}
                className="my-2 flex items-center gap-2 text-zinc-600 text-[11px] uppercase tracking-wider"
              >
                <span className="flex-1 border-t border-zinc-800" />
                {line.label}
                <span className="flex-1 border-t border-zinc-800" />
              </div>
            );
          }
          if ("cmd" in line) {
            return (
              <div key={i} className="flex gap-2">
                <span className="text-emerald-400 select-none">
                  {line.prompt || "$"}
                </span>
                <span className="text-zinc-100">{line.cmd}</span>
              </div>
            );
          }
          const toneClass =
            line.tone === "ok"
              ? "text-emerald-300"
              : line.tone === "warn"
                ? "text-amber-300"
                : line.tone === "err"
                  ? "text-red-300"
                  : "text-zinc-400";
          return (
            <div key={i} className={cn("pl-4", toneClass)}>
              {line.out}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TerminalInline({ children }: { children: ReactNode }) {
  return (
    <code
      className="px-1.5 py-0.5 rounded text-[12px] font-mono"
      style={{
        backgroundColor: "rgb(24 24 27)",
        color: "rgb(244 244 245)",
        border: "1px solid rgb(39 39 42)",
      }}
    >
      {children}
    </code>
  );
}
