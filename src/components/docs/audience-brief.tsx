"use client";

import { Code2, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";
import { audienceBriefs, defaultAudienceBrief } from "@/lib/audience-briefs";

export function AudienceBrief() {
  const pathname = usePathname();
  const brief = audienceBriefs[pathname] ?? defaultAudienceBrief;

  return (
    <>
      <section
        data-user-detail
        className="not-prose mb-8 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.04] p-4"
      >
        <div className="mb-2 flex items-center gap-2">
          <UserRound className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
          <div className="text-[11px] font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
            User mode
          </div>
        </div>
        <h2 className="m-0 border-0 p-0 text-xl font-semibold tracking-tight">{brief.userTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-foreground/80">{brief.userSummary}</p>
        <ul className="mt-3 space-y-1.5 text-sm leading-6 text-foreground/75">
          {brief.userBullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section
        data-dev-detail
        className="not-prose mb-8 rounded-lg border border-violet-500/30 bg-violet-500/[0.04] p-3.5"
      >
        <div className="flex items-start gap-2">
          <Code2 className="mt-0.5 h-4 w-4 text-violet-700 dark:text-violet-300" />
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-violet-700 dark:text-violet-300">
              Dev mode
            </div>
            <p className="mt-1 text-sm leading-6 text-foreground/80">{brief.devSummary}</p>
          </div>
        </div>
      </section>
    </>
  );
}

