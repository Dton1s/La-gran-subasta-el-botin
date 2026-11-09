export type RealMoneyPackage = {
  sku: string;
  name: string;
  priceCents: number;
  gems: number;
  coins: number;
  kind: "bundle" | "gems";
  featured?: boolean;
};

/**
 * Display catalog only. The server must keep its own allowlisted copy and
 * Xsolla's configured SKU price remains the actual charge authority.
 */
export const REAL_MONEY_CATALOG: RealMoneyPackage[] = [
  { sku: "subasta-mixto-119", name: "Bolsa del principiante", priceCents: 119, gems: 80, coins: 800, kind: "bundle" },
  { sku: "subasta-mixto-230", name: "Saco del subastador", priceCents: 230, gems: 170, coins: 1_800, kind: "bundle" },
  { sku: "subasta-mixto-499", name: "Alijo del botín", priceCents: 499, gems: 400, coins: 4_500, kind: "bundle", featured: true },
  { sku: "subasta-mixto-999", name: "Cofre del apostador", priceCents: 999, gems: 900, coins: 10_000, kind: "bundle" },
  { sku: "subasta-mixto-1999", name: "Tesoro del capitán", priceCents: 1_999, gems: 2_000, coins: 22_000, kind: "bundle" },
  { sku: "subasta-mixto-4999", name: "Bóveda de la mesa", priceCents: 4_999, gems: 5_400, coins: 60_000, kind: "bundle" },
  { sku: "subasta-mixto-9999", name: "Gran tesoro", priceCents: 9_999, gems: 11_000, coins: 125_000, kind: "bundle", featured: true },
  { sku: "subasta-gemas-119", name: "Puñado de gemas", priceCents: 119, gems: 120, coins: 0, kind: "gems" },
  { sku: "subasta-gemas-230", name: "Bolsa de gemas", priceCents: 230, gems: 240, coins: 0, kind: "gems" },
  { sku: "subasta-gemas-499", name: "Saco de gemas", priceCents: 499, gems: 520, coins: 0, kind: "gems", featured: true },
  { sku: "subasta-gemas-999", name: "Cofre de gemas", priceCents: 999, gems: 1_100, coins: 0, kind: "gems" },
  { sku: "subasta-gemas-1999", name: "Tesoro de gemas", priceCents: 1_999, gems: 2_300, coins: 0, kind: "gems" },
  { sku: "subasta-gemas-4999", name: "Bóveda de gemas", priceCents: 4_999, gems: 6_000, coins: 0, kind: "gems" },
  { sku: "subasta-gemas-9999", name: "Gran bóveda de gemas", priceCents: 9_999, gems: 12_500, coins: 0, kind: "gems", featured: true },
];

export const formatPackagePrice = (priceCents: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(priceCents / 100);
