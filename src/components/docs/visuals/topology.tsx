import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "blue" | "violet" | "emerald" | "amber" | "pink" | "sky" | "orange" | "neutral";

const ringMap: Record<Tone, string> = {
  blue: "border-blue-500/40",
  violet: "border-violet-500/40",
  emerald: "border-emerald-500/40",
  amber: "border-amber-500/40",
  pink: "border-pink-500/40",
  sky: "border-sky-500/40",
  orange: "border-orange-500/40",
  neutral: "border-border",
};

const dotMap: Record<Tone, string> = {
  blue: "bg-blue-500",
  violet: "bg-violet-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  pink: "bg-pink-500",
  sky: "bg-sky-500",
  orange: "bg-orange-500",
  neutral: "bg-foreground/60",
};

export function ZoneCard({
  zone,
  location,
  tone = "neutral",
  children,
}: {
  zone: string;
  location?: string;
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border-2 bg-card/40 backdrop-blur-sm p-3 sm:p-4",
        ringMap[tone]
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full animate-pulse", dotMap[tone])} />
          <div className="text-[10px] uppercase tracking-widest font-semibold text-foreground/70">
            {zone}
          </div>
        </div>
        {location && (
          <div className="text-[10px] font-mono text-muted-foreground">{location}</div>
        )}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export function Service({
  icon: Icon,
  name,
  detail,
  status,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  name: string;
  detail?: ReactNode;
  status?: "up" | "down" | "manual";
}) {
  return (
    <div className="rounded-md border bg-background px-3 py-2 flex items-center gap-2.5">
      {Icon && (
        <div className="h-7 w-7 rounded-md bg-muted grid place-items-center shrink-0">
          <Icon className="h-3.5 w-3.5" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold leading-tight">{name}</div>
        {detail && (
          <div className="text-[11.5px] text-muted-foreground font-mono leading-snug mt-0.5">
            {detail}
          </div>
        )}
      </div>
      {status && (
        <span
          className={cn(
            "text-[10px] uppercase tracking-wider font-semibold rounded px-1.5 py-0.5 border",
            status === "up" &&
              "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300",
            status === "down" &&
              "bg-red-500/15 border-red-500/40 text-red-700 dark:text-red-300",
            status === "manual" &&
              "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300"
          )}
        >
          {status === "up" && "up"}
          {status === "down" && "down"}
          {status === "manual" && "manual"}
        </span>
      )}
    </div>
  );
}

export function FactRow({
  label,
  value,
  mono = true,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-3 py-1.5 border-b border-border/50 last:border-b-0">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground w-28 shrink-0">
        {label}
      </div>
      <div
        className={cn(
          "text-[13px] text-foreground/90",
          mono && "font-mono"
        )}
      >
        {value}
      </div>
    </div>
  );
}
