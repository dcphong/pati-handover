"use client";

import { useEffect, useState } from "react";
import { Maximize2, X } from "lucide-react";
import Image, { type StaticImageData } from "next/image";

export function PreviewableFigure({
  src,
  alt,
  caption,
}: {
  src: StaticImageData;
  alt: string;
  caption: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <figure className="overflow-hidden rounded-xl border bg-background">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group block w-full text-left"
          aria-label={`Preview ${caption}`}
        >
          <div className="relative">
            <Image src={src} alt={alt} className="h-auto w-full" />
            <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/70 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
              <Maximize2 className="h-3 w-3" />
              Preview
            </div>
          </div>
        </button>
        <figcaption className="border-t bg-muted/30 px-3 py-2 text-[12px] leading-5 text-muted-foreground">
          {caption}
        </figcaption>
      </figure>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-h-[92vh] max-w-[96vw] overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white hover:bg-black/80"
              aria-label="Close preview"
            >
              <X className="h-4 w-4" />
            </button>
            <Image
              src={src}
              alt={alt}
              className="h-auto max-h-[92vh] w-auto max-w-[96vw] object-contain"
              priority
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
