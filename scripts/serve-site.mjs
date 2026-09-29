import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Minimal static file server for the built Eleventy `_site/` output.
// Used only to give the bounded browser-verification layer a real HTTP origin
// (the playground references assets with absolute `/assets/...` paths, which do
// not resolve over `file://`). This is a test harness helper, not a framework.

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE_ROOT = path.join(REPO_ROOT, "_site");
const PORT = Number(process.env.SITE_PORT || 8099);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".map": "application/json; charset=utf-8",
};

function resolveRequestPath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  const safe = path
    .normalize(decoded)
    .replace(/^(\.\.[/\\])+/, "")
    .replace(/^[/\\]+/, "");
  let target = path.join(SITE_ROOT, safe);
  if (!target.startsWith(SITE_ROOT)) {
    return null;
  }
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
    target = path.join(target, "index.html");
  }
  return target;
}

const server = http.createServer((req, res) => {
  const target = resolveRequestPath(req.url || "/");
  if (!target || !fs.existsSync(target) || !fs.statSync(target).isFile()) {
    res.statusCode = 404;
    res.end("Not found");
    return;
  }
  const mime = MIME_TYPES[path.extname(target).toLowerCase()] || "application/octet-stream";
  res.setHeader("Content-Type", mime);
  fs.createReadStream(target).pipe(res);
});

server.listen(PORT, () => {
  console.log(`[serve-site] serving _site on http://127.0.0.1:${PORT}`);
});
