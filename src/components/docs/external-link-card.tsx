import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Card link rời ra external system (Lark Base, Shopify Admin, GitHub, ...).
 * Dùng để show DẪN CHỨNG nguồn dữ liệu / config thay vì chỉ nói mồm trong text.
 */

type Tone = "emerald" | "violet" | "blue" | "amber" | "pink" | "sky";

const toneStyles: Record<Tone, { wrap: string; iconWrap: string; iconColor: string; mono: string }> = {
  emerald: {
    wrap: "border-emerald-500/40 bg-emerald-500/[0.04] hover:bg-emerald-500/[0.08]",
    iconWrap: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    iconColor: "text-emerald-700 dark:text-emerald-300",
    mono: "text-emerald-700 dark:text-emerald-300",
  },
  violet: {
    wrap: "border-violet-500/40 bg-violet-500/[0.04] hover:bg-violet-500/[0.08]",
    iconWrap: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
    iconColor: "text-violet-700 dark:text-violet-300",
    mono: "text-violet-700 dark:text-violet-300",
  },
  blue: {
    wrap: "border-blue-500/40 bg-blue-500/[0.04] hover:bg-blue-500/[0.08]",
    iconWrap: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
    iconColor: "text-blue-700 dark:text-blue-300",
    mono: "text-blue-700 dark:text-blue-300",
  },
  amber: {
    wrap: "border-amber-500/40 bg-amber-500/[0.04] hover:bg-amber-500/[0.08]",
    iconWrap: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    iconColor: "text-amber-700 dark:text-amber-300",
    mono: "text-amber-700 dark:text-amber-300",
  },
  pink: {
    wrap: "border-pink-500/40 bg-pink-500/[0.04] hover:bg-pink-500/[0.08]",
    iconWrap: "bg-pink-500/15 text-pink-700 dark:text-pink-300",
    iconColor: "text-pink-700 dark:text-pink-300",
    mono: "text-pink-700 dark:text-pink-300",
  },
  sky: {
    wrap: "border-sky-500/40 bg-sky-500/[0.04] hover:bg-sky-500/[0.08]",
    iconWrap: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    iconColor: "text-sky-700 dark:text-sky-300",
    mono: "text-sky-700 dark:text-sky-300",
  },
};

export function ExternalLinkCard({
  href,
  title,
  pathHint,
  desc,
  icon: Icon,
  tone = "emerald",
  className,
}: {
  href: string;
  title: string;
  pathHint?: string; // URL fragment để show ngắn gọn, vd "wiki/...?table=..."
  desc?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: Tone;
  className?: string;
}) {
  const s = toneStyles[tone];
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "not-prose flex items-start gap-3 rounded-xl border-2 p-4 transition-colors",
        s.wrap,
        className,
      )}
    >
      <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-md", s.iconWrap)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 font-semibold text-[14.5px] leading-tight mb-1">
          {title}
          <ExternalLink className={cn("h-3.5 w-3.5", s.iconColor)} />
        </div>
        {pathHint && (
          <div className={cn("font-mono text-[11.5px] break-all", s.mono)}>
            {pathHint}
          </div>
        )}
        {desc && (
          <div className="text-[12px] text-muted-foreground leading-5 mt-1.5">{desc}</div>
        )}
      </div>
    </a>
  );
}

export function ExternalLinkRow({
  links,
}: {
  links: Array<{
    href: string;
    title: string;
    pathHint?: string;
    desc?: string;
    icon: React.ComponentType<{ className?: string }>;
    tone?: Tone;
  }>;
}) {
  return (
    <div className="not-prose my-5 grid gap-3 sm:grid-cols-2">
      {links.map((l) => (
        <ExternalLinkCard key={l.href} {...l} />
      ))}
    </div>
  );
}
