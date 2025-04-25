export default {
  async fetch(request, env, ctx) {
    const ua = request.headers.get("User-Agent") || "";
    const url = new URL(request.url);

    // Gắn dấu hiệu phân biệt thiết bị
    const device = /Mobile|Android|iPhone|iPad/i.test(ua) ? "mobile" : "desktop";
    url.searchParams.set("_cf_device", device);

    const modifiedRequest = new Request(url.toString(), request);

    // Xử lý cache
    const cache = caches.default;
    const cacheKey = new Request(modifiedRequest.url, modifiedRequest);

    let response = await cache.match(cacheKey);
    if (!response) {
      response = await fetch(modifiedRequest);

      const newHeaders = new Headers(response.headers);
      newHeaders.delete("Vary");

      response = new Response(response.body, {
        ...response,
        headers: newHeaders
      });

      ctx.waitUntil(cache.put(cacheKey, response.clone()));
    }

    return response;
  }
}
