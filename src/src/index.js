export default {
  async fetch(request, env, ctx) {
    const ua = request.headers.get("User-Agent") || "";
    const url = new URL(request.url);

    const device = /Mobile|Android|iPhone|iPad/i.test(ua) ? "mobile" : "desktop";
    url.searchParams.set("_cf_device", device);

    const modifiedRequest = new Request(url.toString(), request);
    const cache = caches.default;

    let response = await cache.match(modifiedRequest);
    if (!response) {
      response = await fetch(modifiedRequest);

      const newHeaders = new Headers(response.headers);
      newHeaders.delete("Vary");

      response = new Response(response.body, {
        ...response,
        headers: newHeaders
      });

      ctx.waitUntil(cache.put(modifiedRequest, response.clone()));
      ctx.waitUntil(cache.put(request, response.clone())); // cache cho URL gốc luôn
    }

    return response;
  }
}
