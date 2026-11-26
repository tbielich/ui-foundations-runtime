// Bounded fallback for UIF's five top-level named layers, not a general CSS transpiler.
const order = ["reset", "base", "tokens", "context", "components"];

function boundary(source, from, stop) {
  let depth = 0, quote = "", comment = false;
  for (let i = from; i < source.length; i++) {
    const c = source[i], next = source[i + 1];
    if (comment) { if (c === "*" && next === "/") { comment = false; i++; } continue; }
    if (quote) { if (c === "\\") i++; else if (c === quote) quote = ""; continue; }
    if (c === "/" && next === "*") { comment = true; i++; continue; }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (depth === 0 && stop(c, i)) return i;
    if (c === "{") depth++;
    else if (c === "}") { if (--depth < 0) throw new Error("Unbalanced CSS block"); }
  }
  if (depth || quote || comment) throw new Error("Incomplete CSS source");
  return source.length;
}

export function buildLegacyCss(source) {
  const buckets = new Map(order.map(name => [name, []]));
  let cursor = 0, unlayered = "";
  while (cursor < source.length) {
    const start = boundary(source, cursor, (_c, i) => source.startsWith("@layer", i));
    unlayered += source.slice(cursor, start);
    if (start === source.length) break;
    const open = boundary(source, start, c => c === "{" || c === ";");
    const name = source.slice(start + 6, open).trim();
    if (!buckets.has(name) || source[open] !== "{") throw new Error(`Unsupported fallback layer: ${name}`);
    const close = boundary(source, open + 1, c => c === "}");
    if (close === source.length) throw new Error("Unclosed layer");
    const body = source.slice(open + 1, close);
    if (/@layer\b/.test(body)) throw new Error("Nested layers need explicit fallback review");
    buckets.get(name).push(body);
    cursor = close + 1;
  }
  return "/* Opt-in BOOX/Chrome 88 fallback. Named layers flattened in UIF order. */\n" +
    order.map(name => buckets.get(name).join("\n")).join("\n") + "\n" + unlayered;
}
