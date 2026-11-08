/** Split pattern introductions at Anatomy without moving any content client-side. */
function pageSections(content, includeIntroduction = false) {
  const html = String(content || "");
  if (!includeIntroduction) return { hero: "", body: html };
  const anatomy = /<h2\b[^>]*\bid=["']anatomy["'][^>]*>/i.exec(html);
  if (!anatomy) return { hero: "", body: html };
  return { hero: html.slice(0, anatomy.index), body: html.slice(anatomy.index) };
}
module.exports = { pageSections };
