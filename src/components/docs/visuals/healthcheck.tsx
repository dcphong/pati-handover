import { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type HealthProbe = {
  label: string;
  cmd: string;
  expect: string;
  badResult?: string;
  badMeans?: ReactNode;
};

export function HealthCheckGrid({
  title = "Health-check khi nghi ngờ hệ thống down",
  probes,
}: {
  title?: string;
  probes: HealthProbe[];
}) {
  return (
    <div className="not-prose my-6 rounded-xl border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/30">
        <div className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground">
          Health checks
        </div>
        <div className="text-[15px] font-semibold mt-0.5">{title}</div>
      </div>
      <div className="divide-y">
        {probes.map((p, i) => (
          <div key={i} className="px-4 py-3">
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="grid place-items-center h-5 w-5 rounded-full bg-foreground text-background text-[11px] font-bold tabular-nums shrink-0">
                {i + 1}
              </span>
              <div className="font-semibold text-[13.5px]">{p.label}</div>
            </div>
            <div className="ml-7 space-y-1.5">
              <div className="rounded-md border bg-zinc-950 text-zinc-100 px-3 py-1.5 font-mono text-[12px] overflow-x-auto">
                <span className="text-emerald-400 select-none mr-2">$</span>
                {p.cmd}
              </div>
              <div className="text-[12.5px] leading-5 flex items-start gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium text-emerald-700 dark:text-emerald-400">
                    Healthy:{" "}
                  </span>
                  <span className="font-mono text-[12px]">{p.expect}</span>
                </div>
              </div>
              {p.badResult && (
                <div className="text-[12.5px] leading-5 flex items-start gap-1.5">
                  <span className="h-3.5 w-3.5 grid place-items-center text-[10px] text-red-600 dark:text-red-400 mt-0.5 shrink-0">
                    ✕
                  </span>
                  <div>
                    <span className="font-medium text-red-700 dark:text-red-400">
                      Sai:{" "}
                    </span>
                    <span className="font-mono text-[12px]">{p.badResult}</span>
                    {p.badMeans && (
                      <span className="text-muted-foreground">
                        {" "}
                        — {p.badMeans}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatusPill({
  status,
  children,
}: {
  status: "ok" | "warn" | "err" | "muted";
  children: ReactNode;
}) {
  const map = {
    ok: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40",
    warn: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40",
    err: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/40",
    muted: "bg-muted text-muted-foreground border-border",
  } as const;
  return (
    <span
      className={cn(
        "inline-block text-[10px] uppercase tracking-wider font-semibold rounded border px-1.5 py-0.5",
        map[status]
      )}
    >
      {children}
    </span>
  );
}
