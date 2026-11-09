export const XSOLLA_PROJECT_ID = "320352";

export const REAL_MONEY_PRODUCTS = {
  "subasta-mixto-119": { priceCents: 119, gems: 80, coins: 800 },
  "subasta-mixto-230": { priceCents: 230, gems: 170, coins: 1800 },
  "subasta-mixto-499": { priceCents: 499, gems: 400, coins: 4500 },
  "subasta-mixto-999": { priceCents: 999, gems: 900, coins: 10000 },
  "subasta-mixto-1999": { priceCents: 1999, gems: 2000, coins: 22000 },
  "subasta-mixto-4999": { priceCents: 4999, gems: 5400, coins: 60000 },
  "subasta-mixto-9999": { priceCents: 9999, gems: 11000, coins: 125000 },
  "subasta-gemas-119": { priceCents: 119, gems: 120, coins: 0 },
  "subasta-gemas-230": { priceCents: 230, gems: 240, coins: 0 },
  "subasta-gemas-499": { priceCents: 499, gems: 520, coins: 0 },
  "subasta-gemas-999": { priceCents: 999, gems: 1100, coins: 0 },
  "subasta-gemas-1999": { priceCents: 1999, gems: 2300, coins: 0 },
  "subasta-gemas-4999": { priceCents: 4999, gems: 6000, coins: 0 },
  "subasta-gemas-9999": { priceCents: 9999, gems: 12500, coins: 0 },
} as const;

export type RealMoneySku = keyof typeof REAL_MONEY_PRODUCTS;
