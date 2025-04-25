export default {
  async fetch(request, env, ctx) {
    const ua = request.headers.get("User-Agent") || "";
    const url = new URL(request.url);

    const device = /Mobile|Android|iPhone|iPad/i.test(ua) ? "mobile" : "desktop";

    const cacheKeyHeaders = new Headers(request.headers);
    cacheKeyHeaders.set("CF-Device", device);
    const customCacheKey = new Request(url.toString(), {
      method: request.method,
      headers: cacheKeyHeaders,
      body: request.body,
      redirect: request.redirect
    });

    const cache = caches.default;
    let response = await cache.match(customCacheKey);

    if (!response) {
      response = await fetch(request);

      const newHeaders = new Headers(response.headers);
      newHeaders.delete("Vary"); // xóa header Vary để tránh cache phân mảnh

      response = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });

      ctx.waitUntil(cache.put(customCacheKey, response.clone()));
    } else {
      // Khi lấy cache trả về client, cũng xóa header Vary
      const newHeaders = new Headers(response.headers);
      newHeaders.delete("Vary");
      response = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    }

    return response;
  }
}
