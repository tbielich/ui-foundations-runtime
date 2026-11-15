function normalizeBasePath(value) {
  const raw = String(value || "").trim();
  if (!raw || raw === "/") return "";
  const segments = raw.split("/").filter(Boolean);
  return segments.length ? "/" + segments.join("/") : "";
}

function normalizeSiteUrl(value) {
  const raw = String(value || "https://ui-foundations.com");
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

const basePath = normalizeBasePath(process.env.SITE_BASE_PATH);
const siteUrl = normalizeSiteUrl(process.env.SITE_URL);

const site = {
  siteUrl,
  basePath,
  baseUrl: siteUrl + basePath,
  path(pathname = "/") {
    const raw = String(pathname);
    const path = raw.startsWith("/") ? raw : "/" + raw;
    return basePath + path;
  },
  vault: {
    repository: "https://github.com/tbielich/ui-foundations-vault",
    documentation: "https://github.com/tbielich/ui-foundations-vault",
    branch: "main",
  },
};

module.exports = site;
