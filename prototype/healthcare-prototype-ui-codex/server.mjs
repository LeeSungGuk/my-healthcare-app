import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT ?? 4173);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

function safePath(url) {
  const rawPath = new URL(url, `http://localhost:${port}`).pathname;
  const decoded = decodeURIComponent(rawPath);
  const normalized = normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  return normalized === "/" ? "/index.html" : normalized;
}

const server = createServer(async (request, response) => {
  try {
    const requestPath = safePath(request.url ?? "/");
    const filePath = join(rootDir, requestPath);
    const extension = extname(filePath);
    const content = await readFile(filePath);

    response.writeHead(200, {
      "Content-Type": mimeTypes[extension] ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(content);
  } catch {
    const index = await readFile(join(rootDir, "index.html"));
    response.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    });
    response.end(index);
  }
});

server.listen(port, () => {
  console.log(`SilverCare prototype running at http://localhost:${port}`);
});
