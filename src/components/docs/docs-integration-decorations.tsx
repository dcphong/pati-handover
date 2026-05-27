"use client";

import { useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  detectIntegrations,
  IntegrationLogo,
  type Integration,
} from "@/components/docs/integration-logo";

function IntegrationLogoRow({ integrations }: { integrations: Integration[] }) {
  return (
    <>
      {integrations.map((integration) => (
        <IntegrationLogo key={integration} integration={integration} className="h-6 w-6" />
      ))}
    </>
  );
}

export function DocsIntegrationDecorations() {
  useEffect(() => {
    const roots: Root[] = [];
    const headings = Array.from(
      document.querySelectorAll<HTMLElement>(".prose-docs h2, .prose-docs h3, .prose-docs h4"),
    );

    for (const heading of headings) {
      if (heading.dataset.integrationDecorated === "true") continue;

      const integrations = detectIntegrations(heading.textContent ?? "");
      if (integrations.length === 0) continue;

      heading.dataset.integrationDecorated = "true";
      heading.classList.add("docs-heading-with-integrations");

      const marker = document.createElement("span");
      marker.className = "docs-heading-integration-icons";
      marker.setAttribute("aria-hidden", "true");
      heading.prepend(marker);

      const root = createRoot(marker);
      root.render(<IntegrationLogoRow integrations={integrations} />);
      roots.push(root);
    }

    return () => {
      // Defer unmount qua microtask để tránh "synchronously unmount while React
      // is rendering" race khi Next.js client-route đổi page.
      for (const root of roots) {
        queueMicrotask(() => {
          try {
            root.unmount();
          } catch {
            // Root đã bị detach trước cleanup — bỏ qua.
          }
        });
      }
    };
  }, []);

  return null;
}
