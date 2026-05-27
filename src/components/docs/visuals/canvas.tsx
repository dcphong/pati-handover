"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Download, Maximize2, Minimize2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CanvasNode, CanvasEdge } from "@/lib/timcook-agent-data";

const GROUP_STYLES: Record<"brain" | "infra" | "ext", string> = {
  brain: "bg-violet-500/[0.06] border-violet-500/30",
  infra: "bg-blue-500/[0.06] border-blue-500/30",
  ext: "bg-emerald-500/[0.06] border-emerald-500/30",
};

const GROUP_COLOR_HEX: Record<"brain" | "infra" | "ext", string> = {
  // Obsidian canvas color: 1=red, 2=orange, 3=yellow, 4=green, 5=cyan, 6=purple
  brain: "6",
  infra: "5",
  ext: "4",
};

const PADDING = 40;
const MIN_SCALE = 0.18;
const MAX_SCALE = 2.5;
const MIN_NODE_W = 100;
const MIN_NODE_H = 50;

type DragNodeState = {
  id: string;
  startMouseX: number;
  startMouseY: number;
  startNodeX: number;
  startNodeY: number;
};

type ResizeState = {
  id: string;
  startMouseX: number;
  startMouseY: number;
  startWidth: number;
  startHeight: number;
};

type Override = { x?: number; y?: number; width?: number; height?: number };

