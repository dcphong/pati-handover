"use client";

import { ReactNode, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { detectIntegrations, IntegrationLogo } from "@/components/docs/integration-logo";
import { cn } from "@/lib/utils";

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

const methodColor: Record<Method, string> = {
  GET: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/40",
  POST: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40",
  PUT: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40",
  DELETE: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/40",
  PATCH: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/40",
};

export type RouteEntry = {
  method: Method;
  path: string;
  purpose: string;
  note?: string;
};

export type RouteGroup = {
  title: string;
  description?: string;
  icon?: ReactNode;
  routes: RouteEntry[];
};

export function RouteCatalog({ groups }: { groups: RouteGroup[] }) {
  const [q, setQ] = useState("");
  const [activeMethods, setActiveMethods] = useState<Set<Method>>(new Set());

  const allMethods = useMemo<Method[]>(
    () => ["GET", "POST", "PUT", "DELETE", "PATCH"],
    []
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        routes: g.routes.filter((r) => {
          if (activeMethods.size > 0 && !activeMethods.has(r.method)) return false;
          if (!term) return true;
          return (
            r.path.toLowerCase().includes(term) ||
            r.purpose.toLowerCase().includes(term) ||
            g.title.toLowerCase().includes(term)
          );
        }),
      }))
      .filter((g) => g.routes.length > 0);
  }, [groups, q, activeMethods]);

  const totalRoutes = useMemo(
    () => groups.reduce((sum, g) => sum + g.routes.length, 0),
    [groups]
  );
  const visibleRoutes = filtered.reduce((sum, g) => sum + g.routes.length, 0);

  function toggleMethod(m: Method) {
    const next = new Set(activeMethods);
    if (next.has(m)) next.delete(m);
    else next.add(m);
    setActiveMethods(next);
  }

  return (
    <div className="not-prose my-8">
      <div className="sticky top-14 z-10 -mx-2 sm:-mx-4 px-2 sm:px-4 py-3 backdrop-blur bg-background/85 border-b">
        <div className="flex items-center gap-2 mb-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="search"
              placeholder="Tìm route theo path hoặc mô tả…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full text-[13px] rounded-md border bg-card pl-8 pr-3 py-1.5 font-mono focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>
          <div className="text-[11px] text-muted-foreground font-mono shrink-0">
            {visibleRoutes}/{totalRoutes}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {allMethods.map((m) => {
            const active = activeMethods.has(m);
            return (
              <button
                key={m}
                onClick={() => toggleMethod(m)}
                className={cn(
                  "text-[10px] uppercase tracking-wider font-semibold rounded border px-2 py-0.5 transition-colors",
                  active ? methodColor[m] : "border-border bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                {m}
              </button>
            );
          })}
          {activeMethods.size > 0 && (
            <button
              onClick={() => setActiveMethods(new Set())}
              className="text-[10px] uppercase tracking-wider font-semibold rounded border-dashed border px-2 py-0.5 text-muted-foreground hover:text-foreground"
            >
              clear
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-8">
        {filtered.map((g) => (
          <section key={g.title}>
            <div className="flex items-baseline justify-between mb-3">
              <div className="flex items-center gap-2">
                {detectIntegrations(
                  g.title,
                  g.description,
                  g.routes.map((route) => `${route.path} ${route.purpose}`).join(" "),
                ).map((integration) => (
                  <IntegrationLogo key={integration} integration={integration} className="h-5 w-5" />
                ))}
                {detectIntegrations(
                  g.title,
                  g.description,
                  g.routes.map((route) => `${route.path} ${route.purpose}`).join(" "),
                ).length === 0 && g.icon}
                <h3 className="text-base font-semibold tracking-tight">
                  {g.title}
                </h3>
              </div>
              <span className="text-[11px] text-muted-foreground font-mono">
                {g.routes.length} {g.routes.length === 1 ? "route" : "routes"}
              </span>
            </div>
            {g.description && (
              <p className="text-[12.5px] text-muted-foreground mb-3 leading-5">
                {g.description}
              </p>
            )}
            <div className="rounded-lg border overflow-hidden bg-card">
              {g.routes.map((r, i) => (
                <div
                  key={`${r.method}-${r.path}`}
                  className={cn(
                    "flex items-start gap-3 px-3 py-2.5",
                    i > 0 && "border-t"
                  )}
                >
                  <span
                    className={cn(
                      "text-[10px] uppercase tracking-wider font-bold rounded border px-1.5 py-0.5 shrink-0 w-[60px] text-center",
                      methodColor[r.method]
                    )}
                  >
                    {r.method}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {detectIntegrations(r.path, r.purpose, r.note).map((integration) => (
                        <IntegrationLogo key={integration} integration={integration} className="h-[18px] w-[18px]" />
                      ))}
                      <div className="font-mono text-[12.5px] font-semibold leading-tight break-all">
                        {r.path}
                      </div>
                    </div>
                    <div className="text-[12.5px] text-muted-foreground leading-5 mt-0.5">
                      {r.purpose}
                    </div>
                    {r.note && (
                      <div className="mt-1 text-[11px] font-mono text-amber-700 dark:text-amber-400">
                        ⚠ {r.note}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-muted-foreground py-12 text-sm">
            Không match route nào với <code>&quot;{q}&quot;</code>.
          </div>
        )}
      </div>
    </div>
  );
}
