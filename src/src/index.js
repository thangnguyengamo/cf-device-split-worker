export default {
  async fetch(request, env, ctx) {
    const cache = caches.default;

    // Thử lấy response từ cache Cloudflare
    let response = await cache.match(request);
    if (!response) {
      // Nếu chưa có cache, fetch từ origin server
      response = await fetch(request);

      // Giữ nguyên tất cả header, không xóa Vary

      // Lưu response vào cache Cloudflare (bất đồng bộ)
      ctx.waitUntil(cache.put(request, response.clone()));
    }

    // Trả về response (cache hoặc origin)
    return response;
  }
}
