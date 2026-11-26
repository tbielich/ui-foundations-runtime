/** Fixed, decorative Symbol geometry. No arbitrary attributes or path data. */
export const SYMBOL_PATHS = Object.freeze({"checkmark": "M4 13L10 19L20 5", "dash": "M6 12H18", "chevron": "M9 6L15 12L9 18", "plus": "M6 12H18M12 6V18", "cross": "M6.06979 6.06982L17.9302 17.9302M17.9302 6.06982L6.06979 17.9302"});

export function normalizeSymbolName(value) {
  return typeof value === "string" && Object.hasOwn(SYMBOL_PATHS, value) ? value : "";
}

/** Decimal numbers and decimal numeric strings only; no CSS or HTML input. */
export function normalizeSymbolWeight(value = 400) {
  const raw = typeof value === "number" || typeof value === "string" ? String(value).trim() : "";
  const number = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(raw) ? Number(raw) : NaN;
  return Number.isFinite(number) ? Math.min(900, Math.max(100, number)) : 400;
}

export function renderSymbol(name, weight = 400) {
  const motif = normalizeSymbolName(name);
  if (!motif) return "";
  return `<svg xmlns="http://www.w3.org/2000/svg" class="uif-symbol" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style="--uif-symbol-weight: ${normalizeSymbolWeight(weight)}"><path d="${SYMBOL_PATHS[motif]}"></path></svg>`;
}
