/** Format as Indian Rupee */
export function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Format percentage with sign */
export function formatPct(value: number, decimals = 2): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

/** Format number with Indian grouping (lakhs/crores) */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

/** Format volume: 1.5L, 2.3Cr, etc. */
export function formatVolume(volume: number): string {
  if (volume >= 1_00_00_000) return `${(volume / 1_00_00_000).toFixed(1)}Cr`;
  if (volume >= 1_00_000) return `${(volume / 1_00_000).toFixed(1)}L`;
  if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
  return String(volume);
}
