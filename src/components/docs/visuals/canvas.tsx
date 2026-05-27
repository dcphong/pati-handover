"use client";

import { useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { CanvasNode, CanvasEdge } from "@/lib/timcook-agent-data";

const GROUP_STYLES: Record<"brain" | "infra" | "ext", string> = {
  brain: "bg-violet-500/[0.06] border-violet-500/30",
  infra: "bg-blue-500/[0.06] border-blue-500/30",
  ext: "bg-emerald-500/[0.06] border-emerald-500/30",
};

const PADDING = 40;

export function Canvas({
  nodes,
  edges,
  height = 720,
  initialScale = 0.55,
}: {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  height?: number;
  initialScale?: number;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(initialScale);

  const { width: W, height: H, minX, minY } = useMemo(() => {
    let lo_x = Infinity, lo_y = Infinity, hi_x = -Infinity, hi_y = -Infinity;
    for (const n of nodes) {
      if (n.x < lo_x) lo_x = n.x;
      if (n.y < lo_y) lo_y = n.y;
      if (n.x + n.width > hi_x) hi_x = n.x + n.width;
      if (n.y + n.height > hi_y) hi_y = n.y + n.height;
    }
    return { width: hi_x - lo_x + PADDING * 2, height: hi_y - lo_y + PADDING * 2, minX: lo_x, minY: lo_y };
  }, [nodes]);

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
    for (const n of nodes) m[n.id] = n;
    return m;
  }, [nodes]);

  // Pan via mouse drag on empty area
  const drag = useRef<{ startX: number; startY: number; scrollLeft: number; scrollTop: number } | null>(null);
  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a, button")) return;
    if (!stageRef.current) return;
    drag.current = {
      startX: e.pageX,
      startY: e.pageY,
      scrollLeft: stageRef.current.scrollLeft,
      scrollTop: stageRef.current.scrollTop,
    };
    stageRef.current.style.cursor = "grabbing";
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!drag.current || !stageRef.current) return;
    stageRef.current.scrollLeft = drag.current.scrollLeft - (e.pageX - drag.current.startX);
    stageRef.current.scrollTop = drag.current.scrollTop - (e.pageY - drag.current.startY);
  };
  const onMouseUp = () => {
    drag.current = null;
    if (stageRef.current) stageRef.current.style.cursor = "";
  };

  return (
    <div className="not-prose my-6 rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b px-3 py-2 bg-muted/30">
        <div className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground">
          Skill · Workflow · Infrastructure map
        </div>
        <div className="inline-flex items-center gap-1 rounded-md border bg-background p-0.5">
          <CtlBtn onClick={() => setScale((s) => Math.min(2.5, s * 1.15))}>+</CtlBtn>
          <CtlBtn onClick={() => setScale((s) => Math.max(0.18, s / 1.15))}>−</CtlBtn>
          <CtlBtn onClick={() => setScale(1)}>1:1</CtlBtn>
          <CtlBtn onClick={() => setScale(initialScale)}>Fit</CtlBtn>
          <span className="px-2 text-[10.5px] font-mono text-muted-foreground tabular-nums">
            {Math.round(scale * 100)}%
          </span>
        </div>
      </div>
      <div
        ref={stageRef}
        className="relative overflow-auto select-none cursor-grab"
        style={{ height }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <div className="relative" style={{ width: W * scale, height: H * scale }}>
          <div
            className="relative"
            style={{ width: W, height: H, transformOrigin: "0 0", transform: `scale(${scale})` }}
          >
            {/* groups first */}
            {nodes
              .filter((n) => n.type === "group")
              .map((n) => {
                const p = pos(n);
                return (
                  <div
                    key={n.id}
                    className={cn(
                      "absolute rounded-2xl border-2 border-dashed",
                      n.group ? GROUP_STYLES[n.group] : "border-border",
                    )}
                    style={{ left: p.left, top: p.top, width: n.width, height: n.height, zIndex: 1 }}
                  >
                    <div className="absolute -top-3 left-4 bg-card px-2 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
                      {n.label}
                    </div>
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

                // midpoint on the cubic curve at t=0.5
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
            {nodes
              .filter((n) => n.type !== "group")
              .map((n) => {
                const p = pos(n);
                const style: CSSProperties = {
                  left: p.left,
                  top: p.top,
                  width: n.width,
                  height: n.height,
                  zIndex: 10,
                };
                if (n.type === "file" && n.file) {
                  return (
                    <Link
                      key={n.id}
                      href={n.file}
                      className="absolute rounded-xl border border-blue-500/30 bg-gradient-to-b from-blue-500/[0.08] to-transparent hover:from-blue-500/[0.14] px-3 py-2 flex items-center gap-2 shadow-sm text-[13px] font-semibold leading-tight"
                      style={style}
                    >
                      <span className="text-base shrink-0">📄</span>
                      <span className="truncate">{labelForFile(n.file)}</span>
                    </Link>
                  );
                }
                return (
                  <div
                    key={n.id}
                    className="absolute rounded-xl border bg-card px-3 py-2 shadow-sm overflow-hidden text-[11.5px] leading-relaxed text-muted-foreground"
                    style={style}
                  >
                    <MiniMd source={n.text ?? ""} />
                  </div>
                );
              })}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t bg-muted/20 px-3 py-1.5 text-[11px] text-muted-foreground">
        <span className="font-mono">drag to pan · pinch / buttons to zoom · click 📄 to jump</span>
        <span className="font-mono">
          {nodes.filter((n) => n.type !== "group").length} nodes · {edges.length} edges
        </span>
      </div>
    </div>
  );
}

function CtlBtn({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded px-2 py-1 text-[12px] font-mono text-foreground/80 hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
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
      gotchas: "08 · Gotchas",
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
