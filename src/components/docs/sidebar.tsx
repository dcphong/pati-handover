"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { detectIntegrations, IntegrationLogo } from "@/components/docs/integration-logo";
import { navigation } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function DocsSidebar() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-7 py-8 pr-4">
      {navigation.map((section) => (
        <div key={section.title}>
          <h4 className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {section.title}
          </h4>
          <ul className="flex flex-col">
            {section.items.map((item) => {
              const active = pathname === item.href;
              const integrations = detectIntegrations(item.title);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "block px-3 py-1.5 text-sm rounded-md transition-colors",
                      active
                        ? "bg-foreground text-background font-medium"
                        : "text-foreground/70 hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {integrations.map((integration) => (
                        <IntegrationLogo
                          key={integration}
                          integration={integration}
                          className={cn("h-[18px] w-[18px]", active && "border-transparent bg-background/15")}
                        />
                      ))}
                      {item.title}
                      {item.badge && (
                        <span className="ml-auto text-[10px] uppercase tracking-wider bg-muted text-muted-foreground rounded px-1.5 py-0.5">
                          {item.badge}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
