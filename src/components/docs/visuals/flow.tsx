import { ReactNode } from "react";
import { ArrowRight, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "blue" | "violet" | "emerald" | "amber" | "pink" | "sky" | "orange";

const toneMap: Record<Tone, string> = {
  neutral: "border-border bg-card",
  blue: "border-blue-500/30 bg-blue-500/[0.06]",
  violet: "border-violet-500/30 bg-violet-500/[0.06]",
  emerald: "border-emerald-500/30 bg-emerald-500/[0.06]",
  amber: "border-amber-500/40 bg-amber-500/[0.06]",
  pink: "border-pink-500/30 bg-pink-500/[0.06]",
  sky: "border-sky-500/30 bg-sky-500/[0.06]",
  orange: "border-orange-500/30 bg-orange-500/[0.06]",
};

const toneText: Record<Tone, string> = {
  neutral: "text-foreground",
  blue: "text-blue-700 dark:text-blue-300",
  violet: "text-violet-700 dark:text-violet-300",
  emerald: "text-emerald-700 dark:text-emerald-300",
  amber: "text-amber-700 dark:text-amber-300",
  pink: "text-pink-700 dark:text-pink-300",
  sky: "text-sky-700 dark:text-sky-300",
  orange: "text-orange-700 dark:text-orange-300",
};

export function FlowNode({
  icon: Icon,
  label,
  sub,
  tone = "neutral",
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  sub?: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2.5 min-w-[8rem]",
        toneMap[tone],
        className
      )}
    >
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon className={cn("h-3.5 w-3.5 shrink-0", toneText[tone])} />
        )}
        <span className="font-semibold text-[13px] leading-tight">{label}</span>
      </div>
      {sub && (
        <div className="mt-1 text-[11px] text-muted-foreground font-mono leading-snug">
          {sub}
        </div>
      )}
    </div>
  );
}

export function FlowRow({
  children,
  arrows = "right",
}: {
  children: ReactNode[];
  arrows?: "right" | "down";
}) {
  const sep =
    arrows === "right" ? (
      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
    ) : (
      <ArrowDown className="h-4 w-4 text-muted-foreground shrink-0" />
    );
  return (
    <div
      className={cn(
        "not-prose my-4 flex gap-2 items-center",
        arrows === "down" && "flex-col",
        arrows === "right" && "flex-wrap"
      )}
    >
      {children.map((c, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center gap-2",
            arrows === "down" && "flex-col"
          )}
        >
          {c}
          {i < children.length - 1 && sep}
        </div>
      ))}
    </div>
  );
}

export function LayerStack({ layers }: { layers: LayerItem[] }) {
  return (
    <div className="not-prose my-6 space-y-2">
      {layers.map((layer, i) => (
        <div key={i} className="relative">
          <div
            className={cn(
              "rounded-xl border-2 px-4 py-3 backdrop-blur-sm",
              toneMap[layer.tone ?? "neutral"]
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {layer.icon && (
                  <div
                    className={cn(
                      "h-8 w-8 rounded-md grid place-items-center shrink-0",
                      "bg-background/60 border"
                    )}
                  >
                    <layer.icon
                      className={cn("h-4 w-4", toneText[layer.tone ?? "neutral"])}
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <div
                    className={cn(
                      "font-semibold text-[13px] uppercase tracking-wider",
                      toneText[layer.tone ?? "neutral"]
                    )}
                  >
                    {layer.name}
                  </div>
                  {layer.description && (
                    <div className="text-[13px] text-foreground/80 mt-0.5">
                      {layer.description}
                    </div>
                  )}
                </div>
              </div>
              {layer.host && (
                <div className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground shrink-0">
                  {layer.host}
                </div>
              )}
            </div>
            {layer.items && layer.items.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {layer.items.map((item) => (
                  <span
                    key={item}
                    className="text-[11px] font-mono rounded bg-background/70 border px-1.5 py-0.5 text-foreground/75"
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
          {i < layers.length - 1 && (
            <div className="flex justify-center py-1" aria-hidden>
              <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export type LayerItem = {
  name: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: Tone;
  host?: string;
  items?: string[];
};
