/** Bounded Markdown renderer. Untrusted source is only ever written as text. */
const MAX_SOURCE = 200000;
const MAX_DEPTH = 20;

export function safeContentUrl(value) {
  if (typeof value !== "string" || /[\s\u0000-\u001f\u007f\\]/u.test(value)) return null;
  // Relative references are deliberately explicit, never protocol-relative.
  if (/^(?:#|\/(?!\/)|\.\.?\/)/.test(value)) return value;
  try {
    const url = new URL(value);
    return ["http:", "https:", "mailto:"].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}

/** Plain, bounded AST: useful to servers/tests without needing a document. */
export function parseContent(source) {
  if (typeof source !== "string") throw new TypeError("Content source must be a string");
  if (source.length > MAX_SOURCE) return [{ type: "plain", text: source }];
  const lines = (source.match(/[^\n]*\n|[^\n]+$/g) || []).map(raw => ({ raw, text: raw.replace(/\r?\n$/, "") }));
  return blocks(lines, 0);
}

function listItem(line) {
  const match = /^( *)([-+*]|\d+[.)]) +(.*)$/.exec(line);
  return match && { indent: match[1].length, ordered: /\d/.test(match[2]), start: Number.parseInt(match[2], 10), text: match[3], prefix: match[0].length - match[3].length };
}

function tableCells(line) {
  let text = line.trim();
  if (text.startsWith("|")) text = text.slice(1);
  if (text.endsWith("|") && !text.endsWith("\\|")) text = text.slice(0, -1);
  const cells = []; let cell = "";
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "\\" && text[i + 1] === "|") { cell += "|"; i++; }
    else if (text[i] === "|") { cells.push(cell.trim()); cell = ""; }
    else cell += text[i];
  }
  cells.push(cell.trim());
  return cells;
}

function tableStart(lines, i) {
  return i + 1 < lines.length && lines[i].text.includes("|") &&
    tableCells(lines[i + 1].text).every(cell => /^:?-{3,}:?$/.test(cell)) &&
    tableCells(lines[i].text).length === tableCells(lines[i + 1].text).length;
}

