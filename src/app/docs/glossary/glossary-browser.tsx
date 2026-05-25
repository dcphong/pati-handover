"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

export function GlossaryBrowser({ terms }: { terms: { term: string; def: string }[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return terms;
    return terms.filter(
      (x) =>
        x.term.toLowerCase().includes(t) || x.def.toLowerCase().includes(t)
    );
  }, [q, terms]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof terms> = {};
    for (const t of filtered) {
      const key = t.term[0].toUpperCase();
      (map[key] = map[key] || []).push(t);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div className="not-prose my-8">
      <div className="sticky top-14 z-10 -mx-2 sm:-mx-4 px-2 sm:px-4 py-3 backdrop-blur bg-background/85 border-b">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="search"
              placeholder="Tìm theo term hoặc trong định nghĩa…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full text-[13px] rounded-md border bg-card pl-8 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>
          <div className="text-[11px] text-muted-foreground font-mono shrink-0">
            {filtered.length}/{terms.length}
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-8">
        {grouped.map(([letter, items]) => (
          <section key={letter}>
            <h3 className="text-[15px] font-bold tracking-tight mb-2.5 sticky top-32 bg-background/80 backdrop-blur py-1">
              {letter}{" "}
              <span className="text-muted-foreground font-mono text-[11px] ml-1">
                {items.length}
              </span>
            </h3>
            <div className="rounded-lg border bg-card overflow-hidden">
              {items.map((t, i) => (
                <div
                  key={t.term}
                  className={`px-4 py-2.5 grid grid-cols-12 gap-3 items-start ${i > 0 ? "border-t" : ""}`}
                >
                  <code className="col-span-12 sm:col-span-3 font-mono text-[12.5px] font-semibold text-foreground/90 break-all">
                    {t.term}
                  </code>
                  <div className="col-span-12 sm:col-span-9 text-[13px] text-foreground/85 leading-6">
                    {t.def}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-muted-foreground py-12 text-sm">
            Không tìm thấy term nào.
          </div>
        )}
      </div>
    </div>
  );
}
