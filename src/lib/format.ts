const nf = new Intl.NumberFormat("en-US");
const nfCompact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

export function formatNumber(n: number) {
  return nf.format(Math.round(n));
}

export function formatCompactNumber(n: number) {
  return nfCompact.format(n);
}

export function formatCurrency(n: number) {
  return `EC$${nf.format(Math.round(n))}`;
}

export function formatPct(n: number, digits = 0) {
  return `${n.toFixed(digits)}%`;
}
