/** Round displayed cash to the nearest dollar. Do not render faux-precision. */

export function roundUsd(usd: number): number {
  return Math.round(usd);
}

export function formatUsd(usd: number): string {
  return `$${roundUsd(usd).toLocaleString("en-US")}`;
}

/** Integer acres × 2.0 t/ac is a whole ton. Do not show three-decimal yields. */
export function formatYieldTons(tons: number): string {
  return `${Math.round(tons)} t`;
}

export function formatAcres(acres: number): string {
  return `${acres} ac`;
}

export function formatGrapeTons(tons: number): string {
  return `${tons} t`;
}
