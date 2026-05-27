"use client";

import { useState } from "react";
import { Check, Copy, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function AiPromptButton({
  prompt,
  className,
}: {
  prompt: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyPrompt() {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className={cn("relative inline-flex", className)}>
      <button
        type="button"
        onClick={() => setOpen((next) => !next)}
        className="inline-flex h-7 items-center gap-1.5 rounded-md border bg-background px-2.5 text-xs font-medium text-foreground/80 shadow-sm transition-colors hover:bg-muted"
      >
        <Sparkles className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
        Prompt AI
      </button>
      {open && (
        <div className="absolute left-0 top-9 z-50 w-[min(36rem,calc(100vw-2rem))] rounded-xl border bg-popover p-3 text-popover-foreground shadow-xl sm:left-auto sm:right-0">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="text-sm font-semibold">Prompt để paste vào AI</div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close prompt"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <textarea
            readOnly
            value={prompt}
            className="h-52 w-full resize-none rounded-lg border bg-background p-3 font-mono text-[12px] leading-5 text-foreground/85 focus:outline-none"
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="m-0 text-[11px] leading-4 text-muted-foreground">
              Không paste token, password, secret key hoặc cookie thật vào AI.
            </p>
            <button
              type="button"
              onClick={() => void copyPrompt()}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-foreground px-3 text-xs font-medium text-background hover:opacity-90"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
