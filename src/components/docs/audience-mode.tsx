"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Code2, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

type AudienceMode = "dev" | "user";

type AudienceContextValue = {
  mode: AudienceMode;
  setMode: (mode: AudienceMode) => void;
};

const STORAGE_KEY = "pati-handover-audience-mode";
const AudienceModeContext = createContext<AudienceContextValue | null>(null);

export function AudienceModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<AudienceMode>(() => {
    if (typeof window === "undefined") return "user";
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "dev" || stored === "user" ? stored : "user";
  });

  const value = useMemo<AudienceContextValue>(
    () => ({
      mode,
      setMode: (next) => {
        setModeState(next);
        window.localStorage.setItem(STORAGE_KEY, next);
        document.documentElement.dataset.audience = next;
      },
    }),
    [mode],
  );

  useEffect(() => {
    document.documentElement.dataset.audience = mode;
  }, [mode]);

  return <AudienceModeContext.Provider value={value}>{children}</AudienceModeContext.Provider>;
}

function useAudienceMode() {
  const context = useContext(AudienceModeContext);
  if (!context) {
    throw new Error("useAudienceMode must be used inside AudienceModeProvider");
  }
  return context;
}

export function AudienceModeSwitch({ className }: { className?: string }) {
  const { mode, setMode } = useAudienceMode();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border bg-muted/40 p-0.5 text-xs font-medium",
        className,
      )}
      aria-label="Documentation audience mode"
    >
      <button
        type="button"
        onClick={() => setMode("user")}
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 transition-colors",
          mode === "user"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
        aria-pressed={mode === "user"}
        title="User mode: plain-language docs with fewer technical details"
      >
        <UserRound className="h-3.5 w-3.5" />
        User
      </button>
      <button
        type="button"
        onClick={() => setMode("dev")}
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 transition-colors",
          mode === "dev"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
        aria-pressed={mode === "dev"}
        title="Dev mode: exact names, commands, schemas, and implementation notes"
      >
        <Code2 className="h-3.5 w-3.5" />
        Dev
      </button>
    </div>
  );
}
