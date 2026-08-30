/** Round to the precision agronomy supports. Do not render faux-precision. */

export function roundCm(cm: number): number {
  return Math.round(cm);
}

export function formatCm(cm: number): string {
  return `${roundCm(cm)} cm`;
}

export function formatInchesWhole(inches: number): string {
  return `${Math.round(inches)} in`;
}

export function formatInchesSourced(inches: number, decimals: number): string {
  return `${inches.toFixed(decimals)} in`;
}

export function formatDemandIn(inches: number): string {
  return `${inches.toFixed(1)} in`;
}
