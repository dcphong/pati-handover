"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function CodeBlock({
  children,
  language,
  filename,
  className,
}: {
  children: string;
  language?: string;
  filename?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className={cn("my-5 rounded-lg border overflow-hidden bg-muted/40", className)}>
      {(filename || language) && (
        <div className="flex items-center justify-between border-b bg-muted/60 px-3.5 py-1.5">
          <div className="flex items-center gap-2 text-xs">
            {filename && <span className="font-mono text-foreground/70">{filename}</span>}
            {language && !filename && (
              <span className="text-muted-foreground uppercase tracking-wider text-[10px]">{language}</span>
            )}
          </div>
          <button
            onClick={copy}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Copy code"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      )}
      <div className="relative">
        {!filename && !language && (
          <button
            onClick={copy}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors z-10"
            aria-label="Copy code"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        )}
        <pre className="overflow-x-auto px-4 py-3.5 text-[13px] leading-6 font-mono">
          <code>{children}</code>
        </pre>
      </div>
    </div>
  );
}
