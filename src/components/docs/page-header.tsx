export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div data-page-header className="mb-10 not-prose">
      {eyebrow && (
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{eyebrow}</div>
      )}
      <h1 className="text-4xl font-bold tracking-tight" style={{ letterSpacing: "-0.025em" }}>
        {title}
      </h1>
      {description && (
        <p className="mt-3 text-lg text-muted-foreground leading-7">{description}</p>
      )}
    </div>
  );
}
