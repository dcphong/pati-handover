import { detectIntegrations, IntegrationBadges } from "@/components/docs/integration-logo";
import { ExportMdButton } from "@/components/docs/export-md-button";

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  const integrations = detectIntegrations(title, description);

  return (
    <div data-page-header className="mb-10 not-prose">
      {eyebrow && (
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{eyebrow}</div>
      )}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <h1 className="text-4xl font-bold tracking-tight" style={{ letterSpacing: "-0.025em" }}>
          {title}
        </h1>
        <ExportMdButton className="mt-1" />
      </div>
      {description && (
        <p className="mt-3 text-lg text-muted-foreground leading-7">{description}</p>
      )}
      {integrations.length > 0 && (
        <div className="mt-4">
          <IntegrationBadges integrations={integrations} />
        </div>
      )}
    </div>
  );
}
