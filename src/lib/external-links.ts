/**
 * URLs tới các hệ thống ngoài mà docs tham chiếu.
 * Mọi page muốn link "Mở Lark Base / Shopify Admin / ..." phải import từ đây
 * — đừng hard-code URL trong page, dễ lệch khi đổi.
 */

// ─── Lark Base (paticreativeagency.sg.larksuite.com) ─────────────────────

const LARK_WIKI_PO = "https://paticreativeagency.sg.larksuite.com/wiki/JhiDwNmtwizHQ6kTV8slDMJZgOr";

export const LARK = {
  // PO Management wiki root — entrypoint tất cả bảng giá vốn, vận chuyển, fulfillment
  wikiRoot: LARK_WIKI_PO,

  // COGS full catalog — ops nhập 6 chi phí per-PO, sync → master_app.cogs_full_catalog
  cogs: `${LARK_WIKI_PO}?table=tblSsTpnEZoAnqEu&view=vew16l2h9E`,

  // Best Fulfillment shipping rate card
  bestShippingRates: `${LARK_WIKI_PO}?table=tbljgr7rhuZPNob4&view=vewGLOwukq`,

  // Best Cannot Ship — orders Best không ship được
  bestCannotShip: `${LARK_WIKI_PO}?table=tbloYzPvpIRSE4it&view=vewYzPtwrL`,

  // Shipping cost theo order (input cho Payment Request workflow)
  shippingCost: `${LARK_WIKI_PO}?table=tblcV9D0F3alJajJ&view=vewQMTdXqs`,

  // Fulfillment Master (VNH routing) — customer/SKU → warehouse choice
  fulfillmentRouting: `${LARK_WIKI_PO}?table=tblNQrmGRQFDkkPu`,

  // Payment Request form — submit shipping cost batch
  paymentRequestForm:
    "https://paticreativeagency.sg.larksuite.com/share/base/form/shrlgdjWNHXRURbjYx5kHl5LFcb?from=from_parent_docs",

  // Lark Mail web UI — CS đọc/reply email
  mail: "https://paticreativeagency.sg.larksuite.com/mail",
};

// ─── Shopify ─────────────────────────────────────────────────────────────

export const SHOPIFY = {
  // WellnessNest store admin (primary store)
  wnAdmin: "https://admin.shopify.com/store/e49d78-3",
  // Custom App "Lark Integration" — chứa SHOPIFY_API_SECRET, webhook owner
  wnCustomAppLark:
    "https://admin.shopify.com/store/e49d78-3/settings/apps/development",
};

// ─── External SaaS dashboards ────────────────────────────────────────────

export const EXTERNAL = {
  // ChargeFlow dispute management
  chargeflow: "https://app.chargeflowapp.com",
  // Flexport logistics portal
  flexport: "https://app.flexport.com",
  // Recharge subscriptions admin (WN store)
  recharge: "https://wellnessnest.admin.rechargeapps.com",
  // Klaviyo marketing
  klaviyo: "https://www.klaviyo.com",
  // 17track parcel tracking
  tracking17: "https://www.17track.net",
  // Meta Business (Facebook + Instagram ads)
  metaAds: "https://business.facebook.com",
  // Google Ads
  googleAds: "https://ads.google.com",
  // PayPal Business
  paypal: "https://www.paypal.com/businessmanage",
};

// ─── Infrastructure dashboards ───────────────────────────────────────────

export const INFRA = {
  // GitHub repo
  githubRepo: "https://github.com/dev-pati/pati-master-app",
  githubActions:
    "https://github.com/dev-pati/pati-master-app/actions",
  githubSecrets:
    "https://github.com/dev-pati/pati-master-app/settings/secrets/actions",
  // Tailscale tailnet admin
  tailscaleAdmin: "https://login.tailscale.com/admin/machines",
  // Cloudflare zero-trust + tunnel dashboard
  cloudflareDash: "https://dash.cloudflare.com",
  cloudflareTunnels:
    "https://one.dash.cloudflare.com/?to=/:account/networks/tunnels",
  // Supabase Studio (PATI self-host)
  supabaseStudio: "https://supabase.patiagency.com",
  // PATI production dashboard
  dashboardProd: "https://pnl.patigroup.com",
  // GoDaddy DNS (read-only for most users)
  godaddy: "https://dcc.godaddy.com",
};
