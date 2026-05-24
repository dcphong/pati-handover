import { Info, AlertTriangle, AlertOctagon, Lightbulb, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "info" | "warning" | "danger" | "tip" | "success";

const styles: Record<Variant, { wrap: string; icon: string; Icon: typeof Info; label: string }> = {
  info: {
    wrap: "border-blue-500/30 bg-blue-500/[0.04]",
    icon: "text-blue-600 dark:text-blue-400",
    Icon: Info,
    label: "Note",
  },
  warning: {
    wrap: "border-amber-500/40 bg-amber-500/[0.06]",
    icon: "text-amber-600 dark:text-amber-400",
    Icon: AlertTriangle,
    label: "Warning",
  },
  danger: {
    wrap: "border-red-500/40 bg-red-500/[0.05]",
    icon: "text-red-600 dark:text-red-400",
    Icon: AlertOctagon,
    label: "Danger",
  },
  tip: {
    wrap: "border-violet-500/30 bg-violet-500/[0.04]",
    icon: "text-violet-600 dark:text-violet-400",
    Icon: Lightbulb,
    label: "Tip",
  },
  success: {
    wrap: "border-emerald-500/30 bg-emerald-500/[0.05]",
    icon: "text-emerald-600 dark:text-emerald-400",
    Icon: CheckCircle2,
    label: "Done",
  },
};

export function Callout({
  variant = "info",
  title,
  children,
}: {
  variant?: Variant;
  title?: string;
  children: React.ReactNode;
}) {
  const s = styles[variant];
  const Icon = s.Icon;
  return (
    <div className={cn("my-5 rounded-lg border px-4 py-3.5", s.wrap)}>
      <div className="flex items-start gap-3">
        <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", s.icon)} />
        <div className="flex-1 min-w-0">
          {title && (
            <div className="text-sm font-semibold mb-1">{title}</div>
          )}
          <div className="text-sm leading-6 [&>p]:my-0 [&>p+p]:mt-2 [&>ul]:my-1 [&>ol]:my-1 text-foreground/85">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
