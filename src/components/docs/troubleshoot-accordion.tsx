"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export type TroubleshootSection = {
  id: string;
  title: string;
  subtitle?: string;
  count?: number;
  content: ReactNode;
};

export function TroubleshootAccordion({ sections }: { sections: TroubleshootSection[] }) {
  const [value, setValue] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => {
      const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
      if (!hash) return;
      const match = sections.find((s) => s.id === hash);
      if (!match) return;
      setValue((prev) => (prev.includes(hash) ? prev : [...prev, hash]));
      requestAnimationFrame(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [sections]);

  return (
    <Accordion
      multiple
      value={value}
      onValueChange={(v) => setValue(v as string[])}
      className="not-prose my-6 rounded-2xl border bg-card divide-y"
    >
      {sections.map((s) => (
        <AccordionItem
          key={s.id}
          value={s.id}
          id={s.id}
          className="border-0 px-4 sm:px-5 scroll-mt-20"
        >
          <AccordionTrigger className="py-4 hover:no-underline">
            <div className="flex flex-col items-start gap-0.5 text-left">
              <span className="text-[15px] font-semibold tracking-tight">
                {s.title}
                {typeof s.count === "number" && (
                  <span className="ml-2 inline-block rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground align-middle">
                    {s.count} nhánh
                  </span>
                )}
              </span>
              {s.subtitle && (
                <span className="text-[12.5px] text-muted-foreground font-normal leading-5">
                  {s.subtitle}
                </span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-5">{s.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
