import { NextRequest } from "next/server";

const ALLOWED_HOSTS = new Set([
  "pub-8c6bb3ce4d88417e9f57a8967cf9363d.r2.dev",
  "zowkins-api.onrender.com",
  "localhost",
  "127.0.0.1",
]);

const ALLOWED_HOST_SUFFIXES = [
  ".r2.dev",
  ".cloudflarestorage.com",
];

const isAllowedHost = (hostname: string) => {
  if (ALLOWED_HOSTS.has(hostname)) return true;
  return ALLOWED_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix));
};

export async function GET(request: NextRequest) {
  const src = request.nextUrl.searchParams.get("src");
  if (!src) {
    return new Response("Missing src", { status: 400 });
  }

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return new Response("Invalid src", { status: 400 });
  }

  if (!["http:", "https:"].includes(url.protocol) || !isAllowedHost(url.hostname)) {
    return new Response("Forbidden", { status: 403 });
  }

  const upstream = await fetch(url.toString(), {
    headers: {
      Accept: "image/*",
    },
  }).catch(() => null);

  if (!upstream?.ok || !upstream.body) {
    return new Response("Upstream image fetch failed", {
      status: upstream?.status || 502,
    });
  }

  const headers = new Headers();
  const contentType = upstream.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const cacheControl = upstream.headers.get("cache-control");
  headers.set("cache-control", cacheControl || "public, max-age=3600");
  headers.set("access-control-allow-origin", "*");
  headers.set("vary", "Accept-Encoding");

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}
