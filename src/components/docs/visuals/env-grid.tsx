import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Status = "required" | "optional" | "legacy" | "one-off" | "prod-only";

const statusStyle: Record<Status, string> = {
  required:
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40",
  optional:
    "bg-muted text-muted-foreground border-border",
  legacy:
    "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40",
  "one-off":
    "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/40",
  "prod-only":
    "bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/40",
};

const statusLabel: Record<Status, string> = {
  required: "Bắt buộc",
  optional: "Tuỳ chọn",
  legacy: "Legacy",
  "one-off": "1-lần",
  "prod-only": "Prod-only",
};

export type EnvRow = {
  name: string;
  status: Status;
  desc: ReactNode;
};

export type EnvCategory = {
  title: string;
  description?: ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  rows: EnvRow[];
};

export function EnvCategoryCard({ cat }: { cat: EnvCategory }) {
  const requiredCount = cat.rows.filter((r) => r.status === "required").length;
  return (
    <section className="not-prose my-6 rounded-xl border bg-card overflow-hidden">
      <div className="flex items-baseline justify-between gap-3 px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          {cat.icon && <cat.icon className="h-4 w-4 text-foreground/80" />}
          <h3 className="text-[15px] font-semibold tracking-tight">
            {cat.title}
          </h3>
        </div>
        <div className="text-[11px] text-muted-foreground font-mono shrink-0">
          {requiredCount}/{cat.rows.length} bắt buộc
        </div>
      </div>
      {cat.description && (
        <div className="px-4 py-2 text-[12.5px] text-muted-foreground border-b leading-5">
          {cat.description}
        </div>
      )}
      <div>
        {cat.rows.map((r, i) => (
          <div
            key={r.name}
            className={cn(
              "px-4 py-2.5 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4",
              i > 0 && "border-t"
            )}
          >
            <div className="flex items-center gap-2 sm:w-[280px] shrink-0">
              <span
                className={cn(
                  "text-[10px] uppercase tracking-wider font-semibold rounded border px-1.5 py-0.5 shrink-0",
                  statusStyle[r.status]
                )}
              >
                {statusLabel[r.status]}
              </span>
              <code className="font-mono text-[12px] font-semibold break-all text-foreground/90">
                {r.name}
              </code>
            </div>
            <div className="text-[13px] text-foreground/85 leading-6 flex-1">
              {r.desc}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function EnvLegend() {
  const statuses: Status[] = ["required", "optional", "legacy", "one-off", "prod-only"];
  return (
    <div className="not-prose my-5 flex flex-wrap gap-2">
      {statuses.map((s) => (
        <span
          key={s}
          className={cn(
            "text-[10.5px] uppercase tracking-wider font-semibold rounded border px-2 py-0.5",
            statusStyle[s]
          )}
        >
          {statusLabel[s]}
        </span>
      ))}
    </div>
  );
}
