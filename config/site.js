function normalizeBasePath(value) {
  const raw = String(value || "").trim();
  if (!raw || raw === "/") return "";
  const segments = raw.split("/").filter(Boolean);\n  return segments.length ? `/${segments.join("/")}` : "";
}

function normalizeSiteUrl(value) {
  return String(value || "https://ui-foundations.com").replace(/\/+$/, "");
}

const basePath = normalizeBasePath(process.env.SITE_BASE_PATH);
const siteUrl = normalizeSiteUrl(process.env.SITE_URL);

const site = {
  siteUrl,
  basePath,
  baseUrl: `${siteUrl}${basePath}`,
  path(pathname = "/") {
    const path = `/${String(pathname).replace(/^\\/+/, "")}`;
    return `${basePath}${path}`;
  },
  vault: {
    repository: "https://github.com/tbielich/ui-foundations-vault",
    documentation: "https://github.com/tbielich/ui-foundations-vault",
    branch: "main",
  },
};

module.exports = site;