function special(lines, i) {
  return /^ {0,3}(?:#{1,6} +|`{3,}|~{3,}|> ?)/.test(lines[i].text) || listItem(lines[i].text) || tableStart(lines, i);
}

function blocks(lines, depth) {
  if (depth > MAX_DEPTH) return [{ type: "plain", text: lines.map(line => line.raw).join("") }];
  const nodes = []; let i = 0;
  while (i < lines.length) {
    const text = lines[i].text;
    if (!text.trim()) { i++; continue; }
    const fence = /^ {0,3}(`{3,}|~{3,})([^`]*)$/.exec(text);
    if (fence) {
      const start = ++i;
      const close = new RegExp("^ {0,3}" + fence[1][0] + "{" + fence[1].length + ",} *$");
      while (i < lines.length && !close.test(lines[i].text)) i++;
      nodes.push({ type: "code", text: lines.slice(start, i).map(line => line.raw).join(""), language: fence[2].trim() });
      if (i < lines.length) i++;
      continue;
    }
    const heading = /^ {0,3}(#{1,6}) +(.+?) *#* *$/.exec(text);
    if (heading) { nodes.push({ type: "heading", level: heading[1].length, text: heading[2] }); i++; continue; }
    if (/^ {0,3}>/.test(text)) {
      const quoted = [];
      while (i < lines.length && /^ {0,3}>/.test(lines[i].text)) {
        const line = lines[i++];
        quoted.push({ text: line.text.replace(/^ {0,3}> ?/, ""), raw: line.raw.replace(/^ {0,3}> ?/, "") });
      }
      nodes.push({ type: "quote", children: blocks(quoted, depth + 1) }); continue;
    }
    const first = listItem(text);
    if (first) {
      const items = [];
      while (i < lines.length) {
        const item = listItem(lines[i].text);
        if (!item || item.indent !== first.indent || item.ordered !== first.ordered) break;
        const firstLine = lines[i++];
        const content = [{ text: item.text, raw: item.text + (firstLine.raw.endsWith("\n") ? "\n" : "") }];
        while (i < lines.length) {
          const next = listItem(lines[i].text);
          if (next && next.indent <= first.indent) break;
          const leading = /^ */.exec(lines[i].text)[0].length;
          if (lines[i].text.trim() && leading < item.prefix) break;
          if (!lines[i].text.trim()) {
            const after = lines[i + 1];
            if (!after || /^ */.exec(after.text)[0].length < item.prefix) break;
          }
          const line = lines[i++];
          content.push({ text: line.text.slice(item.prefix), raw: line.raw.slice(Math.min(item.prefix, leading)) });
        }
        items.push(blocks(content, depth + 1));
      }
      nodes.push({ type: "list", ordered: first.ordered, start: first.start, items }); continue;
    }
    if (tableStart(lines, i)) {
      const headers = tableCells(lines[i].text), rows = [];
      i += 2;
      while (i < lines.length && lines[i].text.trim() && lines[i].text.includes("|")) {
        const row = tableCells(lines[i].text);
        if (row.length !== headers.length) break;
        rows.push(row); i++;
      }
      nodes.push({ type: "table", headers, rows }); continue;
    }
    const paragraph = [text]; i++;
    while (i < lines.length && lines[i].text.trim() && !special(lines, i)) paragraph.push(lines[i++].text);
    nodes.push({ type: "paragraph", text: paragraph.join("\n") });
  }
  return nodes;
}

function inline(parent, source, document, depth = 0, links = true) {
  if (depth > MAX_DEPTH || source.length > 16384) { parent.append(document.createTextNode(source)); return; }
  // One pass; unmatched/unsupported constructs remain literal text.
  const pattern = /\\([\\`*_[\]()!])|(`+)([^`]*?)\2|(!?)\[([^\]\n]+)\]\(([^\s)]*)\)|(\*\*|__)(?=\S)(.+?)\7|(\*|_)(?=\S)([^\n]+?)\9/g;
  let cursor = 0, match;
  while ((match = pattern.exec(source))) {
    parent.append(document.createTextNode(source.slice(cursor, match.index)));
    if (match[1]) parent.append(document.createTextNode(match[1]));
    else if (match[2]) { const code = document.createElement("code"); code.textContent = match[3]; parent.append(code); }
    else if (match[5]) {
      const href = !match[4] && links && safeContentUrl(match[6]);
      if (href) {
        const a = document.createElement("a"); a.className = "uif-link"; a.href = href;
        inline(a, match[5], document, depth + 1, false); parent.append(a);
      } else parent.append(document.createTextNode(match[0]));
    } else {
      const tag = document.createElement(match[7] ? "strong" : "em");
      inline(tag, match[8] || match[10], document, depth + 1, links); parent.append(tag);
    }
    cursor = pattern.lastIndex;
  }
  parent.append(document.createTextNode(source.slice(cursor)));
}

/**
 * renderContent(element, untrustedString, {format: "markdown"|"text", headingLevel: 2})
 * No innerHTML, third-party parser, remote resource or automatic DOM scan.
 */
export function renderContent(target, source, options = {}) {
  if (!target?.ownerDocument || typeof source !== "string") throw new TypeError("Expected a DOM element and string source");
  const document = target.ownerDocument;
  const headingLevel = Number(options.headingLevel ?? 2);
  if (!Number.isInteger(headingLevel) || headingLevel < 1 || headingLevel > 6) throw new RangeError("headingLevel must be 1–6");
  if (options.format && !["markdown", "text"].includes(options.format)) throw new RangeError("Unknown content format");
  const labels = { copy: "Copy code", copied: "Code copied.", failed: "Copy unavailable. Select and copy the code manually.", code: "Code example", table: "Content table", ...options.labels };
  const fragment = document.createDocumentFragment();
  const alive = { value: true };
  const make = (tag, text) => { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; return e; };
  function scrollRegion(element, label) {
    element.tabIndex = 0; element.setAttribute("role", "region"); element.setAttribute("aria-label", label);
  }
  function render(nodes, parent) {
    for (const node of nodes) {
      if (node.type === "plain") { const pre = make("pre", node.text); pre.className = "uif-code"; scrollRegion(pre, labels.code); parent.append(pre); }
      else if (node.type === "code") {
        const section = make("section"), pre = make("pre"), code = make("code", node.text);
        section.className = "uif-content-code-block"; pre.className = "uif-code";
        scrollRegion(pre, labels.code); pre.append(code);
        if (options.copy !== true) {
          section.append(pre); parent.append(section); continue;
        }
        const button = make("button", labels.copy), status = make("span");
        button.type = "button"; button.className = "uif-button outline";
        status.className = "uif-content-copy-status"; status.setAttribute("role", "status"); status.setAttribute("aria-live", "polite");
        button.addEventListener("click", async () => {
          if (!alive.value) return;
          button.disabled = true; status.textContent = "";
          try {
            const clipboard = document.defaultView?.navigator.clipboard;
            if (!clipboard?.writeText) throw new Error("Clipboard unavailable");
            await clipboard.writeText(node.text);
            if (alive.value) status.textContent = labels.copied;
          } catch { if (alive.value) status.textContent = labels.failed; }
          finally { if (alive.value) button.disabled = false; }
        });
        section.append(pre, button, status); parent.append(section);
      } else if (node.type === "list") {
        const list = make(node.ordered ? "ol" : "ul");
        if (node.ordered && Number.isSafeInteger(node.start)) list.start = node.start;
        for (const item of node.items) { const li = make("li"); render(item, li); list.append(li); }
        parent.append(list);
      } else if (node.type === "quote") { const quote = make("blockquote"); render(node.children, quote); parent.append(quote); }
      else if (node.type === "table") {
        const region = make("div"), table = make("table"), head = make("thead"), body = make("tbody"), tr = make("tr");
        region.className = "uif-content-table"; table.className = "uif-table"; scrollRegion(region, labels.table);
        for (const header of node.headers) { const th = make("th"); th.scope = "col"; inline(th, header, document); tr.append(th); }
        head.append(tr);
        for (const row of node.rows) { const tr = make("tr"); for (const cell of row) { const td = make("td"); inline(td, cell, document); tr.append(td); } body.append(tr); }
        table.append(head, body); region.append(table); parent.append(region);
      } else {
        const element = make(node.type === "heading" ? "h" + Math.min(6, headingLevel + node.level - 1) : "p");
        inline(element, node.text, document); parent.append(element);
      }
    }
  }
  let fallback = options.format !== "text" && source.length > MAX_SOURCE;
  try { render(options.format === "text" ? [{ type: "plain", text: source }] : parseContent(source), fragment); }
  catch {
    fallback = true; fragment.replaceChildren();
    const pre = make("pre", source); pre.className = "uif-code"; scrollRegion(pre, labels.code); fragment.append(pre);
  }
  // Stop pending clipboard completions from a previous render of this target.
  instances.get(target)?.destroy();
  target.classList.add("uif-content"); target.replaceChildren(fragment);
  const result = { source, fallback, destroy() { alive.value = false; } };
  instances.set(target, result);
  return result;
}
const instances = new WeakMap();
