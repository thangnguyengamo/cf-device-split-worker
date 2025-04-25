export default {
  async fetch(request, env, ctx) {
    const ua = request.headers.get("User-Agent") || "";
    const url = new URL(request.url);

    // Phân biệt thiết bị: mobile hay desktop
    const device = /Mobile|Android|iPhone|iPad/i.test(ua) ? "mobile" : "desktop";

    // Tạo cache key tùy chỉnh: URL gốc + device
    // Không thay đổi URL, chỉ thay đổi cache key
    const cacheKey = new Request(url.toString(), request);
    // Nhưng chúng ta sẽ cache theo key mới gồm url + device (ví dụ: dùng URL + device làm cache key "ẩn")
    // Vì cache API không cho thay đổi cache key trực tiếp,
    // ta sẽ dùng Cache API trong Worker: cache key là URL + device param ẩn

    // Để tạo cache key riêng biệt, tạo một Request mới với URL kèm device dưới dạng path hoặc header (cách này phổ biến):
    // Ví dụ thêm device vào header 'CF-Device' để phân biệt cache
    const cacheKeyHeaders = new Headers(request.headers);
    cacheKeyHeaders.set("CF-Device", device);
    const customCacheKey = new Request(url.toString(), {
      method: request.method,
      headers: cacheKeyHeaders,
      body: request.body,
      redirect: request.redirect
    });

    const cache = caches.default;

    // Kiểm tra cache với cacheKey đã custom
    let response = await cache.match(customCacheKey);
    if (!response) {
      // Nếu chưa có cache thì fetch bản gốc
      response = await fetch(request);

      // Tạo bản response mới xóa header Vary để tránh cache phân mảnh
      const newHeaders = new Headers(response.headers);
      newHeaders.delete("Vary");

      response = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });

      // Lưu cache với key đã custom
      ctx.waitUntil(cache.put(customCacheKey, response.clone()));
    }

    return response;
  }
}
