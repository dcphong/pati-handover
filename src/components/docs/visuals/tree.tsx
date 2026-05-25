import { ReactNode } from "react";
import { Folder, FileCode2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type TreeNode = {
  name: string;
  kind?: "dir" | "file";
  hint?: ReactNode;
  highlight?: boolean;
  children?: TreeNode[];
};

export function FileTree({ root }: { root: TreeNode }) {
  return (
    <div className="not-prose my-5 rounded-xl border bg-card/40 p-3 font-mono text-[12.5px]">
      <Node node={root} depth={0} isLast />
    </div>
  );
}

function Node({
  node,
  depth,
  isLast,
  prefix = "",
}: {
  node: TreeNode;
  depth: number;
  isLast: boolean;
  prefix?: string;
}) {
  const kind = node.kind ?? (node.children ? "dir" : "file");
  const Icon = kind === "dir" ? Folder : FileCode2;
  const next = prefix + (depth === 0 ? "" : isLast ? "    " : "│   ");
  return (
    <div>
      <div
        className={cn(
          "flex items-baseline gap-2 py-0.5 rounded px-1",
          node.highlight && "bg-amber-500/[0.06]"
        )}
      >
        <span className="text-muted-foreground select-none whitespace-pre">
          {depth === 0 ? "" : `${prefix}${isLast ? "└── " : "├── "}`}
        </span>
        <Icon
          className={cn(
            "h-3.5 w-3.5 shrink-0",
            kind === "dir"
              ? "text-amber-500/80"
              : "text-muted-foreground"
          )}
        />
        <span
          className={cn(
            "font-semibold",
            kind === "dir" ? "text-foreground" : "text-foreground/90"
          )}
        >
          {node.name}
        </span>
        {node.hint && (
          <span className="text-muted-foreground text-[11.5px] font-sans">
            — {node.hint}
          </span>
        )}
      </div>
      {node.children && (
        <div>
          {node.children.map((child, i) => (
            <Node
              key={child.name + i}
              node={child}
              depth={depth + 1}
              isLast={i === node.children!.length - 1}
              prefix={next}
            />
          ))}
        </div>
      )}
    </div>
  );
}
