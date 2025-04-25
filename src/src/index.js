export default {
  async fetch(request, env, ctx) {
    const ua = request.headers.get("User-Agent") || "";
    const originalUrl = new URL(request.url);

    // Phân biệt thiết bị mobile hay desktop
    const device = /Mobile|Android|iPhone|iPad/i.test(ua) ? "mobile" : "desktop";

    // Tạo cache key với URL gồm origin + pathname + param _cf_device
    const cacheUrl = new URL(originalUrl.origin + originalUrl.pathname);
    cacheUrl.searchParams.set("_cf_device", device);

    const cacheKey = new Request(cacheUrl.toString(), request);
    const cache = caches.default;

    let response = await cache.match(cacheKey);
    if (!response) {
      response = await fetch(request);

      // Xóa header Vary để tránh cache phân mảnh, không thay đổi Cache-Control đã có từ server
      const newHeaders = new Headers(response.headers);
      newHeaders.delete("Vary");

      response = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });

      ctx.waitUntil(cache.put(cacheKey, response.clone()));
    }

    return response;
  }
}
