const clamp = (value, min = 0, max = 1) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.min(max, Math.max(min, numeric)) : min;
};
const wrapHue = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? ((numeric % 360) + 360) % 360 : 0;
};
const round = (value, places = 2) => {
  const factor = 10 ** places;
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
};

function normalizeRgba(color) {
  return {
    r: Math.round(clamp(color?.r, 0, 255)),
    g: Math.round(clamp(color?.g, 0, 255)),
    b: Math.round(clamp(color?.b, 0, 255)),
    a: round(clamp(color?.a ?? 1), 3),
  };
}

function hslaToRgba(color) {
  const h = wrapHue(color?.h) / 360;
  const s = clamp(color?.s);
  const l = clamp(color?.l);
  const a = clamp(color?.a ?? 1);
  if (s === 0) {
    const channel = Math.round(l * 255);
    return { r: channel, g: channel, b: channel, a: round(a, 3) };
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channel = (offset) => {
    let t = h + offset;
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return normalizeRgba({
    r: channel(1 / 3) * 255,
    g: channel(0) * 255,
    b: channel(-1 / 3) * 255,
    a,
  });
}

function rgbaToHsla(input) {
  const color = normalizeRgba(input);
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    if (max === r) h = 60 * (((g - b) / delta) % 6);
    else if (max === g) h = 60 * ((b - r) / delta + 2);
    else h = 60 * ((r - g) / delta + 4);
  }
  return { h: round(wrapHue(h), 2), s: round(s, 4), l: round(l, 4), a: color.a };
}

function hsvaToRgba(input) {
  const h = wrapHue(input?.h);
  const s = clamp(input?.s);
  const v = clamp(input?.v);
  const c = v * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = v - c;
  const sectors = [
    [c, x, 0], [x, c, 0], [0, c, x],
    [0, x, c], [x, 0, c], [c, 0, x],
  ];
  const [r, g, b] = sectors[Math.floor(h / 60) % 6];
  return normalizeRgba({ r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255, a: input?.a ?? 1 });
}

function rgbaToHsva(input) {
  const color = normalizeRgba(input);
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  if (delta !== 0) {
    if (max === r) h = 60 * (((g - b) / delta) % 6);
    else if (max === g) h = 60 * ((b - r) / delta + 2);
    else h = 60 * ((r - g) / delta + 4);
  }
  return {
    h: round(wrapHue(h), 2),
    s: max === 0 ? 0 : round(delta / max, 4),
    v: round(max, 4),
    a: color.a,
  };
}

function parseHex(value) {
  const match = String(value).trim().match(/^#?([\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i);
  if (!match) return null;
  let digits = match[1];
  if (digits.length <= 4) digits = Array.from(digits, (digit) => digit + digit).join("");
  if (digits.length === 6) digits += "ff";
  return normalizeRgba({
    r: Number.parseInt(digits.slice(0, 2), 16),
    g: Number.parseInt(digits.slice(2, 4), 16),
    b: Number.parseInt(digits.slice(4, 6), 16),
    a: Number.parseInt(digits.slice(6, 8), 16) / 255,
  });
}

function parseAlpha(value) {
  const text = String(value).trim();
  const numeric = Number.parseFloat(text);
  if (!Number.isFinite(numeric)) return null;
  return clamp(text.endsWith("%") ? numeric / 100 : numeric);
}

function parseChannel(value) {
  const text = String(value).trim();
  const numeric = Number.parseFloat(text);
  if (!Number.isFinite(numeric)) return null;
  return clamp(text.endsWith("%") ? numeric * 2.55 : numeric, 0, 255);
}

function functionParts(value, names) {
  let text = String(value).trim();
  const open = text.indexOf("(");
  if (open >= 0) {
    const name = text.slice(0, open).trim().toLowerCase();
    if (!names.includes(name) || !text.endsWith(")")) return null;
    text = text.slice(open + 1, -1);
  }
  const normalized = text.replace(/\s*\/\s*/, ",");
  const commaParts = normalized.split(/\s*,\s*/).map((part) => part.trim());
  if (commaParts.length === 1) return commaParts[0].split(/\s+/);
  if (commaParts.length === 2 && /\s/.test(commaParts[0])) {
    return [...commaParts[0].split(/\s+/), commaParts[1]];
  }
  return commaParts;
}

function parseRgb(value) {
  const parts = functionParts(value, ["rgb", "rgba"]);
  if (!parts || parts.length < 3 || parts.length > 4 || parts.some((part) => part === "")) return null;
  const channels = parts.slice(0, 3).map(parseChannel);
  const alpha = parts.length === 4 ? parseAlpha(parts[3]) : 1;
  if (channels.some((channel) => channel === null) || alpha === null) return null;
  return normalizeRgba({ r: channels[0], g: channels[1], b: channels[2], a: alpha });
}

function parseHsl(value) {
  const parts = functionParts(value, ["hsl", "hsla"]);
  if (!parts || parts.length < 3 || parts.length > 4 || parts.some((part) => part === "")) return null;
  const h = Number.parseFloat(parts[0]);
  const s = Number.parseFloat(parts[1]);
  const l = Number.parseFloat(parts[2]);
  const alpha = parts.length === 4 ? parseAlpha(parts[3]) : 1;
  if (![h, s, l].every(Number.isFinite) || alpha === null) return null;
  return hslaToRgba({ h, s: clamp(s / 100), l: clamp(l / 100), a: alpha });
}

function parseColor(value, format = "auto") {
  if (format === "hex") return parseHex(value);
  if (format === "rgb") return parseRgb(value);
  if (format === "hsl") return parseHsl(value);
  const text = String(value).trim().toLowerCase();
  if (text.startsWith("#") || /^[\da-f]{3,8}$/i.test(text)) return parseHex(text);
  if (text.startsWith("hsl")) return parseHsl(text);
  if (text.startsWith("rgb")) return parseRgb(text);
  return null;
}

function rgbaToHex(input, includeAlpha = normalizeRgba(input).a < 1) {
  const color = normalizeRgba(input);
  const hex = [color.r, color.g, color.b]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("");
  const alpha = Math.round(color.a * 255).toString(16).padStart(2, "0");
  return `#${hex}${includeAlpha ? alpha : ""}`.toUpperCase();
}

function rgbaToRgbString(input) {
  const color = normalizeRgba(input);
  return color.a < 1
    ? `rgb(${color.r}, ${color.g}, ${color.b} / ${round(color.a, 2)})`
    : `rgb(${color.r}, ${color.g}, ${color.b})`;
}

function rgbaToHslString(input) {
  const color = rgbaToHsla(input);
  const body = `${round(color.h)} ${round(color.s * 100)}% ${round(color.l * 100)}%`;
  return color.a < 1 ? `hsl(${body} / ${round(color.a, 2)})` : `hsl(${body})`;
}

function rgbaToCss(input) {
  const color = normalizeRgba(input);
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
}

export {
  clamp,
  wrapHue,
  normalizeRgba,
  hslaToRgba,
  rgbaToHsla,
  hsvaToRgba,
  rgbaToHsva,
  parseHex,
  parseRgb,
  parseHsl,
  parseColor,
  rgbaToHex,
  rgbaToRgbString,
  rgbaToHslString,
  rgbaToCss,
};
