/** Split pattern introductions before the first documentation section. */
function pageSections(content, includeIntroduction = false) {
  const html = String(content || "");
  if (!includeIntroduction) return { hero: "", body: html };
  const hasPreview = /<div\b[^>]*class=["'](?:[^"']*\s)?docs-hero(?:\s|["'])/.test(html);
  const boundary = hasPreview
    ? /<h2\b[^>]*\bid=["'][^"']+["'][^>]*>/i.exec(html)
    : /<h2\b[^>]*\bid=["']anatomy["'][^>]*>/i.exec(html);
  if (!boundary) return { hero: "", body: html };
  return { hero: html.slice(0, boundary.index), body: html.slice(boundary.index) };
}
module.exports = { pageSections };
