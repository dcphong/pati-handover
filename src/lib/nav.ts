export type NavLink = {
  title: string;
  href: string;
  badge?: string;
};

export type NavSection = {
  title: string;
  items: NavLink[];
};

export const navigation: NavSection[] = [
  {
    title: "Getting Started",
    items: [
      { title: "Welcome", href: "/" },
      { title: "Project Overview", href: "/docs/overview" },
      { title: "Local Setup", href: "/docs/setup" },
      { title: "Environment Variables", href: "/docs/env" },
      { title: "Supabase Connection", href: "/docs/supabase" },
    ],
  },
  {
    title: "Architecture",
    items: [
      { title: "System Overview", href: "/docs/architecture" },
      { title: "Tech Stack", href: "/docs/tech-stack" },
      { title: "Data Flow", href: "/docs/data-flow" },
      { title: "Database Schema", href: "/docs/database" },
    ],
  },
  {
    title: "Deployment",
    items: [
      { title: "Mac mini Web Deploy", href: "/docs/deploy-vercel" },
      { title: "Cron Jobs", href: "/docs/cron-jobs" },
      { title: "Mac mini Self-Host", href: "/docs/mac-mini" },
      { title: "Cloudflared Tunnel", href: "/docs/cloudflared" },
    ],
  },
  {
    title: "Access",
    items: [
      { title: "Tailscale Access", href: "/docs/tailscale" },
      { title: "Auth & Credentials", href: "/docs/auth-credentials", badge: "new" },
    ],
  },
  {
    title: "Core Features",
    items: [
      { title: "Shopify Sync", href: "/docs/feature-shopify-sync" },
      { title: "Analytics (TW Parity)", href: "/docs/feature-analytics" },
      { title: "Multi-Store", href: "/docs/feature-multistore" },
      { title: "IAM & Permissions", href: "/docs/feature-iam" },
    ],
  },
  {
    title: "Operations",
    items: [
      { title: "COGS Catalog", href: "/docs/feature-cogs" },
      { title: "ChargeFlow Disputes", href: "/docs/feature-chargeflow" },
      { title: "CS Dashboard", href: "/docs/feature-cs" },
      { title: "Best Fulfillment", href: "/docs/feature-bestfulfill" },
      { title: "VNH / NS3 Fulfillment", href: "/docs/feature-fulfillment" },
    ],
  },
  {
    title: "Beta / Test Features",
    items: [
      { title: "Bulk Update", href: "/docs/feature-bulk-update", badge: "beta" },
    ],
  },
  {
    title: "CS & OF",
    items: [
      { title: "Overview", href: "/docs/cs-of" },
      { title: "Payment Request — Shipping", href: "/docs/cs-of/payment-request" },
      { title: "Timcook Agent", href: "/docs/timcook-agent", badge: "new" },
    ],
  },
  {
    title: "Reference",
    items: [
      { title: "API Routes", href: "/docs/api-routes" },
      { title: "Python Workers", href: "/docs/python-workers" },
      { title: "Troubleshooting", href: "/docs/troubleshooting" },
      { title: "Glossary", href: "/docs/glossary" },
    ],
  },
];

export function flatNav(): NavLink[] {
  return navigation.flatMap((s) => s.items);
}

export function siblings(href: string) {
  const flat = flatNav();
  const i = flat.findIndex((l) => l.href === href);
  return {
    prev: i > 0 ? flat[i - 1] : null,
    next: i >= 0 && i < flat.length - 1 ? flat[i + 1] : null,
  };
}
