import { NextRequest } from "next/server";

const ALLOWED_HOSTS = new Set([
  "pub-8c6bb3ce4d88417e9f57a8967cf9363d.r2.dev",
  "zowkins-api.onrender.com",
  "localhost",
  "127.0.0.1",
  "example.com",
]);

const ALLOWED_HOST_SUFFIXES = [
  ".r2.dev",
  ".cloudflarestorage.com",
  ".onrender.com",
];

const IMAGE_CACHE_TTL_MS = 5 * 60 * 1000;

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || "https://zowkins.vercel.app";

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed =
    origin &&
    (origin === ALLOWED_ORIGIN ||
      origin.endsWith(".vercel.app") ||
      origin === "http://localhost:3000")
      ? origin
      : ALLOWED_ORIGIN;
  return { "access-control-allow-origin": allowed, vary: "Origin, Accept-Encoding" };
}

type CachedImage = {
  body: ArrayBuffer;
  contentType: string | null;
  cacheControl: string;
  expiresAt: number;
};

const imageCache = new Map<string, CachedImage>();

const isAllowedHost = (hostname: string) => {
  // Allow all hosts in development or if explicitly listed
  if (process.env.NODE_ENV === "development") return true;
  if (ALLOWED_HOSTS.has(hostname)) return true;
  return ALLOWED_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix));
};

export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin");
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

  const cacheKey = url.toString();
  const cached = imageCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    const cachedHeaders = new Headers();
    if (cached.contentType) cachedHeaders.set("content-type", cached.contentType);
    cachedHeaders.set("cache-control", cached.cacheControl);
    const cors = corsHeaders(origin);
    Object.entries(cors).forEach(([k, v]) => cachedHeaders.set(k, v));

    return new Response(cached.body.slice(0), {
      status: 200,
      headers: cachedHeaders,
    });
  }

  const upstream = await fetch(url.toString(), {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      "Referer": url.origin,
    },
    cache: "force-cache",
  }).catch(() => null);

  if (!upstream?.ok) {
    return new Response(`Upstream image fetch failed: ${upstream?.status || "Unknown error"}`, {
      status: upstream?.status || 502,
    });
  }

  if (!upstream.body) {
    return new Response("Upstream returned empty body", { status: 502 });
  }

  const body = await upstream.arrayBuffer();
  const headers = new Headers();
  const contentType = upstream.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const cacheControl = upstream.headers.get("cache-control") || "public, max-age=3600";
  headers.set("cache-control", cacheControl);
  const cors = corsHeaders(origin);
  Object.entries(cors).forEach(([k, v]) => headers.set(k, v));

  imageCache.set(cacheKey, {
    body,
    contentType,
    cacheControl,
    expiresAt: Date.now() + IMAGE_CACHE_TTL_MS,
  });

  return new Response(body, {
    status: upstream.status,
    headers,
  });
}
