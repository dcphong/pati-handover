import Link from "next/link";
import { ExternalLink } from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.16c-3.2.7-3.87-1.36-3.87-1.36-.52-1.34-1.28-1.7-1.28-1.7-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.71 1.25 3.37.96.1-.75.4-1.25.74-1.54-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18.91-.25 1.89-.38 2.86-.39.97.01 1.95.14 2.86.39 2.18-1.49 3.14-1.18 3.14-1.18.62 1.59.23 2.76.11 3.05.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.37-5.25 5.65.41.36.78 1.06.78 2.13v3.16c0 .31.21.66.79.55 4.57-1.52 7.85-5.83 7.85-10.9C23.5 5.65 18.35.5 12 .5z"
      />
    </svg>
  );
}

export function Topbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-screen-2xl px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-orange-500 via-pink-500 to-violet-600 grid place-items-center text-white text-xs font-black">
              P
            </div>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-tight">PATI Handover</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">shopify-lark-sync</span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-1 text-sm">
          <Link
            href="/docs/overview"
            className="px-3 py-1.5 rounded-md hover:bg-muted text-foreground/70 hover:text-foreground transition-colors"
          >
            Docs
          </Link>
          <Link
            href="/docs/architecture"
            className="px-3 py-1.5 rounded-md hover:bg-muted text-foreground/70 hover:text-foreground transition-colors"
          >
            Architecture
          </Link>
          <Link
            href="/docs/deploy-vercel"
            className="px-3 py-1.5 rounded-md hover:bg-muted text-foreground/70 hover:text-foreground transition-colors"
          >
            Deploy
          </Link>
          <Link
            href="/docs/troubleshooting"
            className="px-3 py-1.5 rounded-md hover:bg-muted text-foreground/70 hover:text-foreground transition-colors"
          >
            Troubleshooting
          </Link>
          <span className="mx-2 h-5 w-px bg-border" />
          <a
            href="https://github.com/dcphong/pati-handover"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-md hover:bg-muted text-foreground/70 hover:text-foreground transition-colors inline-flex items-center gap-1.5"
          >
            <GithubIcon className="h-4 w-4" />
            <span>GitHub</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        </nav>
      </div>
    </header>
  );
}
