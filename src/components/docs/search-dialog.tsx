"use client";

// Cmd/Ctrl+K opens a search dialog over the docs. On first open we fetch
// every page in nav.ts, extract title + headings + body text, build a
// MiniSearch index, and cache it in localStorage with a 24h TTL so the
// next session is instant.
//
// No backend, no build step — works on Vercel out of the box. Tradeoff
// is ~3s first-time indexing (31 pages); subsequent searches are local.

import { Search, X, Loader2, ArrowRight, FileText } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import MiniSearch from "minisearch";
import { flatNav } from "@/lib/nav";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "pati-handover-search-index-v1";
const TTL_MS = 24 * 60 * 60 * 1000; // 24h

type Doc = {
  id: string;          // route path, unique
  href: string;
  title: string;
  section: string;     // nav section label
  headings: string;    // joined h2/h3 text
  body: string;        // first ~6000 chars of plain text
};

type CachedIndex = {
  builtAt: number;
  docs: Doc[];
};

// ─── Build / load index ──────────────────────────────────────────────────

async function buildIndex(onProgress?: (done: number, total: number, title: string) => void): Promise<Doc[]> {
  const parser = new DOMParser();
  const sections = (await import("@/lib/nav")).navigation;

  // Map href → section title for the badge in search results.
  const sectionByHref = new Map<string, string>();
  for (const s of sections) for (const item of s.items) sectionByHref.set(item.href, s.title);

  const links = flatNav();
  const docs: Doc[] = [];

  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    onProgress?.(i, links.length, link.title);
    try {
      const res = await fetch(link.href, { headers: { Accept: "text/html" } });
      if (!res.ok) continue;
      const html = await res.text();
      const doc = parser.parseFromString(html, "text/html");
      const article =
        doc.querySelector("article.prose-docs") ??
        doc.querySelector("main") ??
        doc.body;
      if (!article) continue;

      // Headings: surface H2/H3 strongly for ranking; titles get even more.
      const headings = Array.from(article.querySelectorAll("h2, h3"))
        .map((h) => h.textContent?.trim())
        .filter(Boolean)
        .join(" · ");

      // Body: strip noisy elements first, then collapse whitespace.
      const clone = article.cloneNode(true) as HTMLElement;
      clone.querySelectorAll("script, style, noscript, svg, [aria-hidden='true']").forEach((n) => n.remove());
      const rawText = clone.textContent ?? "";
      const body = rawText.replace(/\s+/g, " ").trim().slice(0, 6000);

      const title =
        (article.querySelector("h1")?.textContent?.trim() || link.title || "Untitled").replace(/\s+/g, " ");

      docs.push({
        id: link.href,
        href: link.href,
        title,
        section: sectionByHref.get(link.href) ?? "Docs",
        headings,
        body,
      });
    } catch {
      // skip failed page, keep going
    }
  }
  onProgress?.(links.length, links.length, "Done");
  return docs;
}

function loadCachedDocs(): Doc[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw) as CachedIndex;
    if (Date.now() - cached.builtAt > TTL_MS) return null;
    if (!Array.isArray(cached.docs) || cached.docs.length === 0) return null;
    return cached.docs;
  } catch {
    return null;
  }
}

function saveCachedDocs(docs: Doc[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ builtAt: Date.now(), docs }));
  } catch {
    // localStorage full or unavailable — silently skip cache
  }
}

function makeMiniSearch(docs: Doc[]): MiniSearch<Doc> {
  const ms = new MiniSearch<Doc>({
    fields: ["title", "section", "headings", "body"],
    storeFields: ["title", "href", "section", "headings", "body"],
    searchOptions: {
      boost: { title: 4, headings: 2.5, section: 1.5, body: 1 },
      fuzzy: 0.2,
      prefix: true,
      combineWith: "AND",
    },
  });
  ms.addAll(docs);
  return ms;
}

// ─── Highlight matching tokens in a snippet ──────────────────────────────

function snippet(body: string, query: string, max = 180): string {
  if (!body) return "";
  const q = query.trim().toLowerCase();
  if (!q) return body.slice(0, max);
  const lower = body.toLowerCase();
  const tokens = q.split(/\s+/).filter(Boolean);
  let idx = -1;
  for (const t of tokens) {
    const i = lower.indexOf(t);
    if (i >= 0 && (idx === -1 || i < idx)) idx = i;
  }
  if (idx < 0) return body.slice(0, max);
  const start = Math.max(0, idx - 40);
  const end = Math.min(body.length, idx + max - 40);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < body.length ? "…" : "";
  return prefix + body.slice(start, end) + suffix;
}

// ─── Dialog ──────────────────────────────────────────────────────────────

type SearchHit = {
  href: string;
  title: string;
  section: string;
  headings: string;
  body: string;
  score: number;
};

