// Measurement only; Node builtins, stdout JSON, no writes or timing claims.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { gzipSync, brotliCompressSync, constants } from 'node:zlib';
import { createHash } from 'node:crypto';
const local = name => readFileSync(new URL(name, import.meta.url), 'utf8');
const source = name => local(`../../../${name}`);
// Deliberately conservative whitespace/comment minification. No path rewriting,
// numeric optimization, selector optimization or semantic compiler is implied.
const cssMin = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};])\s*/g, '$1').trim();
const xmlMin = s => s.replace(/>\s+</g, '><').trim();
const bytes = s => Buffer.byteLength(s);
function payload(raw, minified = raw) {
  return { raw: bytes(raw), minified: bytes(minified), gzip: gzipSync(minified, { level: 9 }).length,
    brotli: brotliCompressSync(minified, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).length };
}
const checkbox = source('src/ui/patterns/checkbox.css');
const select = source('src/ui/patterns/select.css');
const icon = source('src/ui/patterns/icon.css');
const candidate = local('candidate.css');
// Exact source blocks, not full pattern styles. Retain selector overhead.
function block(text, marker) {
  const start = text.indexOf(marker);
  if (start < 0) throw new Error(`Missing source marker: ${marker}`);
  const end = text.indexOf('}', start);
  if (end < 0) throw new Error('Unterminated source block');
  return text.slice(start, end + 1);
}
const checked = block(checkbox, '  :is(.uif-checkbox, .checkbox):checked::after,');
const mixed = block(checkbox, '  :is(.uif-checkbox, .checkbox):indeterminate::after,');
const mask = block(icon, '  :is(.uif-icon, .icon) {');
// Select declaration extraction retains every occurrence, including hover,
// active, disabled and picker content; avoids counting unrelated control styles.
const selectGeometry = [...select.matchAll(/^\s*(?:background-image|background-repeat|background-position|background-size|content):[^\n]+/gm)].map(m => m[0]).join('\n');
const chevronUrl = select.match(/background-image:\s*(url\("data:image\/svg\+xml,[^\n]+?"\));/)[1];
const decorativeAdapters = `.baseline-dash{inline-size:.75rem;block-size:var(--size-border-200);border-radius:var(--size-radius-full);background:currentColor}.baseline-chevron{display:inline-block;inline-size:1em;block-size:1em;background:${chevronUrl} center/contain no-repeat}`;
const baselineCss = [checked, mixed, mask, selectGeometry, decorativeAdapters].join('\n');
const svgs = Object.fromEntries(['checkmark', 'plus', 'cross'].map(name => [name, source(`src/assets/icons/${name}.svg`)]));
const markup = {
  baseline: ['checkmark', 'plus', 'cross'].map(name => `<span class="uif-icon" aria-hidden="true" style="--uif-icon-src:url(../../../src/assets/icons/${name}.svg)"></span>`).join('') + '<span class="baseline-dash" aria-hidden="true"></span><span class="baseline-chevron" aria-hidden="true"></span>',
  candidate: ['checkmark', 'plus', 'cross', 'dash', 'chevron'].map(name => `<span class="poc-geometry poc-${name}" aria-hidden="true"></span>`).join(''),
  baselinePseudo: '<input class="uif-checkbox" type="checkbox" aria-label="Example" checked>',
  candidatePseudo: '<input class="uif-checkbox poc-checkbox" type="checkbox" aria-label="Example" checked>',
};
const repeats = {};
for (const count of [1, 100, 1000]) {
  repeats[count] = {};
  for (const variant of ['baseline', 'candidate']) {
    const css = variant === 'baseline' ? baselineCss : candidate;
    const assets = variant === 'baseline' ? Object.values(svgs) : [];
    const html = (markup[variant] + markup[`${variant}Pseudo`]).repeat(count);
    const cssCost = payload(css, cssMin(css));
    const htmlCost = payload(html, xmlMin(html));
    const assetCosts = assets.map(s => payload(s, xmlMin(s)));
    const totals = Object.fromEntries(['raw', 'minified', 'gzip', 'brotli'].map(key => [key, cssCost[key] + htmlCost[key] + assetCosts.reduce((n, cost) => n + cost[key], 0)]));
    repeats[count][variant] = { css: cssCost, markup: htmlCost, assets: assetCosts, coldTotal: totals,
      warmCssAndAssetCache: htmlCost, coldRequests: 2 + assets.length, warmRequests: 1 };
  }
}
console.log(JSON.stringify({
  methodology: {
    script: fileURLToPath(import.meta.url), node: process.version, zlib: process.versions.zlib,
    minifier: 'Conservative comment/whitespace CSS and inter-tag XML removal; not production optimizer',
    compression: 'gzip level 9; Brotli quality 11; each resource compressed independently',
    repeats: 'Each repeat = five decorative motif spans + one checked input; one CSS response and three unique baseline SVG assets per cold page. Equal motif counts do not establish optical equivalence.',
    assumptions: 'Cold: HTML+CSS+3 unique cached-on-first-use external SVGs for baseline, HTML+CSS for candidate. Warm: CSS and assets cached, HTML transferred. Zero HTTP/header/TLS cost; compression assumed even for SVG. Shared production control/token CSS excluded equally. Candidate whole stylesheet includes adapters and forced-colors; baseline only extracted geometry. Demo page overhead excluded. No winner inferred.',
    flatBundle: 'Production build-css.mjs embeds local SVG masks when flattening; external-cache scenario here models modular source CSS, not flat main.css.',
    select: 'Embedded SVG already counted inside extracted CSS; no extra request.',
  },
  hashes: Object.fromEntries(Object.entries({ candidate, baselineCss, ...svgs }).map(([name, value]) => [name, createHash('sha256').update(value).digest('hex')])),
  css: { baseline: payload(baselineCss, cssMin(baselineCss)), candidate: payload(candidate, cssMin(candidate)),
    sharedCandidateUtility: payload(candidate.split('/* shared:start */')[1].split('/* shared:end */')[0], cssMin(candidate.split('/* shared:start */')[1].split('/* shared:end */')[0])),
    baselineExtracted: { checked, mixed, mask, selectGeometry } },
  svg: Object.fromEntries(Object.entries(svgs).map(([name, value]) => [name, payload(value, xmlMin(value))])),
  markup: Object.fromEntries(Object.entries(markup).map(([name, value]) => [name, { source: value, ...payload(value, xmlMin(value)) }])),
  repeats, checks: { visual: 'BLOCKED', timing: 'BLOCKED: not measured', acceptance: 'Independent orchestrator only' },
}, null, 2));
