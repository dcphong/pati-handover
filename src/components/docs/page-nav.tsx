import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { siblings } from "@/lib/nav";

export function PageNav({ href }: { href: string }) {
  const { prev, next } = siblings(href);
  return (
    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
      {prev ? (
        <Link
          href={prev.href}
          className="group flex flex-col items-start gap-1 rounded-lg border p-4 hover:bg-muted transition-colors"
        >
          <span className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" />
            Previous
          </span>
          <span className="font-semibold group-hover:text-foreground">{prev.title}</span>
        </Link>
      ) : <div />}
      {next ? (
        <Link
          href={next.href}
          className="group flex flex-col items-end gap-1 rounded-lg border p-4 hover:bg-muted transition-colors text-right md:col-start-2"
        >
          <span className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            Next
            <ArrowRight className="h-3 w-3" />
          </span>
          <span className="font-semibold group-hover:text-foreground">{next.title}</span>
        </Link>
      ) : <div />}
    </div>
  );
}
