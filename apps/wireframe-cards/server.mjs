import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const serverRoot = resolve(rootDir);
const port = Number(process.env.PORT ?? 4174);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
};

const securityHeaders = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "base-uri 'self'",
    "connect-src 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' data:",
    "object-src 'none'",
    "script-src 'self'",
    "style-src 'self'",
  ].join("; "),
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

const defaultHeaders = {
  ...securityHeaders,
  "Cache-Control": "no-store",
};

const publicPathPrefixes = ["/assets/", "/src/"];

function safePath(url) {
  const pathname = new URL(url, `http://localhost:${port}`).pathname;
  const normalized = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  return normalized === "/" ? "/index.html" : normalized;
}

function isPublicPath(path) {
  if (path === "/index.html") {
    return true;
  }

  if (path.split("/").some((segment) => segment.startsWith("."))) {
    return false;
  }

  return publicPathPrefixes.some((prefix) => path.startsWith(prefix)) && mimeTypes[extname(path)] !== undefined;
}

function filePathForRequest(url) {
  const requestPath = safePath(url);

  if (!isPublicPath(requestPath)) {
    return null;
  }

  const filePath = resolve(serverRoot, `.${requestPath}`);

  if (filePath !== serverRoot && !filePath.startsWith(`${serverRoot}${sep}`)) {
    return null;
  }

  return filePath;
}

const server = createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, {
      ...defaultHeaders,
      Allow: "GET, HEAD",
      "Content-Type": "text/plain; charset=utf-8",
    });
    response.end("Method Not Allowed");
    return;
  }

  try {
    const filePath = filePathForRequest(request.url ?? "/");

    if (filePath === null) {
      response.writeHead(404, {
        ...defaultHeaders,
        "Content-Type": "text/plain; charset=utf-8",
      });
      response.end("Not Found");
      return;
    }

    const extension = extname(filePath);
    const content = await readFile(filePath);

    response.writeHead(200, {
      ...defaultHeaders,
      "Content-Type": mimeTypes[extension] ?? "application/octet-stream",
    });
    response.end(content);
  } catch {
    const fallback = await readFile(join(rootDir, "index.html"));
    response.writeHead(200, {
      ...defaultHeaders,
      "Content-Type": "text/html; charset=utf-8",
    });
    response.end(fallback);
  }
});

server.listen(port, () => {
  console.log(`Wireframe card board running at http://localhost:${port}`);
});
