export default {
  async fetch(request, env, ctx) {
    const ua = request.headers.get("User-Agent") || "";
    const url = new URL(request.url);

    // Phân biệt thiết bị mobile hay desktop
    const device = /Mobile|Android|iPhone|iPad/i.test(ua) ? "mobile" : "desktop";
    url.searchParams.set("_cf_device", device);

    // Tạo request mới với URL đã thay đổi
    const modifiedRequest = new Request(url.toString(), request);
    const cache = caches.default;

    // Kiểm tra cache trước
    let response = await cache.match(modifiedRequest);
    if (!response) {
      response = await fetch(modifiedRequest);

      // Xóa header Vary nếu có
      const newHeaders = new Headers(response.headers);
      newHeaders.delete("Vary");

      response = new Response(response.body, {
        ...response,
        headers: newHeaders
      });

      // Lưu lại cache
      ctx.waitUntil(cache.put(modifiedRequest, response.clone()));
    }

    return response;
  }
}
