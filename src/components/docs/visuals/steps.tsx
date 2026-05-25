import { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepStatus = "todo" | "current" | "done";

export function Steps({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose my-8 relative">
      <div className="absolute left-[18px] top-2 bottom-2 w-px bg-border" aria-hidden />
      <ol className="space-y-6">{children}</ol>
    </div>
  );
}

export function Step({
  n,
  title,
  status = "todo",
  hint,
  children,
}: {
  n: number;
  title: string;
  status?: StepStatus;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <li className="relative pl-12">
      <div
        className={cn(
          "absolute left-0 top-0 grid h-9 w-9 place-items-center rounded-full border-2 text-sm font-semibold tabular-nums",
          status === "done" &&
            "bg-emerald-500/15 border-emerald-500/50 text-emerald-600 dark:text-emerald-400",
          status === "current" &&
            "bg-background border-foreground text-foreground shadow-sm ring-4 ring-foreground/5",
          status === "todo" && "bg-background border-border text-muted-foreground"
        )}
      >
        {status === "done" ? <Check className="h-4 w-4" /> : n}
      </div>
      <div className="min-h-[2.25rem]">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h3 className="text-base font-semibold tracking-tight">{title}</h3>
          {hint && (
            <span className="text-xs text-muted-foreground">{hint}</span>
          )}
        </div>
        <div className="mt-2 space-y-3 text-[14px] leading-6 text-foreground/85">
          {children}
        </div>
      </div>
    </li>
  );
}

export function StepCheck({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-emerald-500/30 bg-emerald-500/[0.05] px-3 py-2 text-[13px] leading-6 flex items-start gap-2">
      <Check className="h-3.5 w-3.5 mt-1 shrink-0 text-emerald-600 dark:text-emerald-400" />
      <div>
        <span className="font-medium text-emerald-700 dark:text-emerald-400">
          Bạn thấy được:
        </span>{" "}
        <span className="text-foreground/85">{children}</span>
      </div>
    </div>
  );
}

export function StepWarn({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-md border border-amber-500/40 bg-amber-500/[0.06] px-3 py-2 text-[13px] leading-6">
      {title && (
        <div className="font-medium text-amber-700 dark:text-amber-400 mb-0.5">
          {title}
        </div>
      )}
      <div className="text-foreground/85">{children}</div>
    </div>
  );
}
