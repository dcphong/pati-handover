import { DocsSidebar } from "@/components/docs/sidebar";
import { AudienceBrief } from "@/components/docs/audience-brief";
import { DocsIntegrationDecorations } from "@/components/docs/docs-integration-decorations";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 w-full flex-1">
      <div className="flex">
        <aside className="hidden lg:block w-64 shrink-0 border-r sticky top-14 h-[calc(100dvh-3.5rem)] overflow-y-auto">
          <DocsSidebar />
        </aside>
        <main className="flex-1 min-w-0 py-12 px-4 sm:px-10">
          <article className="prose-docs max-w-3xl mx-auto">
            <DocsIntegrationDecorations />
            <AudienceBrief />
            {children}
          </article>
        </main>
      </div>
    </div>
  );
}
