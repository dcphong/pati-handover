import { ReactNode } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Search,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function DecisionStart({
  question,
  children,
}: {
  question: string;
  children?: ReactNode;
}) {
  return (
    <div className="not-prose my-4 rounded-xl border-2 border-violet-500/40 bg-violet-500/[0.06] px-4 py-3">
      <div className="flex items-start gap-3">
        <HelpCircle className="h-5 w-5 mt-0.5 text-violet-600 dark:text-violet-400 shrink-0" />
        <div>
          <div className="text-[10px] uppercase tracking-widest text-violet-700 dark:text-violet-300 font-semibold">
            Bắt đầu từ đây
          </div>
          <div className="text-base font-semibold mt-0.5">{question}</div>
          {children && (
            <div className="mt-1.5 text-[13px] text-foreground/80">{children}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export function DecisionBranch({
  symptom,
  cause,
  fix,
  severity = "warn",
}: {
  symptom: string;
  cause: string;
  fix: ReactNode;
  severity?: "warn" | "danger" | "info";
}) {
  const palette =
    severity === "danger"
      ? {
          ring: "border-red-500/40",
          chip: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30",
          icon: "text-red-600 dark:text-red-400",
        }
      : severity === "info"
        ? {
            ring: "border-sky-500/30",
            chip: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
            icon: "text-sky-600 dark:text-sky-400",
          }
        : {
            ring: "border-amber-500/40",
            chip: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
            icon: "text-amber-600 dark:text-amber-400",
          };

  return (
    <div className={cn("not-prose my-4 rounded-xl border-2 overflow-hidden", palette.ring)}>
      <div className="bg-card px-4 py-3 border-b flex items-start gap-3">
        <AlertCircle className={cn("h-4 w-4 mt-1 shrink-0", palette.icon)} />
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              "inline-block text-[10px] uppercase tracking-widest font-semibold rounded-md border px-1.5 py-0.5 mb-1",
              palette.chip
            )}
          >
            Triệu chứng
          </div>
          <div className="text-[14px] font-semibold leading-snug">{symptom}</div>
        </div>
      </div>
      <div className="px-4 py-3 bg-muted/30 border-b">
        <div className="flex items-start gap-3">
          <Search className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-0.5">
              Nguyên nhân
            </div>
            <div className="text-[13.5px] text-foreground/85 leading-6">{cause}</div>
          </div>
        </div>
      </div>
      <div className="px-4 py-3">
        <div className="flex items-start gap-3">
          <Wrench className="h-4 w-4 mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-widest font-semibold mb-1 text-emerald-700 dark:text-emerald-400">
              Cách fix (từng bước)
            </div>
            <div className="text-[13.5px] text-foreground/90 leading-6 space-y-1">
              {fix}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FixStep({
  n,
  children,
}: {
  n: number;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-2 items-start">
      <span className="shrink-0 grid place-items-center h-5 w-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 tabular-nums">
        {n}
      </span>
      <span className="flex-1">{children}</span>
    </div>
  );
}

export function ProbeFirst({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose my-5 rounded-xl border-2 border-violet-500/40 bg-gradient-to-br from-violet-500/[0.08] to-pink-500/[0.05] px-4 py-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-violet-500/20 border border-violet-500/40 grid place-items-center shrink-0">
          <Search className="h-5 w-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-widest text-violet-700 dark:text-violet-300 font-semibold">
            Quy tắc số 1
          </div>
          <div className="text-base font-bold mt-0.5">
            Trước khi đào bất cứ thứ gì khác — TEST TUNNEL trước
          </div>
          <div className="mt-2 text-[13.5px] leading-6 text-foreground/90">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FixSuccess({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose my-3 rounded-md border border-emerald-500/40 bg-emerald-500/[0.06] px-3 py-2 flex items-start gap-2">
      <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
      <div className="text-[13px] leading-6">
        <span className="font-medium text-emerald-700 dark:text-emerald-400">
          Nếu thấy{" "}
        </span>
        {children}{" "}
        <span className="text-emerald-700 dark:text-emerald-400">— xong, bạn fix rồi.</span>
      </div>
    </div>
  );
}

export function NextHop({ to, label }: { to: string; label: string }) {
  return (
    <a
      href={to}
      className="not-prose inline-flex items-center gap-1.5 text-[12px] font-medium text-foreground/70 hover:text-foreground border rounded-md px-2 py-1 mt-2"
    >
      {label}
      <ArrowRight className="h-3 w-3" />
    </a>
  );
}
