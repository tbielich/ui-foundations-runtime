const {
  TOKENS_YAML_RELATIVE_PATH,
  loadTokensFromYaml,
} = require("../lib/tokens-yaml");

module.exports = () => {
  const tokens = loadTokensFromYaml().filter(
    (t) => t.cssVar && t.cssVar.startsWith("--"),
  );

  // Font families
  const families = tokens
    .filter((t) => t.cssVar.startsWith("--font-family-"))
    .map((t) => ({
      cssVar: t.cssVar,
      name: t.cssVar.replace("--font-family-", ""),
      value: String(t.value || ""),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Font sizes (core scale)
  const sizes = tokens
    .filter(
      (t) =>
        t.cssVar.startsWith("--font-size-") &&
        !t.cssVar.includes("badge") &&
        !t.cssVar.includes("button") &&
        !t.cssVar.includes("input") &&
        !t.cssVar.includes("link") &&
        !t.cssVar.includes("select") &&
        !t.cssVar.includes("textarea"),
    )
    .map((t) => ({
      cssVar: t.cssVar,
      name: t.cssVar.replace("--", ""),
      value: String(t.value || ""),
    }))
    .sort((a, b) => {
      const order = ["xs", "sm", "md", "lg", "xl", "xxl", "xxxl"];
      const aKey = a.name.replace("font-size-", "");
      const bKey = b.name.replace("font-size-", "");
      return order.indexOf(aKey) - order.indexOf(bKey);
    });

  // Font weights
  const weights = tokens
    .filter(
      (t) =>
        t.cssVar.startsWith("--font-weight-") &&
        /--font-weight-\d+$/.test(t.cssVar),
    )
    .map((t) => ({
      cssVar: t.cssVar,
      name: t.cssVar.replace("--", ""),
      value: String(t.value || ""),
    }))
    .sort((a, b) => Number(a.value) - Number(b.value));

  // Line heights
  const lineHeights = tokens
    .filter(
      (t) =>
        t.cssVar.startsWith("--line-height-") &&
        !t.cssVar.includes("badge") &&
        !t.cssVar.includes("button") &&
        !t.cssVar.includes("input") &&
        !t.cssVar.includes("link") &&
        !t.cssVar.includes("select") &&
        !t.cssVar.includes("textarea"),
    )
    .map((t) => ({
      cssVar: t.cssVar,
      name: t.cssVar.replace("--", ""),
      value: String(t.value || ""),
    }))
    .sort((a, b) => {
      const order = ["xs", "sm", "md", "lg", "xl", "xxl", "xxxl"];
      const aKey = a.name.replace("line-height-", "");
      const bKey = b.name.replace("line-height-", "");
      return order.indexOf(aKey) - order.indexOf(bKey);
    });

  // Brand font tokens
  const brandFonts = tokens
    .filter(
      (t) =>
        t.cssVar.startsWith("--brand-font-") &&
        t.scopeBucket === "brand",
    )
    .map((t) => ({
      cssVar: t.cssVar,
      name: t.cssVar.replace("--", ""),
      value: String(t.value || ""),
      brand: t.scopeId || "",
    }));

  // Derive displayed families from the existing Brand roles and canonical Core
  // catalogue. Legacy family aliases resolve through the same projection used
  // by the Runtime; no separate brand-to-font catalogue is maintained here.
  const compatibility = require("../../figma/font-family-compatibility.json");
  const canonicalFamily = new Map(compatibility.exports.map(entry => [entry.legacyCssVar, entry.canonicalCssVar]));
  const typefaceBrands = [...new Set(brandFonts.map(token => token.brand))].sort().map(id => {
    const selected = new Map();
    for (const token of brandFonts.filter(token => token.brand === id)) {
      const reference = /^var\((--font-family-[a-z0-9-]+)\)$/.exec(token.value);
      const cssVar = reference && (canonicalFamily.get(reference[1]) || reference[1]);
      const family = families.find(family => family.cssVar === cssVar);
      if (!family) throw new Error(`Unresolved brand typeface: ${id} ${token.cssVar}`);
      if (!selected.has(cssVar)) selected.set(cssVar, { ...family, roles: [] });
      selected.get(cssVar).roles.push(token.name.replace("brand-font-", ""));
    }
    return { id, title: `Brand ${id.toUpperCase()}`, families: [...selected.values()] };
  });

  // Heading scale tokens
  const headingScale = [
    { class: "heading-xxxl", label: "XXXL", element: "h1" },
    { class: "heading-xxl", label: "XXL", element: "h2" },
    { class: "heading-xl", label: "XL", element: "h3" },
    { class: "heading-lg", label: "LG", element: "h4" },
    { class: "heading-md", label: "MD", element: "h5" },
    { class: "heading-sm", label: "SM", element: "h6" },
  ];

  // Text scale
  const textScale = [
    { class: "text-xxxl", label: "XXXL" },
    { class: "text-xxl", label: "XXL" },
    { class: "text-xl", label: "XL" },
    { class: "text-lg", label: "LG" },
    { class: "text-md", label: "MD" },
    { class: "text-sm", label: "SM" },
    { class: "text-xs", label: "XS" },
  ];

  return {
    families,
    typefaceBrands,
    sizes,
    weights,
    lineHeights,
    brandFonts,
    headingScale,
    textScale,
    sourceDir: TOKENS_YAML_RELATIVE_PATH,
  };
};