export function DocsSearchDialog() {
  const [open, setOpen] = useState(false);
  const [docs, setDocs] = useState<Doc[] | null>(null);
  const [building, setBuilding] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number; title: string } | null>(null);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Cmd/Ctrl+K to open; ESC closes.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const trigger = (isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === "k";
      if (trigger) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // First-time index build (or pull from cache).
  const ensureIndex = useCallback(async () => {
    if (docs) return;
    const cached = loadCachedDocs();
    if (cached) {
      setDocs(cached);
      return;
    }
    setBuilding(true);
    setProgress({ done: 0, total: flatNav().length, title: "" });
    const built = await buildIndex((d, t, title) => setProgress({ done: d, total: t, title }));
    saveCachedDocs(built);
    setDocs(built);
    setBuilding(false);
    setProgress(null);
  }, [docs]);

  useEffect(() => {
    if (open) {
      ensureIndex();
      // Focus input on next tick after portal mount.
      setTimeout(() => inputRef.current?.focus(), 30);
      setActiveIdx(0);
    }
  }, [open, ensureIndex]);

  const ms = useMemo(() => (docs ? makeMiniSearch(docs) : null), [docs]);

  const hits: SearchHit[] = useMemo(() => {
    if (!ms || !query.trim()) return [];
    return ms
      .search(query, { fuzzy: 0.2, prefix: true })
      .slice(0, 20)
      .map((r) => ({
        href: r.href as string,
        title: r.title as string,
        section: r.section as string,
        headings: r.headings as string,
        body: r.body as string,
        score: r.score,
      }));
  }, [ms, query]);

  function handleKeyDownInput(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, hits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" && hits[activeIdx]) {
      e.preventDefault();
      router.push(hits[activeIdx].href);
      setOpen(false);
      setQuery("");
    }
  }

  function forceRebuild() {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setDocs(null);
    ensureIndex();
  }

  if (!mounted) return <SearchTrigger onClick={() => setOpen(true)} />;

  return (
    <>
      <SearchTrigger onClick={() => setOpen(true)} />
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4"
            onClick={() => setOpen(false)}
          >
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
            <div
              className="relative w-full max-w-2xl rounded-xl border bg-card shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 border-b px-4 py-3">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setActiveIdx(0); }}
                  onKeyDown={handleKeyDownInput}
                  placeholder={building ? "Đang dựng index…" : "Tìm trong handover docs (vd: cron, supabase, refund)…"}
                  className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-muted-foreground"
                />
                {building && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {building && progress && (
                <div className="px-4 py-2 border-b bg-muted/30 text-[11.5px] text-muted-foreground flex items-center justify-between">
                  <span>Đang đọc {progress.done}/{progress.total} trang… ({progress.title})</span>
                  <span className="tabular-nums">{Math.round((progress.done / Math.max(1, progress.total)) * 100)}%</span>
                </div>
              )}

              <div className="max-h-[60vh] overflow-y-auto">
                {!building && !query && (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    Gõ từ khoá để tìm trong {docs?.length ?? 0} trang docs.
                    <div className="mt-2 text-[11px]">
                      Phím tắt: <KbdHint>↑↓</KbdHint> di chuyển · <KbdHint>Enter</KbdHint> mở ·{" "}
                      <KbdHint>Esc</KbdHint> đóng
                    </div>
                  </div>
                )}

                {!building && query && hits.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Không thấy kết quả nào cho <span className="font-mono text-foreground">{query}</span>.
                  </div>
                )}

                {hits.map((h, i) => (
                  <button
                    key={h.href}
                    type="button"
                    onMouseEnter={() => setActiveIdx(i)}
                    onClick={() => { router.push(h.href); setOpen(false); setQuery(""); }}
                    className={cn(
                      "w-full text-left px-4 py-3 border-b last:border-b-0 flex items-start gap-3 transition-colors",
                      i === activeIdx ? "bg-accent/60" : "hover:bg-muted/40",
                    )}
                  >
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-[13.5px] font-semibold text-foreground truncate">{h.title}</div>
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                          {h.section}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[11.5px] text-muted-foreground font-mono truncate">{h.href}</div>
                      {h.headings && (
                        <div className="mt-1 text-[11.5px] text-muted-foreground/90 line-clamp-1">
                          <span className="text-muted-foreground/70">Sections:</span> {h.headings}
                        </div>
                      )}
                      <div className="mt-1 text-[12px] text-foreground/75 line-clamp-2">
                        {snippet(h.body, query)}
                      </div>
                    </div>
                    {i === activeIdx && <ArrowRight className="h-3.5 w-3.5 text-foreground shrink-0 mt-1" />}
                  </button>
                ))}
              </div>

              <div className="border-t bg-muted/20 px-4 py-2 flex items-center justify-between text-[10.5px] text-muted-foreground">
                <div>
                  Index cached 24h ·{" "}
                  <button type="button" onClick={forceRebuild} className="underline hover:text-foreground">
                    rebuild
                  </button>
                </div>
                <div>{docs ? `${docs.length} trang đã index` : "—"}</div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

// ─── Trigger button (used in topbar) ────────────────────────────────────

function SearchTrigger({ onClick }: { onClick: () => void }) {
  const [shortcut, setShortcut] = useState("⌘K");
  useEffect(() => {
    const isMac = navigator.platform.toLowerCase().includes("mac");
    setShortcut(isMac ? "⌘K" : "Ctrl K");
  }, []);
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-md border bg-card px-2.5 py-1.5 text-[12px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      aria-label="Tìm kiếm docs"
    >
      <Search className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Tìm docs</span>
      <KbdHint>{shortcut}</KbdHint>
    </button>
  );
}

function KbdHint({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-4 items-center rounded border bg-background px-1 text-[10px] font-mono text-foreground/70">
      {children}
    </kbd>
  );
}
