import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Runner = "macmini" | "gha" | "webapi";

const runnerStyles: Record<Runner, { bg: string; text: string; label: string }> = {
  macmini: {
    bg: "bg-orange-500/20 border-orange-500/40",
    text: "text-orange-700 dark:text-orange-300",
    label: "Mac mini",
  },
  gha: {
    bg: "bg-violet-500/20 border-violet-500/40",
    text: "text-violet-700 dark:text-violet-300",
    label: "GH Actions",
  },
  webapi: {
    bg: "bg-sky-500/20 border-sky-500/40",
    text: "text-sky-700 dark:text-sky-300",
    label: "Web API",
  },
};

export type CronJob = {
  name: string;
  hours: number[]; // 0..23 — which hours of day it runs (VN time)
  every?: number; // every N min, if sub-hour. Used for "*/5".
  runner: Runner;
  what?: string;
};

export function ScheduleGrid({ jobs }: { jobs: CronJob[] }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div className="not-prose my-6 rounded-xl border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="text-left px-3 py-2 font-semibold w-[260px] sticky left-0 bg-muted/40">
                Job
              </th>
              <th className="text-left px-2 py-2 font-semibold w-[80px]">Runner</th>
              {hours.map((h) => (
                <th
                  key={h}
                  className="text-center font-mono font-medium text-muted-foreground py-2 w-[24px]"
                >
                  {h.toString().padStart(2, "0")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => {
              const style = runnerStyles[job.runner];
              return (
                <tr key={job.name} className="border-t hover:bg-muted/20">
                  <td className="px-3 py-2 align-middle sticky left-0 bg-card">
                    <div className="font-mono text-[12px] font-semibold leading-tight">
                      {job.name}
                    </div>
                    {job.what && (
                      <div className="text-[10.5px] text-muted-foreground mt-0.5">
                        {job.what}
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-2 align-middle">
                    <span
                      className={cn(
                        "inline-block text-[10px] uppercase tracking-wider font-semibold rounded border px-1.5 py-0.5",
                        style.bg,
                        style.text
                      )}
                    >
                      {style.label}
                    </span>
                  </td>
                  {hours.map((h) => {
                    const active = job.hours.includes(h);
                    const isEvery = !!job.every;
                    return (
                      <td
                        key={h}
                        className={cn(
                          "text-center align-middle border-l border-border/40 h-7",
                          (h === 0 || h === 6 || h === 12 || h === 18) &&
                            "border-l-foreground/10"
                        )}
                      >
                        {active && (
                          <span
                            className={cn(
                              "inline-block h-3 w-3 rounded-sm border",
                              style.bg
                            )}
                            title={`Runs at ${h}:00 VN`}
                          />
                        )}
                        {isEvery && !active && (
                          <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground/40" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="border-t bg-muted/20 px-4 py-2 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
        <span>
          <span className="inline-block h-3 w-3 rounded-sm border bg-orange-500/20 border-orange-500/40 align-text-bottom mr-1" />
          Mac mini cron
        </span>
        <span>
          <span className="inline-block h-3 w-3 rounded-sm border bg-violet-500/20 border-violet-500/40 align-text-bottom mr-1" />
          GitHub Actions
        </span>
        <span>
          <span className="inline-block h-3 w-3 rounded-sm border bg-sky-500/20 border-sky-500/40 align-text-bottom mr-1" />
          Mac mini web API
        </span>
        <span className="ml-auto font-mono">Time = Asia/Ho_Chi_Minh (UTC+7)</span>
      </div>
    </div>
  );
}

export function RunnerLegend({ children }: { children?: ReactNode }) {
  return (
    <div className="not-prose my-5 grid sm:grid-cols-3 gap-3">
      <RunnerCard
        runner="macmini"
        title="Mac mini cron"
        desc="Heavy / persistent — Playwright, Chrome CDP, big backfills. Runs under launchd on the Mac mini."
      />
      <RunnerCard
        runner="gha"
        title="GitHub Actions"
        desc="Triggerable từ UI (workflow_dispatch). Analytics providers, North Stars matview refresh."
      />
      <RunnerCard
        runner="webapi"
        title="Mac mini web API"
        desc="Endpoint /api/cron/* chạy trong Next.js web service, protected bằng CRON_SECRET."
      />
      {children}
    </div>
  );
}

function RunnerCard({
  runner,
  title,
  desc,
}: {
  runner: Runner;
  title: string;
  desc: string;
}) {
  const style = runnerStyles[runner];
  return (
    <div className={cn("rounded-lg border p-3", style.bg)}>
      <div className={cn("text-[11px] uppercase tracking-widest font-semibold", style.text)}>
        {title}
      </div>
      <div className="text-[12.5px] text-foreground/85 mt-1.5 leading-5">{desc}</div>
    </div>
  );
}
