export default {
  async fetch(request, env, ctx) {
    const ua = request.headers.get("User-Agent") || "";
    const url = new URL(request.url);

    if (/Mobile|Android|iPhone|iPad/i.test(ua)) {
      url.searchParams.set("_cf_device", "mobile");
    } else {
      url.searchParams.set("_cf_device", "desktop");
    }

    const newRequest = new Request(url.toString(), request);
    return fetch(newRequest);
  }
}
