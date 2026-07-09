/**
 * Tiny same-origin proxy for temporary Live Demo tunnels.
 * Forwards /api,/health,/docs,/openapi.json -> API and everything else -> Next.
 */
const http = require("http");
const { URL } = require("url");

const LISTEN_PORT = Number(process.env.PROXY_PORT || 3080);
const FRONTEND = process.env.FRONTEND_ORIGIN || "http://127.0.0.1:3010";
const BACKEND = process.env.BACKEND_ORIGIN || "http://127.0.0.1:8123";

function shouldProxyToApi(pathname) {
  return (
    pathname === "/health" ||
    pathname === "/docs" ||
    pathname === "/openapi.json" ||
    pathname === "/api/routes" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/docs/")
  );
}

function normalizeApiPath(pathname, search) {
  // FastAPI redirects /api/routes -> /api/routes/; avoid tunnel/proxy redirect loops.
  if (pathname === "/api/routes") return "/api/routes/" + search;
  return pathname + search;
}

function proxy(req, res, targetOrigin) {
  const incoming = new URL(req.url, "http://localhost");
  const normalizedPath = shouldProxyToApi(incoming.pathname)
    ? normalizeApiPath(incoming.pathname, incoming.search)
    : incoming.pathname + incoming.search;
  const target = new URL(normalizedPath, targetOrigin);
  const headers = { ...req.headers, host: target.host };

  const upstream = http.request(
    {
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port,
      path: target.pathname + target.search,
      method: req.method,
      headers,
    },
    (upRes) => {
      res.writeHead(upRes.statusCode || 502, upRes.headers);
      upRes.pipe(res);
    }
  );

  upstream.on("error", (err) => {
    res.writeHead(502, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "proxy_upstream_error", detail: String(err.message) }));
  });

  req.pipe(upstream);
}

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, "http://localhost").pathname;
  const target = shouldProxyToApi(pathname) ? BACKEND : FRONTEND;
  proxy(req, res, target);
});

server.listen(LISTEN_PORT, "0.0.0.0", () => {
  console.log(`ViaStat demo proxy on http://127.0.0.1:${LISTEN_PORT}`);
  console.log(`frontend=${FRONTEND}`);
  console.log(`backend=${BACKEND}`);
});