export function Canvas({
  nodes,
  edges,
  height = 720,
  initialScale = 0.55,
  exportName = "canvas",
}: {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  height?: number;
  initialScale?: number;
  exportName?: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(initialScale);
  const [overrides, setOverrides] = useState<Record<string, Override>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const dragNode = useRef<DragNodeState | null>(null);
  const dragResize = useRef<ResizeState | null>(null);
  const panDrag = useRef<{ startX: number; startY: number; scrollLeft: number; scrollTop: number } | null>(null);

  const effective = useCallback(
    (n: CanvasNode): CanvasNode => {
      const o = overrides[n.id];
      if (!o) return n;
      return {
        ...n,
        x: o.x ?? n.x,
        y: o.y ?? n.y,
        width: o.width ?? n.width,
        height: o.height ?? n.height,
      };
    },
    [overrides],
  );

  const effectiveNodes = useMemo(() => nodes.map(effective), [nodes, effective]);

  const { width: W, height: H, minX, minY } = useMemo(() => {
    let lo_x = Infinity, lo_y = Infinity, hi_x = -Infinity, hi_y = -Infinity;
    for (const n of effectiveNodes) {
      if (n.x < lo_x) lo_x = n.x;
      if (n.y < lo_y) lo_y = n.y;
      if (n.x + n.width > hi_x) hi_x = n.x + n.width;
      if (n.y + n.height > hi_y) hi_y = n.y + n.height;
    }
    return { width: hi_x - lo_x + PADDING * 2, height: hi_y - lo_y + PADDING * 2, minX: lo_x, minY: lo_y };
  }, [effectiveNodes]);

  const pos = (n: CanvasNode) => ({ left: n.x - minX + PADDING, top: n.y - minY + PADDING });

  const anchor = (n: CanvasNode, side: CanvasEdge["fromSide"]): [number, number] => {
    const p = pos(n);
    switch (side) {
      case "top":    return [p.left + n.width / 2, p.top];
      case "bottom": return [p.left + n.width / 2, p.top + n.height];
      case "left":   return [p.left, p.top + n.height / 2];
      case "right":  return [p.left + n.width, p.top + n.height / 2];
    }
  };

  const nodeById = useMemo(() => {
    const m: Record<string, CanvasNode> = {};
    for (const n of effectiveNodes) m[n.id] = n;
    return m;
  }, [effectiveNodes]);

  // ─── Mouse drag: node / resize / pan ──────────────────────────────────

  const onStageMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a, button, [data-resize-handle]")) return;
    if (!stageRef.current) return;
    panDrag.current = {
      startX: e.pageX,
      startY: e.pageY,
      scrollLeft: stageRef.current.scrollLeft,
      scrollTop: stageRef.current.scrollTop,
    };
    stageRef.current.style.cursor = "grabbing";
  };

  const onNodeMouseDown = (e: React.MouseEvent, n: CanvasNode) => {
    if ((e.target as HTMLElement).closest("a, button, [data-resize-handle]")) return;
    e.stopPropagation();
    dragNode.current = {
      id: n.id,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startNodeX: n.x,
      startNodeY: n.y,
    };
    if (stageRef.current) stageRef.current.style.cursor = "grabbing";
  };

  const onResizeMouseDown = (e: React.MouseEvent, n: CanvasNode) => {
    e.stopPropagation();
    e.preventDefault();
    dragResize.current = {
      id: n.id,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startWidth: n.width,
      startHeight: n.height,
    };
    if (stageRef.current) stageRef.current.style.cursor = "nwse-resize";
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (dragResize.current) {
      const dx = (e.clientX - dragResize.current.startMouseX) / scale;
      const dy = (e.clientY - dragResize.current.startMouseY) / scale;
      const id = dragResize.current.id;
      const w = Math.max(MIN_NODE_W, dragResize.current.startWidth + dx);
      const h = Math.max(MIN_NODE_H, dragResize.current.startHeight + dy);
      setOverrides((prev) => ({ ...prev, [id]: { ...prev[id], width: w, height: h } }));
      return;
    }
    if (dragNode.current) {
      const dx = (e.clientX - dragNode.current.startMouseX) / scale;
      const dy = (e.clientY - dragNode.current.startMouseY) / scale;
      const id = dragNode.current.id;
      const nx = dragNode.current.startNodeX + dx;
      const ny = dragNode.current.startNodeY + dy;
      setOverrides((prev) => ({ ...prev, [id]: { ...prev[id], x: nx, y: ny } }));
      return;
    }
    if (panDrag.current && stageRef.current) {
      stageRef.current.scrollLeft = panDrag.current.scrollLeft - (e.pageX - panDrag.current.startX);
      stageRef.current.scrollTop = panDrag.current.scrollTop - (e.pageY - panDrag.current.startY);
    }
  };

  const onMouseUp = () => {
    dragNode.current = null;
    dragResize.current = null;
    panDrag.current = null;
    if (stageRef.current) stageRef.current.style.cursor = "";
  };

  // ─── Wheel zoom (Ctrl/Cmd + wheel or trackpad pinch) ──────────────────

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();

      const rect = el.getBoundingClientRect();
      const cursorX = e.clientX - rect.left + el.scrollLeft;
      const cursorY = e.clientY - rect.top + el.scrollTop;

      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      setScale((s) => {
        const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, s * factor));
        const ratio = next / s;
        requestAnimationFrame(() => {
          if (!el) return;
          el.scrollLeft = cursorX * ratio - (e.clientX - rect.left);
          el.scrollTop = cursorY * ratio - (e.clientY - rect.top);
        });
        return next;
      });
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // ─── Fullscreen ESC handler ───────────────────────────────────────────

  useEffect(() => {
    if (!isFullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFullscreen]);

  // ─── Export to Obsidian .canvas ──────────────────────────────────────

  const exportCanvas = () => {
    const obsidianNodes = effectiveNodes.map((n) => {
      const base = {
        id: n.id,
        type: n.type,
        x: Math.round(n.x),
        y: Math.round(n.y),
        width: Math.round(n.width),
        height: Math.round(n.height),
      };
      if (n.type === "group") {
        return { ...base, label: n.label ?? "", color: n.group ? GROUP_COLOR_HEX[n.group] : "0" };
      }
      if (n.type === "file") {
        return { ...base, file: n.file ?? "" };
      }
      return { ...base, text: n.text ?? "" };
    });
    const obsidianEdges = edges.map((e) => ({
      id: e.id,
      fromNode: e.fromNode,
      fromSide: e.fromSide,
      toNode: e.toNode,
      toSide: e.toSide,
      ...(e.label ? { label: e.label } : {}),
    }));
    const json = JSON.stringify({ nodes: obsidianNodes, edges: obsidianEdges }, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportName}.canvas`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const resetLayout = () => setOverrides({});
  const movedCount = Object.keys(overrides).length;

  // Compute stage height: in fullscreen, leave room for top toolbar + bottom footer
  const stageHeight = isFullscreen ? "calc(100vh - 84px)" : height;

  return (
    <div
      className={cn(
        "not-prose rounded-xl border bg-card overflow-hidden",
        isFullscreen
          ? "fixed inset-0 z-50 my-0 rounded-none border-0"
          : "my-6",
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b px-3 py-2 bg-muted/30 flex-wrap">
        <div className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground">
          Skill · Workflow · Infrastructure map
          {isFullscreen && (
            <span className="ml-2 normal-case tracking-normal text-muted-foreground/70">
              · Esc để thoát fullscreen
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1 rounded-md border bg-background p-0.5">
            <CtlBtn onClick={() => setScale((s) => Math.min(MAX_SCALE, s * 1.15))} title="Zoom in">+</CtlBtn>
            <CtlBtn onClick={() => setScale((s) => Math.max(MIN_SCALE, s / 1.15))} title="Zoom out">−</CtlBtn>
            <CtlBtn onClick={() => setScale(1)} title="100%">1:1</CtlBtn>
            <CtlBtn onClick={() => setScale(initialScale)} title="Reset zoom">Fit</CtlBtn>
            <span className="px-2 text-[10.5px] font-mono text-muted-foreground tabular-nums">
              {Math.round(scale * 100)}%
            </span>
          </div>
          {movedCount > 0 && (
            <button
              type="button"
              onClick={resetLayout}
              className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground/80 hover:bg-muted"
              title="Khôi phục vị trí gốc"
            >
              <RotateCcw className="h-3 w-3" />
              Reset layout
              <span className="text-[10px] text-muted-foreground">({movedCount})</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsFullscreen((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground/80 hover:bg-muted"
            title={isFullscreen ? "Thoát fullscreen (Esc)" : "Fullscreen canvas"}
          >
            {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            {isFullscreen ? "Exit" : "Fullscreen"}
          </button>
          <button
            type="button"
            onClick={exportCanvas}
            className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15"
            title="Tải file .canvas — mở được bằng Obsidian"
          >
            <Download className="h-3 w-3" />
            Export .canvas
          </button>
        </div>
      </div>
      <div
        ref={stageRef}
        className="relative overflow-auto select-none cursor-grab"
        style={{ height: stageHeight }}
        onMouseDown={onStageMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <div className="relative" style={{ width: W * scale, height: H * scale }}>
          <div
            ref={innerRef}
            className="relative"
            style={{ width: W, height: H, transformOrigin: "0 0", transform: `scale(${scale})` }}
          >
            {/* groups first */}
            {effectiveNodes
              .filter((n) => n.type === "group")
              .map((n) => {
                const p = pos(n);
                return (
                  <div
                    key={n.id}
                    onMouseDown={(e) => onNodeMouseDown(e, n)}
                    className={cn(
                      "absolute rounded-2xl border-2 border-dashed cursor-move",
                      n.group ? GROUP_STYLES[n.group] : "border-border",
                    )}
                    style={{ left: p.left, top: p.top, width: n.width, height: n.height, zIndex: 1 }}
                  >
                    <div className="absolute -top-3 left-4 bg-card px-2 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground pointer-events-none">
                      {n.label}
                    </div>
                    <ResizeHandle onMouseDown={(e) => onResizeMouseDown(e, n)} />
                  </div>
                );
              })}

            {/* SVG edges */}
            <svg
              className="absolute inset-0 pointer-events-none text-foreground/40"
              width={W}
              height={H}
              style={{ zIndex: 5 }}
            >
              <defs>
                <marker
                  id="tc-arrow"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
                </marker>
              </defs>
              {edges.map((e) => {
                const a = nodeById[e.fromNode];
                const b = nodeById[e.toNode];
                if (!a || !b) return null;
                const [fx, fy] = anchor(a, e.fromSide);
                const [tx, ty] = anchor(b, e.toSide);
                const d = 60;
                let c1x = fx, c1y = fy, c2x = tx, c2y = ty;
                if (e.fromSide === "top")    c1y -= d;
                else if (e.fromSide === "bottom") c1y += d;
                else if (e.fromSide === "left")   c1x -= d;
                else if (e.fromSide === "right")  c1x += d;
                if (e.toSide === "top")    c2y -= d;
                else if (e.toSide === "bottom") c2y += d;
                else if (e.toSide === "left")   c2x -= d;
                else if (e.toSide === "right")  c2x += d;

                const t = 0.5;
                const mx =
                  (1 - t) ** 3 * fx +
                  3 * (1 - t) ** 2 * t * c1x +
                  3 * (1 - t) * t ** 2 * c2x +
                  t ** 3 * tx;
                const my =
                  (1 - t) ** 3 * fy +
                  3 * (1 - t) ** 2 * t * c1y +
                  3 * (1 - t) * t ** 2 * c2y +
                  t ** 3 * ty;
                const labelW = e.label ? e.label.length * 6.2 + 14 : 0;

                return (
                  <g key={e.id}>
                    <path
                      d={`M ${fx} ${fy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${tx} ${ty}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.4}
                      markerEnd="url(#tc-arrow)"
                    />
                    {e.label && (
                      <>
                        <rect
                          x={mx - labelW / 2}
                          y={my - 8}
                          width={labelW}
                          height={14}
                          rx={3}
                          className="fill-card stroke-border"
                        />
                        <text
                          x={mx}
                          y={my + 3}
                          textAnchor="middle"
                          fontSize={10.5}
                          fontFamily="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
                          className="fill-muted-foreground"
                        >
                          {e.label}
                        </text>
                      </>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* leaf nodes on top */}
            {effectiveNodes
              .filter((n) => n.type !== "group")
              .map((n) => {
                const p = pos(n);
                const isMoved = !!overrides[n.id];
                const style: CSSProperties = {
                  left: p.left,
                  top: p.top,
                  width: n.width,
                  height: n.height,
                  zIndex: 10,
                };
                if (n.type === "file" && n.file) {
                  return (
                    <div
                      key={n.id}
                      onMouseDown={(e) => onNodeMouseDown(e, n)}
                      className={cn(
                        "absolute rounded-xl border bg-gradient-to-b from-blue-500/[0.08] to-transparent shadow-sm cursor-move",
                        isMoved ? "border-amber-500/50" : "border-blue-500/30",
                      )}
                      style={style}
                    >
                      <Link
                        href={n.file}
                        className="flex items-center gap-2 px-3 py-2 h-full rounded-xl text-[13px] font-semibold leading-tight hover:bg-blue-500/[0.06]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-base shrink-0">📄</span>
                        <span className="truncate">{labelForFile(n.file)}</span>
                      </Link>
                      <ResizeHandle onMouseDown={(e) => onResizeMouseDown(e, n)} />
                    </div>
                  );
                }
                return (
                  <div
                    key={n.id}
                    onMouseDown={(e) => onNodeMouseDown(e, n)}
                    className={cn(
                      "absolute rounded-xl border bg-card px-3 py-2 shadow-sm overflow-auto text-[11.5px] leading-relaxed text-muted-foreground cursor-move",
                      isMoved && "border-amber-500/50",
                    )}
                    style={style}
                  >
                    <MiniMd source={n.text ?? ""} />
                    <ResizeHandle onMouseDown={(e) => onResizeMouseDown(e, n)} />
                  </div>
                );
              })}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t bg-muted/20 px-3 py-1.5 text-[11px] text-muted-foreground flex-wrap">
        <span className="font-mono">
          drag card di chuyển · drag góc dưới phải resize · drag nền pan · <kbd className="rounded border bg-background px-1">Ctrl</kbd>+wheel zoom
        </span>
        <span className="font-mono">
          {effectiveNodes.filter((n) => n.type !== "group").length} nodes · {edges.length} edges
        </span>
      </div>
    </div>
  );
}

function CtlBtn({ children, onClick, title }: { children: ReactNode; onClick: () => void; title?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="rounded px-2 py-1 text-[12px] font-mono text-foreground/80 hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  );
}

function ResizeHandle({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) {
  return (
    <div
      data-resize-handle
      onMouseDown={onMouseDown}
      className="absolute right-0 bottom-0 h-4 w-4 cursor-nwse-resize z-20 group"
      style={{
        backgroundImage:
          "linear-gradient(135deg, transparent 0%, transparent 50%, currentColor 50%, currentColor 60%, transparent 60%, transparent 70%, currentColor 70%, currentColor 80%, transparent 80%)",
        color: "rgba(120,120,120,0.45)",
      }}
      title="Drag để resize"
    />
  );
}

function labelForFile(file: string): string {
  if (file.startsWith("#")) {
    const slug = file.slice(1);
    const map: Record<string, string> = {
      overview: "Overview",
      persona: "01 · Persona",
      skills: "02 · Skills",
      crons: "03 · Cron pipelines",
      runbook: "04 · Access runbook",
      services: "05 · Services",
      tunnel: "06 · Tunnel",
      supabase: "07 · Supabase",
    };
    return map[slug] ?? slug;
  }
  return file.split("/").pop()?.replace(".md", "").replace(/^\d+-/, "") ?? file;
}

// Tiny markdown for the small text cards. No dangerouslySetInnerHTML.
function MiniMd({ source }: { source: string }) {
  const lines = source.split("\n");
  const out: ReactNode[] = [];
  let listBuffer: ReactNode[] = [];
  const flushList = () => {
    if (listBuffer.length) {
      out.push(
        <ul key={`u${out.length}`} className="ml-4 list-disc space-y-0.5">
          {listBuffer}
        </ul>,
      );
      listBuffer = [];
    }
  };
  lines.forEach((line, i) => {
    if (line.startsWith("### ") || line.startsWith("## ")) {
      flushList();
      const txt = line.replace(/^#+\s+/, "");
      out.push(
        <div
          key={i}
          className="text-[12.5px] font-semibold text-amber-600 dark:text-amber-400 mb-1"
        >
          {inlineMd(txt)}
        </div>,
      );
    } else if (line.startsWith("- ")) {
      listBuffer.push(
        <li key={i} className="text-foreground/80">
          {inlineMd(line.slice(2))}
        </li>,
      );
    } else if (line.trim() === "") {
      flushList();
      out.push(<div key={i} className="h-1" />);
    } else {
      flushList();
      out.push(
        <div key={i} className="text-foreground/85">
          {inlineMd(line)}
        </div>,
      );
    }
  });
  flushList();
  return <>{out}</>;
}

function inlineMd(s: string): ReactNode {
  const parts: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) parts.push(<span key={key++}>{s.slice(last, m.index)}</span>);
    parts.push(
      <strong key={key++} className="text-foreground font-semibold">
        {m[1]}
      </strong>,
    );
    last = m.index + m[0].length;
  }
  if (last < s.length) parts.push(<span key={key++}>{s.slice(last)}</span>);
  return parts;
}
