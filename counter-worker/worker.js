const ALLOWED_ORIGIN = "https://observatorio.revistatimeline.com";

function json(data, status = 200, origin = ALLOWED_ORIGIN) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, max-age=0",
      "access-control-allow-origin": origin,
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "content-type",
      "vary": "Origin"
    }
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    if (origin !== ALLOWED_ORIGIN) {
      return json({ error: "Origin not allowed" }, 403, ALLOWED_ORIGIN);
    }

    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": ALLOWED_ORIGIN,
          "access-control-allow-methods": "GET, POST, OPTIONS",
          "access-control-allow-headers": "content-type",
          "access-control-max-age": "86400",
          "vary": "Origin"
        }
      });
    }

    try {
      if (request.method === "GET" && url.pathname === "/counts") {
        const result = await env.DB.prepare(
          "SELECT name, value FROM counters WHERE name IN ('visits', 'downloads')"
        ).all();

        const counts = Object.fromEntries(
          (result.results || []).map(row => [row.name, Number(row.value)])
        );
        if (!Number.isFinite(counts.visits) || !Number.isFinite(counts.downloads)) {
          return json({ error: "Counter database is not initialized" }, 503);
        }
        return json(counts);
      }

      if (request.method === "POST" &&
          (url.pathname === "/visit" || url.pathname === "/download")) {
        const name = url.pathname === "/visit" ? "visits" : "downloads";
        const result = await env.DB.prepare(
          "UPDATE counters SET value = value + 1 WHERE name = ? RETURNING value"
        ).bind(name).first();

        if (!result) return json({ error: "Counter not initialized" }, 503);
        return json({ name, value: Number(result.value) });
      }

      return json({ error: "Not found" }, 404);
    } catch (error) {
      return json({ error: "Counter service unavailable" }, 500);
    }
  }
};
